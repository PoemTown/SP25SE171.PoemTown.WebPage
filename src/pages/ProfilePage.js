import React, { useEffect, useState } from "react";
import { Avatar, Button, Input, Select, DatePicker, Spin, message, Divider, Row, Col, Card, Typography } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import Headeruser from "../components/Headeruser";
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from "dayjs";

const { Option } = Select;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const navigate = useNavigate();

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

      // if (!response.ok) {
      //   throw new Error("Failed to fetch user profile");
      // }

      const data = await response.json();
      setUser(data.data);
      setFormData(data.data);
    } catch (error) {
      message.error("Error fetching profile data!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {


    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(user);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const requiredFields = [
      'fullName',
      'address',
      'userName',
      'phoneNumber',
      'displayName'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      message.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    const updatedData = {
      ...formData,
      avatar: sessionStorage.getItem("profileImage") || formData.avatar,
    };

    localStorage.setItem("username", updatedData.userName);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/users/v1/mine/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(updatedData),
        }
      );


      const data = await response.json();
      if (data.statusCode === 400) {
        switch (data.errorMessage) {
          case "User name already exist":
            message.error("Username này đã tồn tại");
            break;
        }
      }
      else {
        setUser(data.data);
        setIsEditing(false);
        message.success("Cập nhật thông tin cá nhân thành công!");

        sessionStorage.removeItem("profileImage");
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
        fetchUserProfile();
      }
    } catch (error) {
      message.error("Đã xảy ra lỗi khi cập nhật thông tin cá nhân!");
      console.error(error);
    }
  };


  const handleAvatarClick = () => {
    if (isEditing) {
      document.getElementById("avatarInput").click();
    }
  };

  const handleAvatarChange = async (event) => {
    setLoading(true);
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatarFile(imageUrl);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/users/v1/mine/profile/image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          message.error("Lỗi khi tải hình ảnh");
          return
        }

        const data = await response.json();
        const uploadedImageUrl = data.data;

        message.success("Hình ảnh được tải thành công!");
        sessionStorage.setItem("profileImage", uploadedImageUrl);
        setFormData((prev) => ({ ...prev, avatar: uploadedImageUrl }));
        setAvatarFile(uploadedImageUrl);
      } finally {
        // This will run regardless of success or failure
        setLoading(false);
      }
    } else {
      // If no file is selected, stop the loading indicator
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <p style={{ textAlign: "center", color: "red" }}></p>
    );
  }


  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Headeruser />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <UserOutlined style={{ marginRight: '10px', color: '#1890ff' }} />
              <span style={{fontWeight: 'bold'}}>Thông tin cá nhân</span>
            </div>
          }
          extra={
            !isEditing ? (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                Chỉnh sửa
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button icon={<CloseOutlined />} onClick={handleCancel}>
                  Hủy
                </Button>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  Lưu
                </Button>
              </div>
            )
          }
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={6} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                onClick={handleAvatarClick}
                style={{
                  position: 'relative',
                  cursor: isEditing ? 'pointer' : 'default',
                  marginBottom: '20px'
                }}
              >
                <Avatar
                  size={150}
                  src={avatarFile || user.avatar || "https://via.placeholder.com/150"}
                  icon={<UserOutlined />}
                  style={{
                    border: '3px solid #1890ff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                {isEditing && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: '#1890ff',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EditOutlined />
                  </div>
                )}
              </div>
              <input
                type="file"
                id="avatarInput"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <h3 style={{ marginTop: '10px', marginBottom: 0 }}>{formData.displayName || 'User'}</h3>
              <p style={{ color: '#666', marginBottom: 0 }}>@{formData.userName}</p>
            </Col>

            <Col xs={24} md={18}>
              <Divider orientation="left" plain style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#006d75',
                marginBottom: '24px',
                marginTop: '16px'
              }}>Thông tin tài khoản</Divider>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên đầy đủ</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      disabled={!isEditing}
                      size="large"
                      required
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Tên hiển thị</label>
                    <Input
                      value={formData.displayName}
                      onChange={(e) => handleChange("displayName", e.target.value)}
                      disabled={!isEditing}
                      size="large"
                      required
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Username 
                    <span style={{ color: '#888', fontWeight: '400' }}> (Đây là mã tên để người khác tìm kiếm bạn)</span>
                    </label>
                    
                    <Input
                      value={formData.userName}
                      onChange={(e) => handleChange("userName", e.target.value)}
                      disabled={!isEditing}
                      size="large"
                      required
                      addonBefore="@"
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Số điện thoại</label>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits (no letters, no negative sign)
                        if (/^\d*$/.test(value)) {
                          handleChange("phoneNumber", value);
                        }
                      }}
                      disabled={!isEditing}
                      size="large"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={(10)}
                      required
                    />
                  </div>
                </Col>
              </Row>

              <Divider orientation="left" plain style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#006d75',
                marginBottom: '24px',
                marginTop: '16px'
              }}>Thông tin chi tiết</Divider>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Giới tính</label>
                    <Select
                      value={formData.gender}
                      onChange={(value) => handleChange("gender", value)}
                      disabled={!isEditing}
                      style={{ width: '100%' }}
                      size="large"
                    >
                      <Option value="Male">Nam</Option>
                      <Option value="Female">Nữ</Option>
                      <Option value="Other">Khác</Option>
                    </Select>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Ngày sinh</label>
                    <DatePicker
                      value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                      onChange={(date, dateString) => handleChange("dateOfBirth", dateString)}
                      format="YYYY-MM-DD"
                      disabled={!isEditing}
                      style={{ width: '100%' }}
                      size="large"
                      disabledDate={(current) => current && current > dayjs().endOf('day')}
                    />
                  </div>
                </Col>
                <Col xs={24}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Địa chỉ</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      disabled={!isEditing}
                      size="large"
                      required
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );

};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "auto",
    width: "auto",
    backgroundColor: "#fff",
    padding: "40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    maxWidth: "800px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
  },
  avatar: {
    border: "2px solid #ddd",
    cursor: "pointer"
  },
  form: {
    width: "80%",
    maxWidth: "800px",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: "10px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  input: {
    flex: 1,
    borderRadius: "8px",
  },
  select: {
    width: "100%",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  editButton: {
    backgroundColor: "#1890ff",
    borderColor: "#1890ff",
    color: "#fff",
    borderRadius: "6px",
  },
  cancelButton: {
    backgroundColor: "#fff",
    color: "#d9534f",
    borderColor: "#d9534f",
    borderRadius: "6px",
  },
  saveButton: {
    backgroundColor: "#52c41a",
    borderColor: "#52c41a",
    borderRadius: "6px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default ProfilePage;
