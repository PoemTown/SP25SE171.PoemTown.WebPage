import React, { useState, useEffect } from "react";
import { message } from "antd";

const UserCoverEditModal = ({
    themes,
    selectedTemplateId,
    setSelectedTemplateId,
    setTempCoverImage,
    setTempCoverColorCode,
    coverImage, // current in-use cover object
    closeModal
}) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedImageId, setSelectedImageId] = useState(null);
    const [originalHeader, setOriginalHeader] = useState(coverImage);

    // When the modal opens, store the original cover value.
    useEffect(() => {
        setOriginalHeader(coverImage);
    }, [coverImage]);

    const handleConfirm = () => {
        const selectedTheme = themes.find(theme =>
            theme.userTemplateDetails.some(detail => detail.id === selectedTemplateId)
        );
        if (selectedTheme) {
            setShowConfirm(true);
        } else {
            message.error("Vui lòng chọn một nền trước khi xác nhận!");
        }
    };

    const handleConfirmApiCall = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            message.error("Bạn chưa đăng nhập!");
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
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/theme/${themes.find(theme => theme.isInUse === true).id}/user-template-detail`,
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

            message.success("Cập nhật thành công!");
            setShowConfirm(false);
            closeModal();
            window.location.reload();
        } catch (error) {
            message.error(error.message);
        }
    };

    // When closing without confirmation, revert to the original cover value.
    const handleClose = () => {
        if (setTempCoverImage && originalHeader) {
            setTempCoverImage(originalHeader.image);
        }
        if (setTempCoverColorCode && originalHeader) {
            setTempCoverColorCode(originalHeader.colorCode);
        }
        closeModal();
    };

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
                    onClick={handleClose}
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
                        theme.userTemplateDetails
                    ) ? (
                        themes.map((theme) => (
                            <div key={theme.id} style={{ marginBottom: "10px" }}>
                                {theme.userTemplateDetails.map((detail) => (
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
                                                setTempCoverColorCode(detail.colorCode)
                                            }}
                                            style={{ display: "none" }}
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
                                                <p style={{ margin: 0, color: detail.colorCode }}>PoemTown</p>
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
                        }}
                    >
                        <p>
                            Bạn có muốn thay đổi Theme{" "}
                            {themes.find(theme => theme.isInUse === true)?.name}{" "}
                            sang nền này không?
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

export default UserCoverEditModal;
