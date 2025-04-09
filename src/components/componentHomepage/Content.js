import React, { useEffect, useState } from "react";
import { Avatar, Button, List, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import CollectionCard from "./CollectionCard";
import PoemCard from "./PoemCard";
import RecordCard from "./RecordCard";
import { BiCommentDetail, BiLike } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";

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
  const [records, setRecord] = useState([]);
  const [isCommunity, setIsCommunity] = useState(false);
  const [title, setTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [poemLeaderBoard, setPoemLeaderBoard] = useState({ topPoems: [] });
  const [userLeaderBoard, setUserLeaderBoard] = useState({ topUsers: [] });
  const [isLeaderboardUserModalVisible, setIsLeaderboardUserModalVisible] = useState(false);
  const [isLeaderboardPoemModalVisible, setIsLeaderboardPoemModalVisible] = useState(false);

  const accessToken = localStorage.getItem("accessToken");
  const [hoveredUserLdb, setHoveredUserLdb] = useState(null);

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

  const getRankColor = (rank) => {
    if (rank === 1) return "#f7d42d";
    if (rank === 2) return "#0d6efd";
    if (rank === 3) return "#d63384";
    return "#000"; // default color for other ranks
  };

  const openLeaderboardUserModal = () => {
    setIsLeaderboardUserModalVisible(true);
  };

  const closeLeaderboardUserModal = () => {
    setIsLeaderboardUserModalVisible(false);
  };

  const openLeaderboardPoemModal = () => {
    setIsLeaderboardPoemModalVisible(true);
  };

  const closeLeaderboardPoemModal = () => {
    setIsLeaderboardPoemModalVisible(false);
  };

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
  ? `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection/${id}`
  : `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`;

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
    setIsBookmarkCollectionTab(false);
    fetchData(`${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem?pageNumber=${currentPage}&pageSize=${pageSize}`);
  };


  const handleChangeToBookmarkCollection = () => {
    setIsBookmarkCollectionTab(true)
    fetchData(`${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection?pageNumber=${currentPage}&pageSize=${pageSize}`);
  }


  const handleLike = async (postId) => {
    if (isLoggedIn === false) {
      showModal();
    }

    const isCurrentlyLiked = likedPosts[postId];
    const method = isCurrentlyLiked ? "DELETE" : "POST";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${postId}`,
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
          setRecord([]);// Clear record data

        } else if (apiUrl.includes('/record-files/')) {
          setRecord(data.data)
          setData([]); // Clear poem data

          setCollections([]);
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
          setRecord([]);// Clear record data

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
    let apiUrl = `${process.env.REACT_APP_API_BASE_URL}/poems/v1/posts`;
    console.log("activeTab hiện tại:", activeTab);
    switch (activeTab) {
      case "trending":
        apiUrl = `${process.env.REACT_APP_API_BASE_URL}/poems/v1/trending?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Đạt được lượng tương tác lớn trong thời gian gần 📈");
        setIsCommunity(false);
        break;
      case "collections":
        apiUrl = `${process.env.REACT_APP_API_BASE_URL}/collections/v1/trending?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Các Tập thơ của người dùng được yêu thích gần đây 📚");
        setIsCommunity(false);
        break;
      case "bookmark":
        if (isBookmarkCollectionTab) {
          apiUrl = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection?pageNumber=${currentPage}&pageSize=${pageSize}`
        } else {
          apiUrl = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem?pageNumber=${currentPage}&pageSize=${pageSize}`;
        }
        setIsBookmarkTab(true);
        setTitle("");
        setIsCommunity(false);
        break;
      case "community":
        apiUrl = `${process.env.REACT_APP_API_BASE_URL}/collections/v1/community?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Hãy cùng nhau chung tay đóng góp cho cộng đồng Thị trấn thơ 🏡")
        setIsCommunity(true);
        break;
      case "audioread":
        apiUrl = `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/all?pageNumber=${currentPage}&pageSize=${pageSize}`;
        setIsBookmarkTab(false);
        setTitle("Lắng nghe và cảm nhận sẽ mang đến bức tranh toàn cảnh️ ▶️")
        setIsCommunity(false);
        break;
      default:
        apiUrl = `${process.env.REACT_APP_API_BASE_URL}/poems/v1/posts?pageNumber=${currentPage}&pageSize=${pageSize}`;
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

  useEffect(() => {
    const fetchLeaderBoard = async () => {
      const requestHeaders = {
        "Content-Type": "application/json",
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leaderboards/v1/poem-leaderboard`, {
        headers: requestHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("poemLdb", data.data)
      setPoemLeaderBoard(data.data); // set the entire object
    };

    fetchLeaderBoard();
  }, []);

  useEffect(() => {
    const fetchUserLeaderBoard = async () => {
      const requestHeaders = {
        "Content-Type": "application/json",
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/leaderboards/v1/user-leaderboard`, {
        headers: requestHeaders
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data.data);
      setUserLeaderBoard(data.data); // set the entire object
    };

    fetchUserLeaderBoard();
  }, []);


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
                <p style={{ flexGrow: 1, textAlign: "center", alignSelf: "center" }}>Chúc mừng sinh nhật Võ Đăng Khôi (Kalen Guy)</p>
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
                {records.map((item) => (
                  <RecordCard
                    key={item.id}
                    record={item}
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
              {userLeaderBoard && userLeaderBoard.topUsers?.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  style={{
                    marginBottom: "20px",
                    opacity: hoveredUserLdb === user.id ? 0.8 : 1,
                    cursor: "pointer",
                    transition: "opacity 0.3s",
                    backgroundColor: hoveredUserLdb === user.id ? "#f1f1f1" : "",
                    borderRadius: "20px 20px 0 0"
                  }}
                  onMouseEnter={() => setHoveredUserLdb(user.id)}
                  onMouseLeave={() => setHoveredUserLdb(null)}
                  onClick={() => navigate(`/user/${user.user.userName}`)}
                >
                  <li key={user.id} style={styles.topItem}>
                    <span style={{ ...styles.topItemRank, color: getRankColor(user.rank) }}>
                      #{user.rank}
                    </span>
                    <img style={styles.topItemAvatar} src={user.user.avatar ?? "./default_avatar.png"} alt="avatar user" />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={styles.topItemName}>{user.user.displayName}</span>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                        <HiUsers /> <span style={{ fontSize: "0.9rem" }}>{user.user.totalFollower}</span>
                      </div>
                    </div>
                  </li>
                  <div style={styles.topItemLine} />
                </div>
              ))}
            </ul>
            <a onClick={openLeaderboardUserModal} style={styles.seeMore}>
              Xem thêm &gt;
            </a>
            <Modal
              title="Top các tác giả được yêu thích 👑"
              visible={isLeaderboardUserModalVisible}
              onCancel={closeLeaderboardUserModal}
              footer={[
                <Button key="close" onClick={closeLeaderboardUserModal}>
                  Đóng
                </Button>,
              ]}
            >
              <List
                itemLayout="horizontal"
                dataSource={userLeaderBoard ? userLeaderBoard.topUsers : []}
                renderItem={(user) => (
                  <List.Item
                    onClick={() => navigate(`/user/${user.user.userName}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <li key={user.id} style={styles.topItem}>
                      <span style={{ ...styles.topItemRank, color: getRankColor(user.rank) }}>
                        #{user.rank}
                      </span>
                      <img style={styles.topItemAvatar} src={user.user.avatar ?? "./default_avatar.png"} alt="avatar user" />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={styles.topItemName}>{user.user.displayName}</span>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}>
                          <HiUsers /> <span style={{ fontSize: "0.9rem" }}>{user.user.totalFollower}</span>
                        </div>
                      </div>
                    </li>
                  </List.Item>
                )}
              />
            </Modal>
          </div>

          {/* Top bài thơ */}
          <div style={styles.topSection}>
            <div style={styles.topTitle}>
              Top các bài thơ được yêu thích 📖
            </div>
            <ul style={styles.topList}>
              {poemLeaderBoard && poemLeaderBoard.topPoems?.slice(0, 3).map((poem) => (
                <div style={{ marginBottom: "20px", cursor: "pointer"}}  onClick={() => navigate(`/poem/${poem.poem.id}`)}>
                  <li key={poem.id} style={styles.topItem}>
                    <span style={{ ...styles.topItemRank, color: getRankColor(poem.rank) }}>
                      #{poem.rank}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center", width: "100%" }}>
                      <span style={styles.topItemName}>{poem.poem.title}</span>
                      <div>
                        <small style={{ margin: 0 }}>
                          Mô tả:{" "}
                          <span style={{ color: "#222" }}>
                            {poem.poem.description.length > 50
                              ? `${poem.poem.description.substring(0, 50)}...`
                              : poem.poem.description}
                          </span>
                        </small>
                      </div>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: "30px" }}>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}><BiLike /> {poem.poem.likeCount}</div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}><BiCommentDetail /> {poem.poem.commentCount}</div>
                      </div>
                      <small style={{ color: "#555", alignSelf: 'flex-end' }}>{poem.poem.user.displayName || "annoymous"}</small>
                    </div>
                  </li>
                  <div style={styles.topItemLine} />
                </div>
              ))}
            </ul>
            <a onClick={openLeaderboardPoemModal} style={styles.seeMore}>
              Xem thêm &gt;
            </a>
            <Modal
              title="Top các bài thơ được yêu thích 📖"
              visible={isLeaderboardPoemModalVisible}
              onCancel={closeLeaderboardPoemModal}
              footer={[
                <Button key="close" onClick={closeLeaderboardPoemModal}>
                  Đóng
                </Button>,
              ]}
            >
              <List
                itemLayout="horizontal"
                dataSource={poemLeaderBoard ? poemLeaderBoard.topPoems : []}
                renderItem={(poem) => (
                  <List.Item
                    onClick={() => navigate(`/poem/${poem.poem.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <li key={poem.id} style={styles.topItem}>
                      <span style={{ ...styles.topItemRank, color: getRankColor(poem.rank) }}>
                        #{poem.rank}
                      </span>
                      <div style={{display: "flex", flexDirection: "row", gap: "20px", width: "100%"}}>
                        <div style={styles.poemImageContainer}>
                          <img
                            src={poem.poem.poemImage || "/anhminhhoa.png"}
                            alt="anh minh hoa"
                            style={styles.poemImage}
                            onError={(e) => {
                              console.log("Image failed to load, switching to fallback");
                              e.target.onerror = null;
                              e.target.src = "/anhminhhoa.png";
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center", width: "100%", flex: 1 }}>
                          <span style={styles.topItemName}>{poem.poem.title}</span>
                          <div>
                            <small style={{ margin: 0 }}>
                              Mô tả:{" "}
                              <span style={{ color: "#222" }}>
                                {poem.poem.description.length > 50
                                  ? `${poem.poem.description.substring(0, 50)}...`
                                  : poem.poem.description}
                              </span>
                            </small>
                          </div>
                          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: "30px" }}>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}><BiLike /> {poem.poem.likeCount}</div>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}><BiCommentDetail /> {poem.poem.commentCount}</div>
                          </div>
                          <small style={{ color: "#005cc5", alignSelf: 'flex-end' }}>{poem.poem.user.displayName || "annoymous"}</small>
                        </div>
                      </div>
                    </li>
                  </List.Item>
                )}
              />
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  poemImageContainer: {
    width: "84px",
    height: "134px",
    border: "1px solid #000",
    marginLeft: "20px",
  },

  poemImage: {
    width: "84px",
    maxWidth: "84px",
    height: "100%",
    objectFit: "cover", // This will prevent stretching
    objectPosition: "center" // Center the image
  },

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
    gap: "40px",
    justifyContent: "center",
    maxWidth: "1600px",
    margin: "0 auto"
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
    flex: "8",

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
    textAlign: "center",
    fontSize: "1.1rem",
    margin: "0 auto 20px"
  },
  topList: {
    listStyle: "none",
    padding: "0px 30px",
    margin: "0",
  },
  topItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    width: "100%"
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
    fontSize: "0.9rem",
    fontWeight: "bold"
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
    cursor: "pointer"
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
