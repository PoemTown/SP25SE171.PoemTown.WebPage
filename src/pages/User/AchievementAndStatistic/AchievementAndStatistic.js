import { FaMedal, FaPenAlt, FaBook, FaHeadphones, FaHeart, FaUserFriends, FaBookmark } from "react-icons/fa";
import { GiInkSwirl, GiQuillInk } from "react-icons/gi";

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
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "28px",
      minWidth: "280px",
      width: "100%",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
    }}>
      {/* Achievements Section - Modern Elegant Design */}
      <div
        style={{
          borderRadius: "20px",
          border: `1px solid ${achievementBorder || "rgba(255, 215, 0, 0.15)"}`,
          background: achievementBackground || "linear-gradient(145deg, rgba(255, 251, 240, 0.95), rgba(255, 245, 230, 0.95))",
          boxShadow: "0 12px 30px rgba(255, 200, 0, 0.08)",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(8px)",
          zIndex: 1,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          ":hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 15px 35px rgba(255, 200, 0, 0.12)"
          }
        }}
      >
        {/* Header with subtle texture */}
        <div
          style={{
            backgroundImage: achievementTitleBackground ? `url("${achievementTitleBackground}")` : "linear-gradient(145deg, #FFD700, #FFC107)",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Decorative elements */}
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            opacity: 0.08,
            transform: "rotate(-15deg)",
            fontSize: "80px",
            color: achievementTitleColorCode || "#FFF"
          }}>
            <GiQuillInk />
          </div>
          
          {/* Icon with soft glow */}
          <div style={{
            background: "rgba(255,255,255,0.3)",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <FaMedal style={{ 
              color: achievementTitleColorCode || "#FFF", 
              fontSize: "20px",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            }} />
          </div>
          
          {/* Title with subtle underline */}
          <h3 style={{
            margin: 0,
            color: achievementTitleColorCode || "#FFF",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "0.3px",
            textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            position: "relative",
            paddingBottom: "6px"
          }}>
            Thành tựu cá nhân
            <span style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "40px",
              height: "3px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: "3px",
              transition: "width 0.3s ease"
            }}></span>
          </h3>
        </div>
        
        {/* Content area with parchment-like texture */}
        <div
          style={{
            backgroundImage: achievementBackground ? `url("${achievementBackground}")` : "none",
            padding: "22px 20px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative"
          }}
        >
          <div style={{
            display: "grid",
            gap: "16px",
            position: "relative",
            zIndex: 1
          }}>
            {achievements && achievements.length > 0 ? (
              achievements.slice(0, 4).map((item, index) => (
                <ElegantAchievementItem 
                  key={item.id}
                  item={item}
                  index={index}
                  color={achievementBackgroundColorCode}
                  borderColor={achievementBorder}
                />
              ))
            ) : (
              <div style={{
                textAlign: "center",
                color: achievementBackgroundColorCode || "#5D4037",
                padding: "24px 16px",
                fontStyle: "italic",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "14px",
                border: `1px dashed ${achievementBorder || "rgba(255, 168, 0, 0.3)"}`,
                backdropFilter: "blur(4px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                fontSize: "15px",
                transition: "all 0.3s ease",
                ":hover": {
                  transform: "scale(1.01)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
                }
              }}>
                <GiInkSwirl size={28} style={{
                  opacity: 0.3,
                  marginBottom: "10px",
                  transition: "transform 0.5s ease",
                  ":hover": {
                    transform: "rotate(15deg)"
                  }
                }} />
                <div>Hành trình thơ ca của bạn bắt đầu từ đây...</div>
              </div>
            )}
          </div>

          {achievements && achievements.length > 4 && (
            <div style={{
              textAlign: "center",
              marginTop: "20px",
              position: "relative",
              zIndex: 1
            }}>
              <a
                href="#"
                style={{
                  color: achievementTitleColorCode || "#D4A017",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                  padding: "10px 22px",
                  borderRadius: "12px",
                  background: "rgba(255, 215, 0, 0.1)",
                  border: `1px solid ${achievementBorder || "rgba(255, 215, 0, 0.15)"}`,
                  backdropFilter: "blur(6px)",
                  boxShadow: "0 4px 12px rgba(255, 193, 7, 0.1)",
                  ":hover": {
                    background: "rgba(255, 215, 0, 0.2)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 16px rgba(255, 193, 7, 0.15)"
                  }
                }}
              >
                Xem các thành tựu
                <span style={{ 
                  fontSize: "16px",
                  transition: "transform 0.3s ease",
                  ":hover": {
                    transform: "translateX(3px)"
                  }
                }}>→</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Section - Modern Data Visualization */}
      <div
        style={{
          borderRadius: "20px",
          border: `1px solid ${statisticBorder || "rgba(126, 87, 194, 0.1)"}`,
          background: statisticBackground || "linear-gradient(145deg, rgba(248, 245, 255, 0.95), rgba(238, 230, 255, 0.95))",
          boxShadow: "0 12px 30px rgba(126, 87, 194, 0.08)",
          position: "relative",
          overflow: "hidden",
          backdropFilter: "blur(8px)",
          zIndex: 1,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          ":hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 15px 35px rgba(126, 87, 194, 0.12)"
          }
        }}
      >
        {/* Header with subtle gradient */}
        <div style={{
          backgroundImage: statisticTitleBackground ? `url("${statisticTitleBackground}")` : "linear-gradient(145deg, #7E57C2, #673AB7)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Decorative swirl */}
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            opacity: 0.08,
            transform: "rotate(15deg)",
            fontSize: "80px",
            color: statisticTitleColorCode || "#FFF"
          }}>
            <GiInkSwirl />
          </div>
          
          {/* Icon with soft glow */}
          <div style={{
            background: "rgba(255,255,255,0.3)",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <FaPenAlt style={{ 
              color: statisticTitleColorCode || "#FFF", 
              fontSize: "18px",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            }} />
          </div>
          
          {/* Title with subtle underline */}
          <h3 style={{ 
            margin: 0, 
            color: statisticTitleColorCode || "#FFF",
            fontSize: "18px",
            fontWeight: 700,
            letterSpacing: "0.3px",
            textShadow: "0 1px 4px rgba(0,0,0,0.2)",
            position: "relative",
            paddingBottom: "6px"
          }}>
            Thống kê trang cá nhân
            <span style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "40px",
              height: "3px",
              background: "rgba(255,255,255,0.6)",
              borderRadius: "3px",
              transition: "width 0.3s ease"
            }}></span>
          </h3>
        </div>

        {/* Content with responsive grid */}
        <div
          style={{
            backgroundImage: statisticBackground ? `url("${statisticBackground}")` : "none",
            padding: "22px 18px",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative"
          }}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            color: statisticBackgroundColorCode || "#5E35B1",
            position: "relative",
            zIndex: 1
          }}>
            <ElegantStatItem 
              icon={<FaBook style={{ fontSize: "20px" }}/>} 
              label="Bài thơ" 
              value={userStatistic?.totalPoems || 0}
              color={statisticBackgroundColorCode}
              accentColor="#7E57C2"
            />
            <ElegantStatItem 
              icon={<FaBookmark style={{ fontSize: "20px" }}/>}
              label="Bộ sưu tập" 
              value={userStatistic?.totalCollections || 0}
              color={statisticBackgroundColorCode}
              accentColor="#7E57C2"
            />
            <ElegantStatItem 
              icon={<FaHeadphones style={{ fontSize: "20px" }}/>}
              label="Bản ghi âm" 
              value={userStatistic?.totalPersonalAudios || 0}
              color={statisticBackgroundColorCode}
              accentColor="#7E57C2"
            />
            <ElegantStatItem 
              icon={<FaHeart style={{ fontSize: "20px", color: "#FF5252" }}/>}
              label="Lượt thích" 
              value={userStatistic?.totalLikes || 0}
              color={statisticBackgroundColorCode}
              accentColor="#FF5252"
            />
            <ElegantStatItem 
              icon={<FaUserFriends style={{ fontSize: "20px" }}/>}
              label="Đang theo dõi" 
              value={totalFollowings || 0}
              color={statisticBackgroundColorCode}
              accentColor="#7E57C2"
            />
            <ElegantStatItem 
              icon={<FaUserFriends style={{ transform: "scaleX(-1)", fontSize: "20px" }}/>}
              label="Lượt theo dõi" 
              value={totalFollowers || 0}
              color={statisticBackgroundColorCode}
              accentColor="#7E57C2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ElegantAchievementItem = ({ item, index, color, borderColor }) => {
  const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#7E57C2"];
  const medalIcons = ["🥇", "🥈", "🥉", "🎖️"];
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "18px 20px",
        background: "rgba(255,255,255,0.9)",
        borderRadius: "14px",
        border: `1px solid ${borderColor || "rgba(255, 215, 0, 0.1)"}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        backdropFilter: "blur(6px)",
        ":hover": {
          transform: "translateX(8px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.1)"
        },
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background decorative element */}
      <div style={{
        position: "absolute",
        right: -30,
        top: -30,
        width: "80px",
        height: "80px",
        background: rankColors[index] || rankColors[3],
        opacity: 0.08,
        borderRadius: "50%"
      }}></div>
      
      {/* Medal/Rank indicator */}
      <div style={{
        flexShrink: 0,
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${rankColors[index] || rankColors[3]}, ${rankColors[index+1] || "#9C27B0"})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFF",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: "20px",
        position: "relative",
        zIndex: 1,
        transition: "transform 0.3s ease",
        ":hover": {
          transform: "rotate(10deg) scale(1.1)"
        }
      }}>
        {medalIcons[item.rank-1] || medalIcons[3]}
      </div>
      
      {/* Content */}
      <div style={{
        flex: 1,
        position: "relative",
        zIndex: 1
      }}>
        <div style={{
          color: color || "#5D4037",
          fontSize: "15px",
          fontWeight: 600,
          marginBottom: "8px",
          letterSpacing: "0.2px"
        }}>
          {item.name}
        </div>
        
        {/* Progress bar with smooth animation */}
        {/* <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <div style={{
            height: "4px",
            background: "rgba(0,0,0,0.08)",
            borderRadius: "4px",
            flex: 1,
            overflow: "hidden"
          }}>
            <div style={{
              width: `${Math.min(100, (item.progress || 0) * 100)}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${rankColors[index] || rankColors[3]}, ${rankColors[index+1] || "#9C27B0"})`,
              borderRadius: "4px",
              transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)"
            }}></div>
          </div>
          
          <span style={{
            color: color || "#795548",
            fontSize: "12px",
            fontWeight: 500,
            minWidth: "40px",
            textAlign: "right"
          }}>
            {Math.round((item.progress || 0) * 100)}%
          </span>
        </div> */}
      </div>
    </div>
  );
};

const ElegantStatItem = ({ icon, label, value, color, accentColor }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    border: "1px solid rgba(126, 87, 194, 0.08)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
    transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
    backdropFilter: "blur(6px)",
    ":hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
    },
    position: "relative",
    overflow: "hidden"
  }}>
    {/* Top accent bar */}
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "4px",
      background: `linear-gradient(90deg, ${accentColor || "#7E57C2"}, ${lightenColor(accentColor || "#7E57C2", 20)})`,
      transition: "all 0.3s ease"
    }}></div>
    
    {/* Icon with gradient background */}
    <div style={{ 
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "16px",
      position: "relative",
      zIndex: 1
    }}>
      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        background: `linear-gradient(135deg, rgba(${hexToRgb(accentColor || "#7E57C2").r}, ${hexToRgb(accentColor || "#7E57C2").g}, ${hexToRgb(accentColor || "#7E57C2").b}, 0.12) 0%, rgba(255,255,255,0.4) 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        ":hover": {
          transform: "rotate(10deg)"
        }
      }}>
        {icon}
      </div>
      <span style={{ 
        fontSize: "14px",
        fontWeight: 600,
        color: color || "#5E35B1",
        letterSpacing: "0.3px"
      }}>
        {label}
      </span>
    </div>
    
    {/* Value with gradient text */}
    <span style={{ 
      fontSize: "24px",
      fontWeight: 700,
      background: `linear-gradient(135deg, ${accentColor || "#7E57C2"}, ${lightenColor(accentColor || "#7E57C2", 10)})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      position: "relative",
      zIndex: 1,
      textShadow: "0 2px 4px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease",
      ":hover": {
        transform: "scale(1.05)"
      }
    }}>
      {value}
    </span>
    
    {/* Subtle decorative element */}
    <div style={{
      position: "absolute",
      bottom: -20,
      right: -20,
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: `rgba(${hexToRgb(accentColor || "#7E57C2").r}, ${hexToRgb(accentColor || "#7E57C2").g}, ${hexToRgb(accentColor || "#7E57C2").b}, 0.05)`,
      zIndex: 0
    }}></div>
  </div>
);

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 126, g: 87, b: 194 };
}

// Helper function to lighten a color
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
}

export default AchievementAndStatistic;