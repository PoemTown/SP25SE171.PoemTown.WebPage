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
} from "antd";
import Headeruser from "../components/Headeruser";
import axios from "axios";

const { Content } = Layout;

const ChangePassword = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
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

        fetchUserProfile();
    }, []);

    const onFinish = async (values) => {
        if (values.confirm !== values.newPassword) {
            notification.error({
                message: "Lỗi",
                description: "Mật khẩu xác nhận không trùng với mật khẩu mới!",
            });
        } else {
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
            } catch (error) {
                notification.error({
                    message: "Lỗi",
                    description: "Mật khẩu hiện tại không đúng!",
                });
            }
        }
    };

    return (
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
                    title="Chỉnh sửa hồ sơ"
                    style={{ width: "100%", maxWidth: 900 }}
                    headStyle={{ fontSize: "22px", fontWeight: "bold" }}
                >
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
                                            {/* <Input type="password" placeholder="Nhập mật khẩu hiện tại" /> */}
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            name="newPassword"
                                            label="Mật khẩu mới"

                                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
                                        >
                                            <Input.Password placeholder="Nhập mật khẩu mới" visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            name="confirm" label="Xác nhận mật khẩu mới"
                                            rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu vừa nhập" }]}
                                        >
                                            <Input.Password placeholder="Xác nhận mật khẩu vừa nhập" visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }} />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item style={{ textAlign: "center", marginTop: 24 }}>
                                    <Button type="primary" htmlType="submit" size="large">
                                        Lưu thay đổi
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </Card>
            </Content>
        </Layout>
    );
};

export default ChangePassword;
