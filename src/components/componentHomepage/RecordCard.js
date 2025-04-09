import React, { useEffect, useState } from "react";
import { Modal, Spin, Switch, Table, Dropdown, Menu } from "antd";
import { FcVideoFile } from "react-icons/fc";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { CiBookmark } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { MdReport } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return date.toLocaleDateString("vi-VN", options);
};

const RecordCard = ({ record, handleToggleStatus, onHover, showDeleteConfirm, isMine, showPurchaseConfirm }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const truncatedDescription =
        record.poem?.description?.length > 102
            ? `${record.poem?.description.substring(0, 102)}...`
            : record.poem?.description;
    const lines = record.poem?.content?.split("\n") || [];
    const displayedLines = lines.slice(0, 4);
    const hasMoreLines = lines.length > 4;
    const navigate = useNavigate();
    const currentUser = localStorage.getItem("username");
    const [isHovered, setIsHovered] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const accessToken = localStorage.getItem("accessToken");

    const showModal = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const defaultMenu = (
        <Menu>
            <Menu.Item key="report" onClick={() => showModal(record)}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MdReport color="red" size={16} />
                    <div> Thông tin chi tiết </div>
                </div>
            </Menu.Item>
            <Menu.Item key="copylink">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <IoIosLink color="#666" size={16} />
                    <div> Sao chép liên kết </div>
                </div>
            </Menu.Item>
            {record.owner?.userName === currentUser && (
                <Menu.Item key="delete" onClick={() => showDeleteConfirm(record.id)}>
                    ❌ Xóa
                </Menu.Item>
            )}
        </Menu>
    );


    useEffect(() => {
        const fetchAudio = async () => {
            try {
                const headers = accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {};

                const response = await axios.get(
                    `https://api-poemtown-staging.nodfeather.win/api/record-files/v1/audio-stream/${record.id}`,
                    {
                        responseType: "blob",
                        headers: headers
                    }
                );

                const url = URL.createObjectURL(response.data);
                setAudioUrl(url);
            } catch (error) {
                console.error("Error fetching audio:", error);
                setAudioUrl(null); // Reset audio URL nếu có lỗi
            }
        };

        fetchAudio();
    }, [record, accessToken, currentUser]);



    const overlayMenu = defaultMenu;
    return (
        <>
            <div style={styles.poemCard} key={record.key}>
                <div style={styles.poemImageContainer}>
                    <img
                        src={record.poem?.poemImage || "/anhminhhoa.png"}
                        alt="anh minh hoa"
                        style={styles.poemImage}
                        onError={(e) => {
                            console.log("Image failed to load, switching to fallback");
                            e.target.onerror = null;
                            e.target.src = "/anhminhhoa.png";
                        }}
                    />
                </div>
                <div style={styles.avatarContainer}>
                    <img
                        src={record.poem?.user?.avatar || "/default_avatar.png"}
                        alt="avatar"
                        style={styles.avatar}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default_avatar.png";
                        }}
                    />
                </div>
                <div style={styles.contentRight}>
                    <div style={styles.cardHeader}>
                        <div style={styles.headerLeft}>
                            <span
                                style={styles.author}
                                onClick={() =>
                                    navigate(`/user/${record.poem?.user?.userName}`)
                                }
                            >
                                {record.poem?.user?.displayName || "Anonymous"}
                            </span>
                            <span style={styles.postDate}>
                                – {formatDate(record.poem?.createdTime)}
                            </span>
                        </div>
                        <div style={styles.headerRight}>
                            <Dropdown overlay={overlayMenu} trigger={["click"]}>
                                <button style={styles.iconButton}>
                                    <IoIosMore />
                                </button>
                            </Dropdown>
                        </div>
                    </div>
                    <h3 style={styles.poemTitle}>{record.poem?.title}</h3>
                    <p style={styles.poemDescription}>
                        Mô tả: {truncatedDescription}
                    </p>
                    <div style={styles.poemContent}>
                        <div style={styles.poemTextContainer}>
                            <span style={styles.quote}>“</span>
                            {displayedLines.map((line, index) => (
                                <p key={index} style={styles.poemLine}>
                                    {line}
                                </p>
                            ))}
                            <p style={styles.poemLine}>
                                {hasMoreLines && <span style={styles.ellipsis}>...</span>}
                                <span style={styles.quoteClose}>”</span>
                            </p>
                        </div>
                    </div>

                    {/* Hiển thị audio */}
                    <div
                        style={{
                            marginTop: "20px",
                            width: "100%",
                            display: "block",
                        }}
                    >
                        {record.fileUrl ? (
                            // Kiểm tra nếu người dùng hiện tại có quyền truy cập file âm thanh
                            record.owner?.userName === currentUser || // Nếu currentUser là chủ sở hữu bài thơ
                                (record.buyers && record.buyers.some(buyer => buyer.userName === currentUser)) || // Hoặc nếu currentUser nằm trong danh sách người mua
                                record.buyer?.userName == currentUser || // Hoặc currentUser là người mua duy nhất (trong trường hợp có một buyer riêng lẻ)
                                record.isPublic == true ? ( // Hoặc bài thơ này được đặt ở chế độ công khai
                                <audio controls style={{ width: "100%" }} src={audioUrl}>
                                    Your browser does not support the audio element.
                                </audio>
                            ) : (
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginTop: "20px",
                                        color: "red",
                                    }}
                                >
                                    <p>Bài ngâm thơ này đã bị khóa. Hãy mua để nghe!</p>
                                    <button
                                        style={{
                                            backgroundColor: "#2a7fbf",
                                            color: "white",
                                            border: "none",
                                            padding: "10px 20px",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                            fontSize: "1rem",
                                        }}
                                        onClick={() => showPurchaseConfirm(record.id, record.price)}
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <Spin size="large" />
                            </div>
                        )}



                    </div>
                    <div style={styles.footerContainer}>
                        <button
                            style={{
                                ...styles.viewButton,
                                ...(isHovered && styles.viewButtonHover)
                            }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={() => navigate(`/poem/${record.poem?.id}`)}
                        >
                            Xem bài thơ &gt;
                        </button>
                    </div>
                </div>
            </div>



            <Modal
                title={record ? record.fileName : "Chi tiết bản ghi"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                bodyStyle={{ padding: "20px" }}
            >
                {record ? (
                    <div>
                        <h3
                            style={{
                                textAlign: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <strong>Tiêu đề bài thơ:</strong>{" "}
                            {record.poem ? record.poem?.title : "Không có tiêu đề"}
                        </h3>
                        <h4
                            style={{
                                textAlign: "center",
                                marginBottom: "20px",
                            }}

                        >
                            Chủ sở hữu:{" "}
                            <span
                                style={styles.author}

                                onClick={() => navigate(`/user/${record.owner.userName}`)}>
                                {record.owner
                                    ? record.owner.displayName
                                    : record.poem?.user?.displayName}
                            </span>

                        </h4>
                        {record.price !== undefined && (
                            <h4
                                style={{
                                    textAlign: "center",
                                    marginBottom: "20px",
                                }}
                            >
                                Giá: {record.price.toLocaleString('vi-VN')} VND
                            </h4>
                        )}
                        {record.buyers && Array.isArray(record.buyers) && (
                            <div style={{ marginBottom: "20px" }}>
                                <Table
                                    dataSource={record.buyers}
                                    columns={[
                                        {
                                            title: "Buyer Name",
                                            dataIndex: "displayName",
                                            key: "displayName",
                                        },
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                />
                            </div>
                        )}
                        {isMine && (
                            <div
                                style={{
                                    marginBottom: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "10px",
                                }}
                            >
                                <strong>Trạng thái:</strong>
                                <Switch
                                    checked={record.isPublic}
                                    onChange={() => handleToggleStatus(record)}
                                />
                                <span>{record.isPublic ? "Công khai" : "Riêng tư"}</span>
                            </div>)}

                    </div>
                ) : (
                    <p style={{ textAlign: "center" }}>Không có thông tin.</p>
                )}
            </Modal>
        </>
    );
};

const styles = {
    poemImageContainer: {
        width: "168px",
        height: "268px",
        border: "1px solid #000",
        marginLeft: "20px",
    },
    poemImage: {
        width: "168px",
        maxWidth: "168px",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
    },
    avatarContainer: {
        flexGrow: "1",
    },
    avatar: {
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #eee",
        marginTop: "4px",
    },
    contentRight: {
        flexBasis: "100%",
        display: "flex",
        flexDirection: "column",
        marginRight: "20px",
    },
    poemCard: {
        display: "flex",
        gap: "10px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #ccc",
        boxShadow: "0px 3px 6px 0px #0000004D",
        alignItems: "stretch",
        width: "100%",
        marginBottom: "40px",
        padding: "20px 0",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.9rem",
        color: "#666",
    },
    author: {
        fontWeight: "600",
        color: "#2a7fbf",
        cursor: "pointer",
    },
    poemTitle: {
        color: "#222",
        margin: "0",
        fontSize: "1.4rem",
    },
    poemDescription: {
        color: "#444",
        fontSize: "0.95rem",
        marginTop: "1px",
        lineHeight: "1.4",
        marginBottom: "5px",
    },
    poemContent: {
        color: "#333",
        fontStyle: "italic",
        borderLeft: "3px solid #eee",
        paddingLeft: "15px",
        marginBottom: "auto",
        position: "relative",
    },
    poemTextContainer: {
        display: "-webkit-box",
        WebkitLineClamp: 5,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        position: "relative",
        paddingRight: "20px",
    },
    quote: {
        position: "absolute",
        fontSize: "1.7rem",
        lineHeight: 1,
        color: "#666",
    },
    quoteClose: {
        fontSize: "1.7rem",
        lineHeight: 1,
        color: "#666",
    },
    poemLine: {
        whiteSpace: "pre-wrap",
        margin: "0 0 0 0",
        lineHeight: "1.6",
        fontSize: "1rem",
        textIndent: "0.8rem",
    },
    ellipsis: {
        background: "white",
        paddingLeft: "4px",
    },
    statItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "1.4em",
    },
    viewButton: {
        background: "none",
        border: "1px solid #2a7fbf",
        color: "#2a7fbf",
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: "20px",
        transition: "all 0.2s",
        fontWeight: "500",
    },
    viewButtonHover: {
        background: "#2a7fbf",
        color: "white",
    },
    postDate: {
        color: "#888",
        fontSize: "0.85rem",
        textAlign: "right",
    },
    headerLeft: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        flexDirection: "row",
    },
    headerRight: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
    },
    iconButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        fontSize: "1.2rem",
        color: "#666",
        display: "flex",
        alignItems: "center",
    },
    footerContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        marginRight: "20px",
    },
    statsContainer: {
        display: "flex",
        gap: "20px",
        alignItems: "center",
    },
    likeButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        transition: "background 0.2s",
    },
    commentStat: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    leftColumn: {
        display: "flex",
        flexDirection: "column",
        flex: "6",
    },
    footerContainer: {
        display: "flex",
        justifyContent: "end",
        alignItems: "center",
        marginTop: "10px"
    },
    viewButton: {
        background: "none",
        border: "1px solid #2a7fbf",
        color: "#2a7fbf",
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: "20px",
        transition: "all 0.2s",
        fontWeight: "500",
    },

    viewButtonHover: {
        background: "#2a7fbf",
        color: "white",
    },
};

export default RecordCard;
