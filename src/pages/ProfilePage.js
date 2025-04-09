import React, { useEffect, useState } from "react";
import { Avatar, Button, Input, Select, DatePicker, Spin, message } from "antd";
import Headeruser from "../components/Headeruser";
import dayjs from "dayjs";

const { Option } = Select;

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

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
      setUser(data.data);
      setIsEditing(false);
      message.success("Profile updated successfully!");

      sessionStorage.removeItem("profileImage");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      message.error("Error updating profile!");
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
          message.error("Failed to upload image");
          return
        }

        const data = await response.json();
        const uploadedImageUrl = data.data;

        message.success("Avatar updated successfully!");
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
    <div>
      <Headeruser />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Profile</h2>
          <div style={styles.avatarContainer} onClick={handleAvatarClick}>
            <Avatar
              size={80}
              src={avatarFile || user.avatar || "https://via.placeholder.com/80"}
              style={styles.avatar}
            />
            {isEditing && <span style={styles.editOverlay}></span>}
          </div>
          <input
            type="file"
            id="avatarInput"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>
        <div style={styles.form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (isEditing) handleSave();
          }}>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Họ và tên</label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                disabled={!isEditing}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Giới tính</label>
              <Select
                value={formData.gender}
                onChange={(value) => handleChange("gender", value)}
                disabled={!isEditing}
                style={styles.select}
              >
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
                <Option value="Other">Khác</Option>
              </Select>
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Địa chỉ</label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                disabled={!isEditing}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Ngày sinh</label>
              <DatePicker
                value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                onChange={(date, dateString) => handleChange("dateOfBirth", dateString)}
                format="YYYY-MM-DD"
                disabled={!isEditing}
                style={styles.input}
                required={isEditing}
              />
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Username <span style={{ color: "#999" }}>(Đây là mã tên để người khác tìm kiếm bạn)</span></label>
              <Input
                value={formData.userName}
                onChange={(e) => handleChange("userName", e.target.value)}
                disabled={!isEditing}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Số điện thoại</label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                disabled={!isEditing}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputContainer}>
              <label style={styles.label}>Tên hiển thị</label>
              <Input
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                disabled={!isEditing}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.buttonGroup}>
              {!isEditing ? (
                <Button type="primary" style={styles.editButton} onClick={handleEdit}>
                  Edit
                </Button>
              ) : (
                <>
                  <Button style={styles.cancelButton} onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    style={styles.saveButton}
                    htmlType="submit"  // Add this
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
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
