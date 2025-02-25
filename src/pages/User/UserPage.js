import React, { useState, useEffect } from "react";
import Headeruser from "../../components/Headeruser";
import Headeredit from "../../components/Headeredit";
import Footer from "../../components/Footer";
import YourPoem from "./YourPoem";
import YourDraft from "./YourDraft";
import YourDesign from "./YourDesign";

const UserPage = () => {
    const [coverImage, setCoverImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [achievementBorder, setAchievementBorder] = useState("white");
    const [statisticBorder, setStatisticBorder] = useState("#FFD700");
    const [activeTab, setActiveTab] = useState("Thơ của bạn");
    const [displayName, setDisplayName] = useState("");
    const fetchImage = async () => {
        try {
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/template/v1/user-templates/theme/in-use", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (response.ok && Array.isArray(result.data)) {
                const coverImg = result.data.find(item => item.type === 1 && item.designType === 1)?.image || null;
                const bgImg = result.data.find(item => item.type === 4 && item.designType === 1)?.image || null;
                const AchievementBorderColor = result.data.find(item => item.type === 5 && item.designType === 2)?.colorCode
                    ? `#${result.data.find(item => item.type === 5 && item.designType === 2)?.colorCode}`
                    : "#FFD700";

                const StatisticBorderColor = result.data.find(item => item.type === 7 && item.designType === 2)?.colorCode
                    ? `#${result.data.find(item => item.type === 7 && item.designType === 2)?.colorCode}`
                    : "#FFD700";

                setAchievementBorder(AchievementBorderColor);
                setStatisticBorder(StatisticBorderColor);
                setCoverImage(coverImg);
                setBackgroundImage(bgImg);
            } else {
                console.error("Lỗi khi lấy dữ liệu hình ảnh:", result.message);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    };

    useEffect(() => {
        fetchImage();
    }, []);
    const [userData, setUserData] = useState({
        displayName: "Loading...",
        email: "Loading...",
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/users/v1/mine/profile/online", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                });
                const result = await response.json();
                if (response.ok && result.data) {
                    setUserData({
                        displayName: result.data.displayName,
                        email: result.data.email,
                        avatar: result.data.avatar,
                        totalFollowers: result.data.totalFollowers,
                        totalFollowings: result.data.totalFollowings,
                    });
                    setDisplayName(result.data.displayName);
                } else {
                    console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <Headeruser />


            {/* Cover Image */}
            <div style={{ width: "100%", position: "relative" }}>
                <div style={{
                    backgroundColor: "#FFD700",
                    padding: "15px",
                    borderRadius: "10px",
                    position: "relative",
                    backgroundImage: coverImage ? `url(${coverImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src={userData.avatar || "./default-avatar.png"}
                            alt="Avatar"
                            style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                border: "2px solid white"
                            }}
                        />

                        <div style={{ marginLeft: "15px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{userData.displayName}</h2>
                            <p style={{ color: "#555" }}>{userData.email}</p>
                            <div style={{ fontSize: "14px", color: "#333" }}>
                                👀 {userData.totalFollowers} Người theo dõi • 📌 {userData.totalFollowings} Đang theo dõi
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Image */}
            <div style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "auto",
            }}>
                {/* Navigation Tabs */}
                <nav style={{ marginTop: "0px", backgroundColor: "white", padding: "10px", borderRadius: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["Thơ của bạn", "Bộ sưu tập của bạn", "Bookmark của bạn", "Bản nháp của bạn", "Lịch sử chỉnh sửa", "Quản lý Bản Quyền", "Trang trí", "Quản lý ví"].map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "10px 15px",
                                fontSize: "14px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                fontWeight: activeTab === tab ? "bold" : "normal",
                                color: activeTab === tab ? "#007bff" : "#555",
                                borderBottom: activeTab === tab ? "2px solid #007bff" : "none"
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                {/* Nội dung hiển thị theo Tab */}
                <div style={{ marginTop: "20px", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    {activeTab === "Thơ của bạn" && (
                        <div>
                            <YourPoem displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                        </div>
                    )}

                    {activeTab === "Bộ sưu tập của bạn" && (
                        <div>
                            <h3>Bộ sưu tập của bạn</h3>
                            <p>Các bộ sưu tập thơ mà bạn đã tạo sẽ hiển thị ở đây.</p>
                        </div>
                    )}
                    {activeTab === "Bookmark của bạn" && (
                        <div>
                            <h3>Bookmark của bạn</h3>
                            <p>Các bài thơ bạn đã đánh dấu yêu thích sẽ hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Bản nháp của bạn" && (
                        <div>
                            <YourDraft displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                        </div>
                    )}
                    {activeTab === "Lịch sử chỉnh sửa" && (
                        <div>
                            <h3>Lịch sử chỉnh sửa</h3>
                            <p>Tất cả các thay đổi bạn đã thực hiện sẽ được hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Quản lý Bản Quyền" && (
                        <div>
                            <h3>Quản lý Bản Quyền</h3>
                            <p>Thông tin về bản quyền các tác phẩm của bạn sẽ được hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Trang trí" && (
                        <div>
                            <YourDesign displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                        </div>
                    )}
                    {activeTab === "Quản lý ví" && (
                        <div>
                            <h3>Quản lý ví</h3>
                            <p>Thông tin về tài chính và ví điện tử sẽ hiển thị ở đây.</p>
                        </div>
                    )}
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default UserPage;
