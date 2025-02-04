import React from "react";
import { useNavigate } from "react-router-dom";

const Headerdefault = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <img
          src="./logo.png"
          alt="PoemTown Logo"
          style={styles.logoImage}
        />
      </div>
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
      <div style={styles.buttons}>
        <button style={styles.loginButton} onClick={handleLogin}>
          Đăng nhập
        </button>
        <button style={styles.signupButton} onClick={handleSignup}>
          Đăng ký
        </button>
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
  buttons: {
    flex: "1",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  loginButton: {
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#F5A623",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Headerdefault;
