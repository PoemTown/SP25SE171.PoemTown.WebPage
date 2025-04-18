import React, { useEffect, useState } from "react";
import { Modal, Radio, Input, Button, message, Spin, Alert } from "antd";
import axios from "axios";

const ReportPoemModal = ({ visible, onClose, poemId, accessToken }) => {
  const [options, setOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [errorOptions, setErrorOptions] = useState(null);

  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Fetch reasons when modal opens
  useEffect(() => {
    if (!visible) return;
    setLoadingOptions(true);
    setErrorOptions(null);

    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/reports/v1/messages`, {
        params: { type: 1 },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(({ data }) => setOptions(data.data || []))
      .catch((err) => {
        console.error(err);
        setErrorOptions("Không tải được danh sách lý do.");
      })
      .finally(() => setLoadingOptions(false));
  }, [visible, accessToken]);

  const handleSubmit = async () => {
    if (!selectedMessageId) {
      return message.error("Vui lòng chọn lý do báo cáo.");
    }

    const selected = options.find(o => o.id === selectedMessageId);
    if (!selected) {
      return message.error("Lý do không hợp lệ.");
    }

    // If "Khác", note is required
    if (selected.description === "Khác" && !note.trim()) {
      return message.error("Vui lòng nhập lý do cụ thể khi chọn 'Khác'.");
    }

    const reportReason = note.trim() || selected.description;

    setSubmitting(true);
    try {
      const body = { poemId, reportMessageId: selectedMessageId, reportReason };
      const resp = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/reports/v1/poem`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (resp.status === 200) {
        message.success("Báo cáo thành công!");
        setSelectedMessageId(null);
        setNote("");
        onClose();
      } else {
        message.error(resp.data.message || "Báo cáo thất bại.");
      }
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.errorMessage || "Đã có lỗi, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Báo cáo bài thơ"
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
        >
          Gửi báo cáo
        </Button>,
      ]}
    >
      {loadingOptions ? (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : errorOptions ? (
        <Alert
          message={errorOptions}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <>
          <Radio.Group
            onChange={e => {
              setSelectedMessageId(e.target.value);
            }}
            value={selectedMessageId}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            {options.map(opt => (
              <Radio key={opt.id} value={opt.id}>
                {opt.description}
              </Radio>
            ))}
          </Radio.Group>

          {/* always show note textarea */}
          <Input.TextArea
            placeholder="Ghi chú hoặc mô tả (bắt buộc nếu chọn 'Khác')"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            style={{ marginTop: 12 }}
          />
        </>
      )}
    </Modal>
  );
};

export default ReportPoemModal;
