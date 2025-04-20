import { Dropdown, Menu, message, Modal } from "antd";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { CiBookmark } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { MdReport } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ReportPoemModal from "./ReportPoemModal";
import { BookOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { Margin } from "@mui/icons-material";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
};

const PoemCard = ({ item, bookmarked, liked, onBookmark, onLike, onHover, collections, handleMove, onPoemCreated }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [moveMenuItems, setMoveMenuItems] = useState([]);

    const lines = item.content?.split('\n') || [];
    const displayedLines = lines.slice(0, 4);
    const hasMoreLines = lines.length > 4;
    const navigate = useNavigate();
    const truncatedDescription = item.description?.length > 80
        ? `${item.description.substring(0, 80)}...`
        : item.description;
    const [showReportModal, setShowReportModal] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/poem/${item.id}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                message.success("Đã sao chép liên kết!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                message.error("Không sao chép được liên kết!");
            });
    };

    const handleReportPoem = () => {
        setShowReportModal(true);
    };

    // Menu dropdown mặc định (cho trường hợp action khác "collection")
    const defaultMenu = (
        <Menu>
            {item?.isFamousPoet ? null :
                <Menu.Item key="report" onClick={handleReportPoem}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <MdReport color="red" size={16} /><div> Báo cáo </div>
                    </div>
                </Menu.Item>
            }
            <Menu.Item key="copylink" onClick={handleCopyLink}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <IoIosLink color="#666" size={16} /><div> Sao chép liên kết </div>
                </div>
            </Menu.Item>
            {item?.isFamousPoet ? null :
                <Menu.Item key="follow">
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaUserPlus color="#666" size={16} /><div> Theo dõi người dùng </div>
                    </div>
                </Menu.Item>
            }
        </Menu>
    );


    const handleMouseEnter = (poemId) => {
        console.log("SubMenu được mở, gọi API hoặc cập nhật dữ liệu...");
        console.log("aaaa" + collections);
        setMoveMenuItems(
            collections.map((collection) => (
                <Menu.Item key={collection.id} onClick={() => handleMove(collection.id, poemId)}>
                    📂 {collection.name}
                </Menu.Item>
            ))
        );
    };

    const confirmDelete = () => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa bài thơ này?",
            content: "Hành động này sẽ xóa bài thơ vĩnh viễn. Bạn có chắc không?",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk() {
                handleDelete();
            }
        });
    };

    const handleDelete = async () => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/poems/v1/${item.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.ok) {
                if (onPoemCreated) {
                    onPoemCreated();
                }
            } else {
                console.error('Lỗi khi xóa bài thơ:', response.statusText);
            }
            if (onPoemCreated) {
                onPoemCreated();
            }
        } catch (error) {
            console.error('Lỗi khi gọi API xóa bài thơ:', error);
        }
    };


    const collectionMenu = (
        <Menu>
            {item?.isMine ?
                <Menu.Item key="delete" onClick={confirmDelete}>
                    ❌ Xóa bài thơ
                </Menu.Item>
                : null
            }
            {item?.isMine ?
                <Menu.SubMenu
                    key="move"
                    title="🔄 Chuyển bài thơ"
                    onTitleMouseEnter={() => handleMouseEnter(item.id)}
                >
                    {moveMenuItems.length > 0 ? moveMenuItems : <Menu.Item>Đang tải...</Menu.Item>}

                </Menu.SubMenu>
                : null
            }
            <Menu.Item key="edit" onClick={handleCopyLink}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <IoIosLink color="#666" size={16} />
                    <div>Sao chép liên kết</div>
                </div>
            </Menu.Item>
        </Menu>
    );

    // Chọn overlay menu dựa trên prop action
    const overlayMenu = collections && collections.length > 0
        ? collectionMenu
        : defaultMenu;

    const handleNavigate = () => {
        if (item.user !== null) {
            navigate(`/user/${item.user?.userName}`)
        } else if (item.poetSample !== null) {
            navigate(`/knowledge/poet/${item.poetSample?.id}`)
        }
    }

    return (
        <div style={styles.poemCard}>
            <div style={styles.imageWrapper}>
                <div style={styles.poemImageContainer}>
                    <img
                        src={item.poemImage || "/anhminhhoa.png"}
                        alt="Thơ minh họa"
                        style={styles.poemImage}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/anhminhhoa.png";
                        }}
                    />
                    <div style={styles.avatarContainer}>
                        <img
                            src={item.user?.avatar || item.poetSample?.avatar || `${process.env.PUBLIC_URL}/default_avatar.png`}
                            alt="Tác giả"
                            style={styles.avatar}
                        />
                    </div>
                </div>
            </div>
            <div style={styles.contentRight}>
                <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                        <span style={styles.author} onClick={handleNavigate}> {item.user ? item.user?.displayName : item.poetSample?.name || 'Anonymous'}</span>
                        <span style={styles.postDate}>– <ClockCircleOutlined style={{ fontSize: "0.9rem" }} />{formatDate(item.createdTime)}</span>
                    </div>
                    <div style={styles.headerRight}>
                        <button style={styles.iconButton} onClick={() => onBookmark(item.id)}>
                            {bookmarked ? <IoBookmark size={15} color="#FFCE1B" /> : <CiBookmark size={15} />}
                        </button>


                        <Dropdown overlay={overlayMenu} trigger={["click"]}>
                            <button style={styles.iconButton}>
                                <IoIosMore size={15} />
                            </button>
                        </Dropdown>


                    </div>
                </div>
                <h3 style={styles.poemTitle}>{item.title}</h3>
                <div style={{
                    display: "inline-flex", // dùng inline-flex để fit nội dung
                    gap: "16px",
                    padding: 0,
                    marginBottom: "10px",
                    marginTop: "10px"
                }}>
                    <p style={styles.poemType}>{item?.type?.name ?? ""}</p>
                    <p style={styles.poemCollection}><BookOutlined style={{ marginRight: "6px", fontSize: "0.9rem" }} /> <span style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate(`/collection/${item.collection.id}`)}>{item.collection?.collectionName}</span></p>

                </div>
                <p style={styles.poemDescription}>Mô tả: {item.description}</p>
                <div style={styles.poemContent}>
                    <div style={styles.poemTextContainer}>
                        <span style={styles.quote}>“</span>
                        {displayedLines.map((line, index) => (
                            <p key={index} style={styles.poemLine}>{line}</p>
                        ))}
                        {/* <pre style={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: '"Cormorant Garamond", serif',
                                fontSize: '1.2rem',
                                lineHeight: '1.8',
                                color: '#5d4c3c',
                                margin: 0,
                                textAlign: 'center',
                            }}>
                                {item?.content || "Nội dung chưa có sẵn"}
                            </pre> */}
                        <p style={styles.poemLine}>
                            {hasMoreLines && <span style={styles.ellipsis}>...</span>}
                            <span style={styles.quoteClose}>”</span>
                        </p>
                    </div>
                </div>
                <div style={styles.footerContainer}>
                    {item?.isFamousPoet ? <></> :
                        <div style={styles.statsContainer}>
                            <button style={styles.likeButton} onClick={() => onLike(item.id)}>
                                {liked ? <BiSolidLike size={17} color="#2a7fbf" /> : <BiLike size={20} />}
                                <span style={styles.statItem}>{item.likeCount || 0}</span>
                            </button>
                            <button style={styles.likeButton}>
                                <BiCommentDetail size={20} />
                                <span style={styles.statItem}>{item.commentCount || 0}</span>
                            </button>
                        </div>
                    }
                    <button
                        style={{
                            ...styles.viewButton,
                            ...(isHovered && styles.viewButtonHover)
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onClick={() => navigate(`/poem/${item.id}`)}
                    >
                        Xem bài thơ &gt;
                    </button>
                </div>
            </div>
            <ReportPoemModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                poemId={item.id}
                accessToken={localStorage.getItem("accessToken")}
            />
        </div>
    )
};

