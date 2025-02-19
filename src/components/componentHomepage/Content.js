
// const Content = () => {
//   const poems = [
//     {
//       author: "KalenGuy34",
//       time: "2h trước",
//       title: "Để cooking bài nhạc làm miếng bò áp chảo",
//       content: `"Tôi đang trong bếp ngó xa xăm
// Người bạn năm ấy chẳng quay về
// Cooking bài nhạc chả bạn tôi
// Cõi lòng nạm mắc nhớ thương ai ..."`,
//       views: 210,
//       likes: 16,
//       comments: 2,
//     },
//     {
//       author: "Cauvàng169",
//       time: "4h trước",
//       title: "Cậu vàng và đứa bé mồ côi",
//       content: `"Tiễn gần đến biển, gió hừng đông
// Lạnh ướt đôi chân, rét và gầy
// Bên tôi chỉ có một cậu bé
// Hoài nhớ mong cha mãi chẳng về ..."`,
//       views: 452,
//       likes: 217,
//       comments: 31,
//     },
//   ];

//   const authors = [
//     { rank: 1, name: "KalenGuy34", avatar: "🧑‍💼", color: "#f7d42d" },
//     { rank: 2, name: "Tabooq253", avatar: "👤", color: "#0d6efd" },
//     { rank: 3, name: "KaBoow254", avatar: "👩", color: "#d63384" },
//   ];

//   const topPoems = [
//     { rank: 1, title: "Để cooking bài nhạc làm miếng bò áp chảo", author: "KalenGuy34" },
//     { rank: 2, title: "Về khói ra mây", author: "KalenGuy34" },
//     { rank: 3, title: "Vẻ đẹp thật sự nằm trong ánh mắt...", author: "Tabooq253" },
//   ];

//   const styles = {
//     container: {
//       display: "grid",
//       gridTemplateColumns: "3fr 1fr",
//       gap: "20px",
//       padding: "20px",
//       fontFamily: "Arial, sans-serif",
//       backgroundColor: "#f9f9f9",
//     },
//     leftColumn: {
//       display: "flex",
//       flexDirection: "column",
//     },
//     dailyMessage: {
//       background: "#f6e3c5",
//       padding: "15px",
//       borderRadius: "5px",
//       marginBottom: "20px",
//       textAlign: "center",
//       fontStyle: "italic",
//       border: "1px solid #d4a373",
//     },
//     poemCard: {
//       border: "1px solid #ddd",
//       borderRadius: "10px",
//       padding: "20px",
//       marginBottom: "20px",
//       background: "white",
//       boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
//     },
//     poemHeader: {
//       display: "flex",
//       alignItems: "center",
//       marginBottom: "10px",
//     },
//     authorAvatar: {
//       width: "50px",
//       height: "50px",
//       borderRadius: "50%",
//       marginRight: "10px",
//       border: "1px solid #ddd",
//     },
//     poemContent: {
//       fontStyle: "italic",
//       margin: "10px 0",
//       color: "#555",
//     },
//     poemStats: {
//       display: "flex",
//       gap: "15px",
//       color: "#777",
//       marginTop: "10px",
//     },
//     readMore: {
//       color: "#0066cc",
//       textDecoration: "none",
//       fontWeight: "bold",
//       marginTop: "10px",
//       display: "inline-block",
//     },
//     rightColumn: {
//       display: "flex",
//       flexDirection: "column",
//       gap: "20px",
//     },
//     topSection: {
//       border: "1px solid #ddd",
//       borderRadius: "10px",
//       padding: "15px",
//       background: "#fff",
//       boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
//     },
//     topTitle: {
//       fontWeight: "bold",
//       marginBottom: "10px",
//       display: "flex",
//       alignItems: "center",
//       fontSize: "18px",
//     },
//     topList: {
//       listStyle: "none",
//       padding: "0",
//       margin: "0",
//     },
//     topItem: {
//       display: "flex",
//       alignItems: "center",
//       marginBottom: "10px",
//     },
//     topItemRank: {
//       fontWeight: "bold",
//       fontSize: "16px",
//       marginRight: "10px",
//     },
//     topItemAvatar: {
//       width: "30px",
//       height: "30px",
//       borderRadius: "50%",
//       marginRight: "10px",
//     },
//     topItemName: {
//       fontSize: "14px",
//     },
//     topItemLine: {
//       borderTop: "1px solid #ddd",
//       width: "100%",
//       marginTop: "5px",
//       marginBottom: "5px",
//     },
//     seeMore: {
//       color: "#0066cc",
//       textDecoration: "underline",
//       fontWeight: "bold",
//       fontSize: "14px",
//       marginTop: "10px",
//     },
//   };

