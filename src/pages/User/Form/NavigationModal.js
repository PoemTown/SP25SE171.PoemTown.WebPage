import React, { useState } from "react";
import { X } from "lucide-react";
import ConfirmBackgroundModal from "./ConfirmBackgroundModal";
import ConfirmBorderModal from "./ConfirmBorderModal";

const NavigationModal = ({
    showPopup,
    setShowPopup,
    step,
    setStep,
    navThemeColors,
    navThemeImages,
    setTempNavBackground,
    setTempNavBorder,
    onUpdateSuccess
}) => {
    const [selectedBackgroundTheme, setSelectedBackgroundTheme] = useState(null);
    const [selectedBorderTheme, setSelectedBorderTheme] = useState(null);
    const [showConfirmBackgroundModal, setShowConfirmBackgroundModal] = useState(false);
    const [showConfirmBorderModal, setShowConfirmBorderModal] = useState(false);

    if (!showPopup) return null;
    return (
        <div
            style={{
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
            }}
        >
            <div
                style={{
                    background: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                    minWidth: "400px",
                    zIndex: 1001,
                    textAlign: "center",
                    position: "relative",
                }}
            >
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

                {step === 1 ? (
                    <div>
                        <p>Chọn hình ảnh nền</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                            {navThemeImages.map((theme) => (
                                <img
                                    key={theme.id}
                                    src={theme.image}
                                    alt="Theme Preview"
                                    style={{
                                        width: "350px",
                                        height: "60px",
                                        cursor: "pointer",
                                        border: selectedBackgroundTheme === theme.id ? "2px solid #4CAF50" : "1px solid transparent",
                                        transition: "border 0.2s ease-in-out",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => {
                                        setSelectedBackgroundTheme(theme.id);
                                        setTempNavBackground(theme.image);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p>Chọn màu viền</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                            {navThemeColors.map((theme) => (
                                <div
                                    key={theme.id}
                                    style={{
                                        width: "300px",
                                        marginBottom: "20px",
                                        height: "4px",
                                        backgroundColor: theme.colorCode,
                                        cursor: "pointer",
                                        border: selectedBorderTheme === theme.id ? "2px solid blue" : "none",
                                    }}
                                    onClick={() => {
                                        setSelectedBorderTheme(theme.id);
                                        setTempNavBorder(theme.colorCode);
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}


                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                    {step > 1 && (
                        <button
                            style={{
                                backgroundColor: "#f0e84f",
                                color: "white",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                width: "30%",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "bold",
                                border: "none",
                            }}
                            onClick={() => setStep(step - 1)}
                        >
                            TRỞ VỀ
                        </button>
                    )}
                    <button
                        style={{
                            backgroundColor: step === 1 ? "#4CAF50" : "#4CAF50",
                            color: "white",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            width: "30%",
                            cursor: "pointer",
                            fontSize: "16px",
                            fontWeight: "bold",
                            border: "none",
                        }}
                        onClick={() => {
                            if (step === 1) setShowConfirmBackgroundModal(true);
                            else setShowConfirmBorderModal(true);
                        }}
                    >
                        {step === 1 ? "XÁC NHẬN NỀN" : "XÁC NHẬN VIỀN"}
                    </button>
                    {step < 2 && (
                        <button
                            style={{
                                backgroundColor: "#f0e84f",
                                color: "white",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                width: "30%",
                                cursor: "pointer",
                                fontSize: "16px",
                                fontWeight: "bold",
                                border: "none",
                            }}
                            onClick={() => setStep(step + 1)}
                        >
                            TIẾP THEO
                        </button>
                    )}
                </div>
            </div>


            <ConfirmBackgroundModal
                show={showConfirmBackgroundModal}
                onConfirm={() => {
                    onUpdateSuccess();
                }}
                onCancel={() => setShowConfirmBackgroundModal(false)}
                selectedThemeId={selectedBackgroundTheme}
            />
            <ConfirmBorderModal
                show={showConfirmBorderModal}
                onConfirm={() => {
                    onUpdateSuccess();
                }}
                onCancel={() => setShowConfirmBorderModal(false)}
                selectedThemeId={selectedBorderTheme}
            />

            {/* Styles cho modal */}
            <style>
                {`
                    .modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2000;
                    }
                    .modal-content {
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                    }
                `}
            </style>
        </div>
    );
};

export default NavigationModal;