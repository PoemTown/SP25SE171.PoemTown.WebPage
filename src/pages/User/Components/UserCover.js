import React from "react";

const UserCover = ({ coverImage, userData }) => {
    return (
        <div style={{ width: "100%", position: "relative" }}>
            <div style={{
                backgroundColor: "#FFD700",
                padding: "15px",
                borderRadius: "10px",
                position: "relative",
                backgroundImage: coverImage ? `url(${coverImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                        src={userData.avatar || "./default-avatar.png"}
                        alt="Avatar"
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            border: "2px solid white"
                        }}
                    />
                    <div style={{ marginLeft: "15px" }}>
                        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{userData.displayName}</h2>
                        <p style={{ color: "#555" }}>{userData.email}</p>
                        <div style={{ fontSize: "14px", color: "#333" }}>
                            👀 {userData.totalFollowers} Người theo dõi • 📌 {userData.totalFollowings} Đang theo dõi
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCover;
