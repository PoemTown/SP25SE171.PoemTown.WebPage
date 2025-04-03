import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Badge, List } from "antd";
import { useSignalR } from "../SignalR/SignalRContext";
import { jwtDecode } from 'jwt-decode';

const Headeruser = () => {
  const navigate = useNavigate();
  const roles = JSON.parse(localStorage.getItem("role")) || [];
  const access_token = localStorage.getItem("accessToken");
  const { announcements, setAnnouncements, createAnnouncementConnection, announcementConnection } = useSignalR();

  let userId = null;

  const fetchAnnouncements = async (access_token) => {
    try {
      const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/announcements/v1/mine", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch announcements");

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    if (!access_token) {
      navigate("/login");
      return;
    }

    const decodedToken = jwtDecode(access_token);
    userId = decodedToken.UserId;

    const fetchData = async () => {
      const data = await fetchAnnouncements(access_token);
      setAnnouncements(data);  // Now this happens outside the async function
    };

    fetchData();

    if (!announcementConnection && userId) {
      createAnnouncementConnection(userId);
    }
  }, [announcements, userId, createAnnouncementConnection]);

  const handleNotificationClick = async (notif) => {
    console.log("Notification clicked:", notif);
    try {
      const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/announcements/v1/${notif.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to update notification status");
      }
      console.log("Notification updated successfully");
      setAnnouncements(prev => prev.filter(item => item.id !== notif.id));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const notificationMenu = (
    <Menu style={{ width: 300 }}>
      {announcements != null ? (
        <List
          dataSource={announcements}
          renderItem={(notif, index) => (
            <Menu.Item key={index} onClick={() => handleNotificationClick(notif)}>
              <div style={{ padding: "5px 10px", backgroundColor: notif.isRead ? 'transparent' : 'red', color: notif.isRead ? 'initial' : '#fff' }}>
                <strong style={{ color: "#4A90E2" }}>{notif.title}</strong>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#555" }}>{notif.content}</p>
                <hr style={{ margin: "5px 0", border: "0.5px solid #ddd" }} />
              </div>
            </Menu.Item>
          )}
        />
      ) : (
        <Menu.Item>
          <p style={{ textAlign: "center", padding: "10px" }}>Không có thông báo mới</p>
        </Menu.Item>
      )}
    </Menu>
  );

  const menuItems = [
    { key: "profile", label: "Profile", onClick: () => navigate("/profile") },
    { key: "logout", label: "Logout", onClick: () => { localStorage.clear(); navigate("/"); window.location.reload(); } },
  ];

  const menu = <Menu items={menuItems} />;

  return (
    <header style={styles.header}>
      <div style={styles.logo} onClick={() => navigate("/")}>
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="PoemTown Logo" style={styles.logoImage} />
      </div>
      <nav style={styles.nav}>
        <a href="/latest" style={styles.navLink}>Trang chủ</a>
        <a href="#about-poemtown" style={styles.navLink}>Về PoemTown</a>
        <a href="#about-us" style={styles.navLink}>Về chúng tôi</a>
        {roles.includes("ADMIN") && <a style={styles.navLink} onClick={() => navigate("/admin")}>Dành cho quản trị viên</a>}
        {roles.includes("MODERATOR") && <a style={styles.navLink} onClick={() => navigate("/mod")}>Dành cho kiểm duyệt viên</a>}
      </nav>
      <div style={styles.icons}>
        <ShopOutlined style={styles.icon} onClick={() => navigate("/shop")} />
        <Dropdown overlay={notificationMenu} trigger={["click"]} placement="bottomRight">
          <Badge count={announcements != null ? announcements.length : 0} overflowCount={9}>
            <BellOutlined style={styles.icon} />
          </Badge>
        </Dropdown>
        <Dropdown overlay={menu} trigger={["click"]}>
          <UserOutlined style={{ ...styles.icon, cursor: "pointer" }} />
        </Dropdown>
      </div>
    </header>
  );
};

const styles = {
  header: { height: "80px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0px 20px", backgroundColor: "#fff", borderBottom: "1px solid #ddd", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", flexWrap: "wrap", gap: "10px", cursor: "pointer" },
  logo: { flex: "1", display: "flex", justifyContent: "flex-start", cursor: "pointer" },
  logoImage: { height: "60px" },
  nav: { flex: "2", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" },
  navLink: { textDecoration: "none", fontSize: "16px", color: "#333", fontWeight: "bold", padding: "5px 10px" },
  icons: { flex: "1", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "20px" },
  icon: { fontSize: "24px", color: "#4A90E2", cursor: "pointer" },
};

export default Headeruser;