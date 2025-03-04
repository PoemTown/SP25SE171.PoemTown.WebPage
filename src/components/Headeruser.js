import React from "react";
import { useNavigate } from "react-router-dom";
import { ShopOutlined , BellOutlined , UserOutlined } from "@ant-design/icons";
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
      </nav>

      {/* Icons Section */}
      <div style={styles.icons}>
        <ShopOutlined style={styles.icon} onClick={() => navigate("/shop")}  />
        <BellOutlined style={styles.icon} onClick={() => navigate("/notifications")} />
        <Dropdown overlay={menu} trigger={['click']}>
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
