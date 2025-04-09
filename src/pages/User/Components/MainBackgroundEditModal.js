import React, { useState, useEffect } from "react";
import { message } from "antd";

/**
 * MainBackgroundEditModal
 * One-step modal to edit the Main Background (type=4) image.
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Function to close the modal
 * @param {object} inUseMainBackground - The currently in-use main background detail (type=4)
 * @param {function} setTempMainBackground - Optional function to preview the new main background in the parent
 */
const MainBackgroundEditModal = ({
  show,
  onClose,
  inUseMainBackground = {},
  setTempMainBackground,
}) => {
  const [themes, setThemes] = useState([]);
  const [selectedBgId, setSelectedBgId] = useState(inUseMainBackground.id || null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [originalBg, setOriginalBg] = useState(inUseMainBackground);

  // When the modal opens (or parent's inUseMainBackground changes), store original and set selected ID.
  useEffect(() => {
    if (show) {
      setOriginalBg(inUseMainBackground);
      setSelectedBgId(inUseMainBackground.id);
      fetchMainBackgroundThemes();
    }
  }, [show, inUseMainBackground.id]);

  const fetchMainBackgroundThemes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=4`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi khi fetch Main Background!");
      }
      const data = await response.json();
      if (data?.statusCode === 200 && Array.isArray(data.data)) {
        // Filter to get the theme(s) that are in use
        const activeThemes = data.data.filter((theme) => theme.isInUse === true);
        setThemes(activeThemes);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải Main Background!");
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

    const previousDetailId = inUseMainBackground.id;
    const newDetailId = selectedBgId;
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

  // When closing without confirming, revert parent's preview state back to the original in-use value.
  const handleClose = () => {
    if (setTempMainBackground && originalBg) {
      setTempMainBackground({
        image: originalBg.image,
        colorCode: originalBg.colorCode || "",
      });
    }
    onClose();
  };

  if (!show) return null;

  // Flatten the data so each detail is its own grid cell
  const allDetails = themes.flatMap((theme) =>
    theme.userTemplateDetails?.filter((detail) => detail.userTemplate?.tagName !== "Default") || []
  );

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
          width: "500px",
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
          Nền của Trang chính
        </h4>

        {/* 3-column grid for all details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 80px)",
            gap: "30px",
            maxHeight: "300px",
            overflowY: "auto",
            width: "430px",
            margin: "0 auto"
          }}
        >
          {allDetails.length > 0 ? (
            allDetails.map((detail) => (
              <label
                key={detail.id}
                style={{
                  display: "block",
                  background: selectedBgId === detail.id ? "#EAF6FF" : "white",
                  border: selectedBgId === detail.id ? "2px solid #007BFF" : "1px solid #ddd",
                  boxShadow:
                    selectedBgId === detail.id
                      ? "0px 0px 10px rgba(0, 123, 255, 0.5)"
                      : "none",
                  borderRadius: "8px",
                  padding: "5px",
                  cursor: "pointer",
                  textAlign: "center",
                  width: "80px"
                }}
              >
                <input
                  type="radio"
                  name="mainBackground"
                  style={{ display: "none" }}
                  checked={selectedBgId === detail.id}
                  onChange={() => {
                    setSelectedBgId(detail.id);
                    if (setTempMainBackground) {
                      setTempMainBackground({
                        image: detail.image || "",
                        colorCode: detail.colorCode || "",
                      });
                    }
                  }}
                />
                {detail.image ? (
                  <img
                    src={encodeURI(detail.image)}
                    alt="Main Background"
                    style={{
                      width: "80px",
                      height: "120px",
                      borderRadius: "5px",
                      objectFit: "cover",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "120px",
                      backgroundColor: detail.colorCode || "#ddd",
                      borderRadius: "5px",
                      margin: "0 auto",
                    }}
                  />
                )}
              </label>
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

export default MainBackgroundEditModal;
