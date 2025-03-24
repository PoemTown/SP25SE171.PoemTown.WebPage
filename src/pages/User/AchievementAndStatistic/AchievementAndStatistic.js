import { useEffect } from "react";

const AchievementAndStatistic = ({statisticTitleBackground, statisticTitleColorCode ,statisticColorCode, statisticBackground, statisticBorder, achievementTitleBackground, achievementTitleColorCode, achievementBackground, achievementColorCode, achievementBorder }) => {
    
    return (
        <div style={{display: "flex", flexDirection: "column", gap: "30px"}}>
            <div
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  border: `2px solid ${achievementBorder}`,
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#FFD700",
                    padding: "5px 10px",
                    borderRadius: "8px 8px 0 0",
                    margin: "-15px -15px 10px -15px",
                    textAlign: "center",
                  }}
                >
                  Thành tựu cá nhân
                </h3>
                <ul style={{ fontSize: "14px", color: "#555", listStyle: "none", padding: 0 }}>
                  <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                  <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                  <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                  <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                </ul>
                <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
                  Xem thêm &gt;
                </a>
              </div>

              {/* Thống kê người dùng */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "15px",
                  borderRadius: "10px",
                  border: `2px solid ${statisticBorder}`,
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <h3
                  style={{
                    fontWeight: "bold",
                    backgroundColor: "#888",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "8px 8px 0 0",
                    margin: "-15px -15px 10px -15px",
                    textAlign: "center",
                  }}
                >
                  Thống kê người dùng
                </h3>
                <ul style={{ fontSize: "14px", color: "#555", listStyle: "none", padding: 0 }}>
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
                <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
                  Xem thêm &gt;
                </a>
              </div>
        </div>
    )
}

export default AchievementAndStatistic;