import React, { useState } from "react";
import Headeruser from "../../components/Headeruser";
import Footer from "../../components/Footer";
import { Settings } from "lucide-react";


const UserPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);

    const handleCoverChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCoverImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <Headeruser />

            {/* Cover Image */}
            <div style={{ width: "100%", paddingTop: "10px", position: "relative" }}>
                <div style={{
                    backgroundColor: "#FFD700",
                    padding: "15px",
                    borderRadius: "10px",
                    position: "relative",
                    backgroundImage: coverImage ? `url(${coverImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <img
                            src="./@.png"
                            alt="Avatar"
                            style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid white" }}
                        />
                        <div style={{ marginLeft: "15px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>KalenGuy34</h2>
                            <p style={{ color: "#555" }}>@KhoaKalen</p>
                            <div style={{ fontSize: "14px", color: "#333" }}>
                                📜 67 Bài đăng • 👀 1,865 Người theo dõi • 📌 52 Đang theo dõi
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "transparent",
                            color: "black",
                            border: "none",
                            borderRadius: "5px",
                            padding: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                        }}>
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Background Image */}
            <div style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "auto",
                padding: "10px"
            }}>

                {/* MODAL */}
                {isModalOpen && (
                    <div style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: "999",
                        animation: "fadeIn 0.3s ease-in-out"
                    }}>
                        <div style={{
                            backgroundColor: "white",
                            padding: "25px",
                            borderRadius: "12px",
                            width: "420px",
                            textAlign: "center",
                            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
                            position: "relative",
                            animation: "scaleIn 0.3s ease-in-out"
                        }}>
                            <button onClick={() => setIsModalOpen(false)}
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    background: "transparent",
                                    border: "none",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    color: "#333"
                                }}>
                                ✖
                            </button>

                            <h2 style={{ marginBottom: "15px", color: "#333" }}>Chỉnh sửa giao diện</h2>

                            {/* Thay đổi ảnh Cover */}
                            <div style={{ marginBottom: "15px", textAlign: "left" }}>
                                <label style={{ fontWeight: "bold" }}>Thay đổi ảnh Cover:</label>
                                <input type="file" accept="image/*" onChange={handleCoverChange}
                                    style={{
                                        display: "block",
                                        marginTop: "5px",
                                        padding: "6px",
                                        border: "1px solid #ddd",
                                        borderRadius: "5px",
                                        width: "100%"
                                    }} />
                            </div>

                            {/* Thay đổi Background */}
                            <div style={{ marginBottom: "15px", textAlign: "left" }}>
                                <label style={{ fontWeight: "bold" }}>Thay đổi Background:</label>
                                <input type="file" accept="image/*" onChange={handleBackgroundChange}
                                    style={{
                                        display: "block",
                                        marginTop: "5px",
                                        padding: "6px",
                                        border: "1px solid #ddd",
                                        borderRadius: "5px",
                                        width: "100%"
                                    }} />
                            </div>

                            <button onClick={() => setIsModalOpen(false)}
                                style={{
                                    padding: "12px",
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    width: "100%",
                                    fontSize: "16px",
                                    transition: "0.3s"
                                }}>
                                Đóng
                            </button>
                        </div>
                    </div>
                )}


                {/* Navigation Tabs */}
                <nav style={{ marginTop: "15px", backgroundColor: "white", padding: "10px", borderRadius: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["Thơ của bạn", "Bộ sưu tập của bạn", "Bookmark của bạn", "Bản nháp của bạn", "Lịch sử chỉnh sửa", "Quản lý Bản Quyền", "Kho của bạn", "Quản lý ví"].map((tab, index) => (
                        <button
                            key={index}
                            style={{ padding: "10px 15px", fontSize: "14px", color: "#555", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <div style={{ maxWidth: "1500px", margin: "auto", padding: "10px" }}>
                    {/* Button Sáng tác thơ */}
                    <button style={{ marginTop: "15px", padding: "10px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Sáng Tác Thơ</button>

                    {/* Content Section */}
                    <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
                        {/* Left: User Posts */}
                        <div style={{ flex: "2" }}>
                            {[1, 2, 3].map((post) => (
                                <div key={post} style={{ backgroundColor: "white", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", marginBottom: "15px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 style={{ fontWeight: "bold" }}>Tiêu đề bài thơ {post}</h3>
                                        <span style={{ color: "#999", fontSize: "12px" }}>🕒 3 ngày trước</span>
                                    </div>
                                    <p style={{ color: "#555", marginTop: "5px" }}>Nội dung ngắn gọn của bài thơ...</p>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "12px", color: "#666" }}>
                                        <span>👁️ 3,150</span>
                                        <span>❤️ 1,253</span>
                                        <span>💬 675</span>
                                        <a href="#" style={{ color: "#007bff", fontWeight: "bold" }}>Xem bài thơ →</a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right: User Stats */}
                        <div style={{ flex: "1" }}>
                            {/* Personal Achievements */}
                            <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "10px", border: "2px solid #FFD700", marginBottom: "10px" }}>
                                <h3 style={{ fontWeight: "bold" }}>Thành tựu cá nhân</h3>
                                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                                    <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                                    <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                                    <li>🏆 Cúp bạc bài viết tháng 6/2024</li>
                                </ul>
                            </div>

                            {/* User Information */}
                            <div style={{ backgroundColor: "white", padding: "15px", borderRadius: "10px" }}>
                                <h3 style={{ fontWeight: "bold" }}>Thông tin người dùng</h3>
                                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                                    <li>Tổng bài viết: 67</li>
                                    <li>Tổng lượt xem: 3,150</li>
                                    <li>Tổng lượt thích: 1,253</li>
                                    <li>Tổng lượt bookmark: 35</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <Footer />
        </div>
    );
};

export default UserPage;
