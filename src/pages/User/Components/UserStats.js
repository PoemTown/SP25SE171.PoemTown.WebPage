import React, { useState,useEffect } from "react";
import { Settings } from "lucide-react";
import StatisticModal from "../Form/StatisticModal";
import AchievementModal from "../Form/AchievementModal";

const UserStats = ({ achievementBorder, statisticBorder, achievementBackground, statisticBackground, achievementTitleBackground, statisticTitleBackground, achievementTitleColor, statisticTitleColor, achievementBackgroundColor, statisticBackgroundColor}) => {
    const [showPopup1, setShowPopup1] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);
    const [tempAchievementBackground, setTempAchievementBackground] = useState(achievementBackground);
    const [tempAchievementBorder, setTempAchievementBorder] = useState(achievementBorder);
    const [tempAchievementBackgroundTitle, setTempAchievementBackgroundTitle] = useState(achievementTitleBackground);
    const [tempStatisticBackground, setTempStatisticBackground] = useState(statisticBackground);
    const [tempStatisticBorder, setTempStatisticBorder] = useState(statisticBorder);
    const [tempStatisticTitleBackground, setTempStatisticTitleBackground] = useState(statisticTitleBackground);
    const handleCloseModal = () => {
        setTempAchievementBackground(achievementBackground);
        setTempAchievementBorder(achievementBorder);
        setTempAchievementBackgroundTitle(achievementTitleBackground);
        setTempStatisticBackground(statisticBackground);
        setTempStatisticBorder(statisticBorder);
        setTempStatisticTitleBackground(statisticTitleBackground);
        setShowPopup1(false);
        setShowPopup2(false);
    };
    const [setNavThemeImages] = useState([]);
    const [setSelectedTheme] = useState(null);
    const accessToken = localStorage.getItem("accessToken");
    const fetchNavigationThemes = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=6",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };
    const fetchNavigationThemes2 = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=5",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };
    const fetchNavigationThemes3 = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=9",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };
    const fetchNavigationThemes4 = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=8",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };
    const fetchNavigationThemes5 = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=7",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };
    const fetchNavigationThemes6 = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=10",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };
    useEffect(() => {
        if (showPopup1) {
            fetchNavigationThemes();
            fetchNavigationThemes2();
            fetchNavigationThemes3();
            fetchNavigationThemes4();
            fetchNavigationThemes5();
            fetchNavigationThemes6();
        } else {
            setTempAchievementBackground(achievementBackground);
            setTempAchievementBorder(achievementBorder);
            setTempAchievementBackgroundTitle(achievementTitleBackground);
            setTempStatisticBackground(statisticBackground);
            setTempStatisticBorder(statisticBorder);
            setTempStatisticTitleBackground(statisticTitleBackground);
        }
    }, [showPopup1, setShowPopup2, achievementBackground, achievementBorder, achievementTitleBackground, statisticBackground, statisticBorder, statisticTitleBackground ]);
    return (
        <div>
            {/* Thành tựu cá nhân */}
            <div
                style={{
                    position: "relative",
                    backgroundImage: tempAchievementBackground ? `url(${tempAchievementBackground})` : "none",
                    padding: "15px",
                    borderRadius: "10px",
                    border: `2px solid ${tempAchievementBorder}`,
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                }}
            >
                <h3
                    style={{
                        fontWeight: "bold",
                        backgroundImage: tempAchievementBackgroundTitle ? `url(${tempAchievementBackgroundTitle})` : "none",
                        padding: "5px 10px",
                        borderRadius: "8px 8px 0 0",
                        margin: "-15px -15px 10px -15px",
                        textAlign: "center",
                        color: achievementTitleColor,
                    }}
                >
                    Thành tựu cá nhân
                </h3>
                <button
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setShowPopup1(true)}
                >
                    <Settings size={15} color="black" />
                </button>
                <ul style={{ fontSize: "14px", color: achievementBackgroundColor, listStyle: "none", padding: 0 }}>
                    <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                    <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                    <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                    <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                </ul>
                <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
                    Xem thêm &gt;
                </a>
            </div>

            {showPopup1 && <AchievementModal
                onClose={handleCloseModal}
                onChangeBackground={setTempAchievementBackground}
                onChangeBorder={setTempAchievementBorder}
                onChangeBackgroundTitle={setTempAchievementBackgroundTitle}
                achievementBorder={achievementBorder} statisticBorder={statisticBorder} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitleBackground={achievementTitleBackground} statisticTitleBackground={statisticTitleBackground} achievementTitleColor={achievementTitleColor} statisticTitleColor={statisticTitleColor}
            />}

            {/* Thống kê người dùng */}
            <div
                style={{
                    position: "relative",
                    backgroundImage: tempStatisticBackground ? `url(${tempStatisticBackground})` : "none",
                    padding: "15px",
                    borderRadius: "10px",
                    border: `2px solid ${tempStatisticBorder}`,
                    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    marginTop: "20px"
                }}
            >
                <h3
                    style={{
                        fontWeight: "bold",
                        backgroundImage: tempStatisticTitleBackground ? `url(${tempStatisticTitleBackground})` : "none",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "8px 8px 0 0",
                        margin: "-15px -15px 10px -15px",
                        textAlign: "center",
                        color: statisticTitleColor
                    }}
                >
                    Thống kê người dùng
                </h3>
                <button
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setShowPopup2(true)}
                >
                    <Settings size={15} color="black" />
                </button>
                <ul style={{ fontSize: "14px", color: statisticBackgroundColor, listStyle: "none", padding: 0 }}>
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
            {showPopup2 && <StatisticModal 
            onClose={handleCloseModal}
            onChangeBackground={setTempStatisticBackground}
            onChangeBorder={setTempStatisticBorder}
            onChangeBackgroundTitle={setTempStatisticTitleBackground}
            achievementBorder={achievementBorder} statisticBorder={statisticBorder} achievementBackground={achievementBackground} statisticBackground={statisticBackground} achievementTitleBackground={achievementTitleBackground} statisticTitleBackground={statisticTitleBackground} achievementTitleColor={achievementTitleColor} statisticTitleColor={statisticTitleColor} />}
        </div>
    );
};

export default UserStats;