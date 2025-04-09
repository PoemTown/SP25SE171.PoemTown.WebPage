import React, { useState, useEffect } from "react";
import { message } from "antd";

/**
 * StatisticTitleEditModal
 * One-step modal to edit the "Statistic Title" (type=10) background (image and colorCode).
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Function to close the modal
 * @param {object} inUseStatisticTitle - The currently in-use statistic title detail (type=10)
 * @param {function} setTempStatisticTitle - Optional function to preview the new statistic title in the parent
 */
const StatisticTitleEditModal = ({
  show,
  onClose,
  inUseStatisticTitle = {},
  setTempStatisticTitle,
}) => {
  const [themes, setThemes] = useState([]); // fetched themes for type=10
  const [selectedTitleId, setSelectedTitleId] = useState(inUseStatisticTitle.id || null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(inUseStatisticTitle);

  // When modal opens or when parent's inUseStatisticTitle changes, update local state
  useEffect(() => {
    if (show) {
      setOriginalTitle(inUseStatisticTitle);
      setSelectedTitleId(inUseStatisticTitle.id);
      fetchStatisticTitleThemes();
    }
  }, [show, inUseStatisticTitle.id]);

  const fetchStatisticTitleThemes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi khi fetch Statistic Title!");
      }
      const data = await response.json();
      if (data?.statusCode === 200 && Array.isArray(data.data)) {
        // Filter out the in-use themes
        const activeThemes = data.data.filter((theme) => theme.isInUse === true);
        setThemes(activeThemes);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải Statistic Title!");
    }
  };

  const handleConfirm = () => {
    setShowConfirm(true);
  };

  const handleConfirmApiCall = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Bạn chưa đăng nhập!");
      return;
    }

    const previousDetailId = inUseStatisticTitle.id;
    const newDetailId = selectedTitleId;
    const activeTheme = themes.find((t) => t.isInUse) || themes[0];
    if (!activeTheme) {
      message.error("Không tìm thấy theme đang sử dụng!");
      return;
    }
    const selectedThemeId = activeTheme.id;

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
      onClose();
      window.location.reload();
    } catch (error) {
      message.error(error.message);
    }
  };

  // When closing without confirming, revert parent's preview state back to original in-use values
  const handleClose = () => {
    if (setTempStatisticTitle && originalTitle) {
      setTempStatisticTitle({
        image: originalTitle.image,
        colorCode: originalTitle.colorCode,
      });
    }
    onClose();
  };

  if (!show) return null;

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
          boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
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
          Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình. Hãy ghé thăm cửa hàng để mua sắm bất cứ lúc nào.
        </p>

        <h4 style={{ textAlign: "left", fontSize: "14px", marginBottom: "10px" }}>
          Nền của Tiêu đề Statistic
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
          {themes.length > 0 ? (
            themes.map((theme) => (
              <div key={theme.id} style={{ marginBottom: "10px" }}>
                {theme.userTemplateDetails?.map((detail) => {
                  if (detail.userTemplate?.tagName === "Default") return null;
                  return (
                    <label
                      key={detail.id}
                      style={{
                        display: "block",
                        background: selectedTitleId === detail.id ? "#EAF6FF" : "white",
                        border: selectedTitleId === detail.id ? "2px solid #007BFF" : "1px solid #ddd",
                        boxShadow: selectedTitleId === detail.id ? "0px 0px 10px rgba(0, 123, 255, 0.5)" : "none",
                        borderRadius: "8px",
                        padding: "5px",
                        cursor: "pointer",
                        marginBottom: "5px",
                      }}
                    >
                      <input
                        type="radio"
                        name="statisticTitle"
                        style={{ display: "none" }}
                        checked={selectedTitleId === detail.id}
                        onChange={() => {
                          setSelectedTitleId(detail.id);
                          if (setTempStatisticTitle) {
                            setTempStatisticTitle({
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

        <div style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}>
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
              Bạn có muốn thay đổi <strong>Theme</strong> này sang nền đã chọn không?
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

export default StatisticTitleEditModal;
