import React from "react";

const BiographyWithStats = ({ poet, achievements, userStatistic, isLoading }) => {
    // Default styling values for the panels
    const achievementBorder = "#FFD700";
    const achievementTitleBackground = "linear-gradient(to right, #FFD700, #FFA500)";
    const achievementTitleColorCode = "#fff";
    const achievementBackground = "none";
    const achievementBackgroundColorCode = "#333";

    const statisticBorder = "#3498db";
    const statisticTitleBackground = "linear-gradient(to right, #3498db, #2980b9)";
    const statisticTitleColorCode = "#fff";
    const statisticBackground = "none";
    const statisticBackgroundColorCode = "#333";

    const totalFollowings = userStatistic?.totalFollowings || 0;
    const totalFollowers = userStatistic?.totalFollowers || 0;

    return (
        <div style={{
            display: "flex",
            gap: "30px",
            padding: "40px 40px",
            maxWidth: "2000px",  
            margin: "0 auto",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            {/* Main Biography Content (Left Side) */}
            <div style={{ flex: 3 }}>
                <BiographyTab poet={poet} />
            </div>

            {/* Stats Panels (Right Side) */}
            <div style={{ flex: 1, minWidth: "350px" }}>  {/* Tăng minWidth từ 300px lên 350px */}
                <div style={{ display: "flex", flexDirection: "column", gap: "30px", position: "sticky", top: "20px" }}>
                    {/* Thành tựu cá nhân */}
                    <div
                        style={{
                            borderRadius: "10px",
                            border: `2px solid ${achievementBorder}`,
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                        }}
                    >
                        <div
                            style={{
                                background: achievementTitleBackground,
                                height: "53px",
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
                                background: achievementBackground,
                                padding: "10px 20px",
                                borderRadius: "0 0 10px 10px",
                                backgroundColor: "#fff",
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
                            background: statisticTitleBackground,
                            height: "53px",
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
                        <div
                            style={{
                                background: statisticBackground,
                                padding: "10px 20px",
                                borderRadius: "0 0 10px 10px",
                                backgroundColor: "#fff",
                            }}
                        >
                            <ul style={{ 
                                fontSize: "14px", 
                                color: statisticBackgroundColorCode, 
                                listStyle: "none", 
                                padding: 0, 
                                margin: 0,
                                display: "grid",
                                gap: "8px"
                            }}>
                                <li>Tổng bài viết: {isLoading ? <span>...</span> : userStatistic?.totalPoems || 0}</li>
                                <li>Tổng bộ sưu tập: {isLoading ? <span>...</span> : userStatistic?.totalCollections || 0}</li>
                                <li>Tổng audio cá nhân: {isLoading ? <span>...</span> : userStatistic?.totalPersonalAudios || 0}</li>
                                <li>Tổng lượt thích: {isLoading ? <span>...</span> : userStatistic?.totalLikes || 0}</li>
                                <li>Đang theo dõi: {isLoading ? <span>...</span> : totalFollowings || 0}</li>
                                <li>Người theo dõi: {isLoading ? <span>...</span> : totalFollowers || 0}</li>
                                <li>Bookmark bài viết: {isLoading ? <span>...</span> : userStatistic?.poemBookmarks || 0}</li>
                                <li>Bookmark bộ sưu tập: {isLoading ? <span>...</span> : userStatistic?.collectionBookmarks || 0}</li>
                            </ul>
                            <a href="#" style={{ 
                                color: "#007bff", 
                                fontSize: "12px", 
                                display: "block", 
                                marginTop: "10px" 
                            }}>
                                Xem thêm &gt;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BiographyTab = ({ poet }) => {
    return (
        <div style={{
            backgroundColor: "#f5f7fa",
            padding: "60px 20px",
            display: "flex",
            justifyContent: "center",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundImage: "linear-gradient(to right, #f9f9f9 0%, #f5f7fa 20%, #f5f7fa 80%, #f9f9f9 100%)",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Decorative elements */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
                opacity: 0.3,
                zIndex: 0
            }}></div>
            
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                padding: "40px",
                maxWidth: "1200px",  // Tăng maxWidth từ 1000px lên 1200px
                width: "100%",
                position: "relative",
                zIndex: 1,
                border: "1px solid rgba(0,0,0,0.05)"
            }}>
                {/* Header with decorative elements - Điều chỉnh để tiêu đề lệch trái */}
                <div style={{
                    textAlign: "left",  // Thay đổi từ "center" sang "left"
                    marginBottom: "32px",
                    position: "relative",
                    paddingLeft: "20px"  // Thêm padding-left để lệch trái rõ hơn
                }}>
                    <h2 style={{
                        fontSize: "28px",
                        fontWeight: 600,
                        color: "#2c3e50",
                        display: "inline-block",
                        padding: "0 30px 0 0",  // Bỏ padding right để lệch trái
                        background: "#fff",
                        position: "relative",
                        zIndex: 1,
                        marginLeft: "-20px"  // Điều chỉnh để bù lại padding-left
                    }}>
                        <span style={{ 
                            color: "#e74c3c",
                            marginRight: "10px"
                        }}>👤</span>
                        Thông tin cá nhân
                    </h2>
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "1px",
                        backgroundColor: "#eee",
                        zIndex: 0
                    }}></div>
                </div>

                {/* Main Content */}
                <div style={{ 
                    display: "flex", 
                    gap: "40px",
                    flexWrap: "wrap" 
                }}>
                    {/* Left Column - Avatar and basic info */}
                    <div style={{
                        flex: "1",
                        minWidth: "550px",  // Tăng minWidth từ 500px lên 550px
                        padding: "20px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "12px",
                        border: "1px solid #eee",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.03)"
                    }}>
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "20px"
                        }}>
                            <div style={{ 
                                position: "relative",
                                marginBottom: "10px"
                            }}>
                                <img
                                    src={poet?.avatar || "https://via.placeholder.com/150"}
                                    alt="Avatar"
                                    style={{
                                        width: "150px",
                                        height: "150px",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "4px solid #fff",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}
                                />
                                <div style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    right: "10px",
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    backgroundColor: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                }}>
                                    <span style={{ color: "#3498db", fontSize: "16px" }}>👤</span>
                                </div>
                            </div>
                            
                            <div style={{ textAlign: "center" }}>
                                <h3 style={{ 
                                    margin: "0", 
                                    fontSize: "24px",
                                    color: "#2c3e50",
                                    fontWeight: "600"
                                }}>{poet?.name || "Chưa rõ"}</h3>
                                <p style={{ 
                                    color: "#7f8c8d", 
                                    margin: "4px 0 10px",
                                    fontSize: "14px"
                                }}>@{poet?.name || "unknown"}</p>
                                
                                <div style={{
                                    display: "inline-block",
                                    padding: "6px 12px",
                                    backgroundColor: "#e8f4fc",
                                    borderRadius: "20px",
                                    color: "#2980b9",
                                    fontSize: "13px",
                                    fontWeight: "500"
                                }}>
                                    Nhà thơ
                                </div>
                            </div>
                            
                            <div style={{ 
                                width: "100%",
                                marginTop: "20px"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "12px 0",
                                    borderBottom: "1px dashed #eee"
                                }}>
                                    <span style={{
                                        width: "30px",
                                        height: "30px",
                                        backgroundColor: "#f0f7ff",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: "12px",
                                        color: "#3498db"
                                    }}>📅</span>
                                    <div>
                                        <div style={{ 
                                            fontSize: "12px",
                                            color: "#95a5a6",
                                            marginBottom: "2px"
                                        }}>Ngày sinh</div>
                                        <div style={{ fontWeight: "500" }}>
                                            {poet?.dateOfBirth || "Không rõ"}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "12px 0",
                                    borderBottom: "1px dashed #eee"
                                }}>
                                    <span style={{
                                        width: "30px",
                                        height: "30px",
                                        backgroundColor: "#f0f7ff",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: "12px",
                                        color: "#3498db"
                                    }}>👤</span>
                                    <div>
                                        <div style={{ 
                                            fontSize: "12px",
                                            color: "#95a5a6",
                                            marginBottom: "2px"
                                        }}>Giới tính</div>
                                        <div style={{ fontWeight: "500" }}>
                                            {poet?.gender === "Male" ? "Nam" : poet?.gender === "Female" ? "Nữ" : "Khác"}
                                        </div>
                                    </div>
                                </div>
                                
                                {poet?.address && (
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "12px 0"
                                }}>
                                    <span style={{
                                        width: "30px",
                                        height: "30px",
                                        backgroundColor: "#f0f7ff",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: "12px",
                                        color: "#3498db"
                                    }}>📍</span>
                                    <div>
                                        <div style={{ 
                                            fontSize: "12px",
                                            color: "#95a5a6",
                                            marginBottom: "2px"
                                        }}>Địa chỉ</div>
                                        <div style={{ fontWeight: "500" }}>
                                            {poet.address}
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Column - Biography */}
                    <div style={{
                        flex: "2",
                        minWidth: "350px"  // Tăng minWidth từ 300px lên 350px
                    }}>
                        <div style={{ 
                            backgroundColor: "#fff",
                            borderRadius: "12px",
                            padding: "25px",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                            border: "1px solid #f0f0f0",
                            height: "auto"
                        }}>
                            <h3 style={{
                                fontSize: "20px",
                                fontWeight: "600",
                                color: "#2c3e50",
                                marginBottom: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                paddingBottom: "10px",
                                borderBottom: "1px solid #eee"
                            }}>
                                <span style={{
                                    width: "32px",
                                    height: "32px",
                                    backgroundColor: "#f0f7ff",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#3498db"
                                }}>📖</span>
                                Tiểu sử
                            </h3>
                            
                            <div style={{
                                padding: "20px",
                                backgroundColor: "#f9f9f9",
                                borderRadius: "8px",
                                whiteSpace: "pre-line",
                                color: "#34495e",
                                lineHeight: "1.6",
                                fontSize: "15px",
                                borderLeft: "3px solid #3498db"
                            }}>
                                {poet?.bio || "Chưa có tiểu sử."}
                            </div>
                            
                            {/* Additional decorative elements */}
                            <div style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "20px"
                            }}>
                                <div style={{
                                    fontFamily: "'Georgia', serif",
                                    fontSize: "14px",
                                    color: "#bdc3c7",
                                    fontStyle: "italic"
                                }}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiographyWithStats;