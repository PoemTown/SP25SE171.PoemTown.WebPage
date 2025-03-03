import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";

const TemplateDetail = () => {
    const { masterTemplateId } = useParams();
    const [template, setTemplate] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("Thơ của bạn");
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
                            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Your name</h2>
                            <p style={{ color: "#555" }}>@username</p>
                            <div style={{ fontSize: "14px", color: "#333" }}>
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
                        border: `3px solid ${template.find(item => item.type === 3) ? `url("${template.find(item => item.type === 3).image}")` : "none"}`,
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
                                color: activeTab === tab ? "#007bff" : "#555",
                                borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>
            <div style={{display: "flex", flexDirection: "row"}}>
                <div style={{flex: 7}}></div>
                <div style={{flex: 3}}>
                    
                </div>
            </div>
        </div>
    );
};

export default TemplateDetail;
