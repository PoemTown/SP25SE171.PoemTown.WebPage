import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import UserStats from "./Components/UserStats";
import UserBackgroundEditModal from "./Form/UserBackgroundEditModal";

const YourDesign = ({
    statisticBorder,
    achievementBorder,
    setBackgroundImage,
    achievementBackground,
    statisticBackground,
    achievementTitleBackground,
    statisticTitleBackground,
    achievementTitleColor,
    statisticTitleColor,
    achievementBackgroundColor,
    statisticBackgroundColor,
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBackground, setSelectedBackground] = useState("");
    const [showAddTemplateModal, setShowAddTemplateModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

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

                    // Tìm template có isInUse là true
                    const activeTemplate = data.data.find((template) => template.isInUse);

                    if (activeTemplate) {
                        setSelectedTemplate(activeTemplate.name);
                        setSelectedTemplateId(activeTemplate.id);
                        sessionStorage.setItem("selectedTemplate", activeTemplate.name);
                        sessionStorage.setItem("selectedTemplateId", activeTemplate.id);
                    } else if (data.data.length > 0) {
                        // Nếu không có template nào có isInUse là true, chọn template đầu tiên
                        setSelectedTemplate(data.data[0].name);
                        setSelectedTemplateId(data.data[0].id);
                        sessionStorage.setItem("selectedTemplate", data.data[0].name);
                        sessionStorage.setItem("selectedTemplateId", data.data[0].id);
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

    const handleAddTemplate = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("Access token không tồn tại");
            return;
        }

        if (!newTemplateName.trim()) {
            alert("Vui lòng nhập tên bản mẫu!");
            return;
        }

        try {
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/themes/v1/user", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newTemplateName,
                    isInUse: false,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Tạo bản mẫu thành công!");
                setShowAddTemplateModal(false);
                setNewTemplateName("");
                window.location.reload();
            } else {
                console.error("Lỗi từ API:", data);
                alert("Tạo bản mẫu thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };
    const handleDeleteTemplate = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("Access token không tồn tại");
            return;
        }

        if (!selectedTemplateId) {
            console.error("Không tìm thấy template để xóa");
            return;
        }

        const confirmDelete = window.confirm(`Bạn có chắc muốn xóa bản mẫu "${selectedTemplate}" không?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/themes/v1/user/${selectedTemplateId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (response.ok) {
                alert("Xóa bản mẫu thành công!");
                window.location.reload();
            } else {
                console.error("Lỗi từ API:", data);
                alert("Xóa bản mẫu thất bại!");
            }
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại!");
        }
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px", minHeight: "650px" }}>
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
                        style={{ display: "block", margin: "10px 0", padding: "15px", width: "96%" }}
                    />
                    <div style={{ display: "flex", overflowX: "auto", gap: "10px", paddingBottom: "10px" }}>
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleSelectTemplate(template.name, template.id)}
                                style={{
                                    padding: "20px 40px",
                                    backgroundColor: template.name === selectedTemplate ? "#78cfcc" : " ",
                                    border: template.isInUse ? "2px solid blue" : template.name === selectedTemplate ? "2px solid blue" : "1px solid black",
                                    fontWeight: template.name === selectedTemplate ? "bold" : "normal",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                {template.name}
                            </button>
                        ))}
                        <button
                            onClick={() => setShowAddTemplateModal(true)}
                            style={{ padding: "10px 30px", border: "1px dashed black", borderRadius: "5px", cursor: "pointer" }}
                        >
                            +
                        </button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                            onClick={handleDeleteTemplate}
                            style={{
                                backgroundColor: "#d9534f",
                                color: "white",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                marginTop: "10px",
                                cursor: "pointer",
                            }}
                        >
                            XÓA
                        </button>
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
                    <UserStats
                        achievementBorder={achievementBorder}
                        statisticBorder={statisticBorder}
                        achievementBackground={achievementBackground}
                        statisticBackground={statisticBackground}
                        achievementTitleBackground={achievementTitleBackground}
                        statisticTitleBackground={statisticTitleBackground}
                        achievementTitleColor={achievementTitleColor}
                        statisticTitleColor={statisticTitleColor}
                        achievementBackgroundColor={achievementBackgroundColor}
                        statisticBackgroundColor={statisticBackgroundColor}
                    />
                </div>
            </div>

            {/* Sử dụng modal đã tách riêng */}
            <UserBackgroundEditModal
                showModal={showModal}
                setShowModal={setShowModal}
                selectedBackground={selectedBackground}
                setSelectedBackground={setSelectedBackground}
                setBackgroundImage={setBackgroundImage}
            />
            {showAddTemplateModal && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        backgroundColor: "white",
                        transform: "translate(-50%, -50%)",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                        zIndex: 1000,
                        width: "300px"
                    }}
                >
                    <h3>Tạo bản mẫu mới</h3>
                    <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Nhập tên bản mẫu"
                        style={{ display: "block", padding: "10px", width: "250px", margin: "0 auto 10px auto", }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button onClick={() => setShowAddTemplateModal(false)} style={{ padding: "10px", borderRadius: "5px" }}>
                            Hủy
                        </button>
                        <button onClick={handleAddTemplate} style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#6aad5e", color: "white" }}>
                            Lưu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourDesign;