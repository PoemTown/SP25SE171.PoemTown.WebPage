import { message, Spin } from "antd";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EmailConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "Email không được cung cấp";

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30); // Initial countdown value is 30 seconds
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

  
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;
    setOtp([...otp.map((d, i) => (i === index ? element.value : d))]);
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Vui lòng nhập đầy đủ mã OTP.");
      setIsSubmitting(false);
      return;
    }

    setError("");

    const requestBody = {
      email,
      emailOtp: enteredOtp,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/email/confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Xác nhận email thành công:", data);
        message.success("Xác nhận email thành công!");

        // Chuyển hướng đến trang đăng nhập
        navigate("/login");
      } else {
        const errorData = await response.json();
        switch (errorData.errorMessage) {
          case "Email Otp is incorrect":
            message.error("Mã xác nhận không đúng hoặc đã hết hạn")
        }
        console.error("Lỗi xác nhận:", errorData);
        //setError(errorData.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
   };

  const handleResend = async () => {
    setIsResendDisabled(true);
    setIsSubmitting(true);
    console.log("Đang gửi lại mã OTP...");

    const requestBody = {
      email,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/email/otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        console.log("Gửi lại mã OTP thành công!");
        message.success("Mã OTP đã được gửi lại. Vui lòng kiểm tra email.");
      } else {
        const errorData = await response.json();
        console.error("Lỗi gửi lại mã OTP:", errorData);
        message.error(errorData.message || "Có lỗi xảy ra khi gửi lại mã OTP. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi kết nối khi gửi lại mã OTP:", error);
      message.error("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown === 1) {
          clearInterval(timer); // Stop the countdown
          setIsResendDisabled(false); // Re-enable the button
          return 30; // Reset the countdown
        }
        return prevCountdown - 1;
      });
    }, 1000); // Update every second
    // // Vô hiệu hóa nút "Gửi lại mã" trong 30 giây
    // setTimeout(() => {
    //   setIsResendDisabled(false);
    // }, 30000);



  };
  const isOtpValid = otp.every((digit) => digit !== "") && otp.length === 6;

  return (
    <Spin spinning={isSubmitting} size="large" tip="Đang tái..." style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>

    <div style={styles.container}>
      <h2 style={styles.title}>Xác nhận Email</h2>
      <p style={styles.subtitle}>
        Nhập mã OTP đã được gửi đến <strong>{email}</strong> để hoàn tất xác minh.
      </p>
      <div style={styles.otpContainer}>
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            style={styles.otpInput}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <button style={{
          ...styles.confirmButton,
          backgroundColor: isOtpValid && !isSubmitting ? "#4CAF50" : "#ccc", // Change color if disabled
          cursor: isOtpValid && !isSubmitting ? "pointer" : "not-allowed", // Change cursor if disabled
        }} onClick={handleSubmit} disabled={!isOtpValid} >
        Xác nhận
      </button>
      <button
        style={{
          ...styles.resendButton,
          backgroundColor: isResendDisabled ? "#ccc" : "#f4a261",
        }}
        onClick={handleResend}
        disabled={isResendDisabled}
      >
        {isResendDisabled ? `Thử lại trong ${countdown}s` : "Gửi lại mã"}
      </button>
    </div>
    </Spin>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    textAlign: "center",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px",
  },
  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  otpInput: {
    width: "40px",
    height: "40px",
    fontSize: "18px",
    textAlign: "center",
    borderRadius: "5px",
    border: "1px solid #ddd",
  },
  error: {
    color: "red",
    fontSize: "14px",
    marginBottom: "10px",
  },
  confirmButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#2a9d8f",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "10px",
  },
  resendButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#f4a261",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default EmailConfirmationPage;