//   return (
//     <div style={styles.container}>
//       {/* Cột trái */}
//       <div style={styles.leftColumn}>
//         <div style={styles.dailyMessage}>
//           <p>
//             <strong>Thông điệp của ngày:</strong> "Trời lạnh rét buốt, cần người
//             sưởi ấm cho đêm đông"
//           </p>
//         </div>

//         {poems.map((poem, index) => (
//           <div key={index} style={styles.poemCard}>
//             <div style={styles.poemHeader}>
//               <img
//                 src={`https://via.placeholder.com/50?text=${poem.author.charAt(
//                   0
//                 )}`}
//                 alt={poem.author}
//                 style={styles.authorAvatar}
//               />
//               <div>
//                 <strong>{poem.author}</strong>
//                 <p>{poem.time}</p>
//               </div>
//             </div>
//             <h3>{poem.title}</h3>
//             <p style={styles.poemContent}>{poem.content}</p>
//             <div style={styles.poemStats}>
//               <span>👁️ {poem.views}</span>
//               <span>❤️ {poem.likes}</span>
//               <span>💬 {poem.comments}</span>
//             </div>
//             <a href="#read-more" style={styles.readMore}>
//               Xem bài thơ &gt;
//             </a>
//           </div>
//         ))}
//       </div>

//       {/* Cột phải */}
//       <div style={styles.rightColumn}>
//         {/* Top tác giả */}
//         <div style={styles.topSection}>
//           <div style={styles.topTitle}>
//             Top các tác giả được yêu thích 👑
//           </div>
//           <ul style={styles.topList}>
//             {authors.map((author, index) => (
//               <li key={index} style={styles.topItem}>
//                 <span style={{ ...styles.topItemRank, color: author.color }}>
//                   #{author.rank}
//                 </span>
//                 <span style={styles.topItemAvatar}>{author.avatar}</span>
//                 <div>
//                   <span style={styles.topItemName}>{author.name}</span>
//                   <div style={styles.topItemLine} />
//                 </div>
//               </li>
//             ))}
//           </ul>
//           <a href="#see-more" style={styles.seeMore}>
//             Xem thêm &gt;
//           </a>
//         </div>

//         {/* Top bài thơ */}
//         <div style={styles.topSection}>
//           <div style={styles.topTitle}>
//             Top các bài thơ được yêu thích 📖
//           </div>
//           <ul style={styles.topList}>
//             {topPoems.map((poem, index) => (
//               <li key={index} style={styles.topItem}>
//                 <span style={{ ...styles.topItemRank, color: "#f7d42d" }}>
//                   #{poem.rank}
//                 </span>
//                 <div>
//                   <span style={styles.topItemName}>{poem.title}</span>
//                   <br />
//                   <small style={{ color: "#555" }}>{poem.author}</small>
//                   <div style={styles.topItemLine} />
//                 </div>
//               </li>
//             ))}
//           </ul>
//           <a href="#see-more" style={styles.seeMore}>
//             Xem thêm &gt;
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { CiBookmark } from "react-icons/ci";
import { IoBookmark } from "react-icons/io5";
import { BiLike, BiSolidLike, BiCommentDetail } from "react-icons/bi";
import { IoIosMore } from "react-icons/io";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";

