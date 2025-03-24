import React, { useEffect, useState } from "react";

const UserCoverEditModal = ({
    themes,
    selectedTemplateId,
    setSelectedTemplateId,
    setTempCoverImage,
    coverImage,
    closeModal
}) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);

    const handleConfirm = () => {
        const selectedTheme = themes.find(theme =>
            theme.userTemplateDetails.some(detail => detail.id === selectedTemplateId)
        );
        if (selectedTheme) {
            setShowConfirm(true);
        } else {
            alert("Vui lòng chọn một nền trước khi xác nhận!");
        }
    };
    const handleConfirmApiCall = async () => {
        // const coverImageId = sessionStorage.getItem("coverImageId");

        // if (!selectedImageId) {
        //     alert("Vui lòng chọn một hình nền!");
        //     return;
        // }

        // if (!coverImageId) {
        //     alert("Không tìm thấy coverImageId!");
        //     return;
        // }
        const selectedThemeId = themes.find(theme => theme.isInUse === true).id;

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("Bạn chưa đăng nhập!");
            return;
        }
        
        const payload = [
            {
                previousUserTemplateDetailId: coverImage.id,
                newUserTemplateDetailId: selectedImageId,
            },
        ];
        console.log(payload)
        try {
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/template/v1/theme/${selectedThemeId}/user-template-detail`,
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
            closeModal();
            window.location.reload();
        } catch (error) {
            alert(error.message);
        }
    };


    const selectedTemplate = sessionStorage.getItem("selectedTemplate") || "mặc định";

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
                    borderRadius: "15px",
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                    minWidth: "350px",
                    zIndex: 1001,
                    position: "relative",
                    textAlign: "center",
                }}
            >
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
                    onClick={closeModal}
                >
                    ✖
                </button>

                <h3 style={{ fontWeight: "bold", marginBottom: "5px" }}>Kho của bạn</h3>
                <p style={{ color: "#999", fontSize: "14px", marginBottom: "15px" }}>
                    Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.
                    Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.
                </p>

                <h4 style={{ textAlign: "left", fontSize: "14px", marginBottom: "10px" }}>
                    Nền của Mái nhà
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
                    {themes.some(theme =>
                        theme.userTemplateDetails.some(detail => detail.userTemplate.tagName !== "Default")
                    ) ? (
                        themes.map((theme) => (
                            <div key={theme.id} style={{ marginBottom: "10px" }}>
                                {theme.userTemplateDetails
                                    .filter(detail => detail.userTemplate.tagName !== "Default")
                                    .map((detail) => (
                                        <label
                                            key={detail.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                background: selectedTemplateId === detail.id ? "#EAF6FF" : "white",
                                                border: selectedTemplateId === detail.id ? "2px solid #007BFF" : "1px solid #ddd",
                                                boxShadow: selectedTemplateId === detail.id ? "0px 0px 10px rgba(0, 123, 255, 0.5)" : "none",
                                                borderRadius: "8px",
                                                padding: "5px",
                                                cursor: "pointer",
                                                position: "relative",
                                            }}
                                            onClick={() => setSelectedImageId(detail.id)}
                                        >
                                            <input
                                                type="radio"
                                                name="background"
                                                value={detail.id}
                                                checked={selectedTemplateId === detail.id}
                                                onChange={() => {
                                                    setSelectedTemplateId(detail.id);
                                                    setTempCoverImage(encodeURI(detail.image) || coverImage);
                                                }}
                                                style={{ display: "none" }}
                                            />
                                            {detail.image ? (
                                                <img
                                                src={encodeURI(detail.image)} 
                                                    alt={theme.name}
                                                    style={{
                                                        width: "100%",
                                                        height: "50px",
                                                        borderRadius: "5px",
                                                        objectFit: "cover",
                                                    }}
                                                />
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
                                    ))}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#999" }}>Không có chủ đề nào đang sử dụng</p>
                    )}
                </div>


                <button
                    style={{
                        marginTop: "15px",
                        padding: "12px",
                        backgroundColor: "#00C853",
                        color: "white",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        width: "100%",
                        fontSize: "16px",
                    }}
                    onClick={handleConfirm}
                >
                    XÁC NHẬN
                </button>

                {/* Hộp thoại xác nhận */}
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
        </div>
    );
};

export default UserCoverEditModal;
