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
            <div style={styles.poemImageContainer}>
                <img
                    src={item.poemImage || "/anhminhhoa.png"}
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
                    src={item.user ? item.user?.avatar : item.poetSample?.avatar || `${process.env.PUBLIC_URL}/default_avatar.png`}
                    alt="avatar"
                    style={styles.avatar}
                    onError={(e) => { e.target.src = "./default_avatar.png"; }}
                />
            </div>
            <div style={styles.contentRight}>
                <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                        <span style={styles.author} onClick={handleNavigate}> {item.user ? item.user?.displayName : item.poetSample?.name || 'Anonymous'}</span>
                        <span style={styles.postDate}>– {formatDate(item.createdTime)}</span>
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
                <p style={styles.poemType}>Thể loại: {item?.type?.name ?? ""}</p>
                <p style={styles.poemDescription}>Mô tả: {truncatedDescription}</p>
                <div style={styles.poemContent}>
                    <div style={styles.poemTextContainer}>
                        <span style={styles.quote}>“</span>
                        {displayedLines.map((line, index) => (
                            <p key={index} style={styles.poemLine}>{line}</p>
                        ))}
                        <p style={styles.poemLine}>
                            {hasMoreLines && <span style={styles.ellipsis}>...</span>}
                            <span style={styles.quoteClose}>”</span>
                        </p>
                    </div>
                </div>
                <p style={styles.poemCollection}>Tập thơ: <span style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate(`/collection/${item.collection.id}`)}>{item.collection?.collectionName}</span></p>
                <div style={styles.footerContainer}>
                    {item?.isFamousPoet ? <></> :
                        <div style={styles.statsContainer}>
                            <button style={styles.likeButton} onClick={() => onLike(item.id)}>
                                {liked ? <BiSolidLike size={17} color="#2a7fbf" /> : <BiLike size={18} />}
                                <span style={styles.statItem}>{item.likeCount || 0}</span>
                            </button>
                            <button style={styles.likeButton}>
                                <BiCommentDetail size={17} />
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
    poemImageContainer: {
        width: "134px",
        height: "234px",
        border: "1px solid #000",
        marginLeft: "20px",
        alignSelf: "center"
    },

    poemImage: {
        width: "134px",
        maxWidth: "134px",
        height: "100%",
        objectFit: "cover", // This will prevent stretching
        objectPosition: "center" // Center the image
    },

    avatarContainer: {
        flexGrow: "1",
    },

    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #eee",
        marginTop: "4px",
    },

    contentRight: {
        flexBasis: "100%",
        display: "flex",
        flexDirection: "column",
        marginRight: "20px"
    },

    poemCard: {
        display: "flex",
        gap: "10px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #ccc",
        boxShadow: "0px 3px 6px 0px #0000004D",
        alignItems: "stretch",
        width: "100%", // Ensure it takes available width
        marginBottom: "40px",
        padding: "20px 0"
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
        fontSize: "0.8rem",
    },

    poemTitle: {
        color: "#222",
        margin: "0",
        fontSize: "1rem",
    },

    poemType: {
        color: "#444",
        margin: "1px 0 0",
        fontSize: "0.8rem",
    },

    poemDescription: {
        color: "#444",
        fontSize: "0.8rem",
        marginTop: "1px",
        lineHeight: "1.4",
        marginBottom: "5px"
    },

    poemCollection: {
        color: "#444",
        fontSize: "0.8rem",
        marginBottom: 0,
        marginTop: 0
    },

    poemContent: {
        color: "#333",
        fontStyle: "italic",
        borderLeft: "3px solid #eee",
        paddingLeft: "15px",
        marginBottom: "auto",
        position: 'relative',
    },

    poemTextContainer: {
        display: '-webkit-box',
        WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        position: 'relative',
        paddingRight: '20px',
    },
    quote: {
        position: 'absolute',
        fontSize: '1.7rem',
        lineHeight: 1,
        color: '#666',
    },
    quoteClose: {

        fontSize: '1.7rem',
        lineHeight: 1,
        color: '#666',
    },
    poemLine: {
        whiteSpace: 'pre-wrap',
        margin: "0 0 0 0",
        lineHeight: "1.6",
        fontSize: "0.8rem",
        textIndent: '0.7rem',
    },
    ellipsis: {
        background: 'white',
        paddingLeft: '4px',
    },

    statItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "1rem"
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
        fontSize: "0.8rem",
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
        marginRight: "20px"
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

        "&:hover": {
            background: "#f0f0f0",
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