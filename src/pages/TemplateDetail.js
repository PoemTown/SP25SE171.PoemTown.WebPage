import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";
import { Button, message, Modal } from "antd";
import { HiUsers } from "react-icons/hi2";
import { FaBook, FaBookmark, FaCheck, FaHeadphones, FaHeart, FaMedal, FaPenAlt, FaUserFriends, FaUserPlus } from "react-icons/fa";
import { GiInkSwirl, GiQuillInk } from "react-icons/gi";

const TemplateDetail = () => {
    const { masterTemplateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("Thơ của bạn");
    const [hover, setHover] = useState(false);
    const [hoverBuy, setHoverBuy] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isBought, setIsBought] = useState(false);
    const location = useLocation();
    const { price } = location.state || {};

    // For header (type 1)
    const [headerbackground, setHeaderBackground] = useState(null);
    const [headerColorCode, setHeaderColorCode] = useState("#000");
    // Type 2: navBackground (image) and navColorCode (color)
    const [navBackground, setNavBackground] = useState(null);
    const [navColorCode, setNavColorCode] = useState("#000");
    // Type 3: navBorder (color), type 3 doesn't have an image
    const [navBorder, setNavBorder] = useState(null);
    // Type 4: mainBackground
    const [mainBackground, setMainBackground] = useState(null);

    // Type 5: AchievementBorder (color code only)
    const [achievementBorder, setAchievementBorder] = useState(null);
    // Type 6: AchievementBackground (image) and AchievementColorCode (color)
    const [achievementBackground, setAchievementBackground] = useState(null);
    const [achievementColorCode, setAchievementColorCode] = useState("#000");
    // Type 9: Achievement Title Background (image) and Achievement Title Color Code (color)
    const [achievementTitleBackground, setAchievementTitleBackground] = useState(null);
    const [achievementTitleColorCode, setAchievementTitleColorCode] = useState("#000");

    // Type 7: StatisticBorder (color code only)
    const [statisticBorder, setStatisticBorder] = useState(null);
    // Type 8: StatisticBackground (image) and StatisticColorCode (color)
    const [statisticBackground, setStatisticBackground] = useState(null);
    const [statisticColorCode, setStatisticColorCode] = useState("#000");
    // Type 10: Statistic Title Background (image) and Statistic Title Color Code (color)
    const [statisticTitleBackground, setStatisticTitleBackground] = useState(null);
    const [statisticTitleColorCode, setStatisticTitleColorCode] = useState("#000");

    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const tabs = [
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
        "Bản ghi âm",
        "Bookmark của bạn",
        "Bản nháp của bạn",
        "Lịch sử chỉnh sửa",
        "Quản lý Quyền Sử Dụng",
        "Quản lý ví",
        "Đóng góp",
    ];

    const achievements = [
        {
            id: "153",
            name: "Top 1 Bài thơ tháng 4/2025",
            rank: 1
        },
        {
            id: "1522",
            name: "Top 2 Nhà thơ tháng 3/2025",
            rank: 2
        },
        {
            id: "151",
            name: "Top 3 Bài thơ thơ tháng 3/2025",
            rank: 3
        },
        {
            id: "150",
            name: "Top 4 Nhà thơ tháng 2/2025",
            rank: 4
        },
    ]

    const userStatistic = {
        totalPoems: 46,
        totalCollections: 12,
        totalPersonalAudios: 32,
        totalLikes: 352,
        totalFollowers: 123,
        totalFollowings: 21
    }

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        fetchTemplateDetail();
    }, []);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const requestHeaders = {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` })
            };
            const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates?pageSize=250&allowExceedPageSize=true`;

            const response = await fetch(apiUrl, { headers: requestHeaders });
            if (!response.ok) throw new Error("Failed to fetch templates");

            const data = await response.json();
            const foundOne = data.data.find((item) => item.id === masterTemplateId);
            setIsBought(foundOne?.isBought || false);
            setTemplates(data.data || []);
        } catch (error) {
            console.error("Error fetching templates:", error);
            message.error("Không thể tải thông tin template");
        }
    }

    const fetchTemplateDetail = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/${masterTemplateId}?pageSize=250&allowExceedPageSize=true`);
            if (!response.ok) throw new Error("Failed to fetch template details");

            const data = await response.json();
            console.log(data);
            setTemplate(data.data);

            // Update all template parts
            updateTemplateParts(data.data);

            const imageUrls = data.data
                .filter(item => item.image)
                .map(item => item.image);

            if (imageUrls.length > 0) {
                await preloadImages(imageUrls);
            }
            setImagesLoaded(true);
        } catch (error) {
            console.error("Error fetching template details:", error);
            message.error("Không thể tải chi tiết template");
        }
    };

    const updateTemplateParts = (templateData) => {
        // Update header state (type 1)
        const typeOneTemplate = templateData.find(item => item.type === 1);
        if (typeOneTemplate) {
            setHeaderBackground(typeOneTemplate.image);
            setHeaderColorCode(typeOneTemplate.colorCode);
        }

        // Update nav state (type 2)
        const typeTwoTemplate = templateData.find(item => item.type === 2);
        if (typeTwoTemplate) {
            setNavBackground(typeTwoTemplate.image);
            setNavColorCode(typeTwoTemplate.colorCode);
        }

        // Update nav border state (type 3)
        const typeThreeTemplate = templateData.find(item => item.type === 3);
        if (typeThreeTemplate) {
            setNavBorder(typeThreeTemplate.colorCode);
        }

        // Update main background state (type 4)
        const typeFourTemplate = templateData.find(item => item.type === 4);
        if (typeFourTemplate) {
            setMainBackground(typeFourTemplate.image);
        }

        // Update achievement border state (type 5)
        const typeFiveTemplate = templateData.find(item => item.type === 5);
        if (typeFiveTemplate) {
            setAchievementBorder(typeFiveTemplate.colorCode);
        }

        // Update achievement background and color state (type 6)
        const typeSixTemplate = templateData.find(item => item.type === 6);
        if (typeSixTemplate) {
            setAchievementBackground(typeSixTemplate.image);
            setAchievementColorCode(typeSixTemplate.colorCode);
        }

        // Update achievement title background and color state (type 9)
        const typeNineTemplate = templateData.find(item => item.type === 9);
        if (typeNineTemplate) {
            setAchievementTitleBackground(typeNineTemplate.image);
            setAchievementTitleColorCode(typeNineTemplate.colorCode);
        }

        // Update statistic border state (type 7)
        const typeSevenTemplate = templateData.find(item => item.type === 7);
        if (typeSevenTemplate) {
            setStatisticBorder(typeSevenTemplate.colorCode);
        }

        // Update statistic background and color state (type 8)
        const typeEightTemplate = templateData.find(item => item.type === 8);
        if (typeEightTemplate) {
            setStatisticBackground(typeEightTemplate.image);
            setStatisticColorCode(typeEightTemplate.colorCode);
        }

        // Update statistic title background and color state (type 10)
        const typeTenTemplate = templateData.find(item => item.type === 10);
        if (typeTenTemplate) {
            setStatisticTitleBackground(typeTenTemplate.image);
            setStatisticTitleColorCode(typeTenTemplate.colorCode);
        }
    };

    const preloadImages = (urls) => {
        return Promise.all(
            urls.map(url =>
                new Promise((resolve, reject) => {
                    const img = new Image();
                    img.src = url;
                    img.onload = resolve;
                    img.onerror = reject;
                })
            )
        );
    };

    const handleBuyTemplate = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/template/v1/master-template/${masterTemplateId}/purchase`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.message) {
                    message.error(data.message);
                } else if (response.status === 400) {
                    message.error("Tài khoản hiện tại đang không đủ!");
                } else if (response.status === 401) {
                    message.error("Bạn cần đăng nhập để thực hiện thao tác này");
                } else if (response.status === 403) {
                    message.error("Bạn không có quyền thực hiện thao tác này");
                } else if (response.status === 402) {
                    message.error("Không đủ tiền trong tài khoản");
                } else {
                    message.error("Đã xảy ra lỗi khi mua template");
                }
                return;
            }

            message.success(data.message || "Mua template thành công");
            setIsBought(true);

            setTimeout(() => {
                navigate(-1);
            }, 2000);
        } catch (error) {
            console.error("Error purchasing template:", error);
            message.error("Đã xảy ra lỗi khi kết nối đến server");
        }
    };

    const handleBuyClick = () => {
        if (!token) {
            message.error("Bạn cần đăng nhập để mua template");
            return;
        }

        Modal.confirm({
            title: `Bạn chắc chắn muốn mua bản thiết kế này với giá ${price?.toLocaleString("vi-VN") || '0'}₫?`,
            onOk: handleBuyTemplate,
            onCancel: () => { },
        });
    };

    const buttonStyle = {
        backgroundColor: hover ? "white" : "blue",
        color: hover ? "blue" : "white",
        padding: "10px 20px",
        fontWeight: "bold",
        textAlign: "center",
        display: "inline-block",
        border: hover ? "1px solid blue" : "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s ease, color 0.3s ease",
        marginRight: "20px"
    };

    const buyButtonStyle = {
        backgroundColor: hoverBuy ? "white" : "green",
        color: hoverBuy ? "green" : "white",
        padding: "10px 20px",
        fontWeight: "bold",
        textAlign: "center",
        display: "inline-block",
        border: hoverBuy ? "1px solid green" : "none",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.3s ease, color 0.3s ease",
    };

    if (!template || !imagesLoaded) return <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>;

    return (
        <div>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            {template.find(item => item.type === 1) ? (
                <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
                    <img
                        src={headerbackground}
                        alt="Cover"
                        style={{
                            width: "100%",
                            display: "block"
                        }}
                    />

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
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                                src={`${process.env.PUBLIC_URL}/default_avatar.png`}
                                alt="Avatar"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    border: "2px solid white"
                                }}
                            />
                            <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                                    <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: headerColorCode }}>
                                        Your name
                                    </h2>
                                    <p style={{ color: "#555", margin: "0", fontSize: "0.9em", color: headerColorCode }}>
                                        @username
                                    </p>
                                </div>
                                <div style={{ fontSize: "14px", color: "#333", display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                        <HiUsers color={headerColorCode} /> <span style={{ color: headerColorCode }}>100 Người theo dõi</span>
                                    </div>
                                    <div style={{ color: headerColorCode }}>•</div>
                                    <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                        <FaUserPlus color={headerColorCode} /> <span style={{ color: headerColorCode }}>100 Đang theo dõi</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{
                    width: "100%", boxSizing: "border-box", height: "183px"
                }}>
                    <div
                        style={{
                            backgroundColor: "#FFD700",
                            padding: "1em 6em",
                            height: "183px",
                            boxSizing: "border-box",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                                src={`${process.env.PUBLIC_URL}/default_avatar.png`}
                                alt="Avatar"
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "50%",
                                    border: "2px solid white",
                                }}
                            />
                            <div style={{ marginLeft: "15px" }}>
                                <h2 style={{
                                    fontSize: "20px", fontWeight: "bold",
                                    color: "#000",
                                }}>Your name</h2>
                                <p style={{
                                    color: "#000",
                                }}>@username</p>
                                <div style={{
                                    fontSize: "14px",
                                    color: "#000",
                                }}>
                                    👀 100 Người theo dõi • 📌 100 Đang theo dõi
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ position: "relative" }}>
                <nav
                    style={{
                        marginTop: "0px",
                        backgroundImage: `url("${navBackground}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        padding: "10px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        border: `3px solid ${navBorder}`,
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
                                fontWeight: activeTab === tab ? "bold" : "normal",
                                color: navColorCode,
                                borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div style={{
                display: "flex", flexDirection: "row",
                padding: "20px 129px",
                backgroundImage: `url("${mainBackground}")`,
                backgroundSize: "cover",
            }}>
                <div style={{
                    flex: 7,
                }}>
                    <button
                        style={buttonStyle}
                        onMouseEnter={() => setHover(true)}
                        onMouseLeave={() => setHover(false)}
                        onClick={() => navigate(-1)}>Trở về
                    </button>
                    {isBought ?
                        <button style={buyButtonStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span>Đã mua</span>
                                <FaCheck />
                            </div>
                        </button>
                        :
                        <button
                            style={buyButtonStyle}
                            onMouseEnter={() => setHoverBuy(true)}
                            onMouseLeave={() => setHoverBuy(false)}
                            onClick={handleBuyClick}
                        >
                            Mua bản thiết kế này
                        </button>
                    }
                </div>
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "28px",
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
                                                color={achievementColorCode}
                                                borderColor={achievementBorder}
                                            />
                                        ))
                                    ) : (
                                        <div style={{
                                            textAlign: "center",
                                            color: achievementColorCode || "#5D4037",
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
                                    color: statisticColorCode || "#5E35B1",
                                    position: "relative",
                                    zIndex: 1
                                }}>
                                    <ElegantStatItem
                                        icon={<FaBook style={{ fontSize: "20px" }} />}
                                        label="Bài thơ"
                                        value={userStatistic?.totalPoems || 0}
                                        color={statisticColorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaBookmark style={{ fontSize: "20px" }} />}
                                        label="Bộ sưu tập"
                                        value={userStatistic?.totalCollections || 0}
                                        color={statisticColorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaHeadphones style={{ fontSize: "20px" }} />}
                                        label="Bản ghi âm"
                                        value={userStatistic?.totalPersonalAudios || 0}
                                        color={statisticColorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaHeart style={{ fontSize: "20px", color: "#FF5252" }} />}
                                        label="Lượt thích"
                                        value={userStatistic?.totalLikes || 0}
                                        color={statisticColorCode}
                                        accentColor="#FF5252"
                                    />
                                    <ElegantStatItem
                                        icon={<FaUserFriends style={{ fontSize: "20px" }} />}
                                        label="Đang theo dõi"
                                        value={userStatistic?.totalFollowings || 0}
                                        color={statisticColorCode}
                                        accentColor="#7E57C2"
                                    />
                                    <ElegantStatItem
                                        icon={<FaUserFriends style={{ transform: "scaleX(-1)", fontSize: "20px" }} />}
                                        label="Lượt theo dõi"
                                        value={userStatistic?.totalFollowers || 0}
                                        color={statisticColorCode}
                                        accentColor="#7E57C2"
                                    />
                                </div>
                            </div>
                        </div>
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

export default TemplateDetail;