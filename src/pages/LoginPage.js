import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import { useSignalR } from "../SignalR/SignalRContext";
import { message, Button, Spin, Modal, Input, Form, Divider } from "antd";
import { LoadingOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isForgotPasswordPopupOpen, setForgotPasswordPopupOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [touched, setTouched] = useState({
        email: false,
        password: false,
    });
    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // SignalR
    const { createAnnouncementConnection } = useSignalR();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleForgotPassword = async () => {
        setIsSending(true);
        setForgotPasswordMessage("");

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/password/recovery`,
                { email: forgotEmail }
            );

            if (response.status === 202) {
                setForgotPasswordMessage("Yêu cầu khôi phục mật khẩu đã được gửi!");
                message.success("Yêu cầu khôi phục mật khẩu đã được gửi!")
                setTimeout(() => {
                    setForgotPasswordPopupOpen(false);
                }, 1500);
            }
        } catch (err) {
            console.error("Password recovery failed:", err.response?.data || err.message);
            setForgotPasswordMessage("Không thể gửi yêu cầu, vui lòng kiểm tra lại email.");
            message.error("Không thể gửi yêu cầu, vui lòng kiểm tra lại email!")
        } finally {
            setIsSending(false);
        }
    };

    const handleEmailVerification = async (email) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/accounts/v1/email/otp`, { email: email });

            if (response.status === 202) {
                message.success("Đã gửi email xác nhận, vui lòng kiểm tra hộp thư đến!");
                navigate("/confirm-email", { state: { email } });
            } else {
                message.error("Có lỗi khi gửi yêu cầu xác nhận email. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error sending OTP for email confirmation:", error);
            message.error("Có lỗi khi gửi yêu cầu xác nhận email. Vui lòng thử lại!");
        }
    };

    const handleSubmit = async (e) => {
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/authentications/v1/authentication`,
                formData
            );

            if (response.status === 200) {
                const { accessToken, refreshToken, role, avatar } = response.data?.data;

                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("role", JSON.stringify(role));
                localStorage.setItem("avatar", JSON.stringify(avatar));
                console.log("Login successful:", response.data?.message);

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

                createAnnouncementConnection(jwtDecode.UserId);
            }
        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            if (err.response?.data?.statusCode === 401) {
                switch (err.response?.data?.errorMessage) {
                    case "Password is incorrect":
                        message.error("Mật khẩu không chính xác.");
                        break;
                    case "User not found":
                        message.error("Người dùng không tồn tại.");
                        break;
                    case "Email is not confirmed":
                        Modal.confirm({
                            title: 'Tài khoản chưa được kích hoạt.',
                            content: 'Bạn chưa xác nhận email, hãy nhấn nút xác nhận bên dưới xác nhận email.',
                            okText: 'Xác nhận',
                            cancelText: 'Hủy',
                            onOk: () => handleEmailVerification(formData.email),
                        });
                        break;
                    case "Account is locked, please contact admin":
                        message.error("Tài khoản bạn đã bị khóa, xin vui lòng liên hệ với quản trị viên.");
                        break;
                    default:
                        message.error("Email hoặc mật khẩu không chính xác.");
                        break;
                }
            }
            else {
                message.error("Đã có lỗi xảy ra, vui lòng thử lại sau !");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Spin spinning={loading} size="large" tip="Đang đăng nhập..." style={{ minHeight: '100vh' }}>
            <div style={styles.loginContainer}>
                <div style={styles.formWrapper}>
                    <div style={styles.header}>
                        <div style={styles.logoContainer}>
                            <img
                                src="/logo.png"
                                alt="Logo"
                                style={styles.logo}
                            />
                        </div>
                        <h1 style={styles.title}>Cánh cửa cũ mở chào người xưa trở lại</h1>
                        <p style={styles.subtitle}>Một bước đăng nhập – ta tiếp chuyện cùng nhau.</p>
                    </div>

                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            label="Email"
                            validateStatus={touched.email && !formData.email ? 'error' : ''}
                            help={touched.email && !formData.email && 'Email không được để trống'}
                        >
                            <Input
                                prefix={<MailOutlined style={styles.inputIcon} />}
                                size="large"
                                placeholder="Nhập email của bạn"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={() => setTouched({ ...touched, email: true })}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            validateStatus={touched.password && !formData.password ? 'error' : ''}
                            help={touched.password && !formData.password && 'Mật khẩu không được để trống'}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={styles.inputIcon} />}
                                size="large"
                                placeholder="Nhập mật khẩu"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                onBlur={() => setTouched({ ...touched, password: true })}
                            />
                        </Form.Item>

                        <div style={styles.forgotPassword}>
                            <Button
                                type="link"
                                onClick={() => setForgotPasswordPopupOpen(true)}
                                style={styles.linkButton}
                            >
                                Quên mật khẩu?
                            </Button>
                        </div>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                style={styles.submitButton}
                                disabled={!formData.email || !formData.password}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                size="large"
                                ghost
                                block
                                loading={loading}
                                style={{
                                    ...styles.submitButton,
                                    ...(isHovered ? {
                                        color: '#40a9ff',
                                        borderColor: '#40a9ff',
                                        backgroundColor: 'rgba(24, 144, 255, 0.1)'
                                    } : {})
                                }}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={() => { navigate('/') }}
                            >
                                Quay về trang chủ
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider style={styles.divider}>Hoặc tiếp tục với</Divider>

                    <div style={styles.footer}>
                        <span style={styles.footerText}>Chưa có tài khoản? </span>
                        <Button
                            type="link"
                            href="/signup"
                            style={styles.signupLink}
                        >
                            Đăng ký ngay
                        </Button>
                    </div>
                </div>

                <div style={{ ...styles.imageSection, backgroundImage: `url('./Login.jpg')`, }} >
                    <div style={styles.imageOverlay} >
                        <h2 style={styles.imageTitle}>Khám phá thế giới mới</h2>
                        <p style={styles.imageText}>Kết nối với cộng đồng và trải nghiệm những điều tuyệt vời</p>
                    </div>
                </div>

                <Modal
                    title="Khôi phục mật khẩu"
                    visible={isForgotPasswordPopupOpen}
                    onCancel={() => setForgotPasswordPopupOpen(false)}
                    footer={null}
                    centered
                >
                    <Form layout="vertical">
                        <Form.Item label="Email">
                            <Input
                                placeholder="Nhập email đăng ký"
                                size="large"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                            />
                        </Form.Item>
                        <Button
                            type="primary"
                            block
                            size="large"
                            loading={isSending}
                            onClick={handleForgotPassword}
                        >
                            Gửi yêu cầu
                        </Button>
                    </Form>
                </Modal>
            </div>
        </Spin>
    );
}

const styles = {
    loginContainer: {
        display: 'flex',
        minHeight: '100vh',
    },
    formWrapper: {
        flex: 1,
        maxWidth: 520,
        padding: 48,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    header: {
        marginBottom: 40,
        textAlign: 'center',
    },
    logoContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logo: {
        height: 80,
        width: 'auto',
        objectFit: 'contain',
    },
    title: {
        fontSize: 28,
        fontWeight: 600,
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    inputIcon: {
        color: '#1890ff',
        marginRight: 8,
    },
    forgotPassword: {
        textAlign: 'right',
        margin: '-12px 0 24px 0',
    },
    linkButton: {
        padding: 0,
        fontSize: 14,
    },
    submitButton: {
        height: 48,
        fontSize: 16,
        fontWeight: 500,
        transition: 'all 0.3s ease',
    },
    divider: {
        color: '#666',
        margin: '32px 0',
    },
    footer: {
        marginTop: 32,
        textAlign: 'center',
    },
    footerText: {
        color: '#666',
    },
    signupLink: {
        padding: 0,
        fontSize: 14,
    },
    imageSection: {
        flex: 1,
        position: 'relative',
        backgroundImage: "url('./Login.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 48,
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
    },
    imageTitle: {
        fontSize: 28,
        color: '#fff',
        marginBottom: 16,
    },
    imageText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.85)',
    },
    '@media (max-width: 768px)': {
        loginContainer: {
            flexDirection: 'column',
        },
        formWrapper: {
            maxWidth: '100%',
            padding: 24,
            minHeight: '100vh',
        },
        imageSection: {
            display: 'none',
        },
    },
};

export default LoginPage;