import { useEffect, useState } from "react";
import Headeruser from "../../components/Headeruser";
import { HiUsers } from "react-icons/hi2";
import { FaUserPlus } from "react-icons/fa6";
import { Button, ConfigProvider, message, Modal, Select, Space } from "antd";
import UserCoverEditModal from "./Form/UserCoverEditModal";
import NavigationEditModal from "./Components/NavigationEditModal";
import AchievementEditModal from "./Components/AchievementEditModal ";
import StatisticEditModal from "./Components/StatisticEditModal";
import AchievementTitleEditModal from "./Components/AchievementTitleEditModal";
import StatisticTitleEditModal from "./Components/StatisticTitleEditModal";
import MainBackgroundEditModal from "./Components/MainBackgroundEditModal";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router-dom";
import { DoubleRightOutlined } from "@ant-design/icons";

import { FaMedal, FaPenAlt, FaBook, FaHeadphones, FaHeart, FaUserFriends, FaBookmark } from "react-icons/fa";
import { GiInkSwirl, GiQuillInk } from "react-icons/gi";
const useStyle = createStyles(({ prefixCls, css }) => ({

    linearGradientButton: css`
      &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
        > span {
          position: relative;
        }
  
        &::before {
          content: '';
          background: linear-gradient(135deg,rgb(0, 201, 43),rgb(106, 255, 56));
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

const DesignPage = () => {
    const { styles } = useStyle();
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        displayName: "Anonymous",
        email: "",
        userName: "anonymous",
        avatar: "",
        totalFollowers: 0,
        totalFollowings: 0,
    });
    const [userTemplates, setUserTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [myInUseTemplate, setMyInUseTemplate] = useState(null);
    const [inUseHeader, setInUseHeader] = useState({});
    const [inUseNav, setInUseNav] = useState({});
    const [inUseNavBorder, setInUseNavBorder] = useState({});
    const [inUseMainBackground, setInUseMainBackground] = useState({});
    const [inUseAchievementBorder, setInUseAchievementBorder] = useState({});
    const [inUseAchievement, setInUseAchievement] = useState({});
    const [inUseStatisticBorder, setInUseStatisticBorder] = useState({});
    const [inUseStatistic, setInUseStatistic] = useState({});
    const [inUseAchievementTitle, setInUseAchievementTitle] = useState({});
    const [inUseStatisticTitle, setInUseStatisticTitle] = useState({});
    const [activeTab, setActiveTab] = useState("Thơ của bạn")
    const accessToken = localStorage.getItem("accessToken");
    const [isHoveredHeader, setIsHoveredHeader] = useState(false);
    const [isHoveredNav, setIsHoveredNav] = useState(false);
    const [isHoverMainBackground, setIsHoverMainBackground] = useState(false);
    const [isHoverAchievementTitle, setIsHoverAchievementTitle] = useState(false);
    const [isHoverAchievementContent, setIsHoverAchievementContent] = useState(false);
    const [isHoverStatisticTitle, setIsHoverStatisticTitle] = useState(false);
    const [isHoverStatisticContent, setIsHoverStatisticContent] = useState(false);
    const [isHoverThemeEdit, setIsHoverThemeEdit] = useState(false);
    const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    const [originalNav, setOriginalNav] = useState(inUseNav);
    const [originalNavBorder, setOriginalNavBorder] = useState(inUseNavBorder);
    const [originalMainBackground, setOriginalMainBackground] = useState(inUseMainBackground);
    const [originalAchievementTitle, setOriginalAchievementTitle] = useState(inUseAchievementTitle);
    const [originalAchievement, setOriginalAchievement] = useState(inUseAchievement);
    const [originalAchievementBorder, setOriginalAchievementBorder] = useState(inUseAchievementBorder);
    const [originalStatisticTitle, setOriginalStatisticTitle] = useState(inUseStatisticTitle);
    const [originalStatistic, setOriginalStatistic] = useState(inUseStatistic);
    const [originalStatisticBorder, setOriginalStatisticBorder] = useState(inUseStatisticBorder);

    const [themes, setThemes] = useState([])
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);

    const [tempHeaderImage, setTempHeaderImage] = useState(null);
    const [tempHeaderColorCode, setTempHeaderColorCode] = useState(inUseHeader.colorCode);

    const [showPopupModalHeader, setShowPopupModalHeader] = useState(false);
    const [showPopupModalNav, setShowPopupModalNav] = useState(false);
    const [showPopupModalMainBackground, setShowPopupModalMainBackground] = useState(false);
    const [showPopupModalAchievementTitle, setShowPopupModalAchievementTitle] = useState(false);
    const [showPopupModalAchievement, setShowPopupModalAchievement] = useState(false);
    const [showPopupModalStatisticTitle, setShowPopupModalStatisticTitle] = useState(false);
    const [showPopupModalStatistic, setShowPopupModalStatistic] = useState(false);


    const tabs = [
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
        "Bookmark của bạn",
        "Bản nháp của bạn",
        "Lịch sử chỉnh sửa",
        "Quản lý Quyền Sử Dụng",
        // "Trang trí",
        "Quản lý ví",
    ];

    useEffect(() => {
        fetchUserTemplates();
    }, [])

    const fetchUserTemplates = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Có lỗi. Xin hãy đăng nhập lại!");
            return;
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/template/v1/user-templates`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            console.log(data.data);

            if (data?.statusCode === 200) {
                setUserTemplates(data.data);
            }

        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

    const handleChangeSelectedTemplate = (value) => {
        setSelectedTemplate(value);
    };

    const handleApplyFullTemplate = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Có lỗi. Xin hãy đăng nhập lại!");
            return;
        }

        console.log(selectedTemplate);
        console.log(myInUseTemplate.id)

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/template/v1/user-templates/theme`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userTemplateId: selectedTemplate,
                    themeId: myInUseTemplate.id,
                }),
            });

            const data = await response.json();
            if (data?.statusCode === 202) {
                message.success("Cập nhật thành công");
                window.location.reload();
            } else {
                console.error("Lỗi từ API:", data);
                message.error("Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            message.error("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    }

    useEffect(() => {
        fetchTemplates();
    }, [])

    const fetchTemplates = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("Access token không tồn tại");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/themes/v2/user`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (data?.statusCode === 200 && Array.isArray(data.data)) {
                // Find the theme with isInUse === true
                const inUseTheme = data.data.find(theme => theme.isInUse === true);
                setTemplates(data.data);
                if (inUseTheme) {
                    setMyInUseTemplate(inUseTheme);
                    const details = inUseTheme.userTemplateDetails || [];
                    // Find the detail with isInUse true for each type (1 to 10)
                    const header = details.find(detail => detail.type === 1 && detail.isInUse === true);
                    const nav = details.find(detail => detail.type === 2 && detail.isInUse === true);
                    const navBorder = details.find(detail => detail.type === 3 && detail.isInUse === true);
                    const mainBackground = details.find(detail => detail.type === 4 && detail.isInUse === true);
                    const achievementBorder = details.find(detail => detail.type === 5 && detail.isInUse === true);
                    const achievement = details.find(detail => detail.type === 6 && detail.isInUse === true);
                    const statisticBorder = details.find(detail => detail.type === 7 && detail.isInUse === true);
                    const statistic = details.find(detail => detail.type === 8 && detail.isInUse === true);
                    const achievementTitle = details.find(detail => detail.type === 9 && detail.isInUse === true);
                    const statisticTitle = details.find(detail => detail.type === 10 && detail.isInUse === true);
                    console.log(mainBackground)
                    // Set the state variables
                    setInUseHeader(header || {});
                    setInUseNav(nav || {});
                    setInUseNavBorder(navBorder || {});
                    setInUseMainBackground(mainBackground || {});
                    setInUseAchievementBorder(achievementBorder || {});
                    setInUseAchievement(achievement || {});
                    setInUseStatisticBorder(statisticBorder || {});
                    setInUseStatistic(statistic || {});
                    setInUseAchievementTitle(achievementTitle || {});
                    setInUseStatisticTitle(statisticTitle || {});
                }
            }

        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/users/v1/mine/profile/online`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
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
                } else {
                    console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchUserProfile();
    }, []);

    const handleSelectTemplate = async (id, name) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Có lỗi. Xin hãy đăng nhập lại!");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/themes/v1/user`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    name: name,
                    isInUse: true,
                }),
            });

            const data = await response.json();
            if (data?.statusCode === 200) {
                message.success("Cập nhật thành công");
                window.location.reload();
            } else {
                console.error("Lỗi từ API:", data);
                message.error("Cập nhật thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            message.error("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    const handleAddTemplate = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Có lỗi. Xin hãy đăng nhập lại!");
            return;
        }

        if (!newTemplateName.trim()) {
            message.error("Vui lòng nhập tên bản mẫu!");
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/themes/v1/user`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newTemplateName,
                    isInUse: false,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                message.success("Tạo bản mẫu thành công!");
                setShowAddTemplateModal(false);
                setNewTemplateName("");
                window.location.reload();
            } else {
                console.error("Lỗi từ API:", data);
                message.error("Tạo bản mẫu thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            message.error("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    const handleDeleteTemplate = async () => {
        if (!myInUseTemplate) {
            console.error("Không tìm thấy template để xóa");
            return;
        }

        Modal.confirm({
            title: `Bạn có chắc muốn xóa bản mẫu "${myInUseTemplate.name}" không?`,
            okText: "Xóa",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_BASE_URL}/themes/v1/user/${myInUseTemplate.id}`,
                        {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    const data = await response.json();
                    if (response.ok) {
                        message.success("Xóa bản mẫu thành công!");
                        window.location.reload();
                    } else {
                        console.error("Lỗi từ API:", data);
                        message.error("Xóa bản mẫu thất bại!");
                    }
                } catch (error) {
                    console.error("Lỗi khi gọi API:", error);
                    message.error("Đã xảy ra lỗi, vui lòng thử lại!");
                }
            },
        });
    };

    const handleModalHeader = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=1`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
            }

            const data = await response.json();
            const activeThemes = data.data.filter((theme) => theme.isInUse);
            console.log("haha", activeThemes)
            setThemes(activeThemes);
            const activeTemplate = activeThemes
                .flatMap((theme) => theme.userTemplateDetails)
                .find((detail) => detail.isInUse);
            console.log("hehe", activeTemplate)
            if (activeTemplate) {
                setSelectedTemplateId(activeTemplate.id);
                setTempHeaderImage(activeTemplate.image || inUseHeader.image);
                setTempHeaderColorCode(activeTemplate.colorCode || inUseHeader.color);
            }
        } catch (error) {
            console.error("Error fetching themes:", error);
        }
        setShowPopupModalHeader(true);
    }

    return (
        <div>
            <Headeruser />
            {/* Header */}
            <div
                onClick={handleModalHeader}
                onMouseEnter={() => setIsHoveredHeader(true)}
                onMouseLeave={() => setIsHoveredHeader(false)}
                style={{
                    padding: 0,
                    margin: 0,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    opacity: isHoveredHeader ? 0.5 : 1, // inline hover effect
                }}
            >
                <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
                    {inUseHeader && (
                        <img
                            src={tempHeaderImage ? tempHeaderImage : inUseHeader.image}
                            alt="Cover"
                            style={{
                                width: "100%",
                                display: "block" // removes extra bottom spacing
                            }}
                        />
                    )}
                    {/* Overlay content */}
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        padding: "1em 6em",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center"
                    }}>
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
                        <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0px", alignItems: "flex-start" }}>
                                <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode }}>{userData.displayName || "Annoymous"}</h2>
                                <p style={{ color: tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode, margin: "0", fontSize: "0.9em" }}>@{userData.userName || "Annoymous"}</p>
                            </div>
                            <div style={{ fontSize: "14px", color: tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode, display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                    <HiUsers color={tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode} /> <span style={{ color: tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode }}>{userData.totalFollowers} Người theo dõi</span>
                                </div>
                                <div style={{ color: tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode }}>•</div>
                                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                    <FaUserPlus color={tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode} /> <span style={{ color: tempHeaderColorCode ? tempHeaderColorCode : inUseHeader.colorCode }}>{userData.totalFollowings} Đang theo dõi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Nav */}
            <div
                onClick={() => {
                    setOriginalNav(inUseNav);
                    setOriginalNavBorder(inUseNavBorder);
                    setShowPopupModalNav(true);
                }}
                onMouseEnter={() => setIsHoveredNav(true)}
                onMouseLeave={() => setIsHoveredNav(false)}
                style={{
                    padding: 0,
                    margin: 0,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    opacity: isHoveredNav ? 0.5 : 1, // inline hover effect
                }}
            >
                <nav
                    style={{
                        marginTop: "0px",
                        backgroundImage: inUseNav.image ? `url("${inUseNav.image}")` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        padding: "10px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        border: `3px solid ${inUseNavBorder.colorCode}`,
                        position: "relative",
                    }}
                >
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            style={{
                                padding: "10px 15px",
                                fontSize: "14px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                fontWeight: tab === 'Thơ của bạn' ? "bold" : "normal",
                                color: tab === 'Thơ của bạn' ? "#007bff" : inUseNav.colorCode,
                                borderBottom: tab === 'Thơ của bạn' ? "2px solid #007bff" : "none",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            {/* content */}
            <div
                style={{
                    position: "relative",
                    backgroundImage: inUseMainBackground ? `url("${inUseMainBackground.image}")` : "none", // Replace with your image source
                    padding: "20px",
                    minHeight: "650px",
                    gap: "40px",
                    display: "flex"
                }}
                onMouseEnter={() => setIsHoverMainBackground(true)}
                onMouseLeave={() => setIsHoverMainBackground(false)}
                onClick={() => {
                    setShowPopupModalMainBackground(true);
                    setOriginalMainBackground(inUseMainBackground);
                }}
            >
                {/* Background element */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: isHoverMainBackground ? 0.5 : 1,
                        backgroundColor: isHoverMainBackground ? "#00000030" : "transparent",
                        backgroundBlendMode: isHoverMainBackground ? "multiply" : "normal",
                        zIndex: 1,
                        transition: "opacity 0.3s ease"
                    }}
                />

                {/* Content container (not affected by background opacity) */}
                <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "row", margin: "0 auto", gap: "40px", width: "100%", maxWidth: "1400px", alignItems: "flex-start", }}>
                    {/* Left Column */}
                    <div style={{
                        flex: 7,
                        border: "2px solid #e0d8c5",
                        backgroundColor: "#f9f7f1",
                        padding: "24px",
                        borderRadius: "16px",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                        onMouseEnter={() => {
                            setIsHoverThemeEdit(true);
                            setIsHoverMainBackground(false);
                        }}
                        onMouseLeave={() => {
                            setIsHoverThemeEdit(false);
                            setIsHoverMainBackground(true);
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            {/* Header */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "24px",
                                borderBottom: "2px solid #d4c9b1",
                                paddingBottom: "16px"
                            }}>
                                <h3 style={{
                                    fontWeight: 600,
                                    margin: 0,
                                    fontSize: "1.75rem",
                                    fontFamily: "'Crimson Pro', serif",
                                    color: "#5d4737",
                                    letterSpacing: "0.05em"
                                }}>
                                    📜 Bản Mẫu Thơ
                                </h3>
                            </div>

                            {/* Template Name Input */}
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    color: "#7a6856",
                                    fontSize: "0.95rem",
                                    fontStyle: "italic"
                                }}>
                                    Tên bản mẫu
                                </label>
                                <input
                                    type="text"
                                    value={myInUseTemplate?.name || "Chưa đặt tên..."}
                                    readOnly
                                    style={{
                                        width: "100%",
                                        padding: "12px 16px",
                                        borderRadius: "8px",
                                        border: "1px solid #d4c9b1",
                                        backgroundColor: "#fffefc",
                                        fontFamily: "'Playfair Display', serif",
                                        fontSize: "1.1rem",
                                        color: "#5d4737",
                                        letterSpacing: "0.02em"
                                    }}
                                />
                            </div>

                            {/* Template Selection */}
                            <div style={{
                                display: "flex",
                                gap: "12px",
                                overflowX: "auto",
                                paddingBottom: "16px",
                                marginBottom: "24px",
                                scrollbarWidth: 'thin',
                                scrollbarColor: "#a3917f #f9f7f1"
                            }}>
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template.id, template.name)}
                                        style={{
                                            flexShrink: 0,
                                            padding: "16px 32px",
                                            backgroundColor: template.name === myInUseTemplate?.name ? "#e8e0d1" : "transparent",
                                            border: `2px solid ${template.name === myInUseTemplate?.name ? "#9b8774" : "#d4c9b1"}`,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            transition: "all 0.3s ease",
                                            color: "#5d4737",
                                            fontWeight: 500,
                                            fontFamily: "'Crimson Pro', serif",
                                            ":hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                                            }
                                        }}
                                    >
                                        {template.name}
                                    </button>
                                ))}

                                {/* Add Template Button */}
                                <button
                                    style={{
                                        flexShrink: 0,
                                        padding: "16px",
                                        border: "2px dashed #d4c9b1",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        background: "transparent",
                                        color: "#7a6856",
                                        transition: "all 0.3s ease",
                                        ":hover": {
                                            borderColor: "#9b8774",
                                            color: "#5d4737",
                                            transform: "scale(1.05)"
                                        }
                                    }}
                                    onClick={() => setShowAddTemplateModal(true)}
                                >
                                    <span style={{ fontSize: "1.5rem", fontFamily: "'Playfair Display', serif" }}>+ Thêm Mới</span>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                marginTop: "24px",
                                borderTop: "2px solid #d4c9b1",
                                paddingTop: "24px"
                            }}>
                                <button
                                    onClick={handleDeleteTemplate}
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#f5e6e5",
                                        color: "#a44a4a",
                                        border: "1px solid #e0c0bf",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        fontFamily: "'Crimson Pro', serif",
                                        ":hover": {
                                            backgroundColor: "#f0d4d3"
                                        }
                                    }}
                                >
                                    🍂 Xóa Bản Mẫu
                                </button>
                            </div>

                            {/* Template Application Section */}
                            <div style={{ marginTop: "32px" }}>
                                <h4 style={{
                                    marginBottom: "16px",
                                    color: "#7a6856",
                                    fontFamily: "'Crimson Pro', serif",
                                    fontSize: "1.25rem"
                                }}>
                                    🖌️ Áp Dụng Mẫu
                                </h4>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <Select
                                        value={selectedTemplate}
                                        onChange={handleChangeSelectedTemplate}
                                        style={{
                                            width: "100%",
                                            border: "2px solid #d4c9b1",
                                            borderRadius: "6px",
                                            backgroundColor: "#fffefc",
                                            fontFamily: "'Crimson Pro', serif",
                                            color: "#5d4737",
                                        }}
                                        dropdownStyle={{
                                            backgroundColor: "#fffefc",
                                            border: "1px solid #d4c9b1",
                                            borderRadius: "6px",
                                            boxShadow: "0 4px 12px rgba(94, 71, 55, 0.12)"
                                        }}
                                        suffixIcon={
                                            <svg
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="#5d4737"
                                                style={{ transition: "transform 0.3s" }}
                                            >
                                                <path d="M7 10l5 5 5-5z" />
                                            </svg>
                                        }
                                        placeholder="Chọn mẫu thơ..."
                                        optionFilterProp="children"
                                        options={userTemplates.map(template => ({
                                            value: template.id,
                                            label: (
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "8px 0",
                                                    color: "#5d4737"
                                                }}>
                                                    <span style={{ fontSize: "1.2rem" }}>📜</span>
                                                    <span>{template.templateName}</span>
                                                    <span style={{
                                                        fontSize: "0.85em",
                                                        color: "#7a6856",
                                                        marginLeft: "auto"
                                                    }}>
                                                        {template.tagName}
                                                    </span>
                                                </div>
                                            )
                                        }))}
                                    />


                                    <Button color="green" variant="solid" onClick={handleApplyFullTemplate} style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#e8e0d1",
                                        color: "#5d4737",
                                        border: "2px solid #d4c9b1",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        fontFamily: "'Crimson Pro', serif",
                                        ":hover": {
                                            backgroundColor: "#dcd3c4",
                                            transform: "translateY(-1px)"
                                        }
                                    }}>Áp dụng</Button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right Column */}
                    {/* Right Column */}
                    <div style={{
                        flex: 3,
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px"
                    }}>
                        {/* Achievement Section */}
                        <div
                            style={{
                                // borderRadius: "16px",
                                // overflow: "hidden",
                                // boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                // border: `1px solid ${inUseAchievementBorder.colorCode || "rgba(255, 215, 0, 0.3)"}`,
                                // backgroundColor: "#fff",

                                borderRadius: "20px",
                                border: `1px solid ${inUseAchievementBorder.colorCode || "rgba(255, 215, 0, 0.3)"}`,
                                backgroundColor: "#fff",

                                // background: achievementBackground || "linear-gradient(145deg, rgba(255, 251, 240, 0.95), rgba(255, 245, 230, 0.95))",
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
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Achievement Title */}
                            <div
                                onClick={() => {
                                    setShowPopupModalAchievementTitle(true);
                                    setOriginalAchievementTitle(inUseAchievementTitle);
                                }}
                                onMouseEnter={() => {
                                    setIsHoverAchievementTitle(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverAchievementTitle(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    backgroundImage: inUseAchievementTitle.image ? `url("${inUseAchievementTitle.image}")` : "linear-gradient(145deg, #FFD700, #FFC107)",
                                    // padding: "16px",
                                    // display: "flex",
                                    // alignItems: "center",
                                    // justifyContent: "center",
                                    // position: "relative",
                                    cursor: "pointer",
                                    opacity: isHoverAchievementTitle ? 0.8 : 1,
                                    transition: "opacity 0.2s ease",

                                    padding: "20px 24px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    position: "relative",
                                    overflow: "hidden"
                                }}
                            >
                                <div style={{
                                    position: "absolute",
                                    top: -20,
                                    right: -20,
                                    opacity: 0.08,
                                    transform: "rotate(-15deg)",
                                    fontSize: "80px",
                                    color: inUseAchievementTitle.colorCode || "#FFF"
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
                                        color: inUseAchievementTitle.colorCode || "#FFF",
                                        fontSize: "20px",
                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                    }} />
                                </div>

                                {/* Title with subtle underline */}
                                <h3 style={{
                                    margin: 0,
                                    color: inUseAchievementTitle.colorCode || "#FFF",
                                    fontSize: "18px",
                                    fontWeight: 700,
                                    letterSpacing: "0.3px",
                                    textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                    position: "relative",
                                    paddingBottom: "6px"
                                }}>
                                    Thành tựu thi nhân
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

                            {/* Achievement Content */}
                            <div
                                onClick={() => {
                                    setOriginalAchievement(inUseAchievement);
                                    setOriginalAchievementBorder(inUseAchievementBorder);
                                    setShowPopupModalAchievement(true)
                                }}
                                onMouseEnter={() => {
                                    setIsHoverAchievementContent(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverAchievementContent(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    backgroundImage: inUseAchievement.image ? `url("${inUseAchievement.image}")` : "linear-gradient(145deg, rgba(255,251,240,0.95), rgba(255,245,230,0.95))",
                                    cursor: "pointer",
                                    opacity: isHoverAchievementContent ? 0.8 : 1,
                                    transition: "opacity 0.2s ease",
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
                                    {[
                                        { id: 1, name: "Top 1 Bài thơ" },
                                        { id: 2, name: "Top 2 Nhà thơ" },
                                        { id: 3, name: "Top 3 Bài thơ" },
                                        { id: 4, name: "Top 4 Nhà thơ" },
                                    ].map((item, index) => (
                                        <ElegantAchievementItem
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            color={inUseAchievement.colorCode}
                                            // borderColor={achievementBorder}
                                        />

                                        // <div key={index} style={{
                                        //     display: "flex",
                                        //     alignItems: "center",
                                        //     gap: "10px",
                                        //     padding: "10px",
                                        //     backgroundColor: "rgba(255,255,255,0.7)",
                                        //     borderRadius: "8px",
                                        //     boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                                        // }}>
                                        //     <span style={{ fontSize: "18px" }}>{item.split(" ")[0]}</span>
                                        //     <span style={{
                                        //         fontSize: "14px",
                                        //         color: inUseAchievement.colorCode || "#5D4037"
                                        //     }}>
                                        //         {item.split(" ").slice(1).join(" ")}
                                        //     </span>
                                        // </div>
                                    ))}
                                </div>
                                {/* <a href="#" style={{
                                    display: "inline-block",
                                    marginTop: "16px",
                                    color: inUseAchievement.colorCode || "#7E57C2",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    transition: "all 0.2s ease",
                                    ":hover": {
                                        textDecoration: "underline"
                                    }
                                }}>
                                    Xem thêm thành tựu →
                                </a> */}



                            </div>
                        </div>

                        {/* Statistics Section */}
                        <div
                            style={{

                                borderRadius: "20px",
                                // border: `1px solid ${statisticBorder || "rgba(126, 87, 194, 0.1)"}`,
                                // background: statisticBackground || "linear-gradient(145deg, rgba(248, 245, 255, 0.95), rgba(238, 230, 255, 0.95))",
                                boxShadow: "0 12px 30px rgba(126, 87, 194, 0.08)",
                                position: "relative",
                                overflow: "hidden",
                                backdropFilter: "blur(8px)",
                                zIndex: 1,
                                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                ":hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 15px 35px rgba(126, 87, 194, 0.12)"
                                },
                                // borderRadius: "16px",
                                // overflow: "hidden",
                                // boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                border: `1px solid ${inUseStatisticBorder.colorCode || "rgba(126, 87, 194, 0.2)"}`,
                                backgroundColor: "#fff",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Statistics Title */}
                            <div
                                onClick={() => {
                                    setShowPopupModalStatisticTitle(true);
                                    setOriginalStatisticTitle(inUseStatisticTitle);
                                }}
                                onMouseEnter={() => {
                                    setIsHoverStatisticTitle(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverStatisticTitle(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    backgroundImage: inUseStatisticTitle.image ? `url("${inUseStatisticTitle.image}")` : "linear-gradient(145deg, #7E57C2, #673AB7)",
                                    padding: "20px 24px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    position: "relative",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    opacity: isHoverStatisticTitle ? 0.8 : 1,
                                    transition: "opacity 0.2s ease",
                                }}
                            >
                                {/* Decorative swirl */}
                                <div style={{
                                    position: "absolute",
                                    top: -20,
                                    right: -20,
                                    opacity: 0.08,
                                    transform: "rotate(15deg)",
                                    fontSize: "80px",
                                    color: inUseStatisticTitle.colorCode || "#FFF"
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
                                        color: inUseStatisticTitle.colorCode || "#FFF",
                                        fontSize: "18px",
                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                    }} />
                                </div>

                                {/* Title with subtle underline */}
                                <h3 style={{
                                    margin: 0,
                                    color: inUseStatisticTitle.colorCode || "#FFF",
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

                            {/* Statistics Content */}
                            <div
                                onClick={() => {
                                    setShowPopupModalStatistic(true);
                                    setOriginalStatistic(inUseStatistic);
                                    setOriginalStatisticBorder(inUseStatisticBorder);
                                }}
                                onMouseEnter={() => {
                                    setIsHoverStatisticContent(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverStatisticContent(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    backgroundImage: inUseStatistic.image ? `url("${inUseStatistic.image}")` : "linear-gradient(145deg, rgba(248, 245, 255, 0.95), rgba(238, 230, 255, 0.95))",
                                    padding: "22px 18px",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    position: "relative",
                                    cursor: "pointer",
                                    opacity: isHoverStatisticContent ? 0.8 : 1,
                                    transition: "opacity 0.2s ease"
                                }}
                            >

                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                    gap: "16px",
                                    color: inUseStatistic.colorCode || "#5E35B1",
                                    position: "relative",
                                    zIndex: 1
                                }}>
                                    <ElegantStatItem
                                        icon={<FaBook style={{ fontSize: "20px" }} />}
                                        label="Bài thơ"
                                        value={0}
                                        color={inUseStatistic.colorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaBookmark style={{ fontSize: "20px" }} />}
                                        label="Bộ sưu tập"
                                        value={0}
                                        color={inUseStatistic.colorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaHeadphones style={{ fontSize: "20px" }} />}
                                        label="Bản ghi âm"
                                        value={0}
                                        color={inUseStatistic.colorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaHeart style={{ fontSize: "20px", color: "#FF5252" }} />}
                                        label="Lượt thích"
                                        value={0}
                                        color={inUseStatistic.colorCode}
                                        accentColor="#FF5252"
                                    />
                                    <ElegantStatItem
                                        icon={<FaUserFriends style={{ fontSize: "20px" }} />}
                                        label="Đang theo dõi"
                                        value={0}
                                        color={inUseStatistic.colorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaUserFriends style={{ transform: "scaleX(-1)", fontSize: "20px" }} />}
                                        label="Lượt theo dõi"
                                        value={0}
                                        color={inUseStatistic.colorCode}
                                        accentColor="#7E57C2"
                                    />
                                </div>


                                {/* <div style={{
                                    backgroundImage: inUseStatistic.image ? `url("${inUseStatistic.image}")` : "none",
                                    padding: "10px 20px",
                                    borderRadius: "0 0 10px 10px"
                                }}>
                                    <ul style={{
                                        fontSize: "14px",
                                        color: inUseStatistic.colorCode,
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0
                                    }}>
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
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                showPopupModalHeader && (
                    <UserCoverEditModal
                        themes={themes}
                        selectedTemplateId={selectedTemplateId}
                        setSelectedTemplateId={setSelectedTemplateId}
                        setTempCoverImage={setTempHeaderImage}
                        setTempCoverColorCode={setTempHeaderColorCode}
                        coverImage={inUseHeader}  // original in-use cover/header
                        closeModal={() => setShowPopupModalHeader(false)}
                    />
                )
            }
            <NavigationEditModal
                show={showPopupModalNav}
                onClose={() => setShowPopupModalNav(false)}
                inUseNav={originalNav}
                inUseNavBorder={originalNavBorder}
                setTempNavBackground={(temp) =>
                    setInUseNav((prev) => ({ ...prev, image: temp.image, colorCode: temp.colorCode }))
                }
                setTempNavBorder={(color) =>
                    setInUseNavBorder((prev) => ({ ...prev, colorCode: color }))
                }
            />
            <MainBackgroundEditModal
                show={showPopupModalMainBackground}
                onClose={() => setShowPopupModalMainBackground(false)}
                inUseMainBackground={originalMainBackground} // object for type=4
                setTempMainBackground={(temp) =>
                    setInUseMainBackground((prev) => ({ ...prev, image: temp.image, colorCode: temp.colorCode }))
                }
            />

            <AchievementTitleEditModal
                show={showPopupModalAchievementTitle}
                onClose={() => setShowPopupModalAchievementTitle(false)}
                inUseAchievementTitle={originalAchievementTitle} // object for type=9
                setTempAchievementTitle={(temp) =>
                    setInUseAchievementTitle((prev) => ({ ...prev, image: temp.image, colorCode: temp.colorCode }))
                }
            />
            <AchievementEditModal
                show={showPopupModalAchievement}
                onClose={() => setShowPopupModalAchievement(false)}
                inUseAchievement={originalAchievement} // object for type=6
                inUseAchievementBorder={originalAchievementBorder} // object for type=5
                // optional to preview changes:
                setTempAchievement={(temp) => setInUseAchievement((prev) => ({ ...prev, image: temp.image, colorCode: temp.colorCode }))}
                setTempAchievementBorder={(color) => setInUseAchievementBorder((prev) => ({ ...prev, colorCode: color }))}
            />
            <StatisticTitleEditModal
                show={showPopupModalStatisticTitle}
                onClose={() => setShowPopupModalStatisticTitle(false)}
                inUseStatisticTitle={originalStatisticTitle}  // object for type=10
                setTempStatisticTitle={(temp) =>
                    setInUseStatisticTitle((prev) => ({ ...prev, image: temp.image, colorCode: temp.colorCode }))
                }
            />
            <StatisticEditModal
                show={showPopupModalStatistic}
                onClose={() => setShowPopupModalStatistic(false)}
                inUseStatistic={originalStatistic}            // object for type=8
                inUseStatisticBorder={originalStatisticBorder}  // object for type=7
                setTempStatistic={(temp) =>
                    setInUseStatistic((prev) => ({ ...prev, image: temp.image, colorCode: temp.colorCode }))
                }
                setTempStatisticBorder={(color) =>
                    setInUseStatisticBorder((prev) => ({ ...prev, colorCode: color }))
                }
            />
            <ConfigProvider
                button={{
                    className: styles.linearGradientButton,
                }}
            >
                <Space style={{ position: "fixed", right: 0, bottom: 60, zIndex: 3, padding: "30px", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }}>
                    <Button type="primary" size="large" iconPosition="end" icon={<DoubleRightOutlined />} style={{ position: "fixed", right: 0, bottom: 60, padding: "30px", borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px", borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }} onClick={() => { navigate(`/user/${localStorage.getItem("username")}`) }}>
                        Về trang của bạn
                    </Button>
                </Space>
            </ConfigProvider>
            {
                showAddTemplateModal && (
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            backgroundColor: "white",
                            transform: "translate(-50%, -50%)",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                            zIndex: 1000,
                            width: "300px"
                        }}
                    >
                        <h3>Tạo bản mẫu mới</h3>
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Nhập tên bản mẫu"
                            style={{ display: "block", padding: "10px", width: "250px", margin: "0 auto 10px auto", }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button onClick={() => setShowAddTemplateModal(false)} style={{ padding: "10px", borderRadius: "5px" }}>
                                Hủy
                            </button>
                            <button onClick={handleAddTemplate} style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#6aad5e", color: "white" }}>
                                Lưu
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    )
}



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
                background: `linear-gradient(135deg, ${rankColors[index] || rankColors[3]}, ${rankColors[index + 1] || "#9C27B0"})`,
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
                {medalIcons[item.rank - 1] || medalIcons[3]}
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

export default DesignPage;

