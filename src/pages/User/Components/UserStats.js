import React, { useState } from "react";
import { Settings, X } from "lucide-react";

const UserStats = ({ achievementBorder, statisticBorder }) => {
    const [showPopup1, setShowPopup1] = useState(false);
    const [showPopup2, setShowPopup2] = useState(false);
    const [step1, setStep1] = useState(1);
    const [step2, setStep2] = useState(1)
    return (
        <div>
            {/* Thành tựu cá nhân */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    border: `2px solid ${achievementBorder}`,
                    marginBottom: "15px",
                    position: "relative",
                }}
            >
                {/* Tiêu đề và Icon */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: "bold" }}>Thành tựu cá nhân</h3>
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
                        <Settings size={20} color="black" />
                    </button>
                </div>

                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                    <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                    <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                    <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                    <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                </ul>
                <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
            </div>
            {showPopup1 && (
                <div style={{
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                        minWidth: "300px",
                        zIndex: 1001,
                        textAlign: "center",
                        position: "relative"
                    }}>
                        <button
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                            onClick={() => setShowPopup1(false)}
                        >
                            <X size={20} color="black" />
                        </button>
                        <h3 style={{ marginBottom: "10px" }}>Kho của bạn</h3>
                        <p style={{ color: "#666" }}>Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.</p>
                        <p style={{ color: "#666" }}>Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.</p>

                        {step1 === 1 ? (
                            <div>
                                <p>Nền của Kệ thành tựu</p>
                                <input type="text" style={{ width: "100%", padding: "5px" }} />
                                <div style={{ height: "20px", background: "linear-gradient(to right, red, pink)", margin: "10px 0" }}></div>
                            </div>
                        ) : (
                            <div>
                                <p>Viền của Kệ thành tựu</p>
                                <input type="range" style={{ width: "100%" }} />
                                <div style={{ height: "2px", background: "linear-gradient(to right, red, blue)", margin: "10px 0" }}></div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            {step1 > 1 && (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#FFC107", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setStep1(step1 - 1)}
                                >
                                    TRỞ VỀ
                                </button>
                            )}
                            <span>{step1} / 2</span>
                            {step1 < 2 ? (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setStep1(step1 + 1)}
                                >
                                    TIẾP THEO
                                </button>
                            ) : (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setShowPopup1(false)}
                                >
                                    XÁC NHẬN
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Thống kê người dùng */}
            <div
                style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    border: `2px solid ${statisticBorder}`,
                    position: "relative",
                }}
            >
                {/* Tiêu đề và Icon */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: "bold" }}>Thống kê người dùng</h3>
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
                        <Settings size={20} color="black" />
                    </button>
                </div>

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
                {showPopup2 && (
                <div style={{
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                        minWidth: "300px",
                        zIndex: 1001,
                        textAlign: "center",
                        position: "relative"
                    }}>
                        <button
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                            }}
                            onClick={() => setShowPopup2(false)}
                        >
                            <X size={20} color="black" />
                        </button>
                        <h3 style={{ marginBottom: "10px" }}>Kho của bạn</h3>
                        <p style={{ color: "#666" }}>Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.</p>
                        <p style={{ color: "#666" }}>Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.</p>

                        {step2 === 1 ? (
                            <div>
                                <p>Nền của Kệ thống kê </p>
                                <input type="text" style={{ width: "100%", padding: "5px" }} />
                                <div style={{ height: "20px", background: "linear-gradient(to right, red, pink)", margin: "10px 0" }}></div>
                            </div>
                        ) : (
                            <div>
                                <p>Viền của Kệ thống kê</p>
                                <input type="range" style={{ width: "100%" }} />
                                <div style={{ height: "2px", background: "linear-gradient(to right, red, blue)", margin: "10px 0" }}></div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            {step2 > 1 && (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#FFC107", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setStep2(step2 - 1)}
                                >
                                    TRỞ VỀ
                                </button>
                            )}
                            <span>{step2} / 2</span>
                            {step2 < 2 ? (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setStep2(step2 + 1)}
                                >
                                    TIẾP THEO
                                </button>
                            ) : (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setShowPopup2(false)}
                                >
                                    XÁC NHẬN
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
};

export default UserStats;
