import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import CollectionCard from "./CollectionCard";
import PoemCard from "./PoemCard";

const Content = ({ activeTab }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState([]);
  const [collections, setCollections] = useState([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [isBookmarkTab, setIsBookmarkTab] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookmarkCollectionTab, setIsBookmarkCollectionTab] = useState(false);
  const [bookmarkedCollections, setBookmarkedCollections] = useState({});
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isCommunity, setIsCommunity] = useState(false);
  const [title, setTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

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

  const handleMoveToDetail = (collection) => {
    setSelectedCollection(collection); // Chuyển sang trang chi tiết
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, isBookmarkCollectionTab]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };

  const handleBookmark = async (id, isCollection = false) => {
    if (!isLoggedIn) {
      showModal();
      return;
    }

    const endpoint = isCollection
      ? `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection/${id}`
      : `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem/${id}`;

    const currentState = isCollection
      ? bookmarkedCollections[id]
      : bookmarkedPosts[id];

    try {
      const response = await fetch(endpoint, {
        method: currentState ? "DELETE" : "POST",
        headers
      });

      if (response.ok) {
        if (isCollection) {
          setBookmarkedCollections(prev => ({
            ...prev,
            [id]: !currentState
          }));
        } else {
          setBookmarkedPosts(prev => ({
            ...prev,
            [id]: !currentState
          }));
        }
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const handleChangeToBookmarkPoem = () => {
    setIsBookmarkCollectionTab(false)
    fetchData("https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem");
  }


  const handleChangeToBookmarkCollection = () => {
    setIsBookmarkCollectionTab(true)
    fetchData("https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection");
  }


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
    let abortController;
    try {
      abortController = new AbortController();
      setIsLoading(true);
      setError(null);

      const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      };

      const response = await fetch(apiUrl, { headers: requestHeaders, signal: abortController.signal });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      if (!abortController.signal.aborted) {
        if (data.totalPages) {
          setTotalPages(data.totalPages);
        }
        // Determine data type based on API URL instead of isCollection state
        if (apiUrl.includes('/collections/') || apiUrl.includes('target-marks/v1/collection')) {
          // Handle collections data
          const initialCollectionBookmarks = {};
          data.data.forEach(item => {
            initialCollectionBookmarks[item.id] = !!item.targetMark;
          });
          setBookmarkedCollections(initialCollectionBookmarks);
          setCollections(data.data);
          setData([]); // Clear poem data
        } else {
          // Handle poems data
          const initialBookmarkedState = {};
          const initialLikedState = {};
          data.data.forEach(item => {
            initialLikedState[item.id] = !!item.like;
            initialBookmarkedState[item.id] = !!item.targetMark;
          });
          setBookmarkedPosts(initialBookmarkedState);
          setLikedPosts(initialLikedState);
          setData(data.data);
          setCollections([]); // Clear collection data
        }
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.error("Error fetching data:", error);
        setError(error.message);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let abortController = new AbortController();
    let apiUrl = "https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts";

    switch (activeTab) {
      case "trending":
        apiUrl = `https://api-poemtown-staging.nodfeather.win/api/poems/v1/trending?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Đạt được lượng tương tác lớn trong thời gian gần 📈");
        setIsCommunity(false);
        break;
      case "collections":
        apiUrl = `https://api-poemtown-staging.nodfeather.win/api/collections/v1/trending?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Các Tập thơ của người dùng được yêu thích gần đây 📚");
        setIsCommunity(false);
        break;
      case "bookmark":
        if (isBookmarkCollectionTab) {
          apiUrl = `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection?pageNumber=${currentPage}&pageSize=${pageSize}`
        } else {
          apiUrl = `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem?pageNumber=${currentPage}&pageSize=${pageSize}`;
        }
        setIsBookmarkTab(true);
        setTitle("");
        setIsCommunity(false);
        break;
      case "community":
        apiUrl = `https://api-poemtown-staging.nodfeather.win/api/collections/v1/community?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Hãy cùng nhau chung tay đóng góp cho cộng đồng Thị trấn thơ 🏡")
        setIsCommunity(true);
        break;
      case "audioread":
        apiUrl = `https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts?filterOptions.audio=1&pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Lắng nghe và cảm nhận sẽ mang đến bức tranh toàn cảnh️ ▶️")
        setIsCommunity(false);
        break;
      default:
        apiUrl = `https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Những bài thơ nóng hổi, vừa thổi vừa đọc 📰")
        setIsCommunity(false);
        break;
    }

    fetchData(apiUrl);

    return () => {
      abortController.abort();
    };
  }, [activeTab, currentPage, pageSize, isBookmarkCollectionTab]);

  return (
    <div>
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
            <h2 style={styles.contentTitle}>{title}</h2>
            {!isBookmarkTab && (
              <div style={styles.idea}>
                <p style={{ fontWeight: "bold", marginTop: "5px", marginLeft: "10px" }}>Thông điệp của ngày: </p>
                <p style={{ flexGrow: 1, textAlign: "center", alignSelf: "center" }}>Ngôn từ chỉ đóng góp, Tâm hồn của bạn mới là nơi cảm xúc bắt đầu</p>
              </div>
            )}
            {isLoading && (
              <div style={styles.loading}>
                Loading...
              </div>
            )}
            {error && (
              <div style={styles.error}>
                Error: {error}
                <button onClick={() => fetchData()}>Retry</button>
              </div>
            )}
            {isBookmarkTab && (
              <div>
                <button style={isBookmarkCollectionTab ? styles.toggleBookmarkPoem : styles.toggleBookmarkPoemActive}
                  onClick={handleChangeToBookmarkPoem}
                >
                  Bài thơ
                </button>
                <button style={isBookmarkCollectionTab ? styles.toggleBookmarkCollectionActive : styles.toggleBookmarkCollection}
                  onClick={handleChangeToBookmarkCollection}
                >
                  Tập thơ
                </button>
                <hr style={{ border: "2px solid #FFD557", borderRadius: "5px" }} />
              </div>
            )}
            {!isLoading && !error && (
              <div>
                {data.map((item) => (
                  <PoemCard
                    key={item.id}
                    item={item}
                    liked={likedPosts[item.id]}
                    bookmarked={bookmarkedPosts[item.id]}
                    onBookmark={handleBookmark}
                    onLike={handleLike}
                    onHover={setIsHovered}
                  />
                ))}
                {collections.map((item) => (
                  <CollectionCard
                    key={item.id}
                    item={item}
                    onBookmark={handleBookmark}
                    isBookmarked={bookmarkedCollections[item.id] || false}
                    isCommunity={isCommunity}
                  />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={styles.paginationButton}
                >
                  Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= totalPages}
                  style={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
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
    </div>
  );
};

const styles = {
  idea: {
    display: "flex",
    width: "100%",
    height: "60px",
    backgroundImage: `url('./background_idea.png')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "1px solid #000000",
    borderBottomLeftRadius: "100px",
    borderTopRightRadius: "100px",
    marginBottom: "20px",
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '1.2rem'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    padding: '20px',
    fontSize: '1.2rem'
  },
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

  contentContainer: {
    maxWidth: "100%",
    display: "flex",
    gap: "40px"
  },

  contentTitle: {
    color: "#333",
    marginTop: "30px",
    marginBottom: "20px",
    fontSize: "20px",

  },

  leftColumn: {
    display: "flex",
    flexDirection: "column",
    flex: "6",

  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "328px",
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

  toggleBookmarkPoem: {
    backgroundColor: "white",
    border: "1px solid #00000080",
    color: "#000",
    padding: "10px",
    borderRadius: "10px 0 0 10px",
    fontSize: "16px",
  },

  toggleBookmarkPoemActive: {
    backgroundColor: "#FFCD37B3",
    border: "2px solid #FFC823",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: "10px 0 0 10px",
    fontSize: "16px",
  },

  toggleBookmarkCollection: {
    backgroundColor: "white",
    border: "1px solid #00000080",
    color: "#000",
    padding: "10px",
    borderRadius: "0 10px 10px 0",
    fontSize: "16px",
  },

  toggleBookmarkCollectionActive: {
    backgroundColor: "#FFCD37B3",
    border: "2px solid #FFC823",
    color: "#fff",
    fontWeight: "bold",
    padding: "10px",
    borderRadius: "0 10px 10px 0",
    fontSize: "16px",
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    margin: '20px 0',
  },
  paginationButton: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    '&:disabled': {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },
  pageInfo: {
    fontSize: '14px',
    color: '#666',
  },
};

export default Content;
