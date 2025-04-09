import React, { useState } from "react";
import axios from "axios";
const ConfirmBorderModal = ({ show, onConfirm, onCancel, selectedThemeId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const selectedTemplate = sessionStorage.getItem("selectedTemplate") || "mặc định";
    if (!show) return null;

    const handleConfirm = async () => {
        if (loading) return; 
        setLoading(true);
        setError(null);

        const templateId = sessionStorage.getItem("selectedTemplateId");
        const accessToken = localStorage.getItem("accessToken");
        const previousUserTemplateDetailId = sessionStorage.getItem("navBorderId");

        if (!templateId || !accessToken || !previousUserTemplateDetailId || !selectedThemeId) {
            setError("Thiếu dữ liệu cần thiết");
            setLoading(false);
            return;
        }

        const requestBody = [
            {
                previousUserTemplateDetailId,
                newUserTemplateDetailId: selectedThemeId,
            }
        ];

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/theme/${templateId}/user-template-detail`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                console.log("Cập nhật thành công:", response.data);
                onConfirm(); 
            } else {
                setError("Cập nhật không thành công. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật nền:", error);
            setError("Có lỗi xảy ra khi cập nhật nền");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal">
        <div className="modal-content">
        <p>Bạn có muốn thay đổi Theme {selectedTemplate} sang nền này không?</p>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button  style={{
                            margin: "10px",
                            padding: "8px 15px",
                            backgroundColor: "#007BFF",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }} 
                        onClick={handleConfirm} disabled={loading}>
                {loading ? "Đang xử lý..." : "Xác nhận"}
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
            onClick={onCancel} disabled={loading}>Hủy</button>
        </div>
    </div>
    );
};
export default ConfirmBorderModal;
