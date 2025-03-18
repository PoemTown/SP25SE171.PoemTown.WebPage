import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";
import { Button } from "antd";

const TemplateDetail = () => {
    const { masterTemplateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("Thơ của bạn");
    const [hover, setHover] = useState(false);
    const [hoverBuy, setHoverBuy] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

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
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        fetchTemplateDetail();
    }, []);

    const fetchTemplateDetail = async () => {
        const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates/${masterTemplateId}?pageSize=250&allowExceedPageSize=true`);
        const data = await response.json();
        console.log(data);
        setTemplate(data.data);
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
        const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/template/v1/master-template/${masterTemplateId}/purchase`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        console.log(response)
        const data = await response.json();
        alert(data.message);
    }

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
            <div style={{ width: "100%", position: "relative" }}>
                <div
                    style={{
                        backgroundColor: "#FFD700",
                        padding: "15px",
                        position: "relative",
                        backgroundImage: template.find(item => item.type === 1) ? `url("${template.find(item => item.type === 1).image}")` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "169px",
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
                                color: template.find(item => item.type === 1) ? `"${template.find(item => item.type === 1).colorCode}"` : "none",
                            }}>Your name</h2>
                            <p style={{
                                color: template.find(item => item.type === 1) ? `"${template.find(item => item.type === 1).colorCode}"` : "none",
                            }}>@username</p>
                            <div style={{
                                fontSize: "14px",
                                color: template.find(item => item.type === 1) ? `"${template.find(item => item.type === 1).colorCode}"` : "none",
                            }}>
                                👀 100 Người theo dõi • 📌 100 Đang theo dõi
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ position: "relative" }}>
                <nav
                    style={{
                        marginTop: "0px",
                        backgroundImage: template.find(item => item.type === 2) ? `url("${template.find(item => item.type === 2).image}")` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        padding: "10px",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        border: `3px solid ${template.find(item => item.type === 3) ? `${template.find(item => item.type === 3).colorCode}` : "none"}`,
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
                                color: template.find(item => item.type === 2) ? `${template.find(item => item.type === 2).colorCode}` : "none",
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
                backgroundImage: template.find(item => item.type === 4) ? `url("${template.find(item => item.type === 4).image}")` : "none",
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
                    <button
                        style={buyButtonStyle}
                        onMouseEnter={() => setHoverBuy(true)}
                        onMouseLeave={() => setHoverBuy(false)}
                        onClick={handleBuyTemplate}
                    >
                        Mua bản thiết kế này
                    </button>
                </div>
                <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "15px",
                            borderRadius: "10px",
                            border: `2px solid ${template.find(item => item.type === 5) ? `${template.find(item => item.type === 5).colorCode}` : "none"}`,
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                            backgroundImage: template.find(item => item.type === 6) ? `url("${template.find(item => item.type === 6).image}")` : "none"
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
                                borderBottom: `2px solid ${template.find(item => item.type === 5) ? `${template.find(item => item.type === 5).colorCode}` : "none"}`,
                                backgroundImage: template.find(item => item.type === 9) ? `url("${template.find(item => item.type === 9).image}")` : "none"
                            }}
                        >
                            Thành tựu cá nhân
                        </h3>
                        <ul style={{
                            fontSize: "14px",
                            color: template.find(item => item.type === 6) ? `"${template.find(item => item.type === 6).colorCode}"` : "none",
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
                            border: `2px solid ${template.find(item => item.type === 7) ? `${template.find(item => item.type === 7).colorCode}` : "none"}`,
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                            backgroundImage: template.find(item => item.type === 8) ? `url("${template.find(item => item.type === 8).image}")` : "none"
                        }}
                    >
                        <h3
                            style={{
                                fontWeight: "bold",
                                backgroundColor: "#888",
                                color: template.find(item => item.type === 10) ? `"${template.find(item => item.type === 10).colorCode}"` : "none",
                                padding: "5px 10px",
                                borderRadius: "8px 8px 0 0",
                                margin: "-15px -15px 10px -15px",
                                textAlign: "center",
                                backgroundImage: template.find(item => item.type === 10) ? `url("${template.find(item => item.type === 10).image}")` : "none",
                                borderBottom: `2px solid ${template.find(item => item.type === 7) ? `${template.find(item => item.type === 7).colorCode}` : "none"}`,
                            }}
                        >
                            Thống kê người dùng
                        </h3>
                        <ul style={{
                            fontSize: "14px",
                            color: template.find(item => item.type === 8) ? `"${template.find(item => item.type === 8).colorCode}"` : "none",
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
