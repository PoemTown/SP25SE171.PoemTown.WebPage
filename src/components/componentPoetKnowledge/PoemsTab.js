import React, { useState, useEffect } from "react";

const PoemsTab = () => {
  const [isCreatingPoem, setIsCreatingPoem] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem("role")) || [];
    setRoles(storedRoles);
  }, []);

  const canCreatePoem = roles.includes("ADMIN") || roles.includes("MODERATOR");

  return (
    <div style={{ padding: "20px" }}>
      {canCreatePoem && (
        <button
          onClick={() => setIsCreatingPoem(true)}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "12px 20px",
            borderRadius: "5px",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            display: "block",
            marginBottom: "20px",
          }}
        >
          SÁNG TÁC THƠ
        </button>
      )}

      {!isCreatingPoem ? (
        <div>Nội dung thơ sẽ được hiển thị ở đây</div>
      ) : (
        <div>
          <textarea
            placeholder="Hãy viết bài thơ của bạn..."
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default PoemsTab;
