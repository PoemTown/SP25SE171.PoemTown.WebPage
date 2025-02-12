import React, { useState } from "react";
import CreatePoemForm from "./Form/CreatePoemForm";
const YourPoem = ({ borderColor }) => {
  const [currentPage, setCurrentPage] = useState("list");

  const handleCreatePoemClick = () => {
    setCurrentPage("create");
  };

  const [poemData, setPoemData] = useState({
    title: "",
    description: "",
    chapter: "",
    collection: "",
    content: "",
  });
  const [isCreatingPoem, setIsCreatingPoem] = useState(false);

  return (
    <div style={{ maxWidth: "1500px", margin: "auto", padding: "10px" }}>
      {!isCreatingPoem ? (
        <>
          <button
            onClick={() => setIsCreatingPoem(true)}
            style={{
              marginTop: "15px",
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sáng Tác Thơ
          </button>

          <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
            <div style={{ flex: "2" }}>
              {[1, 2, 3].map((post) => (
                <div
                  key={post}
                  style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    marginBottom: "15px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: "bold" }}>Tiêu đề bài thơ {post}</h3>
                    <span style={{ color: "#999", fontSize: "12px" }}>🕒 3 ngày trước</span>
                  </div>
                  <p style={{ color: "#555", marginTop: "5px" }}>Nội dung ngắn gọn của bài thơ...</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "12px", color: "#666" }}>
                    <span>👁️ 3,150</span>
                    <span>❤️ 1,253</span>
                    <span>💬 675</span>
                    <a href="#" style={{ color: "#007bff", fontWeight: "bold" }}>Xem bài thơ →</a>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ flex: "1" }}>
              <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "10px", border: `2px solid ${borderColor}`, marginBottom: "10px" }}>
                <h3 style={{ fontWeight: "bold" }}>Thành tựu cá nhân</h3>
                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                  <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                  <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                  <li>🏆 Cúp bạc bài viết tháng 6/2024</li>
                </ul>
              </div>

              <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "10px", border: `2px solid ${borderColor}`, marginBottom: "10px" }}>
                <h3 style={{ fontWeight: "bold" }}>Thông tin người dùng</h3>
                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                  <li>Tổng bài viết: 67</li>
                  <li>Tổng lượt xem: 3,150</li>
                  <li>Tổng lượt thích: 1,253</li>
                  <li>Tổng lượt bookmark: 35</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : (
        <CreatePoemForm onBack={() => setIsCreatingPoem(false)} />
      )}
    </div>
  );
};

export default YourPoem;
