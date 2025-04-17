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

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
};

const poemType = {
    1: "Thơ tự do",
    2: "Thơ Lục bát",
    3: "Thơ Song thất lục bát",
    4: "Thơ Thất ngôn tứ tuyệt",
    5: "Thơ Ngũ ngôn tứ tuyệt",
    6: "Thơ Thất ngôn bát cú",
    7: "Thơ bốn chữ",
    8: "Thơ năm chữ",
    9: "Thơ sáu chữ",
    10: "Thơ bảy chữ",
    11: "Thơ tám chữ",
}

const PoemCard = ({ item, bookmarked, liked, onBookmark, onLike, poetId, collections, handleMove, onPoemCreated }) => {
    const [moveMenuItems, setMoveMenuItems] = useState([]);
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const userRoles = JSON.parse(localStorage.getItem('role')) || [];
        setRoles(userRoles);
    }, []);

    const canCreatePoem = roles.includes("ADMIN") || roles.includes("MODERATOR");

    // Xử lý nội dung bài thơ
    const lines = item.content?.split('\n') || [];
    const displayedLines = lines.slice(0, 4);
    const hasMoreLines = lines.length > 4;

    // Xử lý mô tả
    const truncatedDescription = item.description?.length > 80
        ? `${item.description.substring(0, 80)}...`
        : item.description;

    // Hàm xóa bài thơ
    const handleDelete = async () => {
        const accessToken = localStorage.getItem('accessToken');
        try {
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/poems/v1/poet-sample/${item.id}?poetSampleId=${poetId}`,
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

    const handleMouseEnter = (poemId) => {
        setMoveMenuItems(
            collections?.map((collection) => (
                <Menu.Item key={collection.id} onClick={() => handleMove(collection.id, poemId)}>
                    📂 {collection.collectionName}
                </Menu.Item>
            )) || []
        );
    };

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


    const collectionMenu = (
        <Menu>
            <Menu.Item key="delete" onClick={confirmDelete}>
                ❌ Xóa bài thơ
            </Menu.Item>
            <Menu.SubMenu
                key="move"
                title="🔄 Chuyển bài thơ"
                onTitleMouseEnter={() => handleMouseEnter(item.id)}
            >
                {moveMenuItems.length > 0 ? moveMenuItems : <Menu.Item>Đang tải...</Menu.Item>}
            </Menu.SubMenu>
        </Menu>
    );

    const defaultMenu = (
        <Menu>
            <Menu.Item key="copylink" onClick={handleCopyLink}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <IoIosLink color="#666" size={16} />
                    <div>Sao chép liên kết</div>
                </div>
            </Menu.Item>
        </Menu>
    );
    

    const overlayMenu = (collections && collections.length > 0 && canCreatePoem)
        ? collectionMenu
        : defaultMenu;

  
    const handleNavigate = () => {
        navigate(`/knowledge/poet/${item.poetSample?.id}`);
    }

    return (
        <div style={styles.poemCard}>
            <div style={styles.poemImageContainer}>
                <img
                    src={item.poemImage || "/anhminhhoa.png"}
                    alt="anh minh hoa"
                    style={styles.poemImage}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/anhminhhoa.png";
                    }}
                />
            </div>
            <div style={styles.avatarContainer}>
                <img
                    src={item.poetSample?.avatar || "./default_avatar.png"}
                    alt="avatar"
                    style={styles.avatar}
                    onError={(e) => { e.target.src = "./default_avatar.png"; }}
                />
            </div>
            <div style={styles.contentRight}>
                <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                        <span style={styles.author} onClick={handleNavigate}>
                            {item.poetSample?.name || 'Nhà thơ nổi tiếng'}
                        </span>
                        <span style={styles.postDate}>– {formatDate(item.createdTime)}</span>
                    </div>
                    <div style={styles.headerRight}>
                        <button style={styles.iconButton} onClick={() => onBookmark(item.id)}>
                            {bookmarked ? <IoBookmark color="#FFCE1B" /> : <CiBookmark />}
                        </button>
                        {overlayMenu && (
                            <Dropdown overlay={overlayMenu} trigger={["click"]}>
                                <button style={styles.iconButton}>
                                    <IoIosMore />
                                </button>
                            </Dropdown>
                        )}
                    </div>
                </div>
                <h3 style={styles.poemTitle}>{item.title}</h3>
                <p style={styles.poemType}>Thể loại: {poemType[item.type]}</p>
                {item.description && (
                    <p style={styles.poemDescription}>Mô tả: {truncatedDescription}</p>
                )}
                <div style={styles.poemContent}>
                    <div style={styles.poemTextContainer}>
                        <span style={styles.quote}>"</span>
                        {displayedLines.map((line, index) => (
                            <p key={index} style={styles.poemLine}>{line}</p>
                        ))}
                        <p style={styles.poemLine}>
                            {hasMoreLines && <span style={styles.ellipsis}>...</span>}
                            <span style={styles.quoteClose}>"</span>
                        </p>
                    </div>
                </div>
                {item.collection && (
                    <p style={styles.poemCollection}>
                        Tập thơ:
                        <span
                            style={{ fontWeight: "bold", cursor: "pointer" }}
                            onClick={() => navigate(`/collection/${item.collection.id}`)}
                        >
                            {" "}{item.collection.collectionName}
                        </span>
                    </p>
                )}
                <div style={styles.footerContainer}>
                    {item?.isFamousPoet ? <></> :
                        <div style={styles.statsContainer}>
                            <button style={styles.likeButton} onClick={() => onLike(item.id)}>
                                {liked ? <BiSolidLike size={20} color="#2a7fbf" /> : <BiLike size={20} />}
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
        </div>
    )
};

const styles = {
    poemImageContainer: {
        width: "168px",
        height: "268px",
        border: "1px solid #000",
        marginLeft: "20px",
        alignSelf: "center"
    },

    poemImage: {
        width: "168px",
        maxWidth: "168px",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center"
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
        width: "80%",
        margin: "0 auto 40px",
        padding: "20px"
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
        cursor: "pointer"
    },

    poemTitle: {
        color: "#222",
        margin: "0",
        fontSize: "1.2rem",
    },

    poemType: {
        color: "#444",
        margin: "1px 0 0",
        fontSize: "0.85rem",
    },

    poemDescription: {
        color: "#444",
        fontSize: "0.85rem",
        marginTop: "1px",
        lineHeight: "1.4",
        marginBottom: "5px"
    },

    poemCollection: {
        color: "#444",
        fontSize: "0.8rem",
        marginBottom: 0
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
        fontSize: "1rem",
        textIndent: '0.8rem',
    },
    ellipsis: {

        background: 'white',
        paddingLeft: '4px',
    },

    statItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "1.4em"
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