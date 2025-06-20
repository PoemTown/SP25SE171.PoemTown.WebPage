import React, { useEffect, useState } from "react";
import { Avatar, Button, Card, Carousel, List, message, Modal, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import CollectionCard from "./CollectionCard";
import PoemCard from "./PoemCard";
import RecordCard from "./RecordCard";
import { BiCommentDetail, BiLike } from "react-icons/bi";
import { HiUsers } from "react-icons/hi2";
import RecordListGroupedByPoem from "./RecordListGroupedByPoem";
import Title from "antd/es/typography/Title";
import { RightOutlined } from "@ant-design/icons";
import { display } from "@mui/system";
import "./Content.css"

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
  const [dailyMessage, setDailyMessage] = useState("Nổ lực hết mình để đạt được thành quả tốt nhất!!!");
  const [isLoadingDailyMessage, setIsLoadingDailyMessage] = useState(false);
  const [errorDailyMessage, setErrorDailyMessage] = useState(null);

  const accessToken = localStorage.getItem("accessToken");
  const [hoveredUserLdb, setHoveredUserLdb] = useState(null);

  const navigate = useNavigate();

  // ── Famous poets ─────────────────────────────────────────────────
  const [famousPoets, setFamousPoets] = useState([]);
  const [isLoadingFamousPoets, setLoadingFP] = useState(false);
  const [errorFamousPoets, setErrorFP] = useState(null);

  const poetChunks = [];
  for (let i = 0; i < famousPoets.length; i += 3) {
    poetChunks.push(famousPoets.slice(i, i + 3));
  }

  // 2️⃣ Keep track of which chunk we're on
  const [currentChunkIdx, setCurrentChunkIdx] = useState(0);
  useEffect(() => {
    if (poetChunks.length < 2) return;
    const timer = setInterval(() => {
      setCurrentChunkIdx(i => (i + 1) % poetChunks.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [poetChunks]);

  const fetchDailyMessage = async () => {
    setIsLoadingDailyMessage(true);
    setErrorDailyMessage(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/daily-messages/v1/in-use`
      );
      if (!response.ok) throw new Error('Không lấy được thông điệp');
      const json = await response.json();
      setDailyMessage(json.data.message || "Nổ lực hết mình để đạt được thành quả tốt nhất!!!");
    } catch (err) {
      setErrorDailyMessage(err.message);
      console.error("Error fetching daily message:", err);
    } finally {
      setIsLoadingDailyMessage(false);
    }
  };

  useEffect(() => {
    const fetchFamous = async () => {
      setLoadingFP(true);
      setErrorFP(null);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1/live-board`,
        );
        if (!res.ok) throw new Error('Không lấy được danh sách');
        const json = await res.json();
        setFamousPoets(json.data || []);
      } catch (err) {
        setErrorFP(err.message);
      } finally {
        setLoadingFP(false);
      }
    };
    fetchFamous();
    fetchDailyMessage();
  }, []);

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
        message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
      }

      const data = await response.json();
      console.log(data.data);
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
        message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
      }

      const data = await response.json();
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
        message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
      }

      const data = await response.json();
      setUserLeaderBoard(data.data); // set the entire object
    };

    fetchUserLeaderBoard();
  }, []);

  const formatMonthYear = isoString => {
    const d = new Date(isoString);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${mm}/${yyyy}`;        // e.g. "04/2025"
  };

  const formatDate = isoString => {
    const d = new Date(isoString);

    console.log("UTC time:", d.toUTCString());

    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = d.getUTCFullYear();

    return `${dd}/${mm}/${yyyy}`;   // "31/05/2025"
  };

  return (
    <div style={{
      backgroundImage: `url("${process.env.PUBLIC_URL}/homepage_bg.png")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {!isBookmarkTab && (
        <div style={styles.idea}>
          <p style={{ fontWeight: "bold", marginTop: "5px", marginLeft: "10px" }}>Thông điệp của ngày: </p>
          {isLoadingDailyMessage ? (
            <Spin size="small" />
          ) : errorDailyMessage ? (
            <p style={{ flexGrow: 1, textAlign: "center", alignSelf: "center" }}>
              Nổ lực hết mình để đạt được thành quả tốt nhất!!!
            </p>
          ) : (
            <p style={{ flexGrow: 1, textAlign: "center", alignSelf: "center" }}>
              {dailyMessage}
            </p>
          )}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div>
          <h2 style={styles.contentTitle}>{title}</h2>
        </div>
      </div>
      <div className="contentContainer">
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

        <div style={styles.FamousPoetColumn}>
          {errorFamousPoets && (
            <div style={styles.error}>Lỗi: {errorFamousPoets}</div>
          )}
          <Card
            title={<Title level={2} style={{ fontWeight: 'bold', fontSize: '1rem' }}>Vầng sáng giữa trời thơ 🎓</Title>}
            bordered={false}
            style={styles.famousContainerCard}
          >
            {isLoadingFamousPoets ? (
              <div style={{ textAlign: 'center', padding: 24 }}><Spin /></div>
            ) : errorFamousPoets ? (
              <div style={styles.error}>Lỗi: {errorFamousPoets}</div>
            ) : famousPoets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24 }}>Không có dữ liệu</div>
            ) : (
              <div style={styles.carouselContainer}>
                {poetChunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    style={{
                      ...styles.slideChunk,
                      opacity: idx === currentChunkIdx ? 1 : 0,
                      zIndex: idx === currentChunkIdx ? 2 : 1,
                      pointerEvents: idx === currentChunkIdx ? 'auto' : 'none',
                      transition: 'opacity 0.8s ease-in-out'
                    }}
                  >
                    {chunk.map(poet => (
                      <div
                        key={poet.id}
                        style={styles.slideItem}
                        onClick={() => navigate(`/knowledge/poet/${poet.id}`)}
                      >
                        <Avatar size={64} src={poet.avatar} />
                        <Typography.Title level={5} style={styles.slideName}>
                          {poet.name}
                        </Typography.Title>
                        <Typography.Text style={styles.slideMeta}>
                          {/* {new Date(poet.dateOfBirth).toLocaleDateString()} &bull; {poet.gender === 'Male' ? 'Nam' : 'Nữ'} */}
                          {`${poet.yearOfBirth == null ? "Chưa rõ" : poet.yearOfBirth} - ${poet.yearOfDeath == null ? "Chưa rõ" : poet.yearOfDeath }`} &bull; {poet.gender === 'Male' ? 'Nam' : 'Nữ'}
                        </Typography.Text>
                        <Typography.Paragraph
                          ellipsis={{ rows: 3 }}
                          style={styles.slideBio}
                        >
                          {poet.bio}
                        </Typography.Paragraph>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={styles.leftColumn}>
          <div style={styles.poemsList}>
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
                    onPoemCreated={fetchData}
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
                <RecordListGroupedByPoem
                  records={records}
                />
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
          <div style={styles.topSection}>
            <div style={styles.topTitle}>
              BXH tác giả được yêu thích {formatMonthYear(userLeaderBoard.startDate)} 👑
            </div>
            <div style={{ color: "#666", fontSize: "0.8rem", textAlign: "center" }}>
              (Ngày tổng kết: {formatDate(userLeaderBoard.endDate)})
            </div>
            <hr style={{ border: "1px solid #fdf511", width: "100%" }} />
            <ul style={styles.topList}>
              {userLeaderBoard && userLeaderBoard.topUsers?.slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  style={{
                    marginTop: "20px",
                    marginBottom: "10px",
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
            <Button
              type="link"
              icon={<RightOutlined />}
              iconPosition="end"
              style={{ padding: 0, fontSize: "0.9rem", alignSelf: "flex-end" }}
              onClick={openLeaderboardUserModal}
            >
              Xem thêm
            </Button>
            <Modal
              title="BXH tác giả được yêu thích 👑"
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
                          <HiUsers size={15} /> <span style={{ fontSize: "0.8rem" }}>{user.user.totalFollower}</span>
                        </div>
                      </div>
                    </li>
                  </List.Item>
                )}
              />
            </Modal>
          </div>

          <div style={styles.topSection}>
            <div style={styles.topTitle}>
              BXH bài thơ được yêu thích {formatMonthYear(poemLeaderBoard.startDate)} 📖
            </div>
            <div style={{ color: "#666", fontSize: "0.8rem", textAlign: "center" }}>
              (Ngày tổng kết: {formatDate(poemLeaderBoard.endDate)})
            </div>
            <hr style={{ border: "1px solid #f0f", width: "100%" }} />
            <ul style={styles.topList}>
              {poemLeaderBoard && poemLeaderBoard.topPoems?.slice(0, 3).map((poem) => (
                <div style={{ marginTop: "20px", marginBottom: "10px", cursor: "pointer" }} onClick={() => navigate(`/poem/${poem.poem.id}`)}>
                  <li key={poem.id} style={styles.topItem}>
                    <span style={{ ...styles.topItemRank, color: getRankColor(poem.rank) }}>
                      #{poem.rank}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", justifyContent: "center", width: "100%" }}>
                      <span style={styles.topItemName}>{poem.poem.title}</span>
                      <div>
                        <small style={{ margin: 0, fontSize: "0.8rem" }}>
                          Mô tả:{" "}
                          <span style={{ color: "#222", fontSize: "0.8rem" }}>
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
                        }}><BiLike size={15} /> <span style={{ fontSize: "0.8rem" }} > {poem.poem.likeCount}</span></div>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}><BiCommentDetail size={15} /> <span style={{ fontSize: "0.8rem" }} >{poem.poem.commentCount}</span></div>
                      </div>
                      <small style={{ color: "#007bff", alignSelf: 'flex-end' }}>{poem.poem.user.displayName || "annoymous"}</small>
                    </div>
                  </li>
                  <div style={styles.topItemLine} />
                </div>
              ))}
            </ul>
            <Button
              type="link"
              icon={<RightOutlined />}
              iconPosition="end"
              style={{ padding: 0, fontSize: "0.9rem", alignSelf: "flex-end" }}
              onClick={openLeaderboardPoemModal}
            >
              Xem thêm
            </Button>
            <Modal
              title="BXH bài thơ được yêu thích 📖"
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
                      <div style={{ display: "flex", flexDirection: "row", gap: "20px", width: "100%" }}>
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
  FamousPoetColumn: {
    display: "flex",
    flexDirection: "column",
    flex: "3",
  },

  famousContainerCard: {
    background: '#fff',
    borderRadius: 8,
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #ddd",
    position: "relative",
    padding: 16
  },

  carouselContainer: {
    position: 'relative',
    height: "700px",
    width: '100%',
  },

  slideChunk: {
    display: "flex",
    flexDirection: "column",
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    justifyContent: 'space-between'
  },

  slideItem: {
    flex: '0 0 32%',
    cursor: 'pointer',
    textAlign: 'center',
    padding: 12,
    borderRadius: 8,
    background: '#fafafa',
    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
  },

  slideName: { margin: '12px 0 4px', fontWeight: 600, color: '#333' },
  slideMeta: { display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 8 },
  slideBio: { fontSize: '0.85rem', color: '#666' },

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
    objectFit: "cover",
    objectPosition: "center"
  },

  idea: {
    marginTop: "50px",
    maxWidth: "800px",
    display: "flex",
    width: "100%",
    height: "60px",
    backgroundImage: `url('./poet_knowledge_cover.png')`,
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
    maxWidth: "1200px",
    display: "flex",
    gap: "40px",
    justifyContent: "center",
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
    display: "flex",
    flexDirection: "column",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "20px",
    background: "#fff",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  },
  topTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: "1rem",
    margin: "0 auto 20px"
  },
  topList: {
    listStyle: "none",
    padding: "0px 10px",
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
    fontSize: "0.8rem",
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
