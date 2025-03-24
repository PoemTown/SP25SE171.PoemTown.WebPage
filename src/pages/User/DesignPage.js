import { useEffect, useState } from "react";
import Headeruser from "../../components/Headeruser";
import { HiUsers } from "react-icons/hi2";
import { FaUserPlus } from "react-icons/fa6";
import { message } from "antd";
import UserCoverEditModal from "./Form/UserCoverEditModal";

const DesignPage = () => {
    const [userData, setUserData] = useState({
        displayName: "Anonymous",
        email: "",
        userName: "anonymous",
        avatar: "",
        totalFollowers: 0,
        totalFollowings: 0,
    });
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

    const [themes, setThemes] = useState([])
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);

    const [tempHeaderImage, setTempHeaderImage] = useState(null);

    const [showPopupModalHeader, setShowPopupModalHeader] = useState(false);

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
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/themes/v2/user", {
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
                    "https://api-poemtown-staging.nodfeather.win/api/users/v1/mine/profile/online",
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
            console.error("Access token không tồn tại");
            return;
        }

        try {
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/themes/v1/user", {
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

    const handleDeleteTemplate = async () => {
        if (!myInUseTemplate) {
            console.error("Không tìm thấy template để xóa");
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa bản mẫu "${myInUseTemplate.id}" không?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/themes/v1/user/${myInUseTemplate.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

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
    };

    const handleModalHeader = async () => {
        try {
            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=1",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
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
                            src={tempHeaderImage? tempHeaderImage : inUseHeader.image}
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
                                <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: inUseHeader.colorCode }}>{userData.displayName || "Annoymous"}</h2>
                                <p style={{ color: inUseHeader.colorCode, margin: "0", fontSize: "0.9em" }}>@{userData.userName || "Annoymous"}</p>
                            </div>
                            <div style={{ fontSize: "14px", color: inUseHeader.colorCode, display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                    <HiUsers color={inUseHeader.colorCode} /> <span style={{ color: inUseHeader.colorCode }}>{userData.totalFollowers} Người theo dõi</span>
                                </div>
                                <div style={{ color: inUseHeader.colorCode }}>•</div>
                                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                    <FaUserPlus color={inUseHeader.colorCode} /> <span style={{ color: inUseHeader.colorCode }}>{userData.totalFollowings} Đang theo dõi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/*Nav */}
            <div
                // onClick={showModalNavNav}
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
                onClick={() => alert("askjdl")}
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
                <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "row", margin: "0 auto", gap: "40px", width: "100%", maxWidth: "1200px", alignItems: "flex-start", }}>
                    {/* Left Column */}
                    <div style={{
                        flex: 7,
                        border: isHoverThemeEdit ? "1px solid #ddd" : "none",
                        backgroundColor: isHoverThemeEdit ? "#ffffff" : "#ffffff00",
                        padding: "20px"
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", }}>
                            <h3 style={{ fontWeight: "bold", marginTop: 0, }}>Bản mẫu của bạn</h3>
                            {/* Settings icon or modal trigger */}
                        </div>
                        <label>Tên</label>
                        <input
                            type="text"
                            value={myInUseTemplate ? myInUseTemplate.name : "Name of Template"}
                            readOnly
                            style={{ display: "block", margin: "10px 0", padding: "15px", width: "96%" }}
                        />
                        <div style={{ display: "flex", overflowX: "auto", gap: "10px", paddingBottom: "10px" }}>
                            {templates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleSelectTemplate(template.id, template.name)}
                                    style={{
                                        padding: "20px 40px",
                                        backgroundColor: template.name === myInUseTemplate?.name ? "#78cfcc" : " ",
                                        border: template.isInUse
                                            ? "2px solid blue"
                                            : template.name === myInUseTemplate?.name
                                                ? "2px solid blue"
                                                : "1px solid black",
                                        fontWeight: template.name === myInUseTemplate?.name ? "bold" : "normal",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {template.name}
                                </button>
                            ))}
                            <button
                                style={{
                                    padding: "10px 30px",
                                    border: "1px dashed black",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                +
                            </button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                            <button
                                onClick={handleDeleteTemplate}
                                style={{
                                    backgroundColor: "#d9534f",
                                    color: "white",
                                    padding: "10px 15px",
                                    borderRadius: "5px",
                                    marginTop: "10px",
                                    cursor: "pointer",
                                }}
                            >
                                XÓA
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ flex: 3 }}>
                        {/* Other content */}
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                border: `1px solid ${inUseAchievementBorder.colorCode}`,
                                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                onClick={() => alert("Title achievement")}
                                onMouseEnter={() => {
                                    setIsHoverAchievementTitle(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverAchievementTitle(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    padding: 0,
                                    margin: 0,
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    display: "block",
                                    width: "100%",
                                    opacity: isHoverAchievementTitle ? 0.5 : 1, // inline hover effect
                                }}
                            >
                                <div
                                    style={{
                                        background: inUseAchievementTitle.image ? `url("${inUseAchievementTitle.image}")` : "none",
                                        height: 53,
                                        borderRadius: "10px 10px 0 0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderBottom: `2px solid ${inUseAchievementBorder.colorCode}`,
                                        marginBottom: 0,
                                    }}
                                >
                                    <h3 style={{ fontWeight: "bold", margin: 0, textAlign: "center", color: inUseAchievementTitle.colorCode }}>
                                        Thành tựu cá nhân
                                    </h3>
                                </div>
                            </div>
                            <div
                                onClick={() => alert("Content achievement")}
                                onMouseEnter={() => {
                                    setIsHoverAchievementContent(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverAchievementContent(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    padding: 0,
                                    margin: 0,
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    display: "block",
                                    width: "100%",
                                    opacity: isHoverAchievementContent ? 0.5 : 1, // inline hover effect
                                }}
                            >
                                <div style={{ background: inUseAchievement.image ? `url("${inUseAchievement.image}")` : "none", padding: "10px 20px", borderRadius: "0 0 10px 10px" }}>
                                    <ul style={{ fontSize: "14px", color: inUseAchievement.colorCode, listStyle: "none", padding: 0, margin: 0 }}>
                                        <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                                        <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                                        <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                                        <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                                    </ul>
                                    <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
                                        Xem thêm &gt;
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Thống kê người dùng */}
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                border: `2px solid ${inUseStatisticBorder.colorCode}`,
                                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                                marginTop: "20px",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                onClick={() => alert("Title statistic")}
                                onMouseEnter={() => {
                                    setIsHoverStatisticTitle(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverStatisticTitle(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    padding: 0,
                                    margin: 0,
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    display: "block",
                                    width: "100%",
                                    opacity: isHoverStatisticTitle ? 0.5 : 1, // inline hover effect
                                }}
                            >
                                <div
                                    style={{
                                        background: inUseStatisticTitle.image ? `url("${inUseStatisticTitle.image}")` : "none",
                                        height: 53,
                                        borderRadius: "10px 10px 0 0",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderBottom: `2px solid ${inUseStatisticBorder.colorCode}`,
                                    }}
                                >
                                    <h3 style={{ fontWeight: "bold", color: inUseStatisticTitle.colorCode, margin: 0, textAlign: "center" }}>
                                        Thống kê người dùng
                                    </h3>
                                </div>
                            </div>
                            <div
                                onClick={() => alert("Content statistic")}
                                onMouseEnter={() => {
                                    setIsHoverStatisticContent(true);
                                    setIsHoverMainBackground(false)
                                }}
                                onMouseLeave={() => {
                                    setIsHoverStatisticContent(false);
                                    setIsHoverMainBackground(true)
                                }}
                                style={{
                                    padding: 0,
                                    margin: 0,
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    display: "block",
                                    width: "100%",
                                    opacity: isHoverStatisticContent ? 0.5 : 1, // inline hover effect
                                }}
                            >
                                <div style={{ background: inUseStatistic.image ? `url("${inUseStatistic.image}")` : "none", padding: "10px 20px", borderRadius: "0 0 10px 10px" }}>
                                    <ul style={{ fontSize: "14px", color: inUseStatistic.colorCode, listStyle: "none", padding: 0, margin: 0 }}>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showPopupModalHeader && (
                <UserCoverEditModal
                    themes={themes}
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    setTempCoverImage={setTempHeaderImage}
                    coverImage={inUseHeader}
                    closeModal={() => setShowPopupModalHeader(false)}
                />
            )}
        </div>
    )
}
export default DesignPage;