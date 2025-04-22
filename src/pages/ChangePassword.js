import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Input,
    Form,
    Row,
    Col,
    Upload,
    message,
    Card,
    Layout,
    Spin,
    notification,
    Typography,
    Space,
} from "antd";
import Headeruser from "../components/Headeruser";
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const { Content } = Layout;

const ChangePassword = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = React.useState(false);
    const [isSubmit, setIsSubmit] = React.useState(false);
    const [key, setKey] = useState(0); // Add this state for forcing re-render
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/users/v1/mine/profile`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            setUser(data.data);
            setAvatarUrl(data.data.avatar || "https://via.placeholder.com/80");
        } catch (error) {
            message.error("Lỗi khi tải thông tin người dùng!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {


        fetchUserProfile();
    }, []);

    const onFinish = async (values) => {
        if (values.confirm !== values.newPassword) {
            notification.error({
                message: "Lỗi",
                description: "Mật khẩu xác nhận không trùng với mật khẩu mới!",
            });
        } else {
            setIsSubmit(true);
            try {
                const response = await axios.put(
                    `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/password`,
                    {
                        currentPassword: values.currentPassword,
                        newPassword: values.newPassword,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const data = response.data;
                console.log(data.data)

                notification.success({
                    message: "Thành công",
                    description: "Thay đổi mật khẩu thành công!",
                });

                setKey(prevKey => prevKey + 1);

            } catch (error) {
                notification.error({
                    message: "Lỗi",
                    description: "Mật khẩu hiện tại không đúng!",
                });
            } finally {
                setIsSubmit(false); // Hide full page spinner
            }
        }
    };
    const handleCancel = () => {
        form.resetFields(); // Reset form inputs
        fetchUserProfile(); // Refetch fresh data from server
    };

    return (
        <div key={key}>
            <Spin spinning={isSubmit} size="large" tip="Đang cập nhật..." style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <Layout>
                    <Headeruser />
                    <Content
                        style={{
                            padding: "40px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Card
                            style={{ width: "100%", maxWidth: 900 }}
                            headStyle={{ fontSize: "22px", fontWeight: "bold" }}
                            bodyStyle={{ padding: "24px" }}
                        >
                            {/* Back button added here */}
                            {/* Back Arrow */}
                            <div
                                onClick={() => navigate('/')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    marginBottom: '16px',
                                    color: '#1890ff',
                                    fontWeight: 500
                                }}
                            >
                                <ArrowLeftOutlined style={{ marginRight: '8px' }} />
                                <span>Quay lại trang chủ</span>
                            </div>

                            <Typography.Title level={2} style={{ marginBottom: 24, marginTop: 0 }}>
                                Chỉnh sửa hồ sơ
                            </Typography.Title>

                            {loading ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <Row justify="center" align="middle" gutter={16} style={{ marginBottom: 32 }}>
                                        <Col>
                                            <Avatar size={80} src={avatarUrl} />
                                        </Col>
                                    </Row>

                                    <Form
                                        layout="vertical"
                                        onFinish={onFinish}
                                    >
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="userName"
                                                    label="Username"
                                                    initialValue={user?.userName}
                                                    rules={[{ message: "Vui lòng nhập Username" }]}
                                                >
                                                    <Input disabled />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="currentPassword"
                                                    label="Mật khẩu hiện tại"
                                                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                                                >
                                                    <Input.Password
                                                        placeholder="Nhập mật khẩu hiện tại"
                                                        visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="newPassword"
                                                    label="Mật khẩu mới"
                                                    rules={[
                                                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                                                    ]}
                                                >
                                                    <Input.Password
                                                        placeholder="Nhập mật khẩu mới"
                                                        visibilityToggle={{ visible: newPasswordVisible, onVisibleChange: setNewPasswordVisible }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={12}>
                                                <Form.Item
                                                    name="confirm"
                                                    label="Xác nhận mật khẩu mới"
                                                    dependencies={['newPassword']}
                                                    rules={[
                                                        { required: true, message: "Vui lòng xác nhận mật khẩu" },
                                                        ({ getFieldValue }) => ({
                                                            validator(_, value) {
                                                                if (!value || getFieldValue('newPassword') === value) {
                                                                    return Promise.resolve();
                                                                }
                                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                                            },
                                                        }),
                                                    ]}
                                                >
                                                    <Input.Password
                                                        placeholder="Xác nhận mật khẩu vừa nhập"
                                                        visibilityToggle={{ visible: newPasswordVisible, onVisibleChange: setNewPasswordVisible }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
                                            <Space>
                                                <Button
                                                    type="default"
                                                    size="large"
                                                    onClick={() => handleCancel()}
                                                >
                                                    Hủy bỏ
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    htmlType="submit"
                                                    size="large"
                                                    loading={isSubmit}
                                                >
                                                    Lưu thay đổi
                                                </Button>
                                            </Space>
                                        </Form.Item>
                                    </Form>
                                </>
                            )}
                        </Card>
                    </Content>
                </Layout>
            </Spin>
        </div>
    );
};

export default ChangePassword;
