import React, { useState, useEffect } from "react";
import { message } from "antd";

/**
 * AchievementEditModal
 * Two-step modal to edit the "Achievement" (type=6) background and "Achievement Border" (type=5).
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Function to close the modal
 * @param {object} inUseAchievement - The currently in-use achievement detail (type=6)
 * @param {object} inUseAchievementBorder - The currently in-use achievement border detail (type=5)
 * @param {function} setTempAchievement - Optional function to preview the new background in the parent
 * @param {function} setTempAchievementBorder - Optional function to preview the new border in the parent
 */
const AchievementEditModal = ({
    show,
    onClose,
    inUseAchievement = {},
    inUseAchievementBorder = {},
    setTempAchievement,
    setTempAchievementBorder,
}) => {
    const [step, setStep] = useState(1);
    const [backgroundThemes, setBackgroundThemes] = useState([]); // for step 1 (type=6)
    const [borderThemes, setBorderThemes] = useState([]);         // for step 2 (type=5)

    // The selected new detail IDs
    const [selectedBackgroundId, setSelectedBackgroundId] = useState(inUseAchievement.id || null);
    const [selectedBorderId, setSelectedBorderId] = useState(inUseAchievementBorder.id || null);

    // For confirmation popup
    const [showConfirm, setShowConfirm] = useState(false);

    // On open, fetch step 1 data
    useEffect(() => {
        // Whenever inUseAchievement.id changes, update selectedBackgroundId
        if (show && inUseAchievement.id && inUseAchievementBorder.id) {
            setSelectedBackgroundId(inUseAchievement.id);
            setSelectedBorderId(inUseAchievementBorder.id)
        }
    }, [show, inUseAchievement.id, inUseAchievementBorder.id]);

    useEffect(() => {
        console.log("initial", inUseAchievement.id);
        if (show) {
            setStep(1);
            fetchAchievementBackgrounds();
            if (inUseAchievement.id) {
                setSelectedBackgroundId(inUseAchievement.id);
            }
            if (inUseAchievementBorder.id) {
                setSelectedBorderId(inUseAchievementBorder.id);
            }

        }
    }, [show]);

    // -------------- FETCH FUNCTIONS --------------
    const fetchAchievementBackgrounds = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=6`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Lỗi khi fetch Achievement Background!");
            }
            const data = await response.json();
            if (data?.statusCode === 200 && Array.isArray(data.data)) {
                const inUseTheme = data.data.filter(theme => theme.isInUse === true);
                console.log(inUseTheme)
                setBackgroundThemes(inUseTheme);
            }
        } catch (error) {
            console.error(error);
            message.error("Không thể tải Achievement Background!");
        }
    };

    const fetchAchievementBorders = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                message.error("Bạn chưa đăng nhập!");
                return;
            }
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=5`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Lỗi khi fetch Achievement Border!");
            }
            const data = await response.json();
            if (data?.statusCode === 200 && Array.isArray(data.data)) {
                const inUseTheme = data.data.filter(theme => theme.isInUse === true);
                setBorderThemes(inUseTheme);
            }
        } catch (error) {
            console.error(error);
            message.error("Không thể tải Achievement Border!");
        }
    };

    // -------------- HANDLERS --------------
    const handleNextStep = () => {
        fetchAchievementBorders();
        setStep(2);
    };

    const handlePrevStep = () => {
        setStep(1);
    };

    const handleConfirm = () => {
        setShowConfirm(true);
    };

    // Actually calls the update API
    const handleConfirmApiCall = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Bạn chưa đăng nhập!");
            return;
        }

        let previousDetailId;
        let newDetailId;
        let relevantThemes;

        if (step === 1) {
            // step 1 => background
            previousDetailId = inUseAchievement.id;
            newDetailId = selectedBackgroundId;
            relevantThemes = backgroundThemes;
        } else {
            // step 2 => border
            previousDetailId = inUseAchievementBorder.id;
            newDetailId = selectedBorderId;
            relevantThemes = borderThemes;
        }

        // find the inUse theme
        const inUseTheme = relevantThemes.find((t) => t.isInUse) || relevantThemes[0];
        if (!inUseTheme) {
            message.error("Không tìm thấy theme đang sử dụng!");
            return;
        }
        const selectedThemeId = inUseTheme.id;

        const payload = [
            {
                previousUserTemplateDetailId: previousDetailId,
                newUserTemplateDetailId: newDetailId,
            },
        ];

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/theme/${selectedThemeId}/user-template-detail`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                throw new Error("Cập nhật thất bại!");
            }

            message.success("Cập nhật thành công!");
            setShowConfirm(false);

            if (step === 1) {
                // optional: update parent's immediate preview
                if (setTempAchievement) {
                    const foundDetail = backgroundThemes
                        .flatMap((t) => t.userTemplateDetails)
                        .find((d) => d.id === selectedBackgroundId);
                    if (foundDetail) {
                        setTempAchievement({
                            image: foundDetail.image || "",
                            colorCode: foundDetail.colorCode || "",
                          });
                    }
                }
                // proceed to step 2
                fetchAchievementBorders();
                setStep(2);
            } else {
                // step 2 => done
                if (setTempAchievementBorder) {
                    const foundDetail = borderThemes
                        .flatMap((t) => t.userTemplateDetails)
                        .find((d) => d.id === selectedBorderId);
                    if (foundDetail) {
                        setTempAchievementBorder(foundDetail.colorCode || "");
                    }
                }
                onClose();
                window.location.reload();
            }
        } catch (error) {
            message.error(error.message);
        }
    };

    if (!show) return null;

    const handleClose = () => {
        // Reset parent's preview state to original "in use" values
        if (setTempAchievement) {
            setTempAchievement({
                image: inUseAchievement.image,
                colorCode: inUseAchievement.colorCode,
            });
        }
        if (setTempAchievementBorder) {
            setTempAchievementBorder(inUseAchievementBorder.colorCode);
        }
        onClose();
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
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
                    borderRadius: "15px",
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                    minWidth: "350px",
                    zIndex: 1001,
                    position: "relative",
                    textAlign: "center",
                }}
            >
                {/* Close Button */}
                <button
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                        color: "#555",
                    }}
                    onClick={handleClose}
                >
                    ✖
                </button>

                <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>Kho của bạn</h3>
                <p style={{ color: "#999", fontSize: "14px", marginBottom: "15px" }}>
                    Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.
                    Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.
                </p>

                {step === 1 && (
                    <>
                        <h4 style={{ textAlign: "left", fontSize: "14px", marginBottom: "10px" }}>
                            Nền của Thành tựu
                        </h4>
                        <div
                            style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                padding: "5px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                            }}
                        >
                            {backgroundThemes.length > 0 ? (
                                backgroundThemes.map((theme) => (
                                    <div key={theme.id} style={{ marginBottom: "10px" }}>
                                        {theme.userTemplateDetails?.map((detail) => {
                                            return (
                                                <label
                                                    key={detail.id}
                                                    style={{
                                                        display: "block",
                                                        background:
                                                            selectedBackgroundId === detail.id ? "#EAF6FF" : "white",
                                                        border:
                                                            selectedBackgroundId === detail.id
                                                                ? "2px solid #007BFF"
                                                                : "1px solid #ddd",
                                                        boxShadow:
                                                            selectedBackgroundId === detail.id
                                                                ? "0px 0px 10px rgba(0, 123, 255, 0.5)"
                                                                : "none",
                                                        borderRadius: "8px",
                                                        padding: "5px",
                                                        cursor: "pointer",
                                                        marginBottom: "5px",
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="achievementBackground"
                                                        style={{ display: "none" }}
                                                        checked={selectedBackgroundId === detail.id}
                                                        onChange={() => {
                                                            setSelectedBackgroundId(detail.id);
                                                            // optional immediate preview
                                                            if (setTempAchievement) {
                                                                setTempAchievement({
                                                                    image: detail.image || "",
                                                                    colorCode: detail.colorCode || "",
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    {detail.image ? (
                                                        <div
                                                            style={{
                                                                width: "100%",
                                                                height: "50px",
                                                                borderRadius: "5px",
                                                                backgroundImage: `url("${detail.image}")`,
                                                                backgroundSize: "cover",
                                                                backgroundPosition: "center",
                                                                backgroundRepeat: "no-repeat",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}
                                                        >
                                                            <p style={{ margin: 0, color: detail.colorCode }}>Màu chữ trên nền</p>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                width: "100%",
                                                                height: "50px",
                                                                backgroundColor: detail.colorCode || "#ddd",
                                                                borderRadius: "5px",
                                                            }}
                                                        />
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#999" }}>Không có chủ đề nào đang sử dụng</p>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            <button
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#FFCA28",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                                onClick={handleNextStep}
                            >
                                TIẾP THEO
                            </button>
                            <button
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                                onClick={handleConfirm}
                            >
                                XÁC NHẬN
                            </button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h4 style={{ textAlign: "left", fontSize: "14px", marginBottom: "10px" }}>
                            Viền của Thành tựu
                        </h4>
                        <div
                            style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                padding: "5px",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                            }}
                        >
                            {borderThemes.length > 0 ? (
                                borderThemes.map((theme) => (
                                    <div key={theme.id} style={{ marginBottom: "10px" }}>
                                        {theme.userTemplateDetails?.map((detail) => {

                                            return (
                                                <label
                                                    key={detail.id}
                                                    style={{
                                                        display: "block",
                                                        background:
                                                            selectedBorderId === detail.id ? "#EAF6FF" : "white",
                                                        border:
                                                            selectedBorderId === detail.id
                                                                ? "2px solid #007BFF"
                                                                : "1px solid #ddd",
                                                        boxShadow:
                                                            selectedBorderId === detail.id
                                                                ? "0px 0px 10px rgba(0, 123, 255, 0.5)"
                                                                : "none",
                                                        borderRadius: "8px",
                                                        padding: "5px",
                                                        cursor: "pointer",
                                                        marginBottom: "5px",
                                                    }}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="achievementBorder"
                                                        style={{ display: "none" }}
                                                        checked={selectedBorderId === detail.id}
                                                        onChange={() => {
                                                            setSelectedBorderId(detail.id);
                                                            // optional immediate preview
                                                            if (setTempAchievementBorder) {
                                                                setTempAchievementBorder(detail.colorCode || "");
                                                            }
                                                        }}
                                                    />
                                                    {/* Example color swatch or whatever representation */}
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            height: "7px",
                                                            backgroundColor: detail.colorCode || "#ddd",
                                                            borderRadius: "5px",
                                                        }}
                                                    />
                                                </label>
                                            );
                                        })}
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: "#999" }}>Không có chủ đề nào đang sử dụng</p>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
                            <button
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#FFCA28",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                                onClick={handlePrevStep}
                            >
                                TRỞ VỀ
                            </button>
                            <button
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#4CAF50",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                                onClick={handleConfirm}
                            >
                                XÁC NHẬN
                            </button>
                        </div>
                    </>
                )}

                {/* Confirmation Popup */}
                {showConfirm && (
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "white",
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                            textAlign: "center",
                            zIndex: 1002,
                            minWidth: "280px",
                        }}
                    >
                        <p>
                            Bạn có muốn thay đổi <strong>Theme</strong> này sang
                            {step === 1 ? " nền " : " viền "}
                            đã chọn không?
                        </p>
                        <button
                            style={{
                                margin: "10px",
                                padding: "8px 15px",
                                backgroundColor: "#007BFF",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                            onClick={handleConfirmApiCall}
                        >
                            Đồng ý
                        </button>
                        <button
                            style={{
                                margin: "10px",
                                padding: "8px 15px",
                                backgroundColor: "#D32F2F",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                            onClick={() => setShowConfirm(false)}
                        >
                            Hủy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementEditModal;
