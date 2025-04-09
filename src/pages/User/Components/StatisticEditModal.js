import React, { useState, useEffect } from "react";
import { message } from "antd";

/**
 * StatisticEditModal
 * Two-step modal to edit the "Statistic" (type=8) background and "Statistic Border" (type=7).
 *
 * @param {boolean} show - Whether to show the modal
 * @param {function} onClose - Function to close the modal
 * @param {object} inUseStatistic - The currently in-use statistic detail (type=8)
 * @param {object} inUseStatisticBorder - The currently in-use statistic border detail (type=7)
 * @param {function} setTempStatistic - Optional function to preview the new background in the parent
 * @param {function} setTempStatisticBorder - Optional function to preview the new border in the parent
 */
const StatisticEditModal = ({
  show,
  onClose,
  inUseStatistic = {},
  inUseStatisticBorder = {},
  setTempStatistic,
  setTempStatisticBorder,
}) => {
  const [step, setStep] = useState(1);
  const [backgroundThemes, setBackgroundThemes] = useState([]); // for step 1 (type=8)
  const [borderThemes, setBorderThemes] = useState([]);         // for step 2 (type=7)

  // The selected new detail IDs
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(inUseStatistic.id || null);
  const [selectedBorderId, setSelectedBorderId] = useState(inUseStatisticBorder.id || null);

  // For confirmation popup
  const [showConfirm, setShowConfirm] = useState(false);

  // Update selected IDs when parent's in-use values change
  useEffect(() => {
    if (show && inUseStatistic.id && inUseStatisticBorder.id) {
      setSelectedBackgroundId(inUseStatistic.id);
      setSelectedBorderId(inUseStatisticBorder.id);
    }
  }, [show, inUseStatistic.id, inUseStatisticBorder.id]);

  useEffect(() => {
    if (show) {
      setStep(1);
      fetchStatisticBackgrounds();
      if (inUseStatistic.id) {
        setSelectedBackgroundId(inUseStatistic.id);
      }
      if (inUseStatisticBorder.id) {
        setSelectedBorderId(inUseStatisticBorder.id);
      }
    }
  }, [show]);

  // -------------- FETCH FUNCTIONS --------------
  const fetchStatisticBackgrounds = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=8`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi khi fetch Statistic Background!");
      }
      const data = await response.json();
      if (data?.statusCode === 200 && Array.isArray(data.data)) {
        const activeTheme = data.data.filter((theme) => theme.isInUse === true);
        setBackgroundThemes(activeTheme);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải Statistic Background!");
    }
  };

  const fetchStatisticBorders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=7`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi khi fetch Statistic Border!");
      }
      const data = await response.json();
      if (data?.statusCode === 200 && Array.isArray(data.data)) {
        const activeTheme = data.data.filter((theme) => theme.isInUse === true);
        setBorderThemes(activeTheme);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải Statistic Border!");
    }
  };

  // -------------- HANDLERS --------------
  const handleNextStep = () => {
    fetchStatisticBorders();
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
      // Step 1 => statistic background
      previousDetailId = inUseStatistic.id;
      newDetailId = selectedBackgroundId;
      relevantThemes = backgroundThemes;
    } else {
      // Step 2 => statistic border
      previousDetailId = inUseStatisticBorder.id;
      newDetailId = selectedBorderId;
      relevantThemes = borderThemes;
    }

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
        // Update parent's immediate preview for statistic background
        if (setTempStatistic) {
          const foundDetail = backgroundThemes
            .flatMap((t) => t.userTemplateDetails)
            .find((d) => d.id === selectedBackgroundId);
          if (foundDetail) {
            setTempStatistic({
              image: foundDetail.image || "",
              colorCode: foundDetail.colorCode || "",
            });
          }
        }
        // Proceed to step 2
        fetchStatisticBorders();
        setStep(2);
      } else {
        // Step 2 => done, update parent's preview for statistic border
        if (setTempStatisticBorder) {
          const foundDetail = borderThemes
            .flatMap((t) => t.userTemplateDetails)
            .find((d) => d.id === selectedBorderId);
          if (foundDetail) {
            setTempStatisticBorder(foundDetail.colorCode || "");
          }
        }
        onClose();
        window.location.reload();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // When closing the modal without confirming, revert parent's preview state back to original in-use values
  const handleClose = () => {
    if (setTempStatistic) {
      setTempStatistic({
        image: inUseStatistic.image,
        colorCode: inUseStatistic.colorCode || "",
      });
    }
    if (setTempStatisticBorder) {
      setTempStatisticBorder(inUseStatisticBorder.colorCode);
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
              Nền của Statistic
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
                      // Exclude default if necessary
                      if (detail.userTemplate?.tagName === "Default") return null;
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
                            name="statisticBackground"
                            style={{ display: "none" }}
                            checked={selectedBackgroundId === detail.id}
                            onChange={() => {
                              setSelectedBackgroundId(detail.id);
                              if (setTempStatistic) {
                                setTempStatistic({
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
              Viền của Statistic
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
                      if (detail.userTemplate?.tagName === "Default") return null;
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
                            name="statisticBorder"
                            style={{ display: "none" }}
                            checked={selectedBorderId === detail.id}
                            onChange={() => {
                              setSelectedBorderId(detail.id);
                              if (setTempStatisticBorder) {
                                setTempStatisticBorder(detail.colorCode || "");
                              }
                            }}
                          />
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
              Bạn có muốn thay đổi <strong>Theme</strong> này sang{" "}
              {step === 1 ? " nền " : " viền "} đã chọn không?
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

export default StatisticEditModal;