const Content = ({ activeTab }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  const navigate = useNavigate();

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  }

  const authors = [
    { rank: 1, name: "KalenGuy34", avatar: "🧑‍💼", color: "#f7d42d" },
    { rank: 2, name: "Tabooq253", avatar: "👤", color: "#0d6efd" },
    { rank: 3, name: "KaBoow254", avatar: "👩", color: "#d63384" },
  ];

  const topPoems = [
    { rank: 1, title: "Để cooking bài nhạc làm miếng bò áp chảo", author: "KalenGuy34" },
    { rank: 2, title: "Về khói ra mây", author: "KalenGuy34" },
    { rank: 3, title: "Vẻ đẹp thật sự nằm trong ánh mắt...", author: "Tabooq253" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };

  const handleBookmark = async (postId) => {
    if (isLoggedIn === false) {
      showModal();
      return;
    }
    const isCurrentlyBookmarked = bookmarkedPosts[postId];
    const method = isCurrentlyBookmarked ? "DELETE" : "POST";

    try {
      const response = await fetch(
        `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem/${postId}`,
        { method, headers }
      );

      if (response.ok) {
        setBookmarkedPosts(prev => ({
          ...prev,
          [postId]: !isCurrentlyBookmarked
        }));

        setData(prevData => prevData.map(item =>
          item.id === postId ? {
            ...item,
          } : item
        ));
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };


  const handleLike = async (postId) => {
    if (isLoggedIn === false) {
      showModal();
    }

    const isCurrentlyLiked = likedPosts[postId];
    const method = isCurrentlyLiked ? "DELETE" : "POST";

    try {
      const response = await fetch(
        `https://api-poemtown-staging.nodfeather.win/api/likes/v1/${postId}`,
        { method, headers }
      );

      if (response.ok) {
        setLikedPosts(prev => ({
          ...prev,
          [postId]: !isCurrentlyLiked
        }));


        setData(prevData => prevData.map(item =>
          item.id === postId ? {
            ...item,
            likeCount: isCurrentlyLiked ? item.likeCount - 1 : item.likeCount + 1
          } : item
        ));
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const fetchData = async (apiUrl) => {
    try {
      const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      };
      const response = await fetch(apiUrl, { headers: requestHeaders });

      const data = await response.json();
      console.log(data)
      const initialBookmarkedState = {};
      const initialLikedState = {};
      data.data.forEach(item => {
        initialLikedState[item.id] = !!item.like;
        initialBookmarkedState[item.id] = !!item.targetMark;
      });

      setBookmarkedPosts(initialBookmarkedState);
      setLikedPosts(initialLikedState);
      setData(data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    let apiUrl = "https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts";
    switch (activeTab) {
      case "trending":
        apiUrl = "https://api-poemtown-staging.nodfeather.win/api/poems/v1/trending";
        break;
      case "collections":
        apiUrl = "/api/collections";
        break;
      default:
        apiUrl = "https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts";
        break;
    }

    fetchData(apiUrl);
  }, [activeTab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  return (
    <div style={styles.contentContainer}>
      <Modal open={isModalOpen} onCancel={handleCancel} footer={() => (
        <>
          <button style={styles.signupButton} onClick={handleSignup}>
            Đăng ký
          </button>
          <button style={styles.loginButton} onClick={handleLogin}>
            Đăng nhập
          </button>

        </>
      )}>
        <h2 style={{ textAlign: "center", color: "red", fontSize: "1.8rem" }}>Vui lòng đăng nhập để sử dụng</h2>
        <img alt="Access Denied" style={{ margin: "0 15%", width: "70%" }} src="./access_denied_nofitication.png" />
      </Modal>
      <div style={styles.leftColumn}>
        <div style={styles.poemsList}>
          <h2 style={styles.contentTitle}>{activeTab.toUpperCase()}</h2>
          {data.map((item) => (
            <div key={item.id} style={styles.poemCard}>
              <div style={styles.avatarContainer}>
                <img
                  src={item.author?.avatar || "./default_avatar.png"}
                  alt="avatar"
                  style={styles.avatar}
                  onError={(e) => {
                    e.target.src = "./default_avatar.png";
                  }}
                />
              </div>
              <div style={styles.contentRight}>
                <div style={styles.cardHeader}>
                  <div style={styles.headerLeft}>
                    <span style={styles.author}>@{item.author?.username || 'Anonymous'}</span>
                    <span style={styles.postDate}>–{formatDate(item.createdAt)}</span>
                  </div>
                  <div style={styles.headerRight}>
                    <button
                      style={styles.iconButton}
                      onClick={() => handleBookmark(item.id)}
                    >
                      {bookmarkedPosts[item.id] ? <IoBookmark color="#FFCE1B" /> : <CiBookmark />}
                    </button>
                    <button style={styles.iconButton}>
                      <IoIosMore />
                    </button>
                  </div>
                </div>

                <h3 style={styles.poemTitle}>{item.title}</h3>

                <p style={styles.poemDescription}>
                  Mô tả: {item.description}
                </p>

                <div style={styles.poemContent}>
                  {item.content?.split('\n').map((line, index) => (
                    <p key={index} style={styles.poemLine}>"{line}"</p>
                  ))}
                </div>

                <div style={styles.footerContainer}>
                  <div style={styles.statsContainer}>
                    <button
                      style={styles.likeButton}
                      onClick={() => handleLike(item.id)}
                    >
                      {likedPosts[item.id] ? (
                        <BiSolidLike color="#2a7fbf" />
                      ) : (
                        <BiLike />
                      )}
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
                      ...(isHovered && styles.viewButtonHover)
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Xem bài thơ &gt;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.rightColumn}>
        {/* Top tác giả */}
        <div style={styles.topSection}>
          <div style={styles.topTitle}>
            Top các tác giả được yêu thích 👑
          </div>
          <ul style={styles.topList}>
            {authors.map((author, index) => (
              <li key={index} style={styles.topItem}>
                <span style={{ ...styles.topItemRank, color: author.color }}>
                  #{author.rank}
                </span>
                <span style={styles.topItemAvatar}>{author.avatar}</span>
                <div>
                  <span style={styles.topItemName}>{author.name}</span>
                  <div style={styles.topItemLine} />
                </div>
              </li>
            ))}
          </ul>
          <a href="#see-more" style={styles.seeMore}>
            Xem thêm &gt;
          </a>
        </div>

        {/* Top bài thơ */}
        <div style={styles.topSection}>
          <div style={styles.topTitle}>
            Top các bài thơ được yêu thích 📖
          </div>
          <ul style={styles.topList}>
            {topPoems.map((poem, index) => (
              <li key={index} style={styles.topItem}>
                <span style={{ ...styles.topItemRank, color: "#f7d42d" }}>
                  #{poem.rank}
                </span>
                <div>
                  <span style={styles.topItemName}>{poem.title}</span>
                  <br />
                  <small style={{ color: "#555" }}>{poem.author}</small>
                  <div style={styles.topItemLine} />
                </div>
              </li>
            ))}
          </ul>
          <a href="#see-more" style={styles.seeMore}>
            Xem thêm &gt;
          </a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loginButton: {
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#F5A623",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "20px"
  },
  authorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
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
    gap: "20px"
  },

  contentTitle: {
    color: "#333",
    marginBottom: "30px",
    textAlign: "center",
  },
  contentRight: {
    flexBasis: "100%",
  },

  poemsList: {
    display: "grid",
    gap: "25px",
  },

  poemCard: {
    display: "flex",
    gap: "10px",
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    alignItems: "flex-start",
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
    flex: "7",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    flex: "3"
  },
  topSection: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    marginTop: "20px",
    background: "#fff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  topTitle: {
    fontWeight: "bold",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    fontSize: "18px",
  },
  topList: {
    listStyle: "none",
    padding: "0",
    margin: "0",
  },
  topItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  topItemRank: {
    fontWeight: "bold",
    fontSize: "16px",
    marginRight: "10px",
  },
  topItemAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    marginRight: "10px",
  },
  topItemName: {
    fontSize: "14px",
  },
  topItemLine: {
    borderTop: "1px solid #ddd",
    width: "100%",
    marginTop: "5px",
    marginBottom: "5px",
  },
  seeMore: {
    color: "#0066cc",
    textDecoration: "underline",
    fontWeight: "bold",
    fontSize: "14px",
    marginTop: "10px",
  },
};

export default Content;
