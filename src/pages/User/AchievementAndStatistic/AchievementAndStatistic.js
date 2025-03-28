import { useEffect, useState } from "react";
import { Spin } from "antd";

const AchievementAndStatistic = ({
  statisticTitleBackground,
  statisticTitleColorCode,
  statisticColorCode,
  statisticBackground,
  statisticBorder,
  achievementTitleBackground,
  achievementTitleColorCode,
  achievementBackground,
  achievementColorCode,
  achievementBorder
}) => {

  const [statistic, setStatistic] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Thêm state isLoading
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchStatistic = async () => {
      try {
        const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const statisticData = await response.json();
        if (statisticData.statusCode === 200) {
          setStatistic(statisticData.data);
        }
      } catch (error) {
        console.error("Error fetching statistic:", error);
      } finally {
        setIsLoading(false); // Tắt loading khi fetch xong
      }
    };

    fetchStatistic();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
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
          <li>
            Tổng bài viết:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.totalPoems || 0}
          </li>
          <li>
            Tổng bộ sưu tập:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.totalCollections || 0}
          </li>
          <li>
            Tổng audio cá nhân:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.totalPersonalAudios || 0}
          </li>
          <li>
            Tổng lượt thích:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.totalLikes || 0}
          </li>
          <li>
            Đang theo dõi:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.following || 0}
          </li>
          <li>
            Người theo dõi:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.followers || 0}
          </li>
          <li>
            Bookmark bài viết:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.poemBookmarks || 0}
          </li>
          <li>
            Bookmark bộ sưu tập:{" "}
            {isLoading ? <Spin size="small" /> : statistic?.collectionBookmarks || 0}
          </li>
        </ul>
        <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
          Xem thêm &gt;
        </a>
      </div>
    </div>
  );
}

export default AchievementAndStatistic;