const styles = {
    poemCard: {
        display: 'flex',
        gap: '32px',
        //background: 'linear-gradient(135deg, #f8f5ff 0%, #fff7fb 100%)',
        background: 'linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        margin: '16px 0',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        ':hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
        }
    },
    imageWrapper: {
        position: 'relative',
        flexShrink: 0,
        width: '204px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    poemImageContainer: {
        width: '100%',
        height: '320px',
        position: 'relative',
        background: '#f0eafa'
    },
    poemImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
        ':hover': {
            transform: 'scale(1.05)'
        }
    },
    avatarContainer: {
        position: 'absolute',
        bottom: '-24px',
        left: '24px',
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        border: '3px solid white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        ':hover': {
            transform: 'scale(1.1)'
        }
    },
    avatar: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },

    contentRight: {
        flexBasis: "100%",
        display: "flex",
        flexDirection: "column",
        marginRight: "20px"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px"
    },

    author: {
        fontWeight: 600,
        color: "#5d4c3c",
        fontSize: "1.05rem",
        fontFamily: "'Playfair Display', serif",
        cursor: 'pointer',
        ':hover': {
            color: '#4a2b6b'
        }
    },

    poemTitle: {
        color: "#3a2e26",
        margin: 0,
        fontSize: "1.4rem",
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600
    },

    poemType: {
        margin: 0,
        background: "#f8f3ed",
        borderRadius: "16px",
        padding: "4px 12px",
        color: "#7d6b58",
        fontSize: "0.85rem",
        display: "inline-flex",
        alignItems: "center"
    },

    poemDescription: {
        color: "#7d6b58",
        fontSize: "0.95rem",
        margin: 0,
        marginBottom: "4px",
        lineHeight: 1.6,
        display: "-webkit-box",
        WebkitLineClamp: 2,             // 👈 số dòng muốn hiển thị
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },

    poemCollection: {
        margin: 0,
        background: "#f8f3ed",
        borderRadius: "16px",
        padding: "4px 12px",
        color: "#7d6b58",
        fontSize: "0.85rem",
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        ":hover": {
            background: "#f0e6e0"
        }
    },

    poemContent: {
        color: "#5d4c3c",
        fontStyle: "italic",
        borderLeft: "3px solid #f0e6e0",
        padding: "4px 0 4px 20px",
        flexGrow: 1,
        marginBottom: "8px",
        position: "relative"
    },

    poemTextContainer: {
        display: "-webkit-box",
        WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        position: 'relative',
    },
    quote: {
        position: 'absolute',
        fontSize: '1.7rem',
        lineHeight: 1,
        color: '#666',
    },
    quoteClose: {
        position: 'absolute',
        right: 0,
        fontSize: '1.7rem',
        lineHeight: 1,
        color: '#666'
    },
    poemLine: {
        textAlign: 'center',
        margin: "0",
        lineHeight: "1.8",
        fontSize: "1.1rem",
        fontFamily: "'Cormorant Garamond', serif",
        textIndent: '1.5rem',
        position: "relative",
        display: "-webkit-box",
        WebkitLineClamp: 1,             // 👈 số dòng muốn hiển thị
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    ellipsis: {
        background: 'white',
        paddingLeft: '4px',
        position: "relative",
        zIndex: 1
    },

    statItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "1rem"
    },

    viewButton: {
        background: "none",
        border: "1px solid #7d6b58",
        color: "#7d6b58",
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: "20px",
        transition: "all 0.2s",
        fontWeight: "500",
    },

    viewButtonHover: {
        background: "#5d4c3c",
        color: "white",
    },

    postDate: {
        color: "#a89b8c",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginLeft: "4px"
    },

    headerLeft: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px"
    },
    headerRight: {
        display: "flex",
        gap: "12px",
        alignItems: "center"
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
        paddingTop: "10px",
        borderTop: "1px solid #f0e6e0"
    },

    statsContainer: {
        display: "flex",
        gap: "10px",
        alignItems: "center"
    },

    likeButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '24px',
        color: '#000',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ':hover': {
            background: 'rgba(106, 76, 147, 0.1)'
        }
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
}


export default PoemCard;