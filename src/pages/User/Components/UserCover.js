import React, { useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";

const UserCover = ({ isMine, coverImage, coverColorCode, userData }) => {
    return (
        <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
            {coverImage && (
                <img
                    src={coverImage}
                    alt="Cover"
                    style={{
                        width: "100%",
                        display: "block" // removes extra bottom spacing
                    }}
                />
            )}
            {/* Overlay content */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                padding: "1em 6em",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center"
            }}>
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
                <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{display: "flex", flexDirection: "column", gap: "0px"}}>
                        <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: coverColorCode  }}>{userData.displayName}</h2>
                        <p style={{ color: coverColorCode, margin: "0", fontSize: "0.9em" }}>@{userData.userName || "Annoymous"}</p>
                    </div>
                    <div style={{ fontSize: "14px", color: coverColorCode, display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                            <HiUsers color={coverColorCode} /> <span style={{color: coverColorCode}}>{userData.totalFollowers} Người theo dõi</span>
                        </div>
                        <div style={{color: coverColorCode}}>•</div>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                            <FaUserPlus color={coverColorCode} /> <span style={{color: coverColorCode}}>{userData.totalFollowings} Đang theo dõi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCover;
