import React, { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";
import NavigationModal from "../Form/NavigationModal";

const NavigationTabsEdit = ({ activeTab, setActiveTab, NavBorder, navBackground, setNavBackground }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [step, setStep] = useState(1);
    const [navThemes, setNavThemes] = useState([]);
    const [navThemeImages, setNavThemeImages] = useState([]);
    const [navThemeColors, setNavThemeColors] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [tempNavBackground, setTempNavBackground] = useState(navBackground);
    const [tempNavBorder, setTempNavBorder] = useState(NavBorder);
    const [navTextColor, setNavTextColor] = useState("#555");
    const accessToken = localStorage.getItem("accessToken");
    const tabs = [
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
        "Bookmark của bạn",
        "Bản nháp của bạn",
        "Lịch sử chỉnh sửa",
        "Quản lý Bản Quyền",
        "Trang trí",
        "Quản lý ví",
    ];
    const fetchNavigationThemes = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=2",
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
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=3",
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

            const availableColors = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeColors([...availableColors]);

            const activeTemplate = availableColors.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
                setNavTextColor(activeTemplate.colorCode || "#555"); 
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };

    useEffect(() => {
        if (showPopup) {
            fetchNavigationThemes();
            fetchNavigationThemes2();
        } else {
            setTempNavBackground(navBackground);
            setTempNavBorder(NavBorder)
        }
    }, [showPopup, navBackground, NavBorder]);

    const handleUpdateSuccess = () => {
        setShowPopup(false);
        window.location.reload();
    };

    return (
        <div style={{ position: "relative" }}>
            <nav
                style={{
                    marginTop: "0px",
                    backgroundImage: tempNavBackground ? `url(${tempNavBackground})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    padding: "10px",
                    borderRadius: "10px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    border: `3px solid ${tempNavBorder}`,
                    position: "relative",
                }}
            >
                {tabs.map((tab, index) => (
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
                            color: activeTab === tab ? "#007bff" : navTextColor,
                            borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            <button
                style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                }}
                onClick={() => setShowPopup(true)}
            >
                <Settings size={20} color="black" />
            </button>
            <NavigationModal
                showPopup={showPopup}
                setShowPopup={setShowPopup}
                step={step}
                setStep={setStep}
                navThemeImages={navThemeImages}
                navThemeColors={navThemeColors}
                selectedTheme={selectedTheme}
                setSelectedTheme={setSelectedTheme}
                setTempNavBackground={setTempNavBackground}
                setTempNavBorder={setTempNavBorder}
                setNavBackground={setNavBackground}
                onUpdateSuccess={handleUpdateSuccess}
            />

        </div>
    );
};

export default NavigationTabsEdit;