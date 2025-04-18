import { Spin } from "antd";
import { useState } from "react";
import { FaMedal, FaPenAlt, FaBook, FaHeadphones, FaHeart, FaUserFriends, FaBookmark } from "react-icons/fa";

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
  const [statistic, setStatistic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      width: "100%",
      fontFamily: "'Noto Serif', serif"
    }}>
      {/* Thành tựu cá nhân */}
      <div
        style={{
          borderRadius: "12px",
          border: `2px solid ${achievementBorder}`,
          background: achievementBackground || "linear-gradient(to right, #fff5e6, #ffe9cc)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          position: "relative",
          overflow: "hidden",
          "::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "repeating-linear-gradient(90deg, transparent, transparent 15px, #ffd8a8 15px, #ffd8a8 30px)"
          }
        }}
      >
        <div
          style={{
            backgroundImage: achievementTitleBackground ? `url("${achievementTitleBackground}")` : "none",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: `2px solid ${achievementBorder}`
          }}
        >
          <FaMedal style={{ color: achievementTitleColorCode, fontSize: "24px" }} />
          <h3 style={{
            margin: 0,
            color: achievementTitleColorCode,
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.5px"
          }}>
            Thành Tựu Thi Nhân
          </h3>
        </div>
        <div
          style={{
            backgroundImage: achievementBackground ? `url("${achievementBackground}")` : "none",
            padding: "10px 20px",
            borderRadius: "0 0 10px 10px",
          }}
        >
          <div style={{
            display: "grid",
            gap: "12px",
            position: "relative",
            "::before": {
              content: '""',
              position: "absolute",
              left: "8px",
              top: 0,
              bottom: 0,
              width: "2px",
              background: "#ffe9cc"
            }
          }}>
            {achievements && achievements.length > 0 ? (
              achievements.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    paddingLeft: "24px",
                    position: "relative"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}>
                    {item.rank === 1 ? "🥇" :
                      item.rank === 2 ? "🥈" :
                        item.rank === 3 ? "🥉" : "🎓"}
                  </div>
                  <span style={{
                    color: achievementBackgroundColorCode,
                    fontSize: "15px",
                    lineHeight: 1.4
                  }}>
                    {item.name}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                textAlign: "center",
                color: achievementBackgroundColorCode,
                padding: "16px",
                fontStyle: "italic"
              }}>
                Hành trình thơ đang chờ đón...
              </div>
            )}
          </div>

          {achievements && achievements.length > 0 && (
            <div style={{
              textAlign: "right",
              marginTop: "16px",
              borderTop: `1px dashed ${achievementBorder}`,
              paddingTop: "12px"
            }}>
              <a
                href="#"
                style={{
                  color: achievementTitleColorCode,
                  fontSize: "14px",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s",
                  ":hover": {
                    transform: "translateX(4px)"
                  }
                }}
              >
                Xem thêm thành tựu <span style={{ fontSize: "18px" }}>→</span>
              </a>
            </div>
          )}
        </div>

      </div>

      {/* Thống kê người dùng */}
      <div
        style={{
          borderRadius: "12px",
          border: `2px solid ${statisticBorder}`,
          background: statisticBackground || "#f8f5ff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          position: "relative"
        }}
      >
        <div style={{
          backgroundImage: statisticTitleBackground ? `url("${statisticTitleBackground}")` : "none",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderTopLeftRadius: "9px",
          borderTopRightRadius: "9px",
          borderBottom: `2px solid ${statisticBorder}`
        }}>
          <FaPenAlt style={{ color: statisticTitleColorCode, fontSize: "22px" }} />
          <h3 style={{ 
            margin: 0, 
            color: statisticTitleColorCode,
            fontSize: "18px",
            fontWeight: 600,
            letterSpacing: "0.5px"
          }}>
            Thống Kê Thi Phẩm
          </h3>
        </div>

        <div
          style={{
            backgroundImage: statisticBackground ? `url("${statisticBackground}")` : "none",
            padding: "10px 20px",
            borderRadius: "0 0 10px 10px",
          }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "20px",
            color: statisticBackgroundColorCode
          }}>
            <StatItem 
              icon={<FaBook style={{ fontSize: "18px" }}/>} 
              label="Bài thơ" 
              value={userStatistic?.totalPoems || 0}
            />
            <StatItem 
              icon={<FaBookmark style={{ fontSize: "18px" }}/>}
              label="Bộ sưu tập" 
              value={userStatistic?.totalCollections || 0}
            />
            <StatItem 
              icon={<FaHeadphones style={{ fontSize: "18px" }}/>}
              label="Bản ghi âm" 
              value={userStatistic?.totalPersonalAudios || 0}
            />
            <StatItem 
              icon={<FaHeart style={{ fontSize: "18px" }}/>}
              label="Lượt thích" 
              value={userStatistic?.totalLikes || 0}
            />
            <StatItem 
              icon={<FaUserFriends style={{ fontSize: "18px" }}/>}
              label="Đang theo dõi" 
              value={totalFollowings || 0}
            />
            <StatItem 
              icon={<FaUserFriends style={{ transform: "scaleX(-1)", fontSize: "18px" }}/>}
              label="Người theo dõi" 
              value={totalFollowers || 0}
            />
          </div>
          {/* <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
            Xem thêm &gt;
          </a> */}
        </div>
      </div>
    </div>
  );
};
const StatItem = ({ icon, label, value }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "all 0.3s",
    ":hover": {
      transform: "translateY(-2px)"
    }
  }}>
    <div style={{ 
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px"
    }}>
      {icon}
      <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ 
      fontSize: "18px",
      fontWeight: 600,
      color: "#7e57c2"
    }}>
      {value}
    </span>
  </div>
);
export default AchievementAndStatistic;
