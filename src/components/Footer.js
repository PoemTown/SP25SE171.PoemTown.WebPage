import React from "react";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      {/* Contact Information */}
      <div style={styles.column}>
        <h4 style={styles.heading}>Thông tin liên hệ</h4>
        <div style={styles.icons}>
          <i style={styles.icon} className="fab fa-facebook"></i>
          <i style={styles.icon} className="fab fa-instagram"></i>
          <i style={styles.icon} className="fab fa-discord"></i>
          <i style={styles.icon} className="fas fa-envelope"></i>
        </div>
      </div>

      {/* Policies */}
      <div style={styles.column}>
        <h4 style={styles.heading}>Chính sách</h4>
        <ul style={styles.list}>
          <li style={styles.listItem}>Chính sách bảo mật</li>
          <li style={styles.listItem}>Chính sách hoàn tiền</li>
        </ul>
      </div>

      {/* About PoemTown */}
      <div style={styles.column}>
        <h4 style={styles.heading}>Về PoemTown</h4>
      </div>

      {/* About Us */}
      <div style={styles.column}>
        <h4 style={styles.heading}>Về chúng tôi</h4>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    display: "flex",
    flexWrap: "wrap", 
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px",
    backgroundColor: "#1A1A40",
    color: "#fff",
    fontSize: "14px",
    gap: "20px", 
  },
  column: {
    flex: "1 1 calc(25% - 20px)", 
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "150px", 
  },
  heading: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "10px",
  },
  icons: {
    display: "flex",
    gap: "15px",
  },
  icon: {
    fontSize: "20px",
    cursor: "pointer",
    color: "#fff",
  },
  list: {
    listStyleType: "none",
    padding: "0",
    margin: "0",
  },
  listItem: {
    cursor: "pointer",
  },


  "@media (max-width: 768px)": {
    footer: {
      flexDirection: "column", 
      alignItems: "center",
      textAlign: "center", 
    },
    column: {
      flex: "1 1 100%", 
      alignItems: "center",
    },
    icons: {
      justifyContent: "center",
    },
  },
};

export default Footer;
