import React, { useState, useEffect } from "react";
import CreatePoemForm from "./Form/CreatePoemForm";
import { Menu, Dropdown, Modal, Button } from "antd";
import { MoreOutlined, BookOutlined, ExclamationCircleOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import CommentModal from "./Form/CommentModal";
import { IoBookmark } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";
import { BiCommentDetail, BiLike, BiSolidLike } from "react-icons/bi";
import { MdReport } from "react-icons/md";
import { IoIosLink } from "react-icons/io";

const YourPoem = ({ isMine, displayName, avatar, username, setIsCreatingPoem, isCreatingPoem }) => {
  const [poems, setPoems] = useState([]);
  const [likedPoems, setLikedPoems] = useState(new Set());
  const [selectedPoemId, setSelectedPoemId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPoemForComment, setSelectedPoemForComment] = useState(null);
  const [bookmarkedPoems, setBookmarkedPoems] = useState(new Set());

  useEffect(() => {
    console.log("isMine", isMine)
    const fetchPoems = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (isMine !== null) {
        try {
          if (isMine === true) {
            const response = await fetch(
              "https://api-poemtown-staging.nodfeather.win/api/poems/v1/mine?filterOptions.status=1",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            const data = await response.json();
            if (data.statusCode === 200) {
              const likedPoemIds = new Set();
              const bookmarkedPoemIds = new Set();
              console.log("from user", data)
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
                  commentCount: poem.commentCount,
                  createdTime: poem.createdTime,
                };
              });
              console.log(poemsWithId)
              setPoems(poemsWithId);
              setLikedPoems(likedPoemIds);
              setBookmarkedPoems(bookmarkedPoemIds);
            }
          } else {
            const response = await fetch(
              `https://api-poemtown-staging.nodfeather.win/api/poems/v1/user/${username}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
            );

          }
        } catch (error) {
          console.error("Error fetching poems:", error);
        }
      }
    };

    fetchPoems();
  }, [isMine]);

  const handleBookmark = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    const isBookmarked = bookmarkedPoems.has(id);
    const method = isBookmarked ? "DELETE" : "POST";

    try {
      await fetch(
        `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem/${id}`,
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

  const handleDeleteForever = async () => {
    console.log("Xóa vĩnh viễn:", selectedPoemId);

    setIsDeleteModalVisible(false);
  };

  const handleMoveToTrash = async () => {
    console.log("Chuyển vào thùng rác:", selectedPoemId);

    setIsDeleteModalVisible(false);
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
    if (!accessToken) return;

    const isLiked = likedPoems.has(id);
    const method = isLiked ? "DELETE" : "POST";

    try {
      await fetch(`https://api-poemtown-staging.nodfeather.win/api/likes/v1/${id}`, {
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
                const truncatedDescription = poem.description?.length > 102
                  ? `${poem.description.substring(0, 102)}...`
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
                      width: "168x",
                      height: "268px",
                      border: "1px solid #000",
                    }}>
                      <img
                        src={poem.poemImage || "/anhminhhoa.png"}
                        alt="anh minh hoa"
                        style={{
                          width: "168px",
                          maxWidth: "168px",
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
                                <Menu.Item key="edit">
                                  ✏️ Chỉnh sửa
                                </Menu.Item>
                                <Menu.Item key="delete">
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
                        fontSize: "1.4rem",
                      }}>{poem.title}</h3>
                      <p style={{
                        color: "#444",
                        fontSize: "0.95rem",
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
                              margin: "0 0 0 0",
                              lineHeight: "1.6",
                              fontSize: "1rem",
                              textIndent: '0.8rem',
                              whiteSpace: 'pre-wrap',
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
                        <a href="#" style={{ color: "#007bff", fontWeight: "bold" }}>
                          Xem bài thơ →
                        </a>
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

      {/* Modal Xác nhận Xóa */}
      <Modal
        title="Xóa bài thơ"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="trash" type="default" onClick={handleMoveToTrash}>
            Chuyển vào thùng rác
          </Button>,
          <Button key="delete" type="primary" danger onClick={handleDeleteForever}>
            Xóa vĩnh viễn
          </Button>,
        ]}
      >
        <p>
          <ExclamationCircleOutlined style={{ color: "red", marginRight: "10px" }} />
          Bạn muốn xóa bài thơ này vĩnh viễn hay chuyển vào thùng rác?
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

