import { useEffect } from "react";

const AchievementAndStatistic = ({
  statisticBorder,
  achievementBorder,
  statisticBackground,
  statisticBackgroundColorCode,
  achievementBackgroundColorCode,
  statisticTitleBackground,
  achievementBackground,
  achievementTitleBackground,
  achievementTitleColorCode,
  statisticTitleColorCode,
}) => {

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
      <div style={{
        borderRadius: "10px",
        border: `2px solid ${achievementBorder}`,
        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
      }}>
        <div
          style={{
            backgroundImage: achievementTitleBackground ? `url("${achievementTitleBackground}")` : "none",
            height: 53,
            borderRadius: "10px 10px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: `2px solid ${achievementBorder}`,
            marginBottom: 0,
          }}
        >
          <h3 style={{ fontWeight: "bold", margin: 0, textAlign: "center", color: achievementTitleColorCode }}>
            Thành tựu cá nhân
          </h3>
        </div>
        <div style={{ backgroundImage: achievementBackground ? `url("${achievementBackground}")` : "none", padding: "10px 20px", borderRadius: "0 0 10px 10px" }}>
          <ul style={{ fontSize: "14px", color: achievementBackgroundColorCode, listStyle: "none", padding: 0, margin: 0 }}>
            <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
            <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
            <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
            <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
          </ul>
          <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
            Xem thêm &gt;
          </a>
        </div>
      </div>

      {/* Thống kê người dùng */}
      <div
        style={{
          borderRadius: "10px",
          border: `2px solid ${statisticBorder}`,
          boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{
          backgroundImage: statisticTitleBackground ? `url("${statisticTitleBackground}")` : "none",
          height: 53,
          borderRadius: "10px 10px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `2px solid ${statisticBorder}`,
        }}>
          <h3
            style={{
              fontWeight: "bold", color: statisticTitleColorCode, margin: 0, textAlign: "center"
            }}
          >
            Thống kê người dùng
          </h3>
        </div>
        <div style={{backgroundImage: statisticBackground ? `url("${statisticBackground}")` : "none", padding: "10px 20px", borderRadius: "0 0 10px 10px"}}>
          <ul style={{ fontSize: "14px", color: statisticBackgroundColorCode, listStyle: "none", padding: 0, margin: 0 }}>
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
    </div>
  )
}

export default AchievementAndStatistic;