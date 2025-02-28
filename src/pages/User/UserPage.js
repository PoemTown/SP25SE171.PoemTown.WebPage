import React, { useState, useEffect } from "react";
import Headeruser from "../../components/Headeruser";
import Footer from "../../components/Footer";
import YourPoem from "./YourPoem";

import YourDraft from "./YourDraft";
import YourDesign from "./YourDesign";
import YourCollection from "./Collection/YourCollection";
import UserCover from "./Components/UserCover";
import UserCoverEdit from "./Components/UserCoverEdit";
import NavigationTabs from "./Components/NavigationTabs";
import NavigationTabsEdit from "./Components/NavigationTabsEdit";
const UserPage = () => {
    const [coverImage, setCoverImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [achievementBorder, setAchievementBorder] = useState("white");
    const [statisticBorder, setStatisticBorder] = useState("#FFD700");
    const [NavBorder, setNavBorder] = useState("white");
    const [displayName, setDisplayName] = useState("");

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await fetch(
                    "https://api-poemtown-staging.nodfeather.win/api/template/v1/user-templates/theme/in-use",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const result = await response.json();
                if (response.ok && Array.isArray(result.data)) {
                    const cover = result.data.find(item => item.type === 1);
                    if (cover) {
                        setCoverImage(cover.image || null);
                        sessionStorage.setItem("coverImageId", cover.id);
                    }
    
                    const background = result.data.find(item => item.type === 4);
                if (background) {
                    setBackgroundImage(background.image || null);
                    sessionStorage.setItem("backgroundImageId", background.id);
                }

                    setNavBorder(result.data.find(item => item.type === 3)?.colorCode || "#FFD700");
                    setAchievementBorder(result.data.find(item => item.type === 5)?.colorCode || "#FFD700");
                    setStatisticBorder(result.data.find(item => item.type === 7)?.colorCode || "#FFD700");
                } else {
                    console.error("Lỗi khi lấy dữ liệu hình ảnh:", result.message);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };
    
        fetchImage();
    }, []);
    

    const [userData, setUserData] = useState({
        displayName: "Loading...",
        email: "Loading...",
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(
                    "https://api-poemtown-staging.nodfeather.win/api/users/v1/mine/profile/online",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
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

    const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeTab") || "Thơ của bạn");

    useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
    }, [activeTab]);

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <Headeruser />

            {/* Cover Image */}
            {activeTab === "Trang trí" ? (
                <UserCoverEdit coverImage={coverImage} userData={userData} />
            ) : (
                <UserCover coverImage={coverImage} userData={userData} />
            )}

            {/* Background Image */}
            <div
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: "auto",
                }}
            >
                {/* Navigation Tabs */}
                {activeTab === "Trang trí" ? (
                    <NavigationTabsEdit activeTab={activeTab} setActiveTab={setActiveTab} NavBorder={NavBorder} />
                ) : (
                    <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} NavBorder={NavBorder} />
                )}

                {/* Nội dung hiển thị theo Tab */}
                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                >
                    {activeTab === "Thơ của bạn" && (
                        <YourPoem displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                    )}

                    {activeTab === "Bộ sưu tập của bạn" && (
                        <div>
                            <YourCollection avatar={userData.avatar}/>
                        </div>
                    )}
                    {activeTab === "Bookmark của bạn" && (
                        <div>
                            <h3>Bookmark của bạn</h3>
                            <p>Các bài thơ bạn đã đánh dấu yêu thích sẽ hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Bản nháp của bạn" && (
                        <YourDraft displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                    )}
                    {activeTab === "Lịch sử chỉnh sửa" && <p>Tất cả các thay đổi bạn đã thực hiện sẽ được hiển thị tại đây.</p>}
                    {activeTab === "Quản lý Bản Quyền" && <p>Thông tin về bản quyền các tác phẩm của bạn sẽ được hiển thị tại đây.</p>}
                    {activeTab === "Trang trí" && <YourDesign displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} setBackgroundImage={setBackgroundImage}/>}
                    {activeTab === "Quản lý ví" && <p>Thông tin về tài chính và ví điện tử sẽ hiển thị ở đây.</p>}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default UserPage;
