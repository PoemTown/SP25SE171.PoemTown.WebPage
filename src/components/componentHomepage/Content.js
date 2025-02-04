import React from "react";

const Content = () => {
  const poems = [
    {
      author: "KalenGuy34",
      time: "2h trước",
      title: "Để cooking bài nhạc làm miếng bò áp chảo",
      content: `"Tôi đang trong bếp ngó xa xăm
Người bạn năm ấy chẳng quay về
Cooking bài nhạc chả bạn tôi
Cõi lòng nạm mắc nhớ thương ai ..."`,
      views: 210,
      likes: 16,
      comments: 2,
    },
    {
      author: "Cauvàng169",
      time: "4h trước",
      title: "Cậu vàng và đứa bé mồ côi",
      content: `"Tiễn gần đến biển, gió hừng đông
Lạnh ướt đôi chân, rét và gầy
Bên tôi chỉ có một cậu bé
Hoài nhớ mong cha mãi chẳng về ..."`,
      views: 452,
      likes: 217,
      comments: 31,
    },
  ];

  const authors = [
    { rank: 1, name: "KalenGuy34", avatar: "🧑‍💼", color: "#f7d42d" },
    { rank: 2, name: "Tabooq253", avatar: "👤", color: "#0d6efd" },
    { rank: 3, name: "KaBoow254", avatar: "👩", color: "#d63384" },
  ];

  const topPoems = [
    { rank: 1, title: "Để cooking bài nhạc làm miếng bò áp chảo", author: "KalenGuy34" },
    { rank: 2, title: "Về khói ra mây", author: "KalenGuy34" },
    { rank: 3, title: "Vẻ đẹp thật sự nằm trong ánh mắt...", author: "Tabooq253" },
  ];

  const styles = {
    container: {
      display: "grid",
      gridTemplateColumns: "3fr 1fr",
      gap: "20px",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f9f9f9",
    },
    leftColumn: {
      display: "flex",
      flexDirection: "column",
    },
    dailyMessage: {
      background: "#f6e3c5",
      padding: "15px",
      borderRadius: "5px",
      marginBottom: "20px",
      textAlign: "center",
      fontStyle: "italic",
      border: "1px solid #d4a373",
    },
    poemCard: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
      marginBottom: "20px",
      background: "white",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    poemHeader: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    authorAvatar: {
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      marginRight: "10px",
      border: "1px solid #ddd",
    },
    poemContent: {
      fontStyle: "italic",
      margin: "10px 0",
      color: "#555",
    },
    poemStats: {
      display: "flex",
      gap: "15px",
      color: "#777",
      marginTop: "10px",
    },
    readMore: {
      color: "#0066cc",
      textDecoration: "none",
      fontWeight: "bold",
      marginTop: "10px",
      display: "inline-block",
    },
    rightColumn: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    topSection: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "15px",
      background: "#fff",
      boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    },
    topTitle: {
      fontWeight: "bold",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      fontSize: "18px",
    },
    topList: {
      listStyle: "none",
      padding: "0",
      margin: "0",
    },
    topItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    topItemRank: {
      fontWeight: "bold",
      fontSize: "16px",
      marginRight: "10px",
    },
    topItemAvatar: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    topItemName: {
      fontSize: "14px",
    },
    topItemLine: {
      borderTop: "1px solid #ddd",
      width: "100%",
      marginTop: "5px",
      marginBottom: "5px",
    },
    seeMore: {
      color: "#0066cc",
      textDecoration: "underline",
      fontWeight: "bold",
      fontSize: "14px",
      marginTop: "10px",
    },
  };

  return (
    <div style={styles.container}>
      {/* Cột trái */}
      <div style={styles.leftColumn}>
        <div style={styles.dailyMessage}>
          <p>
            <strong>Thông điệp của ngày:</strong> "Trời lạnh rét buốt, cần người
            sưởi ấm cho đêm đông"
          </p>
        </div>

        {poems.map((poem, index) => (
          <div key={index} style={styles.poemCard}>
            <div style={styles.poemHeader}>
              <img
                src={`https://via.placeholder.com/50?text=${poem.author.charAt(
                  0
                )}`}
                alt={poem.author}
                style={styles.authorAvatar}
              />
              <div>
                <strong>{poem.author}</strong>
                <p>{poem.time}</p>
              </div>
            </div>
            <h3>{poem.title}</h3>
            <p style={styles.poemContent}>{poem.content}</p>
            <div style={styles.poemStats}>
              <span>👁️ {poem.views}</span>
              <span>❤️ {poem.likes}</span>
              <span>💬 {poem.comments}</span>
            </div>
            <a href="#read-more" style={styles.readMore}>
              Xem bài thơ &gt;
            </a>
          </div>
        ))}
      </div>

      {/* Cột phải */}
      <div style={styles.rightColumn}>
        {/* Top tác giả */}
        <div style={styles.topSection}>
          <div style={styles.topTitle}>
            Top các tác giả được yêu thích 👑
          </div>
          <ul style={styles.topList}>
            {authors.map((author, index) => (
              <li key={index} style={styles.topItem}>
                <span style={{ ...styles.topItemRank, color: author.color }}>
                  #{author.rank}
                </span>
                <span style={styles.topItemAvatar}>{author.avatar}</span>
                <div>
                  <span style={styles.topItemName}>{author.name}</span>
                  <div style={styles.topItemLine} />
                </div>
              </li>
            ))}
          </ul>
          <a href="#see-more" style={styles.seeMore}>
            Xem thêm &gt;
          </a>
        </div>

        {/* Top bài thơ */}
        <div style={styles.topSection}>
          <div style={styles.topTitle}>
            Top các bài thơ được yêu thích 📖
          </div>
          <ul style={styles.topList}>
            {topPoems.map((poem, index) => (
              <li key={index} style={styles.topItem}>
                <span style={{ ...styles.topItemRank, color: "#f7d42d" }}>
                  #{poem.rank}
                </span>
                <div>
                  <span style={styles.topItemName}>{poem.title}</span>
                  <br />
                  <small style={{ color: "#555" }}>{poem.author}</small>
                  <div style={styles.topItemLine} />
                </div>
              </li>
            ))}
          </ul>
          <a href="#see-more" style={styles.seeMore}>
            Xem thêm &gt;
          </a>
        </div>
      </div>
    </div>
  );
};

export default Content;
