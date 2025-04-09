import React, { useState, useEffect } from "react";
import { message } from "antd";

const NavigationEditModal = ({
  show,
  onClose,
  inUseNav = {},
  inUseNavBorder = {},
  setTempNavBackground,
  setTempNavBorder,
}) => {
  const [step, setStep] = useState(1);
  const [navThemes, setNavThemes] = useState([]);         // For step 1
  const [borderThemes, setBorderThemes] = useState([]);   // For step 2

  // Selected IDs for new background/border
  const [selectedNavThemeId, setSelectedNavThemeId] = useState(inUseNav.id || null);
  const [selectedBorderThemeId, setSelectedBorderThemeId] = useState(inUseNavBorder.id || null);

  // For the confirmation popup
  const [showConfirm, setShowConfirm] = useState(false);


  useEffect(() => {
    // Whenever inUseAchievement.id changes, update selectedBackgroundId
    if (show && inUseNav.id && inUseNavBorder.id) {
      setSelectedNavThemeId(inUseNav.id);
      setSelectedBorderThemeId(inUseNavBorder.id);
    }
  }, [show, inUseNav.id, inUseNavBorder.id]);
  // Fetch nav backgrounds on mount (step 1)
  useEffect(() => {
    if (show) {
      fetchNavThemes();
      setStep(1);  // always start at step 1
    }
  }, [show]);

  // ----------------- FETCH FUNCTIONS -----------------
  const fetchNavThemes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=2`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi khi fetch Nav Background");
      }

      const data = await response.json();
      if (data?.statusCode === 200 && Array.isArray(data.data)) {
        const activeTheme = data.data.filter((theme) => theme.isInUse === true);
        setNavThemes(activeTheme);
        console.log(activeTheme)
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi fetch Nav Background");
    }
  };

  const fetchBorderThemes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        message.error("Bạn chưa đăng nhập!");
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=3`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Lỗi khi fetch Nav Border");
      }

      const data = await response.json();
      if (data?.statusCode === 200 && Array.isArray(data.data)) {
        const activeTheme = data.data.filter((theme) => theme.isInUse === true);
        setBorderThemes(activeTheme);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi fetch Nav Border");
    }
  };

  // ----------------- HANDLERS -----------------
  const handleNextStep = () => {
    // Move from step 1 => step 2
    fetchBorderThemes();
    setStep(2);
  };

  const handlePrevStep = () => {
    // Move back from step 2 => step 1
    setStep(1);
  };

  // Called when user clicks "XÁC NHẬN"
  const handleConfirm = () => {
    setShowConfirm(true);
  };

  // Actually calls the API to update
  const handleConfirmApiCall = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      message.error("Bạn chưa đăng nhập!");
      return;
    }

    // figure out old detail vs. new detail
    let previousDetailId;
    let newDetailId;
    let relevantThemes;

    if (step === 1) {
      previousDetailId = inUseNav.id;        // old nav background
      newDetailId = selectedNavThemeId;      // new nav background
      relevantThemes = navThemes;
    } else {
      previousDetailId = inUseNavBorder.id;  // old nav border
      newDetailId = selectedBorderThemeId;   // new nav border
      relevantThemes = borderThemes;
    }

    // find the theme with isInUse === true
    // or fallback to the first theme if you prefer
    const inUseTheme = relevantThemes.find((t) => t.isInUse) || relevantThemes[0];
    if (!inUseTheme) {
      message.error("Không tìm thấy theme đang sử dụng!");
      return;
    }

    const selectedThemeId = inUseTheme.id;

    // Construct payload
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

      // If step=1, let them see next step
      if (step === 1) {
        // Optional: update parent’s nav background preview
        if (setTempNavBackground) {
          // You might have a local map to find the image or color from selectedNavThemeId
          // or fetch it from navThemes
          const foundDetail = navThemes
            .flatMap((t) => t.userTemplateDetails)
            .find((d) => d.id === selectedNavThemeId);
          if (foundDetail) {
            setTempNavBackground({
              image: foundDetail.image || "",
              colorCode: foundDetail.colorCode || "",
            });
          }
        }
        // Move to step 2
        fetchBorderThemes();
        setStep(2);
      } else {
        // step=2 => done
        // Optional: update parent’s nav border preview
        if (setTempNavBorder) {
          const foundDetail = borderThemes
            .flatMap((t) => t.userTemplateDetails)
            .find((d) => d.id === selectedBorderThemeId);
          if (foundDetail) {
            setTempNavBorder(foundDetail.colorCode || "");
          }
        }
        // Close the modal
        onClose();
        // Possibly reload or refetch in parent
        window.location.reload();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  if (!show) return null;

  const handleClose = () => {
    // Reset parent's preview state to original "in use" values
    if (setTempNavBackground) {
      setTempNavBackground({
        image: inUseNav.image,
        colorCode: inUseNav.colorCode,
      });
    }
    if (setTempNavBorder) {
      setTempNavBorder(inUseNavBorder.colorCode);
    }
    onClose();
  };

  // ----------------- RENDER -----------------
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
              Nền của Thanh điều hướng
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
              {/* Render navThemes details */}
              {navThemes.length > 0 ? (
                navThemes.map((theme) => (
                  <div key={theme.id} style={{ marginBottom: "10px", maxWidth: "800px" }}>
                    {theme.userTemplateDetails?.map((detail) => {

                      return (
                        <label
                          key={detail.id}
                          style={{
                            display: "block",
                            background: selectedNavThemeId === detail.id ? "#EAF6FF" : "white",
                            border:
                              selectedNavThemeId === detail.id
                                ? "2px solid #007BFF"
                                : "1px solid #ddd",
                            boxShadow:
                              selectedNavThemeId === detail.id
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
                            name="navBackground"
                            style={{ display: "none" }}
                            checked={selectedNavThemeId === detail.id}
                            onChange={() => {
                              setSelectedNavThemeId(detail.id);
                              // optional immediate preview
                              if (setTempNavBackground) {
                                setTempNavBackground({
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
              {/* Step 1 Buttons */}
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
              Viền của Thanh điều hướng
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
              {/* Render borderThemes details */}
              {borderThemes.length > 0 ? (
                borderThemes.map((theme) => (
                  <div key={theme.id} style={{ marginBottom: "10px" }}>
                    {theme.userTemplateDetails?.map((detail) => {

                      return (
                        <label
                          key={detail.id}
                          style={{
                            display: "block",
                            background: selectedBorderThemeId === detail.id ? "#EAF6FF" : "white",
                            border:
                              selectedBorderThemeId === detail.id
                                ? "2px solid #007BFF"
                                : "1px solid #ddd",
                            boxShadow:
                              selectedBorderThemeId === detail.id
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
                            name="navBorder"
                            style={{ display: "none" }}
                            checked={selectedBorderThemeId === detail.id}
                            onChange={() => {
                              setSelectedBorderThemeId(detail.id);
                              // optional immediate preview
                              if (setTempNavBorder) {
                                setTempNavBorder(detail.colorCode || "");
                              }
                            }}
                          />
                          {/* Example: color swatch */}
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
              {/* Step 2 Buttons */}
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

export default NavigationEditModal;
