import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headerdefault from "../components/Headerdefault";
import Headeruser from "../components/Headeruser";
import Footer from "../components/Footer";
import Content from "../components/componentHomepage/Content";

const Homepage = () => {
  const [activeTab, setActiveTab] = useState("latest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "yourpage") {
      navigate("/userpage");
    }
  };

  return (
    <div style={styles.container}>
      {isLoggedIn ? <Headeruser /> : <Headerdefault />}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.title}>PoemTown</h1>
          <p style={styles.subtitle}>
            Thị trấn mơ mộng kết nối những người có tâm hồn yêu thơ
          </p>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search"
              style={styles.searchInput}
            />
          </div>
        </div>
      </section>

      <nav style={styles.navbar}>
        <ul style={styles.navList}>
          {navTabs.map((tab) => (
            <li
              key={tab.key}
              style={{
                ...styles.navItem,
                ...(activeTab === tab.key ? styles.navLinkActive : {}),
              }}
            >
              <a
                href={tab.key === "yourpage" ? undefined : tab.href}
                style={styles.navLink}
                onClick={(e) => {
                  e.preventDefault();
                  handleTabClick(tab.key);
                }}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Content />
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
  container: {
    fontFamily: "'Arial', sans-serif",
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
    position: "relative",
    height: "30vh",
    backgroundImage: "url('./background.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    padding: "20px",
  },
  heroContent: {
    position: "absolute",
    top: "20px",
    left: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "400px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    margin: "0",
  },
  subtitle: {
    fontSize: "16px",
    margin: "0",
  },
  searchBox: {
    marginTop: "10px",
    display: "flex",
    width: "100%",
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
    backgroundColor: "#fff",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "10px 20px",
    marginTop: "10px",
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
  },
  navLink: {
    textDecoration: "none",
    color: "#333",
    padding: "5px 10px",
    borderBottom: "2px solid transparent",
    transition: "border-bottom 0.3s",
  },
  navLinkActive: {
    borderBottom: "2px solid #000",
    color: "#000",
    fontWeight: "bolder",
  },
};

export default Homepage;
