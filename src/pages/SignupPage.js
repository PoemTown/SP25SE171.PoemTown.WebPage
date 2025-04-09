import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        fullName: "",
        gender: "male",
        address: "",
        dateOfBirth: "",
        agreeTerms: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreeTerms) {
            alert("You must agree to the terms and conditions.");
            return;
        }
    
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/authentications/v1/registration`,
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    phoneNumber: formData.phoneNumber,
                    fullName: formData.fullName,
                    gender: formData.gender,
                    address: formData.address,
                    dateOfBirth: formData.dateOfBirth,
                }
            );
            console.log("Registration successful:", response.data);
            alert("Đăng ký thành công!");
    
            navigate("/confirm-email", { state: { email: formData.email } });
        } catch (error) {
            console.error("Registration failed:", error.response || error.message);
            alert("Đăng ký thất bại. Vui lòng thử lại.");
        }
    };
    

    return (
        <div style={styles.loginContainer}>
            {/* Left Section */}
            <div style={styles.loginFormContainer}>
                <h1 style={styles.loginTitle}>Bắt đầu ngay nào!</h1>
                <p style={styles.loginSubtitle}>Nhập thông tin để tạo tài khoản</p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Form Row 1 */}
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="username">
                                Tên người dùng
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Nhập tên người dùng"
                                style={styles.formInput}
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

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
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Form Row 2 */}
                    <div style={styles.formRow}>
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
                                onChange={handleChange}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="phoneNumber">
                                Số điện thoại
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                placeholder="Nhập số điện thoại"
                                style={styles.formInput}
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Form Row 3 */}
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="fullName">
                                Họ và tên
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Nhập họ và tên"
                                style={styles.formInput}
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="gender">
                                Giới tính
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                style={styles.formInput}
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                    </div>

                    {/* Form Row 4 */}
                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="address">
                                Địa chỉ
                            </label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                placeholder="Nhập địa chỉ"
                                style={styles.formInput}
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label} htmlFor="dateOfBirth">
                                Ngày sinh
                            </label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                style={styles.formInput}
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Checkbox */}
                    <div style={styles.formCheckbox}>
                        <input
                            id="agreeTerms"
                            name="agreeTerms"
                            type="checkbox"
                            style={styles.checkboxInput}
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                        />
                        <label htmlFor="agreeTerms">
                            Tôi hoàn toàn đồng ý với điều khoản
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" style={styles.loginButton}>
                        Đăng ký
                    </button>
                </form>

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
                    onClick={() => (window.location.href = "/")}>
                    Quay về trang chủ
                </button>

                {/* Signup Link */}
                <p style={styles.signupLink}>
                    Đã có tài khoản?{" "}
                    <a href="/login" style={styles.loginLinkHighlight}>
                        Đăng nhập ngay!
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
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    loginTitle: {
        fontSize: "2rem",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    loginSubtitle: {
        color: "#666",
        marginBottom: "30px",
    },
    formRow: {
        display: "flex",
        gap: "80px",
        marginBottom: "20px",
    },
    formGroup: {
        flex: 1,
    },
    label: {
        display: "block",
        marginBottom: "5px",
        color: "#333",
        fontWeight: "600",
    },
    formInput: {
        width: "100%",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        
        
    },
    formCheckbox: {
        display: "flex",
        alignItems: "center",
        marginBottom: "20px",
    },
    checkboxInput: {
        marginRight: "10px",
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
    googleIcon: {
        width: "20px",
        height: "20px",
        marginRight: "10px",
    },
    signupLink: {
        marginTop: "20px",
        textAlign: "center",
        color: "#666",
    },
    loginLinkHighlight: {
        color: "#007bff",
        textDecoration: "none",
    },
    loginImageContainer: {
        flex: 0.8,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderRadius: "20px 0 0 20px",
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
};

export default SignupPage;
