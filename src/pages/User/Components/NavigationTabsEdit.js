import React, { useState } from "react";
import { Settings, X } from "lucide-react"; 

const NavigationTabsEdit = ({ activeTab, setActiveTab, NavBorder }) => {
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
    const [showPopup, setShowPopup] = useState(false);
    const [step, setStep] = useState(1);

    return (
        <div style={{ position: "relative" }}>
            <nav
                style={{
                    marginTop: "0px",
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    border: `3px solid ${NavBorder}`,
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
                            color: activeTab === tab ? "#007bff" : "#555",
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

            {showPopup && (
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
                            onClick={() => setShowPopup(false)}
                        >
                            <X size={20} color="black" />
                        </button>
                        <h3 style={{ marginBottom: "10px" }}>Kho của bạn</h3>
                        <p style={{ color: "#666" }}>Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.</p>
                        <p style={{ color: "#666" }}>Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.</p>

                        {step === 1 ? (
                            <div>
                                <p>Nền của Thanh điều hướng</p>
                                <input type="text" style={{ width: "100%", padding: "5px" }} />
                                <div style={{ height: "20px", background: "linear-gradient(to right, red, pink)", margin: "10px 0" }}></div>
                            </div>
                        ) : (
                            <div>
                                <p>Viền của Thanh điều hướng</p>
                                <input type="range" style={{ width: "100%" }} />
                                <div style={{ height: "2px", background: "linear-gradient(to right, red, blue)", margin: "10px 0" }}></div>
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            {step > 1 && (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#FFC107", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setStep(step - 1)}
                                >
                                    TRỞ VỀ
                                </button>
                            )}
                            <span>{step} / 2</span>
                            {step < 2 ? (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setStep(step + 1)}
                                >
                                    TIẾP THEO
                                </button>
                            ) : (
                                <button
                                    style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    onClick={() => setShowPopup(false)}
                                >
                                    XÁC NHẬN
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavigationTabsEdit;