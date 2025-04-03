import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShopOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Badge } from "antd";
import { useSignalR } from "../SignalR/SignalRContext"; // Import the hook to access SignalR context
import { jwtDecode } from 'jwt-decode';

const Headeruser = () => {
  const navigate = useNavigate();
  const roles = JSON.parse(localStorage.getItem("role")) || [];
  const access_token = localStorage.getItem("accessToken");

  const { announcements, setAnnouncements, createAnnouncementConnection , announcementConnection} = useSignalR();

  let userId = null;

  // Tạo mới kết nối signalR nếu như hiện tại connection bị mất  
  useEffect(() => {
    // Check xem accessToken có hay không, không thì login
    if(!access_token) {
      navigate("login");
      return null;
    }
  
    const decodedToken = jwtDecode(access_token);
    userId = decodedToken.UserId;
    
    // Tạo mới announcement connection khi đã đăng nhập (userId lấy từ decoded token) nhưng chưa có kết nối
    if (!announcementConnection && userId) {
      createAnnouncementConnection(userId); // Establish connection if not already done
    }
  }, [announcements, userId, createAnnouncementConnection]);

  const handleNotificationClick = () => {
    console.log(announcements);
  };

  const notificationMenu = (
    <Menu>
      {announcements.length > 0 ? (
        announcements.map((notif, index) => (
          <Menu.Item key={index} onClick={handleNotificationClick}>
            <strong>{notif.title}</strong>
            <p>{notif.content}</p>
          </Menu.Item>
        ))
      ) : (
        <Menu.Item>No new notifications</Menu.Item>
      )}
    </Menu>
  );

  const menuItems = [
    {
      key: "profile",
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: "Logout",
      onClick: () => {
        localStorage.clear();
        navigate("/");
        window.location.reload();
      },
    },
  ];

  const menu = <Menu items={menuItems} />;

  return (
    <header style={styles.header}>
      {/* Logo Section */}
      <div style={styles.logo} onClick={() => navigate("/")} >
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="PoemTown Logo" style={styles.logoImage} />
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        <a href="/latest" style={styles.navLink}>
          Trang chủ
        </a>
        <a href="#about-poemtown" style={styles.navLink}>
          Về PoemTown
        </a>
        <a href="#about-us" style={styles.navLink}>
          Về chúng tôi
        </a>
        {roles.includes("ADMIN") && (
          <a style={styles.navLink} onClick={() => navigate("/admin")}>
            Dành cho quản trị viên
          </a>
        )}
        {roles.includes("MODERATOR") && (
          <a style={styles.navLink} onClick={() => navigate("/mod")}>
            Dành cho kiểm duyệt viên
          </a>
        )}
      </nav>

      {/* Icons Section */}
      <div style={styles.icons}>
        <ShopOutlined style={styles.icon} onClick={() => navigate("/shop")} />
        <Dropdown overlay={notificationMenu} trigger={['click']}>
          <Badge>
            <BellOutlined style={styles.icon} />
          </Badge>
        </Dropdown>        <Dropdown overlay={menu} trigger={['click']}>
          <UserOutlined style={{ ...styles.icon, cursor: "pointer" }} />
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
    cursor: "pointer",
  },
  logo: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-start",
    cursor: "pointer",
  },
  logoImage: {
    height: "60px",
  },
  nav: {
    flex: "2",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  navLink: {
    textDecoration: "none",
    fontSize: "16px",
    color: "#333",
    fontWeight: "bold",
    padding: "5px 10px",
  },
  icons: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "20px",
  },
  icon: {
    fontSize: "24px",
    color: "#4A90E2",
    cursor: "pointer",
  },
};

export default Headeruser;
