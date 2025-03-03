import { Dropdown, Menu } from "antd";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { CiBookmark } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { MdReport } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
};



const PoemCard = ({ item, bookmarked, liked, onBookmark, onLike, onHover }) => {
    const lines = item.content?.split('\n') || [];
    const displayedLines = lines.slice(0, 4);
    const hasMoreLines = lines.length > 4;

    const truncatedDescription = item.description?.length > 102
        ? `${item.description.substring(0, 102)}...`
        : item.description;

    return (
        <div style={styles.poemCard}>
            <div style={styles.poemImageContainer}>
                <img src={item.image || "./anhminhhoa.png"} alt="anh minh hoa" style={styles.poemImage} />
            </div>
            <div style={styles.avatarContainer}>
                <img
                    src={item.user?.avatar || "./default_avatar.png"}
                    alt="avatar"
                    style={styles.avatar}
                    onError={(e) => { e.target.src = "./default_avatar.png"; }}
                />
            </div>
            <div style={styles.contentRight}>
                <div style={styles.cardHeader}>
                    <div style={styles.headerLeft}>
                        <span style={styles.author}>{item.user?.displayName || 'Anonymous'}</span>
                        <span style={styles.postDate}>– {formatDate(item.createdTime)}</span>
                    </div>
                    <div style={styles.headerRight}>
                        <button style={styles.iconButton} onClick={() => onBookmark(item.id)}>
                            {bookmarked ? <IoBookmark color="#FFCE1B" /> : <CiBookmark />}
                        </button>


                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item key="report" >
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <MdReport color="red" size={"16"} /><div> Báo cáo </div>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item key="copylink">
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <IoIosLink color="#666" size={"16"} /><div> Sao chép liên kết </div>
                                        </div>
                                    </Menu.Item>
                                    <Menu.Item key="follow">
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <FaUserPlus color="#666" size={"16"} /><div> Theo dõi người dùng </div>
                                        </div>
                                    </Menu.Item>
                                </Menu>
                            }
                            trigger={["click"]}
                        >
                            <button style={styles.iconButton}>
                                <IoIosMore />
                            </button>
                        </Dropdown>


                    </div>
                </div>
                <h3 style={styles.poemTitle}>{item.title}</h3>
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
                <div style={styles.footerContainer}>
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
                    <button
                        style={{
                            ...styles.viewButton,
                            ...(styles.viewButtonHover)
                        }}
                        onMouseEnter={() => onHover(true)}
                        onMouseLeave={() => onHover(false)}
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
        width: "168x",
        height: "268px",
        border: "1px solid #000",
        marginLeft: "20px"
    },

    poemImage: {
        width: "168px",
        maxWidth: "168px",
        height: "100%",
        objectFit: "cover", // This will prevent stretching
        objectPosition: "center" // Center the image
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
        marginBottom: "5px"
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