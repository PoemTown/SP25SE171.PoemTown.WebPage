import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import UserCoverEditModal from "../Form/UserCoverEditModal";
import { HiUsers } from "react-icons/hi2";
import { FaUserPlus } from "react-icons/fa";

const UserCoverEdit = ({ coverImage, coverColorCode, userData }) => {
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
        <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
            {/* Render the full cover image */}
            {tempCoverImage && (
                <img
                    src={tempCoverImage}
                    alt="Cover"
                    style={{
                        width: "100%",
                        display: "block",
                    }}
                />
            )}

            {/* Overlay for user details and settings button */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    padding: "1em 6em",
                    boxSizing: "border-box",
                    borderRadius: "10px",
                }}
            >
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
                    <Settings size={20} color={coverColorCode} />
                </button>

                <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
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
                    <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: coverColorCode }}>{userData.displayName}</h2>
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
