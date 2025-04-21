import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";
import { Button, message, Modal } from "antd";
import { HiUsers } from "react-icons/hi2";
import { FaCheck, FaUserPlus } from "react-icons/fa";

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
        "Bookmark của bạn",
        "Bản nháp của bạn",
        "Lịch sử chỉnh sửa",
        "Quản lý Bản Quyền",
        // "Trang trí",
        "Quản lý ví",
    ];

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
        const requestHeaders = {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        };
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates?pageSize=250&allowExceedPageSize=true`;

        const response = await fetch(apiUrl, { headers: requestHeaders });
        const data = await response.json();
        const foundOne = data.data.find((item) => item.id === masterTemplateId);
        setIsBought(foundOne.isBought);
        setTemplates(data.data || null);
    }


    const fetchTemplateDetail = async () => {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/${masterTemplateId}?pageSize=250&allowExceedPageSize=true`);
        const data = await response.json();
        console.log(data);
        setTemplate(data.data);


        // Update header state (type 1)
        const typeOneTemplate = await data.data.find(item => item.type === 1);
        if (typeOneTemplate) {
            setHeaderBackground(typeOneTemplate.image);
            setHeaderColorCode(typeOneTemplate.colorCode);
        }

        // Update nav state (type 2)
        const typeTwoTemplate = await data.data.find(item => item.type === 2);
        if (typeTwoTemplate) {
            setNavBackground(typeTwoTemplate.image);
            setNavColorCode(typeTwoTemplate.colorCode);
        }

        // Update nav border state (type 3)
        const typeThreeTemplate = await data.data.find(item => item.type === 3);
        if (typeThreeTemplate) {
            setNavBorder(typeThreeTemplate.colorCode);
        }

        // Update main background state (type 4)
        const typeFourTemplate = await data.data.find(item => item.type === 4);
        if (typeFourTemplate) {
            setMainBackground(typeFourTemplate.image);
        }

        // Update achievement border state (type 5)
        const typeFiveTemplate = await data.data.find(item => item.type === 5);
        if (typeFiveTemplate) {
            setAchievementBorder(typeFiveTemplate.colorCode);
        }

        // Update achievement background and color state (type 6)
        const typeSixTemplate = await data.data.find(item => item.type === 6);
        if (typeSixTemplate) {
            setAchievementBackground(typeSixTemplate.image);
            setAchievementColorCode(typeSixTemplate.colorCode);
        }

        // Update achievement title background and color state (type 9)
        const typeNineTemplate = await data.data.find(item => item.type === 9);
        if (typeNineTemplate) {
            setAchievementTitleBackground(typeNineTemplate.image);
            setAchievementTitleColorCode(typeNineTemplate.colorCode);
        }

        // Update statistic border state (type 7)
        const typeSevenTemplate = await data.data.find(item => item.type === 7);
        if (typeSevenTemplate) {
            setStatisticBorder(typeSevenTemplate.colorCode);
        }

        // Update statistic background and color state (type 8)
        const typeEightTemplate = await data.data.find(item => item.type === 8);
        if (typeEightTemplate) {
            setStatisticBackground(typeEightTemplate.image);
            setStatisticColorCode(typeEightTemplate.colorCode);
        }

        // Update statistic title background and color state (type 10)
        const typeTenTemplate = await data.data.find(item => item.type === 10);
        if (typeTenTemplate) {
            setStatisticTitleBackground(typeTenTemplate.image);
            setStatisticTitleColorCode(typeTenTemplate.colorCode);
        }

        const imageUrls = data.data
            .filter(item => item.image)
            .map(item => item.image);

        // Preload images
        if (imageUrls.length > 0) {
            await preloadImages(imageUrls);
        }
        setImagesLoaded(true);
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

    if (!template || !imagesLoaded) return <p>Loading...</p>;

    const handleBuyTemplate = async () => {
        console.log(masterTemplateId)
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/template/v1/master-template/${masterTemplateId}/purchase`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log(response)
        const data = await response.json();
        message.success(data.message);
        setTimeout(() => {
            navigate(-1);  // Quay lại trang trước
        }, 2000);
    }

    const handleBuyClick = () => {
        Modal.confirm({
          title: `Bạn chắc chắn muốn mua bản thiết kế này với giá ${price.toLocaleString("vi-VN")}₫`,
          onOk: handleBuyTemplate, // Gọi hàm mua khi người dùng nhấn "OK"
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

    if (!template) return <p>Loading...</p>;

    return (
        <div>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            {template.find(item => item.type === 1) ? (
                <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
                    {/* Render the cover image as an img so the full image is shown */}
                    <img
                        src={headerbackground}
                        alt="Cover"
                        style={{
                            width: "100%",
                            display: "block" // Prevents any unwanted spacing
                        }}
                    />

                    {/* Overlay content on top of the cover image */}
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
                            <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
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
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "15px",
                            borderRadius: "10px",
                            border: `2px solid ${achievementBorder}`,
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                            backgroundImage: achievementBackground ? `url("${achievementBackground}")` : "none"
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: "bold",
                                backgroundColor: "#FFD700",
                                padding: "5px 10px",
                                borderRadius: "8px 8px 0 0",
                                margin: "-15px -15px 10px -15px",
                                textAlign: "center",
                                borderBottom: `2px solid ${achievementBorder}`,
                                backgroundImage: achievementTitleBackground ? `url("${achievementTitleBackground}")` : "none",
                                color: achievementTitleColorCode
                            }}
                        >
                            Thành tựu cá nhân
                        </h3>
                        <ul style={{
                            fontSize: "14px",
                            color: achievementColorCode,
                            listStyle: "none", padding: 0,
                        }}>
                            <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                            <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                            <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                            <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                        </ul>
                        <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
                            Xem thêm &gt;
                        </a>
                    </div>

                    {/* Thống kê người dùng */}
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "15px",
                            borderRadius: "10px",
                            border: `2px solid ${statisticBorder}`,
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                            backgroundImage: statisticBackground ? `url("${statisticBackground}")` : "none"
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: "bold",
                                backgroundColor: "#888",
                                color: statisticTitleColorCode,
                                padding: "5px 10px",
                                borderRadius: "8px 8px 0 0",
                                margin: "-15px -15px 10px -15px",
                                textAlign: "center",
                                backgroundImage: statisticTitleBackground ? `url("${statisticTitleBackground}")` : "none",
                                borderBottom: `2px solid ${statisticBorder}`,
                            }}
                        >
                            Thống kê người dùng
                        </h3>
                        <ul style={{
                            fontSize: "14px",
                            color: statisticColorCode,
                            listStyle: "none", padding: 0
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
                        <a href="#" style={{ color: "#007bff", fontSize: "12px", display: "block", marginTop: "10px" }}>
                            Xem thêm &gt;
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;
