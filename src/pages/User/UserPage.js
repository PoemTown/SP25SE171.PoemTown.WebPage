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
import YourBookmark from "./Bookmark/YourBookmark";
import { Button, ConfigProvider, Space } from "antd";
import { createStyles } from 'antd-style';
import { DoubleRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: linear-gradient(135deg, #6253e1, #04befe);
          position: absolute;
          inset: -1px;
          opacity: 1;
          transition: all 0.3s;
          border-radius: inherit;
        }
  
        &:hover::before {
          opacity: 0;
        }
      }
    `,
}));

const UserPage = () => {
    const [coverImage, setCoverImage] = useState(null);
    const [coverColorCode, setCoverColorCode] = useState("#000");
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [navBackground, setNavBackground] = useState(null);
    const [navColorCode, setNavColorCode] = useState("#000");
    const [achievementBorder, setAchievementBorder] = useState("white");
    const [achievementBackground, setAchievementBackground] = useState(null);
    const [statisticBorder, setStatisticBorder] = useState("#FFD700");
    const [statisticBackground, setStatisticBackground] = useState(null);
    const [NavBorder, setNavBorder] = useState("white");
    const [displayName, setDisplayName] = useState("");
    const [achievementTitleBackground, setAchievementTitleBackground] = useState(null);
    const [statisticTitleBackground, setStatisticTitleBackground] = useState(null);
    const [achievementTitleColor, setAchievementTitleColor] = useState(null);
    const [statisticTitleColor, setStatisticTitleColor] = useState(null);
    const [achievementBackgroundColor, setAchievementBackgroundColor] = useState(null);
    const [statisticBackgroundColor, setStatisticBackgroundColor] = useState(null);
    const { styles } = useStyle();
    const navigate = useNavigate();

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
                console.log(result)
                if (response.ok && Array.isArray(result.data)) {
                    const cover = result.data.find(item => item.type === 1);
                    if (cover) {
                        setCoverImage(cover.image ? encodeURI(cover.image) : null);
                        setCoverColorCode(cover.colorCode ? cover.colorCode : "#000000");
                        sessionStorage.setItem("coverImageId", cover.id);
                    }

                    const navBackground = result.data.find(item => item.type === 2);
                    if (navBackground) {
                        setNavBackground(navBackground.image ? encodeURI(navBackground.image) : null);
                        setNavColorCode(navBackground.colorCode ? navBackground.colorCode : "#000000");
                        sessionStorage.setItem("navBackgroundId", navBackground.id);
                    }

                    const navBorder = result.data.find(item => item.type === 3);
                    if (navBorder) {
                        setNavBorder(navBorder.colorCode || "#cccccc");
                        sessionStorage.setItem("navBorderId", navBorder.id);
                    }

                    const mainBackground = result.data.find(item => item.type === 4);
                    if (mainBackground) {
                        setBackgroundImage(mainBackground.image ? encodeURI(mainBackground.image) : null);
                        sessionStorage.setItem("mainBackgroundId", mainBackground.id);
                    }

                    const achievementBorder = result.data.find(item => item.type === 5);
                    if (achievementBorder) {
                        setAchievementBorder(achievementBorder.colorCode || "#FFD700");
                        sessionStorage.setItem("achievementBorderId", achievementBorder.id);
                    }

                    const achievementBackground = result.data.find(item => item.type === 6);
                    if (achievementBackground) {
                        setAchievementBackground(achievementBackground.image ? encodeURI(achievementBackground.image) : null);
                        sessionStorage.setItem("achievementBackgroundId", achievementBackground.id);
                        setAchievementBackgroundColor(achievementBackground?.colorCode || null);
                    }

                    const statisticBorder = result.data.find(item => item.type === 7);
                    if (statisticBorder) {
                        setStatisticBorder(statisticBorder.colorCode || "#FFD700");
                        sessionStorage.setItem("statisticBorderId", statisticBorder.id);
                    }

                    const statisticBackground = result.data.find(item => item.type === 8);
                    if (statisticBackground) {
                        setStatisticBackground(statisticBackground.image ? encodeURI(statisticBackground.image) : null);
                        sessionStorage.setItem("statisticBackgroundId", statisticBackground.id);
                        setStatisticBackgroundColor(statisticBackground?.colorCode || null);
                    }

                    const achievementTitleBackgroundData = result.data.find(item => item.type === 9);
                    if (achievementTitleBackgroundData) {
                        setAchievementTitleBackground(achievementTitleBackgroundData.image ? encodeURI(achievementTitleBackgroundData.image) : null);
                        sessionStorage.setItem("achievementTitleBackgroundId", achievementTitleBackgroundData.id);
                        setAchievementTitleColor(achievementTitleBackgroundData?.colorCode || null);
                    }

                    const statisticTitleBackgroundData = result.data.find(item => item.type === 10);
                    if (statisticTitleBackgroundData) {
                        setStatisticTitleBackground(statisticTitleBackgroundData.image ? encodeURI(statisticTitleBackgroundData.image) : null);
                        sessionStorage.setItem("statisticTitleBackgroundId", statisticTitleBackgroundData.id);
                        setStatisticTitleColor(statisticTitleBackgroundData?.colorCode || null);
                    } else {
                    }




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
                console.log(result)
                if (response.ok && result.data) {
                    setUserData({
                        displayName: result.data.displayName,
                        email: result.data.email,
                        userName: result.data.userName,
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
                <UserCoverEdit coverImage={coverImage} coverColorCode={coverColorCode} userData={userData} />
            ) : (
                <UserCover coverImage={coverImage} coverColorCode={coverColorCode} userData={userData} />
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
                    <NavigationTabsEdit activeTab={activeTab} setActiveTab={setActiveTab} NavBorder={NavBorder} navBackground={navBackground} navColorCode={navColorCode} />
                ) : (
                    <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} NavBorder={NavBorder} navBackground={navBackground} navColorCode={navColorCode} />
                )}

                {/* Nội dung hiển thị theo Tab */}
                <div
                    style={{
                        borderRadius: "10px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                >
                    {activeTab === "Thơ của bạn" && (
                        <YourPoem displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitleBackground={achievementTitleBackground} statisticTitleBackground={statisticTitleBackground} />
                    )}

                    {activeTab === "Bộ sưu tập của bạn" && (
                        <div>
                            <YourCollection avatar={userData.avatar} />
                        </div>
                    )}
                    {activeTab === "Bookmark của bạn" && (
                        <div>
                            <YourBookmark />
                        </div>
                    )}
                    {activeTab === "Bản nháp của bạn" && (
                        <YourDraft displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                    )}
                    {activeTab === "Lịch sử chỉnh sửa" && <p>Tất cả các thay đổi bạn đã thực hiện sẽ được hiển thị tại đây.</p>}
                    {activeTab === "Quản lý Bản Quyền" && <p>Thông tin về bản quyền các tác phẩm của bạn sẽ được hiển thị tại đây.</p>}
                    {activeTab === "Trang trí" &&
                        <YourDesign displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} setBackgroundImage={setBackgroundImage} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitleBackground={achievementTitleBackground} statisticTitleBackground={statisticTitleBackground} achievementTitleColor={achievementTitleColor} statisticTitleColor={statisticTitleColor} achievementBackgroundColor={achievementBackgroundColor} statisticBackgroundColor={statisticBackgroundColor} />}
                    {activeTab === "Quản lý ví" && <p>Thông tin về tài chính và ví điện tử sẽ hiển thị ở đây.</p>}
                </div>
            </div>


            <ConfigProvider
                button={{
                    className: styles.linearGradientButton,
                }}
            >
                <Space style={{ position: "fixed", right: 0, bottom: 60, padding: "30px", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}>
                    <Button type="primary" size="large" iconPosition="end" icon={<DoubleRightOutlined />} style={{ position: "fixed", right: 0, bottom: 60, padding: "30px", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }} onClick={() => { navigate('/design') }}>
                        Thiết kế Trang 
                    </Button>
                </Space>
            </ConfigProvider>

            <Footer style={{ marginBottom: "0px" }} />
        </div>
    );
};

export default UserPage;
