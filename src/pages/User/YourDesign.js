import React, { useState, useEffect } from "react";

const YourDesign = ({ statisticBorder, achievementBorder }) => {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [templates, setTemplates] = useState([]);
    useEffect(() => {
        const fetchTemplates = async () => {
            const token = localStorage.getItem("accessToken"); 
            if (!token) {
                console.error("Access token không tồn tại");
                return;
            }

            try {
                const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/themes/v1/user", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`, 
                        "Content-Type": "application/json"
                    }
                });

                const data = await response.json();
                if (data?.statusCode === 200 && Array.isArray(data.data)) {
                    setTemplates(data.data);
                    setSelectedTemplate(data.data[0]?.name || ""); 
                } else {
                    console.error("Lỗi dữ liệu từ API:", data);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchTemplates();
    }, []);
    return (
        <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 2, backgroundColor: "white", padding: "20px", borderRadius: "10px" }}>
                    <h3 style={{ fontWeight: "bold" }}>Bản mẫu của bạn</h3>
                    <label>Tên</label>
                    <input
                        type="text"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        style={{ display: "block", margin: "10px 0", padding: "15px", width: "100%" }}
                    />
                    <div style={{ display: "flex", overflowX: "auto", gap: "10px", paddingBottom: "10px" }}>
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.name)}
                                style={{
                                    padding: "20px 40px",
                                    border: template.name === selectedTemplate ? "2px solid blue" : "1px solid black",
                                    fontWeight: template.name === selectedTemplate ? "bold" : "normal",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    backgroundColor: "white"
                                }}
                            >
                                {template.name}
                            </button>
                        ))}
                        <button style={{ padding: "10px 30px", border: "1px dashed black", borderRadius: "5px" }}>+</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button style={{ backgroundColor: "#6aad5e", color: "white", padding: "10px 15px", borderRadius: "5px", marginTop: "10px" }}>SỬ DỤNG</button>
                    </div>
                </div>

                {/* Thành tựu và thống kê */}
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "15px",
                            borderRadius: "10px",
                            border: `2px solid ${achievementBorder}`,
                            marginBottom: "15px",
                        }}
                    >
                        <h3 style={{ fontWeight: "bold" }}>Thành tựu cá nhân</h3>
                        <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                            <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                            <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                            <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                            <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                        </ul>
                        <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
                    </div>

                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "15px",
                            borderRadius: "10px",
                            border: `2px solid ${statisticBorder}`,
                        }}
                    >
                        <h3 style={{ fontWeight: "bold" }}>Thống kê người dùng</h3>
                        <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
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
                        <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YourDesign;
