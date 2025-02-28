import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import UserCoverEditModal from "../Form/UserCoverEditModal";

const UserCoverEdit = ({ coverImage, userData }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [themes, setThemes] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [tempCoverImage, setTempCoverImage] = useState(coverImage); 

    useEffect(() => {
        const fetchThemes = async () => {
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
                console.error("Access token is missing");
                return;
            }

            try {
                const response = await fetch(
                    "https://api-poemtown-staging.nodfeather.win/api/themes/v2/user?filterOptions.templateDetailType=1",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                const activeThemes = data.data.filter((theme) => theme.isInUse);

                setThemes(activeThemes);
                const activeTemplate = activeThemes
                    .flatMap((theme) => theme.userTemplateDetails)
                    .find((detail) => detail.isInUse);

                if (activeTemplate) {
                    setSelectedTemplateId(activeTemplate.id);
                    setTempCoverImage(activeTemplate.image || coverImage); 
                }
            } catch (error) {
                console.error("Error fetching themes:", error);
            }
        };

        if (showPopup) {
            fetchThemes();
        } else {
            setTempCoverImage(coverImage); 
        }
    }, [showPopup, coverImage]);

    return (
        <div style={{ width: "100%", position: "relative" }}>
            <div
                style={{
                    backgroundColor: "#FFD700",
                    padding: "15px",
                    borderRadius: "10px",
                    position: "relative",
                    backgroundImage: tempCoverImage ? `url(${tempCoverImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Settings button */}
                <button
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                    }}
                    onClick={() => setShowPopup(true)}
                >
                    <Settings size={20} color="black" />
                </button>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <img
                        src={userData.avatar || "./default-avatar.png"}
                        alt="Avatar"
                        style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            border: "2px solid white",
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

            {/* Render Modal when showPopup is true */}
            {showPopup && (
                <UserCoverEditModal
                    themes={themes}
                    selectedTemplateId={selectedTemplateId}
                    setSelectedTemplateId={setSelectedTemplateId}
                    setTempCoverImage={setTempCoverImage}
                    coverImage={coverImage}
                    closeModal={() => setShowPopup(false)}
                />
            )}
        </div>
    );
};

export default UserCoverEdit;
