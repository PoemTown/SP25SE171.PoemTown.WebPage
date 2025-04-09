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
import { Button, ConfigProvider, Space, Spin } from "antd";
import { createStyles } from 'antd-style';
import { DoubleRightOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import AchievementAndStatistic from "./AchievementAndStatistic/AchievementAndStatistic";
import YourRecordFile from "./RecordFile/YourRecordFile";
import Headerdefault from "../../components/Headerdefault";
import YourWallet from "./YourWallet";
import UsageRight from "./UsageRight";
import YourBio from "./YourBio";

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
    const [achievementTitleColorCode, setAchievementTitleColorCode] = useState(null);
    const [statisticTitleColorCode, setStatisticTitleColorCode] = useState(null);
    const [achievementBackgroundColorCode, setAchievementBackgroundColorCode] = useState(null);
    const [statisticBackgroundColorCode, setStatisticBackgroundColorCode] = useState(null);
    const [isCreatingPoem, setIsCreatingPoem] = useState(false);
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { styles } = useStyle();
    const { username } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const accessToken = localStorage.getItem("accessToken");
    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchUserProfile();
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [refreshTrigger]); // Only trigger when refreshTrigger changes


    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/users/v1/profile/online/${username}`,
                    { method: "GET", headers: requestHeaders }
                );

                if (!isMounted) return;

                const result = await response.json();
                if (response.ok && result.data) {
                    setUserData({
                        displayName: result.data.displayName,
                        email: result.data.email,
                        userName: result.data.userName,
                        userId: result.data.id,
                        avatar: result.data.avatar,
                        isMine: result.data.isMine,
                        isFollowed: result.data.isFollowed,
                        totalFollowers: result.data.totalFollowers,
                        totalFollowings: result.data.totalFollowings,
                        userStatistic: result.data.userStatistic,
                        gender: result.data.gender,
                        dateOfBirth: result.data.dateOfBirth,
                        address: result.data.address,
                        phoneNumber: result.data.phoneNumber,
                        bio: result.data.bio,
                        achievements: result.data.achievements
                    });
                    setDisplayName(result.data.displayName);
                    const cover = result.data.userTemplateDetails.find(item => item.type === 1);
                    if (cover) {
                        setCoverImage(cover.image ? encodeURI(cover.image) : null);
                        setCoverColorCode(cover.colorCode ? cover.colorCode : "#000000");
                    }
    
                    const navBackground = result.data.userTemplateDetails.find(item => item.type === 2);
                    if (navBackground) {
                        setNavBackground(navBackground.image ? encodeURI(navBackground.image) : null);
                        setNavColorCode(navBackground.colorCode ? navBackground.colorCode : "#000000");
                    }
    
                    const navBorder = result.data.userTemplateDetails.find(item => item.type === 3);
                    if (navBorder) {
                        setNavBorder(navBorder.colorCode || "#cccccc");
                    }
    
                    const mainBackground = result.data.userTemplateDetails.find(item => item.type === 4);
                    if (mainBackground) {
                        setBackgroundImage(mainBackground.image ? encodeURI(mainBackground.image) : null);
                    }
    
                    const achievementBorder = result.data.userTemplateDetails.find(item => item.type === 5)
                    if (achievementBorder) {
                        setAchievementBorder(achievementBorder.colorCode || "#cccccc");
                    }
    
                    const achievementBackground = result.data.userTemplateDetails.find(item => item.type === 6)
                    if (achievementBackground) {
                        setAchievementBackground(achievementBackground.image || "none");
                        setAchievementBackgroundColorCode(achievementBackground.colorCode || "#000000");
                    }
    
                    const statisticBorder = result.data.userTemplateDetails.find(item => item.type === 7)
                    if (statisticBorder) {
                        setStatisticBorder(statisticBorder.colorCode || "#cccccc");
                    }
    
                    const statisticBackground = result.data.userTemplateDetails.find(item => item.type === 8)
                    if (statisticBackground) {
                        setStatisticBackground(statisticBackground.image || "none");
                        setStatisticBackgroundColorCode(statisticBackground.colorCode || "#000000");
                    }
                    const achievementTitle = result.data.userTemplateDetails.find(item => item.type === 9);
                    if (achievementTitle) {
                        setAchievementTitleBackground(achievementTitle.image || "none");
                        setAchievementTitleColorCode(achievementTitle.colorCode || "#000000")
                    }
    
                    const statisticTitle = result.data.userTemplateDetails.find(item => item.type === 10);
                    if (statisticTitle) {
                        setStatisticTitleBackground(statisticTitle.image || "none");
                        setStatisticTitleColorCode(statisticTitle.colorCode || "#000000");
                    }
                } else {
                    console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
                }

            } catch (error) {
                if (!isMounted) return;
                console.error("Lỗi khi gọi API:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false }; // Cleanup
    }, [refreshTrigger, username]); // Add username to dependencies

    const [userData, setUserData] = useState({
        displayName: "Loading...",
        email: "Loading...",
    });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);


    const fetchUserProfile = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/users/v1/profile/online/${username}`,
                {
                    method: "GET",
                    headers: requestHeaders
                }
            );
            const result = await response.json();
            console.log("online user", result)
            if (response.ok && result.data) {
                setUserData({
                    displayName: result.data.displayName,
                    email: result.data.email,
                    userName: result.data.userName,
                    userId: result.data.id,
                    avatar: result.data.avatar,
                    isMine: result.data.isMine,
                    isFollowed: result.data.isFollowed,
                    totalFollowers: result.data.totalFollowers,
                    totalFollowings: result.data.totalFollowings,
                    userStatistic: result.data.userStatistic,
                    gender: result.data.gender,
                    dateOfBirth: result.data.dateOfBirth,
                    address: result.data.address,
                    phoneNumber: result.data.phoneNumber,
                    bio: result.data.bio,
                    achievements: result.data.achievements
                });
                setDisplayName(result.data.displayName);
                const cover = result.data.userTemplateDetails.find(item => item.type === 1);
                if (cover) {
                    setCoverImage(cover.image ? encodeURI(cover.image) : null);
                    setCoverColorCode(cover.colorCode ? cover.colorCode : "#000000");
                }

                const navBackground = result.data.userTemplateDetails.find(item => item.type === 2);
                if (navBackground) {
                    setNavBackground(navBackground.image ? encodeURI(navBackground.image) : null);
                    setNavColorCode(navBackground.colorCode ? navBackground.colorCode : "#000000");
                }

                const navBorder = result.data.userTemplateDetails.find(item => item.type === 3);
                if (navBorder) {
                    setNavBorder(navBorder.colorCode || "#cccccc");
                }

                const mainBackground = result.data.userTemplateDetails.find(item => item.type === 4);
                if (mainBackground) {
                    setBackgroundImage(mainBackground.image ? encodeURI(mainBackground.image) : null);
                }

                const achievementBorder = result.data.userTemplateDetails.find(item => item.type === 5)
                if (achievementBorder) {
                    setAchievementBorder(achievementBorder.colorCode || "#cccccc");
                }

                const achievementBackground = result.data.userTemplateDetails.find(item => item.type === 6)
                if (achievementBackground) {
                    setAchievementBackground(achievementBackground.image || "none");
                    setAchievementBackgroundColorCode(achievementBackground.colorCode || "#000000");
                }

                const statisticBorder = result.data.userTemplateDetails.find(item => item.type === 7)
                if (statisticBorder) {
                    setStatisticBorder(statisticBorder.colorCode || "#cccccc");
                }

                const statisticBackground = result.data.userTemplateDetails.find(item => item.type === 8)
                if (statisticBackground) {
                    setStatisticBackground(statisticBackground.image || "none");
                    setStatisticBackgroundColorCode(statisticBackground.colorCode || "#000000");
                }
                const achievementTitle = result.data.userTemplateDetails.find(item => item.type === 9);
                if (achievementTitle) {
                    setAchievementTitleBackground(achievementTitle.image || "none");
                    setAchievementTitleColorCode(achievementTitle.colorCode || "#000000")
                }

                const statisticTitle = result.data.userTemplateDetails.find(item => item.type === 10);
                if (statisticTitle) {
                    setStatisticTitleBackground(statisticTitle.image || "none");
                    setStatisticTitleColorCode(statisticTitle.colorCode || "#000000");
                }
            } else {
                console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    };


    const [activeTab, setActiveTab] = useState(() => "Tiểu sử");

    useEffect(() => {
        localStorage.setItem("activeTab", activeTab);
        
        if (activeTab === "Bộ sưu tập của bạn" || activeTab === "Bookmark của bạn" || activeTab === "Bản nháp của bạn" || activeTab === "Lịch sử chỉnh sửa" || activeTab === "Quản lý Bản Quyền" || activeTab === "Quản lý ví" || activeTab === "Bản ghi âm" || activeTab === "Tiểu sử" ) {
            setIsCreatingPoem(false);
        }
        if (activeTab === "Thơ của bạn" || activeTab === "Bookmark của bạn" || activeTab === "Bản nháp của bạn" || activeTab === "Lịch sử chỉnh sửa" || activeTab === "Quản lý Bản Quyền" || activeTab === "Quản lý ví" || activeTab === "Bản ghi âm" || activeTab === "Tiểu sử" ) {
            setIsCreatingCollection(false);
        }

    }, [activeTab]);


    if (isLoading) {
        // Display a spinner or loading message until data is loaded
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}

            {/* Cover Image */}
            {/* {activeTab === "Trang trí" ? (
                <UserCoverEdit coverImage={coverImage} coverColorCode={coverColorCode} userData={userData} />
            ) : ( */}
            <UserCover onFollowSuccess={() => setRefreshTrigger(prev => prev + 1)} isMine={userData.isMine} coverImage={coverImage} coverColorCode={coverColorCode} userData={userData} />
            {/* )} */}

            {/* Navigation Tabs */}
            {/* {activeTab === "Trang trí" ? (
                    <NavigationTabsEdit activeTab={activeTab} setActiveTab={setActiveTab} NavBorder={NavBorder} navBackground={navBackground} navColorCode={navColorCode} />
                ) : ( */}
            <NavigationTabs isMine={userData.isMine} activeTab={activeTab} setActiveTab={setActiveTab} setIsCreatingCollection={setIsCreatingCollection} setIsCreatingPoem={setIsCreatingPoem} NavBorder={NavBorder} navBackground={navBackground} navColorCode={navColorCode} />
            {/* )} */}

            {/* Nội dung hiển thị theo Tab */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    padding: "30px 129px",
                    minHeight: "auto",

                }}
            >
                <div style={{
                    display: "flex",
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "center",
                    maxWidth: "1600px",
                    gap: "40px"
                }}>

                    <div style={{ flex: 8 }}>
                        {activeTab === "Tiểu sử" && (
                            <YourBio userData={userData} displayName={userData.displayName} isMine={userData.isMine} />
                        )}
                        {activeTab === "Thơ của bạn" && (
                            <YourPoem isCreatingPoem={isCreatingPoem} setIsCreatingPoem={setIsCreatingPoem} username={username} isMine={userData.isMine} displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitle={achievementTitleBackground} statisticTitle={statisticTitleBackground} />
                        )}
                        {activeTab === "Bản ghi âm" && (
                            <YourRecordFile username={username} isMine={userData.isMine} achievementBorder={achievementBorder} statisticBorder={statisticBorder} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitleBackground={achievementTitleBackground} statisticTitleBackground={statisticTitleBackground} />
                        )}
                        {activeTab === "Bộ sưu tập của bạn" && (
                            <YourCollection isCreatingCollection={isCreatingCollection} setIsCreatingCollection={setIsCreatingCollection} avatar={userData.avatar} isMine={userData.isMine} displayName={displayName} username={username} />
                        )}
                        {activeTab === "Bookmark của bạn" && (
                            <YourBookmark />
                        )}
                        {activeTab === "Bản nháp của bạn" && (
                            <YourDraft isCreatingPoem={isCreatingPoem} setIsCreatingPoem={setIsCreatingPoem} displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                        )}
                        {activeTab === "Lịch sử chỉnh sửa" && <p>Tất cả các thay đổi bạn đã thực hiện sẽ được hiển thị tại đây.</p>}
                        {activeTab === "Quản lý Bản Quyền" && (
                            <UsageRight/>
                        )}
                        {/* {activeTab === "Trang trí" &&
                        <YourDesign displayName={displayName} avatar={userData.avatar} achievementBorder={achievementBorder} statisticBorder={statisticBorder} setBackgroundImage={setBackgroundImage} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitleBackground={achievementTitleBackground} statisticTitleBackground={statisticTitleBackground} achievementTitleColor={achievementTitleColor} statisticTitleColor={statisticTitleColor} achievementBackgroundColor={achievementBackgroundColor} statisticBackgroundColor={statisticBackgroundColor} />} */}
                        {activeTab === "Quản lý ví" && (<YourWallet/>)}
                    </div>
                    {!isCreatingPoem && !isCreatingCollection &&
                        <div style={{ display: "flex", flex: 3 }}>
                            {/* Thành tựu cá nhân */}
                            <AchievementAndStatistic totalFollowings={userData.totalFollowings} totalFollowers={userData.totalFollowers} userStatistic={userData.userStatistic} achievements={userData.achievements} statisticBorder={statisticBorder} achievementBorder={achievementBorder} statisticBackground={statisticBackground} statisticBackgroundColorCode={statisticBackgroundColorCode} achievementBackgroundColorCode={achievementBackgroundColorCode} statisticTitleBackground={statisticTitleBackground} achievementBackground={achievementBackground} achievementTitleBackground={achievementTitleBackground} achievementTitleColorCode={achievementTitleColorCode} statisticTitleColorCode={statisticTitleColorCode} />
                        </div>
                    }
                </div>
            </div>


            {!isCreatingCollection && !isCreatingPoem && userData.isMine && (
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

            )}

            <Footer style={{ marginBottom: "0px" }} />
        </div>
    );
};

export default UserPage;
