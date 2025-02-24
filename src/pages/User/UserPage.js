import React, { useState, useEffect } from "react";
import Headeruser from "../../components/Headeruser";
import Footer from "../../components/Footer";
import { Settings } from "lucide-react";
import YourPoem from "./YourPoem";
import YourCollection from "./Collection/YourCollection"
import YourDraft from "./YourDraft";
const imageLibrary = {
    coverImages: [
        "./1.png",
        "./2.png",
        "./3.png",
    ],
    backgroundImages: [
        "./a.png",
        "./b.png",
    ],
};

const UserPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [coverImage, setCoverImage] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [tempCoverImage, setTempCoverImage] = useState(null);
    const [tempBackgroundImage, setTempBackgroundImage] = useState(null);
    const [navTabColor, setNavTabColor] = useState("white");
    const [userStatsBorderColor, setUserStatsBorderColor] = useState("#FFD700");
    const [activeTab, setActiveTab] = useState("Thơ của bạn");
    const [displayName, setDisplayName] = useState("");

    const handleImageSelect = (image, type) => {
        if (type === "cover") {
            setTempCoverImage(image);
        } else {
            setTempBackgroundImage(image);
        }
    };

    const handleRemoveImage = (type) => {
        if (type === "cover") {
            setTempCoverImage(null);
        } else {
            setTempBackgroundImage(null);
        }
    };

    const handleSaveChanges = () => {
        setCoverImage(tempCoverImage);
        setBackgroundImage(tempBackgroundImage);
        setIsModalOpen(false);
    };

    const handleColorChange = (e, type) => {
        if (type === "navTab") {
            setNavTabColor(e.target.value);
        } else if (type === "userStatsBorder") {
            setUserStatsBorderColor(e.target.value);
        }
    };
    const [userData, setUserData] = useState({
        displayName: "Loading...",
        email: "Loading...",
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/users/v1/mine/profile", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, 
                        "Content-Type": "application/json",
                    },
                });
                const result = await response.json();
                if (response.ok && result.data) {
                    setUserData({
                        displayName: result.data.displayName,
                        email: result.data.email,
                    });
                    setDisplayName(result.data.displayName); 
                } else {
                    console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
                }
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        };

        fetchUserProfile();
    }, []);

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <Headeruser />

          
            {/* Cover Image */}
            <div style={{ width: "100%", paddingTop: "10px", position: "relative" }}>
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
                            src="./@.png"
                            alt="Avatar"
                            style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid white" }}
                        />
                        <div style={{ marginLeft: "15px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{userData.displayName}</h2>
                            <p style={{ color: "#555" }}>{userData.email}</p>
                            <div style={{ fontSize: "14px", color: "#333" }}>
                                 👀 1,865 Người theo dõi • 📌 52 Đang theo dõi
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "transparent",
                            color: "black",
                            border: "none",
                            borderRadius: "5px",
                            padding: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                        }}>
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            {/* Background Image */}
            <div style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "auto",
                padding: "10px"
            }}>

                {/* MODAL */}
                {isModalOpen && (
                    <div style={{
                        position: "fixed",
                        top: "0", left: "0",
                        width: "100%", height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex", justifyContent: "center", alignItems: "center",
                        zIndex: "999"
                    }}>
                        <div style={{
                            backgroundColor: "white", padding: "25px",
                            borderRadius: "12px", width: "420px",
                            textAlign: "center", position: "relative"
                        }}>
                            <button onClick={() => setIsModalOpen(false)}
                                style={{ position: "absolute", top: "10px", right: "10px", background: "transparent", border: "none", fontSize: "20px", cursor: "pointer" }}>
                                ✖
                            </button>

                            <h2>Chỉnh sửa giao diện</h2>

                            {/* Cover Image Selection */}
                            <div style={{ marginBottom: "15px", textAlign: "left" }}>
                                <label><b>Chọn ảnh Cover:</b></label>
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto" }}>
                                    {imageLibrary.coverImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt="Cover Option"
                                            style={{
                                                width: "80px", height: "50px", borderRadius: "5px",
                                                cursor: "pointer", border: tempCoverImage === img ? "2px solid blue" : "2px solid transparent"
                                            }}
                                            onClick={() => handleImageSelect(img, "cover")}
                                        />
                                    ))}
                                </div>
                                {tempCoverImage && (
                                    <button onClick={() => handleRemoveImage("cover")}
                                        style={{ marginTop: "10px", padding: "5px", background: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                        Hủy chọn ảnh Cover
                                    </button>
                                )}
                            </div>

                            {/* Background Image Selection */}
                            <div style={{ marginBottom: "15px", textAlign: "left" }}>
                                <label><b>Chọn Background:</b></label>
                                <div style={{ display: "flex", gap: "10px", marginTop: "10px", overflowX: "auto" }}>
                                    {imageLibrary.backgroundImages.map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt="Background Option"
                                            style={{
                                                width: "80px", height: "50px", borderRadius: "5px",
                                                cursor: "pointer", border: tempBackgroundImage === img ? "2px solid blue" : "2px solid transparent"
                                            }}
                                            onClick={() => handleImageSelect(img, "background")}
                                        />
                                    ))}
                                </div>
                                {tempBackgroundImage && (
                                    <button onClick={() => handleRemoveImage("background")}
                                        style={{ marginTop: "10px", padding: "5px", background: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                        Hủy chọn Background
                                    </button>
                                )}
                            </div>

                            {/* Navigation Tab Color Selection */}
                            <div style={{ marginBottom: "15px", textAlign: "left" }}>
                                <label><b>Chọn màu nền Tabs:</b></label>
                                <input type="color" value={navTabColor} onChange={(e) => handleColorChange(e, "navTab")} style={{ marginLeft: "10px", cursor: "pointer" }} />
                            </div>

                            {/* User Stats Border Color Selection */}
                            <div style={{ marginBottom: "15px", textAlign: "left" }}>
                                <label><b>Chọn màu viền Thông tin người dùng:</b></label>
                                <input type="color" value={userStatsBorderColor} onChange={(e) => handleColorChange(e, "userStatsBorder")} style={{ marginLeft: "10px", cursor: "pointer" }} />
                            </div>

                            <button onClick={handleSaveChanges}
                                style={{ padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%" }}>
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                )}

                {/* Navigation Tabs */}
                <nav style={{ marginTop: "15px", backgroundColor: navTabColor, padding: "10px", borderRadius: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {["Thơ của bạn", "Bộ sưu tập của bạn", "Bookmark của bạn", "Bản nháp của bạn", "Lịch sử chỉnh sửa", "Quản lý Bản Quyền", "Kho của bạn", "Quản lý ví"].map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "10px 15px",
                                fontSize: "14px",
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                fontWeight: activeTab === tab ? "bold" : "normal",
                                color: activeTab === tab ? "#007bff" : "#555",
                                borderBottom: activeTab === tab ? "2px solid #007bff" : "none"
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                {/* Nội dung hiển thị theo Tab */}
                <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    {activeTab === "Thơ của bạn" && (
                        <div>
                            <YourPoem borderColor={userStatsBorderColor} displayName={displayName} />
                        </div>
                    )}

                    {activeTab === "Bộ sưu tập của bạn" && (
                        <div>
                            <YourCollection />
                        </div>
                    )}
                    {activeTab === "Bookmark của bạn" && (
                        <div>
                            <h3>Bookmark của bạn</h3>
                            <p>Các bài thơ bạn đã đánh dấu yêu thích sẽ hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Bản nháp của bạn" && (
                        <div>
                        <YourDraft borderColor={userStatsBorderColor} displayName={displayName} />
                    </div>
                    )}
                    {activeTab === "Lịch sử chỉnh sửa" && (
                        <div>
                            <h3>Lịch sử chỉnh sửa</h3>
                            <p>Tất cả các thay đổi bạn đã thực hiện sẽ được hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Quản lý Bản Quyền" && (
                        <div>
                            <h3>Quản lý Bản Quyền</h3>
                            <p>Thông tin về bản quyền các tác phẩm của bạn sẽ được hiển thị tại đây.</p>
                        </div>
                    )}
                    {activeTab === "Kho của bạn" && (
                        <div>
                            <h3>Kho của bạn</h3>
                            <p>Quản lý các tài liệu và tệp tin liên quan đến tác phẩm của bạn.</p>
                        </div>
                    )}
                    {activeTab === "Quản lý ví" && (
                        <div>
                            <h3>Quản lý ví</h3>
                            <p>Thông tin về tài chính và ví điện tử sẽ hiển thị ở đây.</p>
                        </div>
                    )}
                </div>

            </div>

            <Footer />
        </div>
    );
};

export default UserPage;
