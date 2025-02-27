import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import UserStats from "./Components/UserStats";

const YourDesign = ({ statisticBorder, achievementBorder }) => {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBackground, setSelectedBackground] = useState("");

    useEffect(() => {
        const fetchTemplates = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                console.error("Access token không tồn tại");
                return;
            }

            try {
                const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/themes/v2/user", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const data = await response.json();
                if (data?.statusCode === 200 && Array.isArray(data.data)) {
                    setTemplates(data.data);

                    // Kiểm tra sessionStorage
                    const storedTemplate = sessionStorage.getItem("selectedTemplate");
                    const storedTemplateId = sessionStorage.getItem("selectedTemplateId");

                    if (storedTemplate && storedTemplateId) {
                        setSelectedTemplate(storedTemplate);
                        setSelectedTemplateId(storedTemplateId);
                    } else {
                        // Nếu không có trong sessionStorage, lấy theme mặc định từ API
                        const activeTemplate = data.data.find((template) => template.isInUse);
                        setSelectedTemplate(activeTemplate ? activeTemplate.name : data.data[0]?.name || "");
                        setSelectedTemplateId(activeTemplate ? activeTemplate.id : data.data[0]?.id || "");
                    }
                } else {
                    console.error("Lỗi dữ liệu từ API:", data);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchTemplates();
    }, []);

    const handleSelectTemplate = (name, id) => {
        setSelectedTemplate(name);
        setSelectedTemplateId(id);

        // Lưu vào sessionStorage
        sessionStorage.setItem("selectedTemplate", name);
        sessionStorage.setItem("selectedTemplateId", id);
    };

    const handleUseTemplate = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("Access token không tồn tại");
            return;
        }

        if (!selectedTemplateId) {
            console.error("Không tìm thấy template được chọn");
            return;
        }

        try {
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/themes/v1/user", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: selectedTemplateId,
                    name: selectedTemplate,
                    isInUse: true,
                }),
            });

            const data = await response.json();
            if (data?.statusCode === 200) {
                alert("Cập nhật thành công!");
                window.location.reload();
            } else {
                console.error("Lỗi từ API:", data);
                alert("Cập nhật thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ flex: 2, backgroundColor: "white", padding: "20px", borderRadius: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontWeight: "bold" }}>Bản mẫu của bạn</h3>
                        <Settings size={20} color="black" style={{ cursor: "pointer" }} onClick={() => setShowModal(true)} />
                    </div>
                    <label>Tên</label>
                    <input
                        type="text"
                        value={selectedTemplate}
                        readOnly
                        style={{ display: "block", margin: "10px 0", padding: "15px", width: "90%" }}
                    />
                    <div style={{ display: "flex", overflowX: "auto", gap: "10px", paddingBottom: "10px" }}>
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleSelectTemplate(template.name, template.id)}
                                style={{
                                    padding: "20px 40px",
                                    backgroundColor: template.name === selectedTemplate ? "#78cfcc" : " ",
                                    border: template.name === selectedTemplate ? "2px solid blue" : "1px solid black",
                                    fontWeight: template.name === selectedTemplate ? "bold" : "normal",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                {template.name}
                            </button>
                        ))}
                        <button style={{ padding: "10px 30px", border: "1px dashed black", borderRadius: "5px" }}>+</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            onClick={handleUseTemplate}
                            style={{
                                backgroundColor: "#6aad5e",
                                color: "white",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                marginTop: "10px",
                                cursor: "pointer",
                            }}
                        >
                            SỬ DỤNG
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <UserStats achievementBorder={achievementBorder} statisticBorder={statisticBorder} />
                </div>
            </div>

            {/* Modal Popup */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "400px",
                            position: "relative",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ fontWeight: "bold" }}>Kho của bạn</h3>
                        <p>Cùng thiết kế một ngôi nhà thật đậm chất riêng của mình.</p>
                        <p>Nền của Tường nhà</p>

                        {/* Lựa chọn nền tường */}
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input type="radio" name="background" checked={selectedBackground === "option1"} onChange={() => setSelectedBackground("option1")} />
                            <input type="radio" name="background" checked={selectedBackground === "option2"} onChange={() => setSelectedBackground("option2")} />
                            <input type="radio" name="background" checked={selectedBackground === "option3"} onChange={() => setSelectedBackground("option3")} />
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            style={{
                                backgroundColor: "#6aad5e",
                                color: "white",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                marginTop: "20px",
                                width: "100%",
                                cursor: "pointer",
                            }}
                        >
                            XÁC NHẬN
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourDesign;
