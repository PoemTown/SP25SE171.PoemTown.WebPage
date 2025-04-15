import React, { useState } from "react";
import { Modal, Radio, Input, Button, message } from "antd";
import axios from "axios";

const REPORT_USER_REASONS = [
    { label: "Hành vi quấy rối", value: "Hành vi quấy rối" },
    { label: "Ngôn từ xúc phạm", value: "Ngôn từ xúc phạm" },
    { label: "Tài khoản giả mạo", value: "Tài khoản giả mạo" },
    { label: "Spam và quảng cáo", value: "Spam và quảng cáo" },
    { label: "Phát ngôn kích động thù địch", value: "Phát ngôn kích động thù địch" },
    { label: "Khác", value: "Khác" }
];

const ReportUserModal = ({ visible, onClose, userId, accessToken }) => {
    const [selectedReason, setSelectedReason] = useState(null);
    const [customReason, setCustomReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReport = async () => {
        // Determine the final reason:
        console.log(userId);
        let reportReason = selectedReason;
        if (selectedReason === "Khác") {
            if (!customReason.trim()) {
                message.error("Vui lòng nhập lý do khi chọn 'Khác'.");
                return;
            }
            reportReason = customReason.trim();
        }
        if (!selectedReason) {
            message.error("Vui lòng chọn lý do báo cáo người dùng.");
            return;
        }

        try {
            setSubmitting(true);
            const requestBody = {
                userId,
                reportReason
            };

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/reports/v1/user`,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 200 || response.data.success) {
                message.success("Báo cáo người dùng thành công!");
                onClose();
            } else {
                message.error(response.data.errorMessage);
            }
        } catch (error) {
            console.error("Error reporting user:", error);
            message.error(error?.response?.data?.errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            title="Báo cáo nguời dùng"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={submitting}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmitReport} loading={submitting}>
                    Gửi báo cáo
                </Button>
            ]}
        >
            <Radio.Group
                onChange={(e) => setSelectedReason(e.target.value)}
                value={selectedReason}
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
                {REPORT_USER_REASONS.map((reason) => (
                    <Radio key={reason.value} value={reason.value}>
                        {reason.label}
                    </Radio>
                ))}
            </Radio.Group>
            {selectedReason === "Khác" && (
                <Input.TextArea
                    placeholder="Vui lòng nhập lý do khác..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    style={{ marginTop: 12 }}
                    rows={3}
                />
            )}
        </Modal>
    );
};

export default ReportUserModal;
