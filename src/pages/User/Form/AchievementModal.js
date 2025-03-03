import React, { useState } from "react";
import { X } from "lucide-react";
import Step1 from "../AchieStep/Step1";
import Step2 from "../AchieStep/Step2";
import Step3 from "../AchieStep/Step3";
const AchievementModal = ({ onClose, onChangeBackground, onChangeBorder, onChangeBackgroundTitle }) => {
    const [step, setStep] = useState(1);

    return (
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
                padding: "30px",
                borderRadius: "15px",
                boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.2)",
                minWidth: "400px",
                zIndex: 1001,
                textAlign: "center",
                position: "relative"
            }}>
                <button
                    style={{
                        position: "absolute",
                        top: "15px",
                        left: "15px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px"
                    }}
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                >
                    ←
                </button>
                <button
                    style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    <X size={24} color="black" />
                </button>
                <h3 style={{ marginBottom: "15px", fontSize: "20px" }}>Kho của bạn</h3>
                <p style={{ color: "#666", fontSize: "16px" }}>Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.</p>
                <p style={{ color: "#666", fontSize: "16px" }}>Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.</p>

                {step === 1 && <Step1 onNext={() => setStep(2)} onClose={onClose} onChangeBackground={onChangeBackground} />}
                {step === 2 && <Step2 onNext={() => setStep(3)} onClose={onClose} onChangeBorder={onChangeBorder}/>}
                {step === 3 && <Step3  onClose={onClose} onChangeBackgroundTitle={onChangeBackgroundTitle} />}

                <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", fontSize: "16px" }}>
                    <span>{step} / 3</span>
                </div>
            </div>
        </div>
    );
};

export default AchievementModal;