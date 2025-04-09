import React, { useState, useEffect } from "react";

const Step3 = ({ onNext, onClose, onChangeBackgroundTitle }) => {
    const [navThemeImages, setNavThemeImages] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const achievementTitleBackgroundId = sessionStorage.getItem("achievementTitleBackgroundId");

    const fetchNavigationThemes3 = async () => {
        if (!accessToken) {
            console.error("Access token is missing");
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/themes/v2/user?filterOptions.templateDetailType=9`, 
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }

            const data = await response.json();

            if (!data?.data || !Array.isArray(data.data)) {
                console.error("Invalid data format received:", data);
                return;
            }

            const activeThemes = data.data.filter((theme) => theme.isInUse);

            const availableThemes = activeThemes.flatMap((theme) =>
                Array.isArray(theme.userTemplateDetails)
                    ? theme.userTemplateDetails
                        .filter((detail) => detail.userTemplate?.tagName !== "Default")
                        .map((detail) => ({
                            id: detail.id,
                            image: encodeURI(detail.image),
                            colorCode: detail.colorCode,
                            isInUse: detail.isInUse,
                        }))
                    : []
            );

            setNavThemeImages([...availableThemes]);

            const activeTemplate = availableThemes.find((theme) => theme.isInUse);
            if (activeTemplate) {
                setSelectedTheme(activeTemplate.id);
            }
        } catch (error) {
            console.error("Error fetching navigation themes:", error);
        }
    };

    const handleConfirmSelection = async () => {
        const templateId = sessionStorage.getItem("selectedTemplateId");
    
        try {
            const requestBody = [
                {
                    previousUserTemplateDetailId: achievementTitleBackgroundId,
                    newUserTemplateDetailId: selectedTheme
                }
            ];
    
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/theme/${templateId}/user-template-detail`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
            }
    
            alert("Xác nhận thành công!");
            setIsConfirmOpen(false);
            window.location.reload(); 
        } catch (error) {
            console.error("Error updating theme:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
        }
    };
    
    useEffect(() => {
        fetchNavigationThemes3();
    }, []);

    return (
        <div>
            <p style={{ fontSize: "16px", fontWeight: "bold" }}>Nền của Kệ thành tựu</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {navThemeImages.map((theme) => (
                    <img
                        key={theme.id}
                        src={theme.image}
                        alt="Theme Preview"
                        style={{
                            width: "350px",
                            height: "30px",
                            cursor: "pointer",
                            border: selectedTheme === theme.id ? "2px solid #4CAF50" : "1px solid transparent",
                            transition: "border 0.2s ease-in-out",
                            borderRadius: "5px",
                        }}
                        onClick={() => {
                            setSelectedTheme(theme.id);
                            onChangeBackgroundTitle(theme.image); 
                        }}
                    />
                ))}
            </div>
            <div style={{ marginTop: "15px" }}>
                <button
                    style={{ padding: "12px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
                    onClick={() => setIsConfirmOpen(true)} 
                >
                    XÁC NHẬN
                </button>
                <button
                    style={{ padding: "12px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "10px", fontSize: "16px" }}
                    onClick={onNext}
                >
                    TIẾP THEO
                </button>
            </div>

            {/* Modal xác nhận */}
            {isConfirmOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex", justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{
                        backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "300px", textAlign: "center"
                    }}>
                        <p style={{ fontSize: "18px", fontWeight: "bold" }}>Xác nhận lựa chọn?</p>
                        <p>Bạn có chắc chắn muốn chọn nền này?</p>
                        <div style={{ marginTop: "10px" }}>
                            <button
                                style={{ padding: "10px", backgroundColor: "#28A745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "10px" }}
                                onClick={handleConfirmSelection}
                            >
                                Xác nhận
                            </button>
                            <button
                                style={{ padding: "10px", backgroundColor: "#DC3545", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                onClick={() => setIsConfirmOpen(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Step3;
