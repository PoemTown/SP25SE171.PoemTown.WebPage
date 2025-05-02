import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopOutlined, BellOutlined, UserOutlined, ShopTwoTone } from "@ant-design/icons";
import { Dropdown, Menu, Badge, List, message, Avatar } from "antd";
import { useSignalR } from "../SignalR/SignalRContext";
import { jwtDecode } from 'jwt-decode';
import ChatDropdown from "../pages/User/Chat/ChatDropdown";
import { FcShop } from "react-icons/fc";

const Headeruser = ({ userData }) => {
  const navigate = useNavigate();
  const roles = JSON.parse(localStorage.getItem("role")) || [];
  const access_token = localStorage.getItem("accessToken");
  const username = localStorage.getItem("username");
  const avatarUrl = JSON.parse(localStorage.getItem("avatar"));
  const { announcements, setAnnouncements, createAnnouncementConnection, announcementConnection } = useSignalR();

  const [refreshKey, setRefreshKey] = useState(0);
  const [userId, setUserId] = useState(null);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/announcements/v1/mine`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`
        }
      });

      if (!response.ok) message.error("Failed to fetch announcements");

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  // Initialize the connection after user is decoded
  useEffect(() => {
    if (access_token != null) {
      const decodedToken = jwtDecode(access_token);
      setUserId(decodedToken.UserId);

      if (!announcementConnection && userId) {
        createAnnouncementConnection(userId);
      }
    }
  }, [access_token, announcementConnection, createAnnouncementConnection, navigate]);

  // Fetch announcements after userId is set
  useEffect(() => {
    if (userId) {
      fetchAnnouncements().then((data) => {
        setAnnouncements(data);
      });
    }
  }, [userId, setAnnouncements]);

  // Handle notification click to mark as read
  const handleNotificationClick = async (notif) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/announcements/v1/${notif.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
      });
      if (!response.ok) {
        message.error("Failed to update notification status");
      }

      setAnnouncements(prev => prev.map(item =>
        item.id === notif.id ? { ...item, isRead: true } : item
      ));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const notificationMenu = (
    <Menu style={{ width: 320, borderRadius: "10px", padding: "10px", backgroundColor: "#f9f9f9", boxShadow: "0px 4px 8px rgba(0,0,0,0.2)" }}>
      {announcements && announcements.length > 0 ? (
        <List
          dataSource={announcements}
          renderItem={(notif, index) => (
            <Menu.Item key={index} onClick={() => { if (!notif.isRead) handleNotificationClick(notif); }} style={{ padding: 0 }}>
              <div
                style={{
                  padding: "10px",
                  marginBottom: "5px",
                  borderRadius: "8px",
                  backgroundColor: notif.isRead ? "#fff" : "#FFE5E5",
                  transition: "background 0.3s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  if (!notif.isRead) {
                    handleNotificationClick(notif);
                  }
                  e.currentTarget.style.backgroundColor = notif.isRead ? "#f0f0f0" : "#FFC7C7";
                }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.isRead ? "#fff" : "#FFE5E5"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <BellOutlined style={{ fontSize: "18px", color: "#000" }} />
                  <div>
                    <strong style={{ color: "#333", fontSize: "16px" }}>{notif.title}</strong>
                    <p style={{ margin: "5px 0 0", fontSize: "14px", color: "#555" }}>{notif.content}</p>
                  </div>
                </div>
              </div>
            </Menu.Item>
          )}
        />
      ) : (
        <Menu.Item>
          <p style={{ textAlign: "center", padding: "10px", color: "#777" }}>Không có thông báo mới</p>
        </Menu.Item>
      )}
    </Menu>
  );

  const menu = (
    <Menu
      style={{
        width: 220,
        borderRadius: 10,
        padding: "10px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      <Menu.Item disabled style={{ padding: "10px 12px", cursor: "default", borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Avatar
            src={avatarUrl}
            icon={!avatarUrl && <UserOutlined />}
            style={{ backgroundColor: !avatarUrl ? "#000" : "transparent" }}
          />
          <div>
            <div style={{ fontWeight: "bold", fontSize: "15px", color: "black" }}>Xin chào {username}</div>
          </div>
        </div>
      </Menu.Item>

      <Menu.Item
        key="profile"
        onClick={() => navigate("/profile")}
        style={{ padding: "10px 16px", fontSize: "14px", fontWeight: 500 }}
      >
        Hồ sơ người dùng
      </Menu.Item>
      <Menu.Item
        key="change-password"
        onClick={() => navigate("/change-password")}
        style={{ padding: "10px 16px", fontSize: "14px", fontWeight: 500 }}
      >
        Thay đổi mật khẩu
      </Menu.Item>
      <Menu.Item
        key="logout"
        onClick={() => {
          localStorage.clear();
          navigate("/");
          window.location.reload();
        }}
        style={{
          padding: "10px 16px",
          color: "#f5222d",
          fontWeight: 500,
          fontSize: "14px",
          borderTop: "1px solid #f0f0f0",
          marginTop: "8px"
        }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={() => navigate("/")}>
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="PoemTown Logo" style={styles.logoImage} />
      </div>
      <nav style={styles.nav}>
        <a href="/latest" style={styles.navLink}>Trang chủ</a>
        <a href="/about-poemtown" style={styles.navLink}>Về PoemTown</a>
        <a href="/knowledge" style={styles.navLink}>Tàng thư trí tuệ</a>
        <a href="/poetsamples" style={styles.navLink}>Thi nhân kiệt xuất</a>
        {roles.includes("ADMIN") && <a style={styles.navLink} onClick={() => navigate("/admin")}>Dành cho quản trị viên</a>}
        {roles.includes("MODERATOR") && <a style={styles.navLink} onClick={() => navigate("/mod")}>Dành cho kiểm duyệt viên</a>}
      </nav>
      <div style={styles.icons}>
        <FcShop style={{ ...styles.icon, color: "#000" }} onClick={() => navigate("/shop")} />
        <ChatDropdown userData={userData} refreshKey={refreshKey} setRefreshKey={setRefreshKey} />
        <Dropdown overlay={notificationMenu} trigger={["click"]} placement="bottomRight">
          <Badge count={announcements?.filter(notif => !notif.isRead).length || 0} overflowCount={9}>
            <BellOutlined style={{ ...styles.icon, color: "#7d6b58", fontSize: "21px" }} />
          </Badge>
        </Dropdown>
        <Dropdown overlay={menu} trigger={["click"]}>
          <Avatar
            src={avatarUrl}
            icon={!avatarUrl && <UserOutlined />}
            style={{
              cursor: "pointer",
              backgroundColor: !avatarUrl ? "#000" : "transparent",
              color: "#fff" // Thêm màu chữ trắng cho icon UserOutlined
            }}
          />
        </Dropdown>
      </div>
    </header>
  );
};

const styles = {
  header: {
    height: "80px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    flexWrap: "wrap",
    gap: "10px",
    cursor: "pointer"
  },
  logo: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-start",
    cursor: "pointer"
  },
  logoImage: {
    height: "50px"
  },
  nav: {
    flex: "2",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  navLink: {
    textDecoration: "none",
    fontSize: "0.9rem",
    color: "#333",
    fontWeight: "bold",
    padding: "5px 10px"
  },
  icons: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "20px"
  },
  icon: {
    fontSize: "24px",
    color: "#7d6b58",
    cursor: "pointer"
  },
};

export default Headeruser;