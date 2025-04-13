import React, { useState, useEffect } from "react";
import CreatePoemForPoetSample from "./CreatePoemForPoetSample";

const PoemsTab = ({ collections, poetId }) => {
    const [isCreatingPoem, setIsCreatingPoem] = useState(false);
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const storedRoles = JSON.parse(localStorage.getItem("role")) || [];
        setRoles(storedRoles);
    }, []);

    const canCreatePoem = roles.includes("ADMIN") || roles.includes("MODERATOR");
    const handleCloseModal = () => {
        // setIsModalVisible(false);
    };
    return (
        <div style={{ padding: "20px" }}>
            {canCreatePoem && !isCreatingPoem && (
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
                <CreatePoemForPoetSample
                    collections={collections}
                    poetId={poetId}
                    setDrafting={false}
                    onBack={() => setIsCreatingPoem(false)}
                    onClose={handleCloseModal}
                />

            )}
        </div>
    );
};

export default PoemsTab;
