import { useEffect } from "react";
import { FaMedal } from "react-icons/fa6";

const AchievementAndStatistic = ({
  totalFollowers,
  totalFollowings,
  userStatistic,
  achievements,
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
        <div
          style={{
            backgroundImage: achievementBackground ? `url("${achievementBackground}")` : "none",
            padding: "10px 20px",
            borderRadius: "0 0 10px 10px",
          }}
        >
          <ul
            style={{
              fontSize: "14px",
              color: achievementBackgroundColorCode,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {achievements && achievements.length > 0 ? (
              achievements.slice(0, 4).map((item) => (
                <li key={item.id} style={{ marginBottom: "4px" }}>
                  <span
                    style={{
                      marginRight: "8px",
                      backgroundColor: "#fff",
                      borderRadius: "30px",
                      padding: "1px",
                    }}
                  >
                    {item.rank === 1 ? (
                      <>🥇</>
                    ) : item.rank === 2 ? (
                      <>🥈</>
                    ) : item.rank === 3 ? (
                      <>🥉</>
                    ) : (
                      <>🎓</>
                    )}
                  </span>
                  {item.name}
                </li>
              ))
            ) : (
              <li style={{ textAlign: "center" }}>Hiện chưa có thành tựu</li>
            )}
          </ul>
          {achievements && achievements.length > 0 && (
            <a
              href="#"
              style={{
                color: "#007bff",
                fontSize: "12px",
                display: "block",
                marginTop: "10px",
              }}
            >
              Xem thêm &gt;
            </a>
          )}
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
        <div style={{ backgroundImage: statisticBackground ? `url("${statisticBackground}")` : "none", padding: "10px 20px", borderRadius: "0 0 10px 10px" }}>
          <ul style={{ fontSize: "14px", color: statisticBackgroundColorCode, listStyle: "none", padding: 0, margin: 0 }}>
            <li>Tổng bài viết: {userStatistic?.totalPoems}</li>
            <li>Tổng bộ sưu tập: {userStatistic?.totalCollections}</li>
            <li>Tổng audio cá nhân: {userStatistic?.totalPersonalAudios}</li>
            <li>Tổng lượt thích: {userStatistic?.totalLikes}</li>
            <li>Đang theo dõi: {totalFollowings}</li>
            <li>Người theo dõi: {totalFollowers}</li>
            <li>Bookmark bài viết: {userStatistic?.poemBookmarks}</li>
            <li>Bookmark bộ sưu tập: {userStatistic?.collectionBookmarks}</li>
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