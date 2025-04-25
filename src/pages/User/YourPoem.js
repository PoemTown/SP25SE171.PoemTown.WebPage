import React, { useState, useEffect, useCallback, useMemo } from "react";
import CreatePoemForm from "./Form/CreatePoemForm";
import { Menu, Dropdown, Modal, Button, message } from "antd";
import { MoreOutlined, ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import CommentModal from "./Form/CommentModal";
import { IoBookmark } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { MdReport } from "react-icons/md";
import { IoIosLink } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import "./button-hover.css";
import ReportPoemModal from "../../components/componentHomepage/ReportPoemModal";

const YourPoem = ({ isMine, displayName, avatar, username, setIsCreatingPoem, isCreatingPoem }) => {
  const [poems, setPoems] = useState([]);
  const [likedPoems, setLikedPoems] = useState(new Set());
  const [bookmarkedPoems, setBookmarkedPoems] = useState(new Set());
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPoemForComment, setSelectedPoemForComment] = useState(null);
  const [poemToDelete, setPoemToDelete] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPoemId, setReportPoemId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  // Memoize headers to prevent unnecessary recreations
  const requestHeaders = useMemo(() => ({
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
  }), [accessToken]);

  // Memoize API URL to prevent unnecessary changes
  const poemsUrl = useMemo(() => {
    return isMine 
      ? `${process.env.REACT_APP_API_BASE_URL}/poems/v1/mine?filterOptions.status=1`
      : `${process.env.REACT_APP_API_BASE_URL}/poems/v1/user/${username}`;
  }, [isMine, username]);

  // Stable fetch function with proper error handling
  const fetchPoems = useCallback(async () => {
    if (isMine === null) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = isMine 
        ? { Authorization: `Bearer ${accessToken}` } 
        : requestHeaders;

      const response = await fetch(poemsUrl, { headers });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.statusCode === 200) {
        const likedPoemIds = new Set();
        const bookmarkedPoemIds = new Set();
        
        const poemsWithId = data.data.map((poem) => {
          if (poem.like) likedPoemIds.add(poem.id);
          if (poem.targetMark) bookmarkedPoemIds.add(poem.id);
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
    } catch (error) {
      console.error("Error fetching poems:", error);
      setError("Không thể tải danh sách bài thơ");
      message.error("Không thể tải danh sách bài thơ");
    } finally {
      setLoading(false);
    }
  }, [isMine, accessToken, requestHeaders, poemsUrl]);

  // Fetch poems on mount and when dependencies change
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      await fetchPoems();
    };

    fetchData();

    return () => controller.abort();
  }, [fetchPoems]);

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
    if (!accessToken) { 
      message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); 
      return; 
    }

    const isBookmarked = bookmarkedPoems.has(id);
    const method = isBookmarked ? "DELETE" : "POST";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update bookmark");
      }

      setBookmarkedPoems((prev) => {
        const newBookmarks = new Set(prev);
        isBookmarked ? newBookmarks.delete(id) : newBookmarks.add(id);
        return newBookmarks;
      });
    } catch (error) {
      console.error("Error updating bookmark:", error);
      message.error("Có lỗi xảy ra khi lưu bài thơ");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };

  const showDeleteModal = (poemId) => {
    setPoemToDelete(poemId);
    setIsDeleteModalVisible(true);
  };

  const handleDeletePoem = async () => {
    if (!poemToDelete) return;
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1/${poemToDelete}`,
        {
          method: "DELETE",
          headers: requestHeaders,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete poem");
      }
      
      setPoems((prevPoems) => prevPoems.filter((poem) => poem.id !== poemToDelete));
      message.success("Bài thơ đã được xóa thành công.");
    } catch (error) {
      console.error("Error deleting poem:", error);
      message.error("Có lỗi xảy ra khi xóa bài thơ.");
    } finally {
      setIsDeleteModalVisible(false);
      setPoemToDelete(null);
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
    if (!accessToken) { 
      message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); 
      return; 
    }

    const isLiked = likedPoems.has(id);
    const method = isLiked ? "DELETE" : "POST";

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/likes/v1/${id}`, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update like status");
      }

      setLikedPoems((prevLiked) => {
        const newLiked = new Set(prevLiked);
        isLiked ? newLiked.delete(id) : newLiked.add(id);
        return newLiked;
      });

      setPoems((prevPoems) =>
        prevPoems.map((poem) =>
          poem.id === id
            ? { 
                ...poem, 
                likeCount: isLiked ? poem.likeCount - 1 : poem.likeCount + 1 
              }
            : poem
        )
      );
    } catch (error) {
      console.error("Error liking/unliking poem:", error);
      message.error("Có lỗi xảy ra khi thao tác với bài thơ");
    }
  };

  const renderPoemContent = (content) => {
    const lines = content?.split('\n') || [];
    const displayedLines = lines.slice(0, 4);
    const hasMoreLines = lines.length > 4;

    return (
      <div style={{
        color: "#333",
        fontStyle: "italic",
        borderLeft: "3px solid #eee",
        paddingLeft: "15px",
        margin: "10px 0",
      }}>
        <div style={{
          display: "-webkit-box",
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute',
            fontSize: '1.7rem',
            lineHeight: 1,
            color: '#666',
          }}>“</span>
          {displayedLines.map((line, index) => (
            <p 
              key={index} 
              style={{
                whiteSpace: 'pre-wrap',
                margin: "0 0 0 0",
                lineHeight: "1.6",
                fontSize: "1rem",
                textIndent: '0.8rem',
              }}
            >
              {line}
            </p>
          ))}
          <p style={{
            margin: "0 0 0 0",
            lineHeight: "1.6",
            fontSize: "1rem",
            textIndent: '0.8rem',
          }}>
            {hasMoreLines && (
              <span style={{ background: 'white', paddingLeft: '4px' }}>...</span>
            )}
            <span style={{
              fontSize: '1.7rem',
              lineHeight: 1,
              color: '#666',
            }}>”</span>
          </p>
        </div>
      </div>
    );
  };

  if (isCreatingPoem) {
    return (
      <CreatePoemForm 
        setDrafting={false} 
        onBack={() => setIsCreatingPoem(false)} 
        fetchPoems={fetchPoems}
        initialData={null}
      />
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>;
  }

  if (poems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Chưa có bài thơ nào được đăng</p>
        {isMine && (
          <button
            onClick={() => setIsCreatingPoem(true)}
            style={{
              backgroundColor: "#b0a499",
              color: "#ecf0f1",
              padding: "12px 24px",
              borderRadius: "30px",
              border: "none",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "20px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "0 auto",
              ':hover': {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                backgroundColor: "#34495e"
              }
            }}
          >
            <PlusOutlined />
            SÁNG TÁC THƠ
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "1200px" }}>
      {isMine && (
        <button
          onClick={() => setIsCreatingPoem(true)}
          style={{
            backgroundColor: "#b0a499",
            color: "#ecf0f1",
            padding: "12px 24px",
            borderRadius: "30px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "25px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.9em",
            ':hover': {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
              backgroundColor: "#34495e"
            }
          }}
        >
          <PlusOutlined />
          SÁNG TÁC THƠ
        </button>
      )}

      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ width: "100%" }}>
          {poems.map((poem) => {
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
                  alignSelf: "center",
                  flexShrink: 0
                }}>
                  <img
                    src={poem.poemImage || "/anhminhhoa.png"}
                    alt="anh minh hoa"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center"
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/anhminhhoa.png";
                    }}
                  />
                </div>
                <div style={{ flexGrow: "1", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <img
                      src={avatar || "./default-avatar.png"}
                      alt="avatar"
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #eee",
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold", color: "#2a7fbf" }}>{displayName}</span>
                        <span style={{ color: "#888", fontSize: "0.85rem" }}>
                          🕒 {formatDate(poem.createdTime)}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ color: "#222", margin: "5px 0 0", fontSize: "1.2rem" }}>
                          {poem.title}
                        </h3>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <button 
                            onClick={() => handleBookmark(poem.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: "4px",
                              fontSize: "1.2rem",
                              color: "#666",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {bookmarkedPoems.has(poem.id) ? (
                              <IoBookmark color="#FFCE1B" />
                            ) : (
                              <CiBookmark />
                            )}
                          </button>
                          {isMine ? (
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item 
                                    key="delete" 
                                    onClick={() => showDeleteModal(poem.id)}
                                    style={{ color: "red" }}
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
                            </Dropdown>
                          ) : (
                            <Dropdown
                              overlay={
                                <Menu>
                                  <Menu.Item 
                                    key="report" 
                                    onClick={() => handleReportPoem(poem.id)}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                      <MdReport color="red" size={16} />
                                      <div>Báo cáo</div>
                                    </div>
                                  </Menu.Item>
                                  <Menu.Item 
                                    key="copylink" 
                                    onClick={() => handleCopyLink(poem.id)}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                      <IoIosLink color="#666" size={16} />
                                      <div>Sao chép liên kết</div>
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
                          )}
                        </div>
                      </div> 
                    </div>
                  </div>

                  <p style={{ color: "#444", margin: "5px 0", fontSize: "0.85rem" }}>
                    Thể loại: {poem?.type?.name ?? ""}
                  </p>
                  <p style={{ color: "#444", fontSize: "0.85rem", margin: "5px 0", lineHeight: "1.4" }}>
                    Mô tả: {truncatedDescription}
                  </p>

                  {renderPoemContent(poem.content)}

                  {poem.collection && (
                    <p style={{ color: "#444", fontSize: "0.8rem", margin: "5px 0" }}>
                      Tập thơ:{" "}
                      <span 
                        style={{ fontWeight: "bold", cursor: "pointer" }} 
                        onClick={() => navigate(`/collection/${poem.collection.id}`)}
                      >
                        {poem.collection.collectionName}
                      </span>
                    </p>
                  )}

                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "10px"
                  }}>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                      <button
                        onClick={() => handleLikePoem(poem.id)}
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
                          ":hover": {
                            background: "#f0f0f0",
                          }
                        }}
                      >
                        {likedPoems.has(poem.id) ? (
                          <BiSolidLike size={20} color="#2a7fbf" />
                        ) : (
                          <BiLike size={20} />
                        )}
                        <span style={{ fontSize: "1.4em" }}>{poem.likeCount || 0}</span>
                      </button>
                      <button 
                        onClick={() => openCommentModal(poem.id)}
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
                          ":hover": {
                            background: "#f0f0f0",
                          }
                        }}
                      >
                        <BiCommentDetail size={20} />
                        <span style={{ fontSize: "1.4em" }}>{poem.commentCount || 0}</span>
                      </button>
                    </div>
                    <button
                      className="button-hover"
                      onClick={() => navigate(`/poem/${poem.id}`)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "4px",
                        border: "1px solid #2a7fbf",
                        background: "white",
                        color: "#2a7fbf",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        ":hover": {
                          background: "#2a7fbf",
                          color: "white"
                        }
                      }}
                    >
                      Xem bài thơ &gt;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showReportModal && (
        <ReportPoemModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          poemId={reportPoemId}
          accessToken={accessToken}
        />
      )}

      <Modal
        title="Xóa bài thơ"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Hủy
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger 
            onClick={handleDeletePoem}
          >
            Xóa
          </Button>,
        ]}
      >
        <p>
          <ExclamationCircleOutlined style={{ color: "red", marginRight: "10px" }} />
          Bạn có chắc chắn muốn xóa bài thơ này?
        </p>
      </Modal>

      <CommentModal
        visible={isCommentModalVisible}
        onClose={closeCommentModal}
        poemId={selectedPoemForComment}
        fetchPoems={fetchPoems}
      />
    </div>
  );
};

export default YourPoem;