import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { useSignalR } from "../SignalR/SignalRContext";

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isForgotPasswordPopupOpen, setForgotPasswordPopupOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // SignalR
    const {createAnnouncementConnection } = useSignalR();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleForgotPassword = async () => {
        setIsSending(true);
        setForgotPasswordMessage("");

        try {
            const response = await axios.put(
                "https://api-poemtown-staging.nodfeather.win/api/accounts/v1/password/recovery",
                { email: forgotEmail }
            );

            if (response.status === 202) {
                setForgotPasswordMessage("Yêu cầu khôi phục mật khẩu đã được gửi!");
                setTimeout(() => {
                    setForgotPasswordPopupOpen(false);
                }, 1500);
            }
        } catch (err) {
            console.error("Password recovery failed:", err.response?.data || err.message);
            setForgotPasswordMessage("Không thể gửi yêu cầu, vui lòng kiểm tra lại email.");
        } finally {
            setIsSending(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "https://api-poemtown-staging.nodfeather.win/api/authentications/v1/authentication",
                formData
            );

            if (response.status === 200) {
                const { accessToken, refreshToken, role } = response.data.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("role", JSON.stringify(role));

                console.log("Login successful:", response.data.message);

                const decodedToken = jwtDecode(accessToken);
                localStorage.setItem("username", decodedToken.UserName);
                localStorage.setItem("userId", decodedToken.UserId);

                if (role.includes("USER")) {
                    window.location.href = "/";
                } else if (role.includes("ADMIN")) {
                    window.location.href = "/";
                } else if (role.includes("MODERATOR")) {
                    window.location.href = "/";
                } else {
                    setError("Vai trò không hợp lệ.");
                }

                // Tạo kết nối tới SignalR
                createAnnouncementConnection(jwtDecode.UserId);
            }
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            setError("Email hoặc mật khẩu không chính xác.");
        }
    };

    return (
        <div style={styles.loginContainer}>
            {/* Left Section */}
            <div style={styles.loginFormContainer}>
                <h1 style={styles.loginTitle}>Chào mừng quay lại!</h1>
                <p style={styles.loginSubtitle}>Mời bạn điền thông tin để đăng nhập</p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="email">
                            Địa chỉ email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Nhập email"
                            style={styles.formInput}
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="password">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            style={styles.formInput}
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    {error && <p style={styles.error}>{error}</p>}

                    <div style={{ textAlign: "center", marginBottom: "20px", width: "100%" }}>
                        <button
                            type="button"
                            style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                textDecoration: "underline",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                            }}
                            onClick={() => setForgotPasswordPopupOpen(true)}
                        >
                            Quên mật khẩu?
                        </button>
                    </div>

                    <button type="submit" style={styles.loginButton}>
                        Đăng nhập
                    </button>
                </form>

                {/* Forgot Password Popup */}
                {isForgotPasswordPopupOpen && (
                    <div style={styles.popupOverlay}>
                        <div style={styles.popup}>
                            <h2>Khôi phục mật khẩu</h2>
                            <p>Nhập địa chỉ email của bạn để nhận liên kết khôi phục mật khẩu:</p>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                style={styles.formInput}
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                            />
                            <button
                                style={styles.loginButton}
                                onClick={handleForgotPassword}
                                disabled={isSending}
                            >
                                {isSending ? (
                                    <span className="spinner"></span>
                                ) : (
                                    "Gửi"
                                )}
                            </button>
                            <p style={forgotPasswordMessage.includes("được gửi") ? styles.successMessage : styles.error}>
                                {forgotPasswordMessage}
                            </p>
                            <button
                                style={styles.homeButton}
                                onClick={() => setForgotPasswordPopupOpen(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div style={styles.divider}>
                    <span style={styles.dividerLine}></span>
                    <span style={styles.dividerText}>or</span>
                    <span style={styles.dividerLine}></span>
                </div>

                {/* Google Login */}
                <button style={styles.googleButton}>
                    <img
                        src="./GGicon.png"
                        alt="Google Logo"
                        style={styles.googleIcon}
                    />
                    Đăng nhập với Google
                </button>

                {/* Home Link */}
                <button
                    style={styles.homeButton}
                    onClick={() => (window.location.href = "/")}
                >
                    Quay về trang chủ
                </button>

                {/* Signup Link */}
                <p style={styles.signupLink}>
                    Chưa có tài khoản?{" "}
                    <a href="/signup" style={styles.signupLinkHighlight}>
                        Đăng ký ngay!
                    </a>
                </p>
            </div>

            {/* Right Section */}
            <div
                style={{
                    ...styles.loginImageContainer,
                    backgroundImage: `url('./Login.jpg')`,
                }}
            ></div>
        </div>
    );
};

const styles = {
    loginContainer: {
        display: "flex",
        minHeight: "100vh",
        flexDirection: "row",
    },
    loginFormContainer: {
        flex: 1,
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    loginTitle: {
        fontSize: "2rem",
        fontWeight: "bold",
        marginBottom: "20px",
    },
    loginSubtitle: {
        color: "#666",
        marginBottom: "20px",
        textAlign: "center",
    },
    formGroup: {
        marginBottom: "15px",
        width: "100%",
    },
    label: {
        display: "block",
        marginBottom: "5px",
        color: "#333",
        fontWeight: "600",
    },
    formInput: {
        width: "300px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        marginBottom: "10px"
    },
    loginButton: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#5c3d2e",
        color: "white",
        fontSize: "1rem",
        fontWeight: "bold",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    divider: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "20px 0",
    },
    dividerLine: {
        flex: 1,
        height: "1px",
        backgroundColor: "#ccc",
    },
    dividerText: {
        margin: "0 10px",
        color: "#999",
    },
    googleIcon: {
        width: "20px",
        height: "20px",
        marginRight: "10px",
    },
    googleButton: {
        width: "50%",
        padding: "12px",
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px",
        backgroundColor: "white",
        cursor: "pointer",
    },
    signupLink: {
        marginTop: "20px",
        textAlign: "center",
        color: "#666",
    },
    signupLinkHighlight: {
        color: "#007bff",
        textDecoration: "none",
    },
    loginImageContainer: {
        flex: 1,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
    },
    homeButton: {
        width: "50%",
        padding: "12px",
        marginTop: "10px",
        backgroundColor: "#007bff",
        color: "white",
        fontSize: "1rem",
        fontWeight: "bold",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    error: {
        color: "red",
        marginBottom: "15px",
        fontSize: "0.9rem",
        textAlign: "center",
    },
    popupOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    popup: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "400px",
        textAlign: "center",
    },
    popupTitle: {
        marginBottom: "10px",
        fontSize: "1.5rem",
    },
    popupActions: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "20px",
    },
    popupButton: {
        padding: "10px 20px",
        backgroundColor: "#5c3d2e",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    popupButtonCancel: {
        padding: "10px 20px",
        backgroundColor: "#ccc",
        color: "#333",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    success: {
        color: "green",
        fontSize: "0.9rem",
        marginBottom: "10px",
    },
    spinner: {
        display: "inline-block",
        width: "15px",
        height: "15px",
        border: "3px solid rgba(0, 0, 0, 0.2)",
        borderTopColor: "#007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    successMessage: {
        color: "green",
        fontSize: "0.9rem",
        marginTop: "10px",
        textAlign: "center",
    },
    "@keyframes spin": {
        from: { transform: "rotate(0deg)" },
        to: { transform: "rotate(360deg)" },
    },

    "@media (max-width: 768px)": {
        loginContainer: {
            flexDirection: "column",
        },
        loginFormContainer: {
            padding: "20px",
        },
        loginImageContainer: {
            width: "100%",
            height: "300px",
        },
        googleButton: {
            width: "100%",
        },
    },
};

export default LoginPage;
