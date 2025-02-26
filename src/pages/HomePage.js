import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headerdefault from "../components/Headerdefault";
import Headeruser from "../components/Headeruser";
import Footer from "../components/Footer";
import Content from "../components/componentHomepage/Content";
import { useParams } from "react-router-dom";
import { Modal } from "antd";

const Homepage = () => {
  const [activeTab, setActiveTab] = useState("latest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const {tab} = useParams();
  const currentTab = tab || "lastest";

  useEffect(() => {
    const currentTab = window.location.pathname.split('/')[1] || 'latest';
    setActiveTab(currentTab);
  }, [currentTab]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  }


  const handleTabClick = (newTab) => {
    console.log(newTab);
    
    if ((newTab === "bookmark" || newTab === "yourpage") && isLoggedIn === false) {
      showModal();
      return;
    } 
    
    navigate(`/${newTab}`);
    setActiveTab(newTab);
    
    if (newTab === "yourpage") {
      navigate("/userpage");
    }
  };

  return (
    <div style={styles.container}>
      {isLoggedIn ? <Headeruser /> : <Headerdefault />}
      <Modal open={isModalOpen} onCancel={handleCancel} footer={() => (
        <>
          <button style={styles.signupButton} onClick={handleSignup}>
            Đăng ký
          </button>
          <button style={styles.loginButton} onClick={handleLogin}>
            Đăng nhập
          </button>

        </>
      )}>
        <h2 style={{ textAlign: "center", color: "red", fontSize: "1.8rem" }}>Vui lòng đăng nhập để sử dụng</h2>
        <img alt="Access Denied" style={{ margin: "0 15%", width: "70%" }} src="./access_denied_nofitication.png" />
      </Modal>
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>PoemTown</h1>
          <p style={styles.subtitle}>
            Thị trấn mơ mộng kết nối những người có tâm hồn yêu thơ
          </p>
          
        </div>
        <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search"
              style={styles.searchInput}
            />
          </div>
      </section>

      <nav style={styles.navbar}>
        <ul style={styles.navList}>
          {navTabs.map((tabItem) => (
            <li
              key={tabItem.key}
              style={{
                ...styles.navItem,
                ...(activeTab === tabItem.key ? styles.navLinkActive : {}),
              }}
            >
              <a
                href={`/${tabItem.key}`}
                style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick(tabItem.key);
                }}
              >
                {tabItem.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div style={styles.content}>
      <Content activeTab={activeTab} />
      </div>
      <Footer />
    </div>
  );
};

const navTabs = [
  { key: "latest", label: "Mới nhất", href: "#latest" },
  { key: "trending", label: "Trending", href: "#trending" },
  { key: "collections", label: "Bộ sưu tập", href: "#collections" },
  { key: "bookmark", label: "Bookmark", href: "#bookmark" },
  { key: "audioread", label: "AudioRead", href: "#audioread" },
  { key: "community", label: "Tuyển tập cộng đồng", href: "#community" },
  { key: "yourpage", label: "Trang của bạn", href: "#yourpage" },
];

// CSS Styles
const styles = {
  loginButton: {
    backgroundColor: "#4A90E2",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  signupButton: {
    backgroundColor: "#F5A623",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "20px"
  },

  container: {
    fontFamily: "'Arial', sans-serif",
    margin: "0",
  },
  main: {
    padding: "20px",
    textAlign: "center",
  },
  heading: {
    fontSize: "36px",
    color: "#333",
    marginBottom: "20px",
  },
  paragraph: {
    fontSize: "18px",
    color: "#555",
    lineHeight: "1.6",
  },
  heroSection: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start", 
    maxHeight: "295px",
    height: "26vh",
    backgroundImage: "url('./background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: "40px",
    color: "#fff",
  },
  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "400px",
  },
  
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    borderBottom: "1px solid #ffffff",
    paddingBottom: "10px",
    marginBottom: "10px",
    margin: "0",
  },
  subtitle: {
    fontSize: "16px",
    margin: "0",
  },
  searchBox: {
    marginTop: "10px",
    display: "flex",
    width: "50%",
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
  },
  navbar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "stretch",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ccc",
    minHeight: "60px",
  },
  navList: {
    listStyleType: "none",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    margin: 0,
    padding: 0,
  },
  navItem: {
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "93%", 
    
  },
  navLink: {
    textDecoration: "none",
    color: "#333",
    padding: "5px 10px",
    borderBottom: "2px solid transparent",
    transition: "border-bottom 0.3s",
  },
  navLinkActive: {
    borderBottom: "5px solid #4E9FE5",
    borderRadius: "0px",
    color: "#000",
    fontWeight: "bolder",
  },
  content: {
      margin: "0px 129px"
  }
};

export default Homepage;
