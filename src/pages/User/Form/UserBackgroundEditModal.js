import React, { useState, useEffect } from "react";

const UserBackgroundEditModal = ({ showModal, setShowModal, selectedBackground, setSelectedBackground, setBackgroundImage }) => {
    const [backgrounds, setBackgrounds] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false); 
    const accessToken = localStorage.getItem("accessToken");
    const selectedTemplate = sessionStorage.getItem("selectedTemplate") || "mặc định";
    useEffect(() => {
        const fetchBackgrounds = async () => {
            if (!accessToken) {
                console.error("Access token is missing");
                return;
            }

            try {
                const response = await fetch(
                    "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=4",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const activeThemes = data.data.filter((theme) => theme.isInUse);
                const availableBackgrounds = activeThemes.flatMap((theme) =>
                    theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            imageUrl: detail.image,
                            isInUse: detail.isInUse,
                        }))
                );

                setBackgrounds(availableBackgrounds);
                const activeTemplate = availableBackgrounds.find((bg) => bg.isInUse);
                if (activeTemplate) {
                    setSelectedBackground(activeTemplate.id);
                }
            } catch (error) {
                console.error("Error fetching backgrounds:", error);
            }
        };

        if (showModal) {
            fetchBackgrounds();
        }
    }, [showModal]);

    const handleConfirm = () => {
        setShowConfirm(true);
    };

    const handleConfirmApiCall = async () => {
        const backgroundImageId = sessionStorage.getItem("mainBackgroundId");
    
        if (!selectedBackground) {
            alert("Vui lòng chọn một hình nền!");
            return;
        }
    
        if (!backgroundImageId) {
            alert("Không tìm thấy backgroundImageId!");
            return;
        }
    
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("Bạn chưa đăng nhập!");
            return;
        }
    
        const payload = [
            {
                previousUserTemplateDetailId: backgroundImageId, 
                newUserTemplateDetailId: selectedBackground,
            },
        ];
    
        try {
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/template/v1/theme/${sessionStorage.getItem("selectedTemplateId")}/user-template-detail`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
    
            if (!response.ok) {
                throw new Error("Cập nhật thất bại!");
            }
    
            alert("Cập nhật thành công!");
            setShowConfirm(false);
            setShowModal(false);
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    };
    

    if (!showModal) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
            onClick={() => setShowModal(false)}
        >
            <div
                style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    width: "450px",
                    position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Nút Đóng (X) */}
                <button
                    onClick={() => setShowModal(false)}
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "15px",
                        background: "none",
                        border: "none",
                        fontSize: "20px",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    ✖
                </button>

                <h3 style={{ fontWeight: "bold" }}>Kho của bạn</h3>
                <p>Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.</p>
                <p>Nền của Tường nhà</p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "10px",
                        maxHeight: "250px",
                        overflowY: "auto",
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "5px",
                    }}
                >
                    {backgrounds.length > 0 ? (
                        backgrounds.map((bg) => (
                            <label key={bg.id} style={{ cursor: "pointer" }}>
                                <div
                                    style={{
                                        border: selectedBackground === bg.id ? "2px solid #4CAF50" : "2px solid #ccc",
                                        borderRadius: "8px",
                                        padding: "4px",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                    onClick={() => {
                                        setSelectedBackground(bg.id);
                                        setBackgroundImage(encodeURI(bg.imageUrl));
                                    }}
                                >
                                    <img
                                        src={encodeURI(bg.imageUrl)}
                                        alt="Background"
                                        width="80"
                                        height="80"
                                        style={{
                                            borderRadius: "5px",
                                            objectFit: "cover",
                                            width: "100%",
                                            height: "100%",
                                        }}
                                    />
                                </div>
                                <input
                                    type="radio"
                                    name="background"
                                    checked={selectedBackground === bg.id}
                                    onChange={() => {
                                        setSelectedBackground(bg.id);
                                        setBackgroundImage(bg.imageUrl);
                                    }}
                                    style={{ display: "none" }}
                                />
                            </label>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", gridColumn: "span 3" }}>Không có nền nào khả dụng.</p>
                    )}
                </div>

                <button
                    onClick={handleConfirm}
                    style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "10px 15px",
                        borderRadius: "5px",
                        marginTop: "20px",
                        width: "100%",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "bold",
                        border: "none",
                    }}
                >
                    XÁC NHẬN
                </button>
            </div>

            {/* Modal xác nhận */}
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
                    }}
                >
                    <p>Bạn có muốn thay đổi Theme {selectedTemplate} sang nền này không?</p>
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
    );
};

export default UserBackgroundEditModal;
