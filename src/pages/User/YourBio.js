import { Button, message, Card, Avatar, Typography, Space, Divider } from "antd";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./ReactQuillNoMargin.css";
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { EditOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const YourBio = (props) => {
    const { userData, displayName, isMine } = props;
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(userData.bio || "");

    const handleSave = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            message.error("Bạn cần đăng nhập để sử dụng chức năng này!");
            return;
        }

        try {
            const requestBody = {
                fullName: userData.fullName,
                gender: userData.gender,
                address: userData.address,
                dateOfBirth: userData.dateOfBirth,
                userName: userData.userName,
                phoneNumber: userData.phoneNumber,
                avatar: userData.avatar,
                displayName: displayName,
                bio: bio,
            };

            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/users/v1/mine/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await response.json();
            console.log("Update response:", data);
            if (!response.ok) {
                throw new Error("Failed to update the bio");
            }

            if (data.statusCode === 202) {
                message.success("Cập nhật thành công");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            message.error("Có lỗi xảy ra khi cập nhật profile!");
        }
    };

    const getGenderText = (gender) => {
        const lowerGender = gender.toLowerCase();
        if (lowerGender === "male") return "Nam";
        if (lowerGender === "female") return "Nữ";
        return gender;
    };

    return (
        <Card
            style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                border: "none",
            }}
            bodyStyle={{ padding: "24px" }}
        >
            {/* Profile Header */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <Title level={3} style={{ marginBottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Space>
                        Thông tin cá nhân
                        <FaUserCircle style={{ color: "#1890ff" }} />
                    </Space>
                </Title>
            </div>

            {/* Profile Content */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {/* Avatar Section */}
                <div style={{ flex: "0 0 auto" }}>
                    <Avatar
                        src={userData.avatar}
                        icon={<UserOutlined />}
                        size={160}
                        style={{
                            border: "3px solid #f0f0f0",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    />
                </div>

                {/* User Info Section */}
                <div style={{ flex: "1 1 300px" }}>
                    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                        <div>
                            <Title level={4} style={{ marginBottom: "2px" }}>
                                {displayName}
                            </Title>
                            <Text type="secondary">@{userData.userName}</Text>
                        </div>

                        <Space direction="vertical" size="small">
                            <Paragraph style={{ marginBottom: 0 }}>
                                <Text strong>Ngày sinh: </Text>
                                <Text>{userData.dateOfBirth || "Chưa cập nhật"}</Text>
                            </Paragraph>
                            <Paragraph style={{ marginBottom: 0 }}>
                                <Text strong>Giới tính: </Text>
                                <Text>{getGenderText(userData.gender)}</Text>
                            </Paragraph>
                            <Paragraph style={{ marginBottom: 0 }}>
                                <Text strong>Địa chỉ: </Text>
                                <Text>{userData.address || "Chưa cập nhật"}</Text>
                            </Paragraph>
                        </Space>
                    </Space>
                </div>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            {/* Bio Section */}
            <div>
                <Title level={4} style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>Tiểu sử</span>
                    <IoIosInformationCircleOutline style={{ color: "#1890ff" }} />
                </Title>

                {isEditing && isMine ? (
                    <>
                        <ReactQuill
                            value={bio}
                            onChange={setBio}
                            style={{
                                borderRadius: "8px",
                                border: "1px solid #d9d9d9",
                                marginBottom: "16px"
                            }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                onClick={handleSave}
                                style={{ borderRadius: "6px" }}
                            >
                                Lưu thay đổi
                            </Button>
                            <Button
                                onClick={() => setIsEditing(false)}
                                style={{ borderRadius: "6px" }}
                            >
                                Hủy bỏ
                            </Button>
                        </Space>
                    </>
                ) : (
                    <>
                        {userData.bio ? (
                            <Card
                                bordered={false}
                                style={{
                                    backgroundColor: "#fafafa",
                                    borderRadius: "8px",
                                    position: "relative"
                                }}
                                bodyStyle={{ padding: "16px" }}
                            >
                                <div
                                    className="bio-content"
                                    dangerouslySetInnerHTML={{ __html: bio }}
                                    style={{ lineHeight: 1.6 }}
                                />
                                {isMine && (
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => setIsEditing(true)}
                                        style={{
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px"
                                        }}
                                    />
                                )}
                            </Card>
                        ) : (
                            <Paragraph type="secondary" style={{ textAlign: "center" }}>
                                {isMine ? (
                                    <Button
                                        type="dashed"
                                        icon={<EditOutlined />}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Thêm tiểu sử
                                    </Button>
                                ) : (
                                    "Người dùng chưa cập nhật tiểu sử"
                                )}
                            </Paragraph>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};

export default YourBio;