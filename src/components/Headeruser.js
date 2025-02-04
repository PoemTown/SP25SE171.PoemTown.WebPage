import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCartOutlined, NotificationOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";

const Headeruser = () => {
  const navigate = useNavigate();

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
      <div style={styles.logo}>
        <img src="./logo.png" alt="PoemTown Logo" style={styles.logoImage} />
      </div>

      {/* Navigation Links */}
      <nav style={styles.nav}>
        <a href="#home" style={styles.navLink}>
          Trang chủ
        </a>
        <a href="#about-poemtown" style={styles.navLink}>
          Về PoemTown
        </a>
        <a href="#about-us" style={styles.navLink}>
          Về chúng tôi
        </a>
      </nav>

      {/* Icons Section */}
      <div style={styles.icons}>
        <ShoppingCartOutlined style={styles.icon} onClick={() => navigate("/cart")} />
        <NotificationOutlined style={styles.icon} onClick={() => navigate("/notifications")} />
        <Dropdown overlay={menu} trigger={['click']}>
          <UserOutlined style={{ ...styles.icon, cursor: "pointer" }} />
        </Dropdown>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    flexWrap: "wrap",
    gap: "10px",
  },
  logo: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-start",
  },
  logoImage: {
    height: "80px",
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
