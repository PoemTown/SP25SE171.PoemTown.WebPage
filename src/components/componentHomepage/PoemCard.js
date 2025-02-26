import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { CiBookmark } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

const PoemCard = ({ item, bookmarked, liked, onBookmark, onLike, onHover }) => (
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
            <button style={styles.iconButton}>
              <IoIosMore />
            </button>
          </div>
        </div>
        <h3 style={styles.poemTitle}>{item.title}</h3>
        <p style={styles.poemDescription}>Mô tả: {item.description}</p>
        <div style={styles.poemContent}>
          {item.content?.split('\n').map((line, index) => (
            <p key={index} style={styles.poemLine}>"{line}"</p>
          ))}
        </div>
        <div style={styles.footerContainer}>
          <div style={styles.statsContainer}>
            <button style={styles.likeButton} onClick={() => onLike(item.id)}>
              {liked ? <BiSolidLike color="#2a7fbf" /> : <BiLike />}
              <span style={styles.statItem}>{item.likeCount || 0}</span>
            </button>
            <div style={styles.commentStat}>
              <BiCommentDetail />
              <span style={styles.statItem}>{item.commentCount || 0}</span>
            </div>
          </div>
          <button
            style={{
              ...styles.viewButton,
              ...( styles.viewButtonHover)
            }}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
          >
            Xem bài thơ &gt;
          </button>
        </div>
      </div>
    </div>
  );

  const styles = {
      poemImageContainer: {
        width: "168x",
        height: "238px",
        border: "1px solid #000",
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
    
      contentContainer: {
        maxWidth: "100%",
        display: "flex",
        gap: "40px"
      },
    
      contentTitle: {
        color: "#333",
        marginBottom: "30px",
        textAlign: "center",
      },
      contentRight: {
        flexBasis: "100%",
      },
    
      poemCard: {
        display: "flex",
        gap: "10px",
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #ccc",
        boxShadow: "0px 3px 6px 0px #0000004D",
        alignItems: "flex-start",
        maxWidth: "850px", // Add max-width constraint
        width: "100%", // Ensure it takes available width
        marginBottom: "40px"
    },
      cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "5px",
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
        marginTop: "5px",
        lineHeight: "1.4",
      },
    
      poemContent: {
        color: "#333",
        fontStyle: "italic",
        margin: "15px 0",
        borderLeft: "3px solid #eee",
        paddingLeft: "15px",
      },
    
      poemLine: {
        margin: "8px 0",
        lineHeight: "1.6",
      },
    
      poemStats: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginTop: "20px",
        color: "#666",
        fontSize: "0.9rem",
      },
    
      statItem: {
        display: "flex",
        alignItems: "center",
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
        marginTop: "20px",
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