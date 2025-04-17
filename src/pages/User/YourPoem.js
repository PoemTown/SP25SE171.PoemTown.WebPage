import React, { useState, useEffect } from "react";
import CreatePoemForm from "./Form/CreatePoemForm";
import { Menu, Dropdown, Modal, Button, message } from "antd";
import { MoreOutlined, BookOutlined, ExclamationCircleOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import CommentModal from "./Form/CommentModal";
import { IoBookmark } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { MdReport } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import "./button-hover.css"
import ReportPoemModal from "../../components/componentHomepage/ReportPoemModal";

const YourPoem = ({ isMine, displayName, avatar, username, setIsCreatingPoem, isCreatingPoem }) => {
  const [poems, setPoems] = useState([]);
  const [likedPoems, setLikedPoems] = useState(new Set());
  const [selectedPoemId, setSelectedPoemId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPoemForComment, setSelectedPoemForComment] = useState(null);
  const [bookmarkedPoems, setBookmarkedPoems] = useState(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const [poemToDelete, setPoemToDelete] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPoemId, setReportPoemId] = useState(null);

  const accessToken = localStorage.getItem("accessToken");
  const requestHeaders = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
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

  const navigate = useNavigate();

  const showDeleteModal = (poemId) => {
    setPoemToDelete(poemId);
    setIsDeleteModalVisible(true);
  };

  useEffect(() => {
    const fetchPoems = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (isMine !== null) {
        try {
          if (isMine === true) {
            const response = await fetch(
              `${process.env.REACT_APP_API_BASE_URL}/poems/v1/mine?filterOptions.status=1`,
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const data = await response.json();
            if (data.statusCode === 200) {
              const likedPoemIds = new Set();
              const bookmarkedPoemIds = new Set();
              const poemsWithId = data.data.map((poem) => {
                if (poem.like) {
                  likedPoemIds.add(poem.id);
                }
                if (poem.targetMark) {
                  bookmarkedPoemIds.add(poem.id);
                }
                return {
                  id: poem.id,
                  title: poem.title,
                  description: poem.description,
                  content: poem.content,
                  poemImage: poem.poemImage,
                  type: poem.type,
                  likeCount: poem.likeCount,
                  commentCount: poem.commentCount,
                  createdTime: poem.createdTime,
                  collection: poem.collection,
                };
              });
              setPoems(poemsWithId);
              setLikedPoems(likedPoemIds);
              setBookmarkedPoems(bookmarkedPoemIds);
            }
          } else {
            const response = await fetch(
              `${process.env.REACT_APP_API_BASE_URL}/poems/v1/user/${username}`,
              {
                headers: requestHeaders,
              }
            );
            const data = await response.json();
            if (data.statusCode === 200) {
              const likedPoemIds = new Set();
              const bookmarkedPoemIds = new Set();
              const poemsWithId = data.data.map((poem) => {
                if (poem.like) {
                  likedPoemIds.add(poem.id);
                }
                if (poem.targetMark) {
                  bookmarkedPoemIds.add(poem.id);
                }
                return {
                  id: poem.id,
                  title: poem.title,
                  description: poem.description,
                  content: poem.content,
                  poemImage: poem.poemImage,
                  likeCount: poem.likeCount,
                  type: poem.type,
                  commentCount: poem.commentCount,
                  createdTime: poem.createdTime,
                  collection: poem.collection,
                };
              });
              setPoems(poemsWithId);
              setLikedPoems(likedPoemIds);
              setBookmarkedPoems(bookmarkedPoemIds);
            }
          }
        } catch (error) {
          console.error("Error fetching poems:", error);
        }
      }
    };

    fetchPoems();
  }, [isMine]);

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/poem/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        message.success("Đã sao chép liên kết!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        message.error("Không sao chép được liên kết!");
      });
  };

  const handleReportPoem = (id) => {
    setReportPoemId(id);
    setShowReportModal(true);
  };

  const handleBookmark = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

    const isBookmarked = bookmarkedPoems.has(id);
    const method = isBookmarked ? "DELETE" : "POST";

    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`,
        {
          method: method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      setBookmarkedPoems((prev) => {
        const newBookmarks = new Set(prev);
        if (isBookmarked) {
          newBookmarks.delete(id);
        } else {
          newBookmarks.add(id);
        }
        return newBookmarks;
      });
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const handleDeletePoem = async () => {
    if (!poemToDelete) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1/${poemToDelete}`,
        {
          method: "DELETE",
          headers: {
            ...requestHeaders, // includes Content-Type and Authorization if available
          },
        }
      );

      if (!response.ok) {
        message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
      }
      setPoems((prevPoems) => prevPoems.filter((poem) => poem.id !== poemToDelete));
      setIsDeleteModalVisible(false);
      setPoemToDelete(null);
      message.success("Bài thơ đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting poem:", error);
      message.error("Có lỗi xảy ra khi xóa bài thơ.");
    }
  };

  const openCommentModal = (poemId) => {
    setSelectedPoemForComment(poemId);
    setIsCommentModalVisible(true);
  };

  const closeCommentModal = () => {
    setIsCommentModalVisible(false);
    setSelectedPoemForComment(null);
  };
  const handleLikePoem = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

    const isLiked = likedPoems.has(id);
    const method = isLiked ? "DELETE" : "POST";

    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/likes/v1/${id}`, {
        method: method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      });

      setLikedPoems((prevLiked) => {
        const newLiked = new Set(prevLiked);
        if (isLiked) {
          newLiked.delete(id);
        } else {
          newLiked.add(id);
        }
        return newLiked;
      });

      setPoems((prevPoems) =>
        prevPoems.map((poem) =>
          poem.id === id
            ? { ...poem, likeCount: isLiked ? poem.likeCount - 1 : poem.likeCount + 1 }
            : poem
        )
      );
    } catch (error) {
      console.error("Error liking/unliking poem:", error);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px" }}>
      {!isCreatingPoem ? (
        <>
          {isMine ?
            <button
              onClick={() => setIsCreatingPoem(true)}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "12px 20px",
                borderRadius: "5px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                display: "block",
                marginBottom: "20px",
              }}
            >
              SÁNG TÁC THƠ
            </button>
            : <></>}
          <div style={{ display: "flex", gap: "40px" }}>
            <div style={{ width: "100%" }}>
              {poems.map((poem) => {
                const lines = poem.content?.split('\n') || [];
                const displayedLines = lines.slice(0, 4);
                const hasMoreLines = lines.length > 4;
                const truncatedDescription = poem.description?.length > 80
                  ? `${poem.description.substring(0, 80)}...`
                  : poem.description;
                return (
                  <div
                    key={poem.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      background: "white",
                      borderRadius: "12px",
                      padding: "20px",
                      border: "1px solid #ccc",
                      boxShadow: "0px 3px 6px 0px #0000004D",
                      alignItems: "stretch",
                      width: "100%",
                      flexDirection: "row",
                      marginBottom: "40px",
                      boxSizing: "border-box"
                    }}
                  >
                    <div style={{
                      width: "168px",
                      height: "268px",
                      border: "1px solid #000",
                      marginLeft: "20px",
                      alignSelf: "center"
                    }}>
                      <img
                        src={poem.poemImage || "/anhminhhoa.png"}
                        alt="anh minh hoa"
                        style={{
                          width: "168px",
                          maxWidth: "168px",
                          height: "100%",
                          objectFit: "cover", // This will prevent stretching
                          objectPosition: "center" // Center the image
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/anhminhhoa.png";
                        }}
                      />
                    </div>
                    <div style={{ flexGrow: "1", }}>
                      <img
                        src={avatar || "./default-avatar.png"}
                        alt="avatar"
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #eee",
                          marginTop: "4px",
                        }}
                      />
                    </div>
                    <div style={{
                      flexBasis: "100%",
                      display: "flex",
                      flexDirection: "column"
                    }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          flexDirection: "row",
                        }}>
                          <span style={{ fontWeight: "bold", color: "#2a7fbf", }}>{displayName}</span>
                          <span style={{ color: "#888", fontSize: "0.85rem", textAlign: "right", }}>– 🕒{formatDate(poem.createdTime)}</span>
                        </div>
                        <div style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}>
                          <button style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            fontSize: "1.2rem",
                            color: "#666",
                            display: "flex",
                            alignItems: "center",
                          }} onClick={() => handleBookmark(poem.id)}>
                            {bookmarkedPoems.has(poem.id) ? (<IoBookmark color="#FFCE1B" />) : (<CiBookmark />)}
                          </button>
                          {isMine ? <Dropdown
                            overlay={
                              <Menu>
                                <Menu.Item key="delete" onClick={() => showDeleteModal(poem.id)}
                                >
                                  ❌ Xóa
                                </Menu.Item>
                              </Menu>
                            }
                            trigger={["click"]}
                          >
                            <MoreOutlined
                              style={{ fontSize: "20px", cursor: "pointer", color: "#555" }}
                              onClick={(e) => e.preventDefault()}
                            />
                          </Dropdown> :
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item key="report" onClick={() => handleReportPoem(poem.id)}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                      <MdReport color="red" size={"16"} /><div> Báo cáo </div>
                                    </div>
                                  </Menu.Item>
                                  <Menu.Item key="copylink" onClick={() => handleCopyLink(poem.id)}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                      <IoIosLink color="#666" size={"16"} /><div> Sao chép liên kết </div>
                                    </div>
                                  </Menu.Item>
                                </Menu>
                              }
                              trigger={["click"]}
                            >
                              <MoreOutlined
                                style={{ fontSize: "20px", cursor: "pointer", color: "#555" }}
                                onClick={(e) => e.preventDefault()}
                              />
                            </Dropdown>
                          }


                        </div>
                      </div>
                      <h3 style={{
                        color: "#222",
                        margin: "0",
                        fontSize: "1.2rem",
                      }}>{poem.title}</h3>
                      <p style={{
                        color: "#444",
                        margin: "1px 0 0",
                        fontSize: "0.85rem",
                      }}>
                        Thể loại: {poemType[poem.type]}
                      </p>
                      <p style={{
                        color: "#444",
                        fontSize: "0.85rem",
                        marginTop: "1px",
                        lineHeight: "1.4",
                        marginBottom: "5px"
                      }}>
                        Mô tả: {truncatedDescription}
                      </p>
                      <div style={{
                        color: "#333",
                        fontStyle: "italic",
                        borderLeft: "3px solid #eee",
                        paddingLeft: "15px",
                        marginBottom: "auto",
                        position: 'relative',
                      }}>
                        <div style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 5,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          position: 'relative',
                          paddingRight: '20px',
                        }}>
                          <span style={{
                            position: 'absolute',
                            fontSize: '1.7rem',
                            lineHeight: 1,
                            color: '#666',
                          }}>“</span>
                          {displayedLines.map((line, index) => (
                            <p key={index} style={{
                              whiteSpace: 'pre-wrap',
                              margin: "0 0 0 0",
                              lineHeight: "1.6",
                              fontSize: "1rem",
                              textIndent: '0.8rem',
                            }}>{line}</p>
                          ))}
                          <p style={{
                            margin: "0 0 0 0",
                            lineHeight: "1.6",
                            fontSize: "1rem",
                            textIndent: '0.8rem',
                          }}>
                            {hasMoreLines && <span style={{
                              background: 'white',
                              paddingLeft: '4px',
                            }}>...</span>}
                            <span style={{
                              fontSize: '1.7rem',
                              lineHeight: 1,
                              color: '#666',
                            }}>”</span>
                          </p>
                        </div>
                      </div>
                      <p style={{
                        color: "#444",
                        fontSize: "0.8rem",
                        marginBottom: 0
                      }}>Tập thơ: <span style={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate(`/collection/${poem.collection.id}`)}>{poem.collection?.collectionName}</span></p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "auto",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          gap: "20px",
                          alignItems: "center",
                        }}>
                          <button
                            style={{
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
                            }}
                            onClick={() => handleLikePoem(poem.id)}
                          >
                            {likedPoems.has(poem.id) ? <BiSolidLike size={20} color="#2a7fbf" /> : <BiLike size={20} />}
                            <span style={{ display: "flex", alignItems: "center", fontSize: "1.4em" }}>{poem.likeCount || 0}</span>
                          </button>
                          <button style={{
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
                          }} onClick={() => openCommentModal(poem.id)}>
                            <BiCommentDetail size={20} />
                            <span style={{ display: "flex", alignItems: "center", fontSize: "1.4em" }}>{poem.commentCount || 0}</span>
                          </button>
                        </div>
                        <button
                          className="button-hover"
                          onClick={() => navigate(`/poem/${poem.id}`)}
                        >
                          Xem bài thơ &gt;
                        </button>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
            {/* Thành tựu và thống kê */}

          </div>
        </>
      ) : (
        <CreatePoemForm setDrafting={false} onBack={() => setIsCreatingPoem(false)} />
      )}

      {showReportModal && (
        <ReportPoemModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          poemId={reportPoemId}
          accessToken={localStorage.getItem("accessToken")}
        />
      )}
      {/* Modal Xác nhận Xóa */}
      <Modal
        title="Xóa bài thơ"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDeletePoem}>
            Xóa
          </Button>,
        ]}
      >
        <p>
          <ExclamationCircleOutlined style={{ color: "red", marginRight: "10px" }} />
          Bạn muốn xóa bài thơ này?
        </p>
      </Modal>
      <CommentModal
        visible={isCommentModalVisible}
        onClose={closeCommentModal}
        poemId={selectedPoemForComment}
      />

    </div >
  );
};

export default YourPoem;

