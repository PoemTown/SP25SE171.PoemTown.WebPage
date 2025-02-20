import React, { useState, useEffect } from "react";
import CreatePoemForm from "./Form/CreatePoemForm";
import { Menu, Dropdown, Modal, Button } from "antd";
import { MoreOutlined, BookOutlined, ExclamationCircleOutlined, HeartFilled, HeartOutlined } from "@ant-design/icons";
import CommentModal from "./Form/CommentModal";
const YourPoem = ({ borderColor, displayName }) => {
  const [isCreatingPoem, setIsCreatingPoem] = useState(false);
  const [poems, setPoems] = useState([]);
  const [likedPoems, setLikedPoems] = useState(new Set());
  const [selectedPoemId, setSelectedPoemId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [selectedPoemForComment, setSelectedPoemForComment] = useState(null);

  useEffect(() => {
    const fetchPoems = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await fetch(
          "https://api-poemtown-staging.nodfeather.win/api/poems/v1/mine?filterOptions.status=1",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await response.json();
        if (data.statusCode === 200) {
          const likedPoemIds = new Set();
          const poemsWithId = data.data.map((poem) => {
            if (poem.like) {
              likedPoemIds.add(poem.id);
            }
            return {
              id: poem.id,
              title: poem.title,
              description: poem.description,
              content: poem.content,
              likeCount: poem.likeCount,
              commentCount: poem.commentCount,
            };
          });

          setPoems(poemsWithId);
          setLikedPoems(likedPoemIds);
        }
      } catch (error) {
        console.error("Error fetching poems:", error);
      }
    };

    fetchPoems();
  }, []);

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
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
      {!isCreatingPoem ? (
        <>
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

          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 2 }}>
              {poems.map((poem) => (
                <div
                  key={poem.id}
                  style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    marginBottom: "15px",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src="./@.png"
                        alt="avatar"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div>
                        <strong>{displayName}</strong>
                        <p style={{ fontSize: "12px", color: "#888" }}>🕒 3 ngày trước</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <BookOutlined style={{ fontSize: "18px", cursor: "pointer", color: "#555" }} />

                      <Dropdown
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
                      </Dropdown>
                    </div>
                  </div>

                  <h3 style={{ fontWeight: "bold", marginTop: "10px" }}>{poem.title}</h3>
                  <p style={{ fontStyle: "italic", color: "#777", marginTop: "5px" }}>
                    Mô tả: {poem.description}
                  </p>
                  <p style={{ color: "#555", marginTop: "5px", marginLeft: "20px" }}>{poem.content}</p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "10px",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <span>👁️ {Math.floor(Math.random() * 5000)}</span>
                    <span
                      onClick={() => handleLikePoem(poem.id)}
                      style={{ cursor: "pointer", color: likedPoems.has(poem.id) ? "red" : "#555" }}
                    >
                      {likedPoems.has(poem.id) ? <HeartFilled /> : <HeartOutlined />} {poem.likeCount}
                    </span>

                    <span onClick={() => openCommentModal(poem.id)} style={{ cursor: "pointer" }}>
                      💬 {poem.commentCount}
                    </span>

                    <a href="#" style={{ color: "#007bff", fontWeight: "bold" }}>
                      Xem bài thơ →
                    </a>
                  </div>
                </div>
              ))}
            </div>
            {/* Thành tựu và thống kê */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  border: `2px solid ${borderColor}`,
                  marginBottom: "15px",
                }}
              >
                <h3 style={{ fontWeight: "bold" }}>Thành tựu cá nhân</h3>
                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                  <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                  <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                  <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                  <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                </ul>
                <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  border: `2px solid ${borderColor}`,
                }}
              >
                <h3 style={{ fontWeight: "bold" }}>Thống kê người dùng</h3>
                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                  <li>Tổng bài viết: 2</li>
                  <li>Tổng bộ sưu tập: 5</li>
                  <li>Tổng audio cá nhân: 16</li>
                  <li>Tổng lượt xem: 662</li>
                  <li>Tổng lượt thích: 233</li>
                  <li>Đang theo dõi: 60</li>
                  <li>Người theo dõi: 1,585</li>
                  <li>Bookmark bài viết: 35</li>
                  <li>Bookmark bộ sưu tập: 12</li>
                </ul>
                <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <CreatePoemForm onBack={() => setIsCreatingPoem(false)} />
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

    </div>
  );
};

export default YourPoem;

