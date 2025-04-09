import { Dropdown, Menu } from "antd";
import React from "react";
import { FaUserPlus } from "react-icons/fa6";
import { IoIosMore } from "react-icons/io";
import { MdReport } from "react-icons/md";
import { RiDeleteBinFill } from "react-icons/ri";


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
};

const currentUserId = localStorage.getItem("userId");


const Comment = React.memo(({
    comment,
    depth,
    currentReply,
    replyTexts,
    onReply,
    onSubmitReply,
    onCancelReply,
    onTextChange,
    isMine,
    onDelete // Add this new prop
}) => {
    // Create dynamic menu based on comment ID
    const ownerMenu = (
        <Menu>
            <Menu.Item
                key="delete"
                onClick={() => onDelete(comment.id)}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <RiDeleteBinFill color="red" size={16} />
                    <div>Xóa</div>
                </div>
            </Menu.Item>
        </Menu>
    );

    const defaultMenu = (
        <Menu>
            <Menu.Item key="report">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MdReport color="red" size={16} /><div> Báo cáo </div>
                </div>
            </Menu.Item>
            <Menu.Item key="follow">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <FaUserPlus color="#666" size={16} /><div> Theo dõi người dùng </div>
                </div>
            </Menu.Item>
        </Menu>
    );


    return (<div style={{ marginLeft: `${Math.min(depth, 3) * 20}px`, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'start' }}>
            <img
                src={comment.author?.avatar || '/default-avatar.png'}
                alt="avatar"
                style={{ width: 40, height: 40, borderRadius: '50%' }}
            />
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexDirection: "row" }}>
                        <span style={{ fontWeight: 500 }}>
                            {comment.author?.displayName || 'Ẩn danh'}
                        </span>
                        -
                        <span style={{ color: '#666', fontSize: 12 }}>
                            {formatDate(comment.createdTime)}
                        </span>
                    </div>
                    <div>
                        <Dropdown overlay={isMine ? ownerMenu : defaultMenu} trigger={["click"]}>
                            <button style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                fontSize: "1.2rem",
                                color: "#666",
                                display: "flex",
                                alignItems: "center",
                                alignSelf: "flex-end"
                            }}>
                                <IoIosMore />
                            </button>
                        </Dropdown>
                    </div>
                </div>
                <p style={{ margin: '8px 0' }}> <span style={{ color: "#005CC5" }}>{comment.parentCommentId !== null ? `@${comment.parentCommentAuthor?.displayName} ` : ""}</span>{comment.content}</p>
                <button
                    onClick={() => onReply(comment.id)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#007bff',
                        cursor: 'pointer',
                        padding: 0
                    }}
                >
                    Trả lời
                </button>

                {currentReply === comment.id && (
                    <div style={{ marginTop: 8 }}>
                        <textarea
                            value={replyTexts[comment.id] || ''}
                            onChange={(e) => onTextChange(comment.id, e.target.value)}
                            placeholder="Viết phản hồi..."
                            style={{
                                width: '100%',
                                padding: 8,
                                margin: '8px 0',
                                border: '1px solid #ddd',
                                borderRadius: 4
                            }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => onSubmitReply(comment.id)}
                                style={{
                                    padding: '6px 16px',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Gửi
                            </button>
                            <button
                                onClick={() => onCancelReply(comment.id)}
                                style={{
                                    padding: '6px 16px',
                                    background: '#ddd',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer'
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {comment.replies?.map((reply) => (
            <Comment
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                currentReply={currentReply}
                replyTexts={replyTexts}
                onReply={onReply}
                onSubmitReply={onSubmitReply}
                onCancelReply={onCancelReply}
                onTextChange={onTextChange}
                isMine={reply.authorCommentId === currentUserId} // Add this line
                onDelete={onDelete}
            />
        ))}
    </div>
    )
});


export default Comment;