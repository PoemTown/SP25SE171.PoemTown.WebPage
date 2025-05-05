import React, { useEffect, useState } from "react";
import { Modal, Button, Select, ColorPicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { HiUsers } from "react-icons/hi2";
import { FaBook, FaBookmark, FaHeadphones, FaHeart, FaMedal, FaPenAlt, FaUserFriends, FaUserPlus } from "react-icons/fa";
import { GiInkSwirl, GiQuillInk } from "react-icons/gi";

const { Option } = Select;

const typeMapping = {
    1: "Header",
    2: "NavBackground",
    3: "NavBorder",
    4: "MainBackground",
    5: "AchievementBorder",
    6: "AchievementBackground",
    7: "StatisticBorder",
    8: "StatisticBackground",
    9: "AchievementTitleBackground",
    10: "StatisticTitleBackground"
};

// TemplateDetails.js
const TemplateDetails = ({ visible, onClose, detailItem, onEdit, id, onSuccess }) => {
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({ colorCode: "#FFFFFF", image: "", type: 1 });
    const [editingItem, setEditingItem] = useState(null);
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("Thơ của bạn");

    const [previewData, setPreviewData] = useState(null);

    const [headerBackground, setHeaderBackground] = useState("");
    const [headerColorCode, setHeaderColorCode] = useState("");
    const [navBackground, setNavBackground] = useState("");
    const [navColorCode, setNavColorCode] = useState("");
    const [navBorder, setNavBorder] = useState("");
    const [mainBackground, setMainBackground] = useState("");
    const [achievementBorder, setAchievementBorder] = useState("");
    const [achievementBackground, setAchievementBackground] = useState("");
    const [achievementColorCode, setAchievementColorCode] = useState("");
    const [statisticBorder, setStatisticBorder] = useState("");
    const [statisticBackground, setStatisticBackground] = useState("");
    const [statisticColorCode, setStatisticColorCode] = useState("");
    const [achievementTitleBackground, setAchievementTitleBackground] = useState("");
    const [achievementTitleColorCode, setAchievementTitleColorCode] = useState("");
    const [statisticTitleBackground, setStatisticTitleBackground] = useState("");
    const [statisticTitleColorCode, setStatisticTitleColorCode] = useState("");


    const tabs = [
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
        "Bản ghi âm",
        "Bookmark của bạn",
        "Bản nháp của bạn",
        "Lịch sử chỉnh sửa",
        "Quản lý Quyền Sử Dụng",
        "Quản lý ví",
        "Đóng góp",
    ];

    const achievements = [
        {
            id: "153",
            name: "Top 1 Bài thơ tháng 4/2025",
            rank: 1
        },
        {
            id: "1522",
            name: "Top 2 Nhà thơ tháng 3/2025",
            rank: 2
        },
        {
            id: "151",
            name: "Top 3 Bài thơ thơ tháng 3/2025",
            rank: 3
        },
        {
            id: "150",
            name: "Top 4 Nhà thơ tháng 2/2025",
            rank: 4
        },
    ]

    const userStatistic = {
        totalPoems: 46,
        totalCollections: 12,
        totalPersonalAudios: 32,
        totalLikes: 352,
        totalFollowers: 123,
        totalFollowings: 21
    }

    useEffect(() => {
        if (!detailItem) return;
        console.log("detailItem", detailItem)
        // Type 1 - Header
        const type1 = detailItem.find(item => item.type === 1);
        if (type1) {
            setHeaderBackground(type1.image);
            setHeaderColorCode(type1.colorCode);
        }

        // Type 2 - NavBackground
        const type2 = detailItem.find(item => item.type === 2);
        if (type2) {
            setNavBackground(type2.image);
            setNavColorCode(type2.colorCode);
        }

        // Type 3 - NavBorder
        const type3 = detailItem.find(item => item.type === 3);
        if (type3) {
            setNavBorder(type3.colorCode);
        }

        // Type 4 - MainBackground
        const type4 = detailItem.find(item => item.type === 4);
        if (type4) {
            setMainBackground(type4.image);
        }

        // Type 5 - AchievementBorder
        const type5 = detailItem.find(item => item.type === 5);
        if (type5) {
            setAchievementBorder(type5.colorCode);
        }

        // Type 6 - AchievementBackground
        const type6 = detailItem.find(item => item.type === 6);
        if (type6) {
            setAchievementBackground(type6.image);
            setAchievementColorCode(type6.colorCode);
        }

        // Type 7 - StatisticBorder
        const type7 = detailItem.find(item => item.type === 7);
        if (type7) {
            setStatisticBorder(type7.colorCode);
        }

        // Type 8 - StatisticBackground
        const type8 = detailItem.find(item => item.type === 8);
        if (type8) {
            setStatisticBackground(type8.image);
            setStatisticColorCode(type8.colorCode);
        }

        // Type 9 - AchievementTitleBackground
        const type9 = detailItem.find(item => item.type === 9);
        if (type9) {
            setAchievementTitleBackground(type9.image);
            setAchievementTitleColorCode(type9.colorCode);
        }

        // Type 10 - StatisticTitleBackground
        const type10 = detailItem.find(item => item.type === 10);
        if (type10) {
            setStatisticTitleBackground(type10.image);
            setStatisticTitleColorCode(type10.colorCode);
        }
    }, [detailItem]);

    const handleAdd = () => {
        const existingTypes = detailItem.map(item => item.type);
        const allTypes = Object.keys(typeMapping).map(Number);

        // Check if all types are already added
        if (existingTypes.length === allTypes.length) {
            message.warning("Bạn đã thêm đầy đủ các loại");
            return;
        }

        // Find first available type that's not added yet
        const firstAvailableType = allTypes.find(t => !existingTypes.includes(t));

        setNewItem({
            colorCode: "#FFFFFF",
            image: "",
            type: firstAvailableType
        });
        setAddModalVisible(true);
    };
    const handlePreview = () => {
        // Type 1 - Header
        const type1 = detailItem.find(item => item.type === 1);
        if (type1) {
            setHeaderBackground(type1.image);
            setHeaderColorCode(type1.colorCode);
        }

        // Type 2 - NavBackground
        const type2 = detailItem.find(item => item.type === 2);
        if (type2) {
            setNavBackground(type2.image);
            setNavColorCode(type2.colorCode);
        }

        // Type 3 - NavBorder
        const type3 = detailItem.find(item => item.type === 3);
        if (type3) {
            setNavBorder(type3.colorCode);
        }

        // Type 4 - MainBackground
        const type4 = detailItem.find(item => item.type === 4);
        if (type4) {
            setMainBackground(type4.image);
        }

        // Type 5 - AchievementBorder
        const type5 = detailItem.find(item => item.type === 5);
        if (type5) {
            setAchievementBorder(type5.colorCode);
        }

        // Type 6 - AchievementBackground
        const type6 = detailItem.find(item => item.type === 6);
        if (type6) {
            setAchievementBackground(type6.image);
            setAchievementColorCode(type6.colorCode);
        }

        // Type 7 - StatisticBorder
        const type7 = detailItem.find(item => item.type === 7);
        if (type7) {
            setStatisticBorder(type7.colorCode);
        }

        // Type 8 - StatisticBackground
        const type8 = detailItem.find(item => item.type === 8);
        if (type8) {
            setStatisticBackground(type8.image);
            setStatisticColorCode(type8.colorCode);
        }

        // Type 9 - AchievementTitleBackground
        const type9 = detailItem.find(item => item.type === 9);
        if (type9) {
            setAchievementTitleBackground(type9.image);
            setAchievementTitleColorCode(type9.colorCode);
        }

        // Type 10 - StatisticTitleBackground
        const type10 = detailItem.find(item => item.type === 10);
        if (type10) {
            setStatisticTitleBackground(type10.image);
            setStatisticTitleColorCode(type10.colorCode);
        }
        setPreviewModalVisible(true);
    }

    const handleEdit = (item) => {
        setEditingItem(item);
        setNewItem({ colorCode: item.colorCode, image: item.image, type: item.type });
        setEditModalVisible(true);
    };

    const handleDelete = (item) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa mục này không?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                const accessToken = localStorage.getItem("accessToken");
                try {
                    const response = await axios.delete(
                        `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/detail/${item.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );

                    if (response.status === 200) {
                        message.success("Xóa thành công!");
                        handleCancelPreview();
                        onSuccess();
                    }
                } catch (error) {
                    console.error("Error deleting template detail:", error);
                    message.error("Xóa thất bại!");
                }
            },
        });
    };

    const handleUpload = async ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);

        const accessToken = localStorage.getItem("accessToken");
        setUploading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/cover-image`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.statusCode === 201) {
                setNewItem((prev) => ({ ...prev, image: response.data.data }));
                message.success("Upload ảnh thành công!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error("Upload ảnh thất bại!");
        } finally {
            setUploading(false);
        }
    };

    const handleAddSubmit = async () => {
        const existingTypes = detailItem.map(item => item.type);

        if (existingTypes.includes(newItem.type)) {
            message.error("Loại này đã được thêm, vui lòng chọn loại khác");
            return;
        }
        if (!id) {
            message.error("Không tìm thấy ID template!");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        setSubmitting(true);

        const requestData = {
            masterTemplateId: id,
            masterTemplateDetails: [newItem]
        };

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/detail/addition`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.statusCode === 201) {
                message.success("Thêm thành công!");
                setAddModalVisible(false);
                onSuccess();
            }
        } catch (error) {
            console.error("Error adding template detail:", error);
            message.error("Thêm thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSubmit = async () => {
        if (!id || !editingItem) {
            message.error("Không tìm thấy ID template hoặc mục cần chỉnh sửa!");
            return;
        }

        // Modified validation: Check if type exists in OTHER items
        const typeExists = detailItem.some(item =>
            item.type === newItem.type &&
            item.id !== editingItem.id  // Exclude current item being edited
        );

        if (typeExists) {
            message.error("Loại này đã được thêm, vui lòng chọn loại khác");
            return;
        }

        const accessToken = localStorage.getItem("accessToken");
        setSubmitting(true);

        const requestData = {
            id: editingItem.id,
            colorCode: newItem.colorCode,
            image: newItem.image,
            type: newItem.type
        };

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/detail`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                message.success("Chỉnh sửa thành công!");
                setEditModalVisible(false);
                onSuccess();
            }
        } catch (error) {
            console.error("Error editing template detail:", error);
            message.error("Chỉnh sửa thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelPreview = () => {
        setHeaderBackground("");
        setHeaderColorCode("");
        setNavBackground("");
        setNavColorCode("");
        setNavBorder("");
        setMainBackground("");
        setAchievementBorder("");
        setAchievementBackground("");
        setAchievementColorCode("");
        setStatisticBorder("");
        setStatisticBackground("");
        setStatisticColorCode("");
        setAchievementTitleBackground("");
        setAchievementTitleColorCode("");
        setStatisticTitleBackground("");
        setStatisticTitleColorCode("");
        setPreviewModalVisible(false);
    }

    return (
        <>
            {/* Modal chi tiết sản phẩm */}
            <Modal
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px" }}>
                        <span>Chi tiết sản phẩm</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Button type="primary" onClick={handlePreview}>
                                Xem trước
                            </Button>
                            <Button color="green" variant="solid" onClick={handleAdd}>
                                Thêm
                            </Button>
                        </div>
                    </div>
                }
                visible={visible}
                onCancel={onClose}
                footer={null}
            >

                {detailItem && (
                    <div>
                        {detailItem.map((item) => (
                            <div key={item.id} style={{ marginBottom: 16 }}>
                                <p><strong>Loại:</strong> {typeMapping[item.type] || item.type}</p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    {item.type === 4 ? <></> :
                                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                            <strong>{item.type === 3 || item.type === 5 || item.type === 7 ? "Màu viền" : "Màu chữ"}
                                                :</strong>
                                            <span
                                                style={{
                                                    width: 24,
                                                    height: 24,
                                                    backgroundColor: item.colorCode || "#FFFFFF",
                                                    border: "1px solid #ccc",
                                                    display: "inline-block"
                                                }}
                                            ></span>
                                            <p>{item.colorCode || "Không có"}</p>
                                        </div>
                                    }

                                </div>
                                {item.type === 3 || item.type === 5 || item.type === 7 ? <></> : item.image &&
                                    <div>
                                        <p><strong>Hình ảnh:</strong></p>
                                        <img src={item.image} alt="Hình ảnh" style={{ width: "100%", borderRadius: 8, border: "1px solid #999" }} />
                                    </div>
                                }
                                <Button onClick={() => handleEdit(item)}>Chỉnh sửa</Button>
                                <Button danger onClick={() => handleDelete(item)}>Xóa</Button>
                                <hr />
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* Modal thêm mới */}
            <Modal
                title="Thêm sản phẩm"
                visible={addModalVisible}
                onCancel={() => setAddModalVisible(false)}
                okText="Xác nhận"
                cancelText="Hủy"
                onOk={handleAddSubmit}
                confirmLoading={submitting}
            >
                <p><strong>Loại:</strong></p>
                <Select
                    value={newItem.type}
                    onChange={(value) => setNewItem({ ...newItem, type: value })}
                    style={{ width: "100%" }}
                >
                    {Object.entries(typeMapping).map(([key, value]) => (
                        <Option key={key} value={parseInt(key)}>{value}</Option>
                    ))}
                </Select>
                {newItem.type === 4 ? <></> : (
                    <>
                        <p><strong>{newItem.type === 3 || newItem.type === 5 || newItem.type === 7 ? "Màu viền" : "Màu chữ"}:</strong></p>
                        <ColorPicker
                            value={newItem.colorCode}
                            onChange={(color) => setNewItem({ ...newItem, colorCode: color.toHexString() })}
                            showText
                        />
                    </>
                )}
                {newItem.type === 3 || newItem.type === 5 || newItem.type === 7 ? <></> : (
                    <>
                        <p><strong>Hình ảnh:</strong></p>
                        {newItem.image ? (
                            <img
                                src={newItem.image}
                                alt="Hình ảnh đã upload"
                                style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8, marginBottom: 8 }}
                            />
                        ) : (
                            <p>Chưa có hình ảnh.</p>
                        )}

                        {/* Nút upload riêng biệt */}
                        <Upload
                            customRequest={handleUpload}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                            </Button>
                        </Upload>
                    </>
                )}

            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal
                title="Chỉnh sửa sản phẩm"
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleEditSubmit}
                confirmLoading={submitting}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p><strong>Loại:</strong></p>
                <Select
                    value={newItem.type}
                    onChange={(value) => setNewItem({ ...newItem, type: value })}
                    style={{ width: "100%" }}
                >
                    {Object.entries(typeMapping).map(([key, value]) => (
                        <Option key={key} value={parseInt(key)}>{value}</Option>
                    ))}
                </Select>
                {newItem.type === 4 ? <></> : (
                    <>
                        <p><strong>{newItem.type === 3 || newItem.type === 5 || newItem.type === 7 ? "Màu viền" : "Màu chữ"}:</strong></p>
                        <ColorPicker
                            value={newItem.colorCode}
                            onChange={(color) => setNewItem({ ...newItem, colorCode: color.toHexString() })}
                            showText
                        />
                    </>
                )}
                {newItem.type === 3 || newItem.type === 5 || newItem.type === 7 ? <></> : (
                    <>
                        <p><strong>Hình ảnh:</strong></p>
                        {newItem.image ? (
                            <img
                                src={newItem.image}
                                alt="Hình ảnh đã upload"
                                style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8, marginBottom: 8 }}
                            />
                        ) : (
                            <p>Chưa có hình ảnh.</p>
                        )}

                        {/* Nút upload riêng biệt */}
                        <Upload
                            customRequest={handleUpload}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
                            </Button>
                        </Upload>
                    </>
                )}
            </Modal>
            <Modal
                title="Xem trước sản phẩm"
                visible={previewModalVisible}
                onCancel={handleCancelPreview}
                centered
                width="90%"
                zIndex={9999}
                key={detailItem ? detailItem.length : 0}
                cancelText="Hủy"
                okButtonProps={{ style: { display: 'none' } }}
            >
                {headerBackground ? (
                    <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
                        <img
                            src={headerBackground}
                            alt="Cover"
                            style={{
                                width: "100%",
                                display: "block"
                            }}
                        />

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
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <img
                                    src={`${process.env.PUBLIC_URL}/default_avatar.png`}
                                    alt="Avatar"
                                    style={{
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                        border: "2px solid white"
                                    }}
                                />
                                <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                                        <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: headerColorCode }}>
                                            Your name
                                        </h2>
                                        <p style={{ color: "#555", margin: "0", fontSize: "0.9em", color: headerColorCode }}>
                                            @username
                                        </p>
                                    </div>
                                    <div style={{ fontSize: "14px", color: "#333", display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                            <HiUsers color={headerColorCode} /> <span style={{ color: headerColorCode }}>100 Người theo dõi</span>
                                        </div>
                                        <div style={{ color: headerColorCode }}>•</div>
                                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }}>
                                            <FaUserPlus color={headerColorCode} /> <span style={{ color: headerColorCode }}>100 Đang theo dõi</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : <></>}
                {navBackground ? (
                    <div style={{ position: "relative" }}>
                        <nav
                            style={{
                                marginTop: "0px",
                                backgroundImage: `url("${navBackground}")`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                                padding: "10px",
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                border: navBorder !== "" ? `3px solid ${navBorder}` : "none",
                                position: "relative",
                            }}
                        >
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    style={{
                                        padding: "10px 15px",
                                        fontSize: "0.75rem",
                                        border: "none",
                                        background: "none",
                                        cursor: "pointer",
                                        fontWeight: activeTab === tab ? "bold" : "normal",
                                        color: navColorCode,
                                        borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                ) : <></>}
                {navBackground === "" && navBorder !== "" ?
                    <div style={{
                        width: "100%",
                        height: "60px",
                        border: `3px solid ${navBorder}`,
                    }}>

                    </div>
                    : <></>
                }
                <div style={{
                    display: "flex", flexDirection: "row",
                    padding: "20px 129px",
                    backgroundImage: `url("${mainBackground}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    height: mainBackground !== "" ? "2000px" : "auto"
                }}>
                    <div style={{
                        flex: 7,
                    }}></div>
                    <div style={{ display: "flex", flex: 3 }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "28px",
                            width: "100%",
                            fontFamily: "'Inter', sans-serif",
                            position: "relative",
                        }}>
                            {/* Achievements Section - Modern Elegant Design */}
                            <div
                                style={{
                                    borderRadius: "20px",
                                    border: achievementBorder !== "" ? `1px solid ${achievementBorder}` : "none",
                                    background: achievementBackground || "none",
                                    boxShadow: "0 12px 30px rgba(255, 200, 0, 0.08)",
                                    position: "relative",
                                    overflow: "hidden",
                                    backdropFilter: "blur(8px)",
                                    zIndex: 1,
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    ":hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 15px 35px rgba(255, 200, 0, 0.12)"
                                    },
                                    height: achievementBorder !== "" && achievementBackground === "" && achievementTitleBackground === "" ? "500px" : "auto"
                                }}
                            >
                                {/* Header with subtle texture */}
                                {achievementTitleBackground !== "" ?
                                    <div
                                        style={{
                                            backgroundImage: achievementTitleBackground ? `url("${achievementTitleBackground}")` : "linear-gradient(145deg, #FFD700, #FFC107)",
                                            padding: "20px 24px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "16px",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {/* Decorative elements */}
                                        <div style={{
                                            position: "absolute",
                                            top: -20,
                                            right: -20,
                                            opacity: 0.08,
                                            transform: "rotate(-15deg)",
                                            fontSize: "80px",
                                            color: achievementTitleColorCode || "#FFF"
                                        }}>
                                            <GiQuillInk />
                                        </div>

                                        {/* Icon with soft glow */}
                                        <div style={{
                                            background: "rgba(255,255,255,0.3)",
                                            width: "44px",
                                            height: "44px",
                                            borderRadius: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                            backdropFilter: "blur(6px)",
                                            border: "1px solid rgba(255,255,255,0.3)"
                                        }}>
                                            <FaMedal style={{
                                                color: achievementTitleColorCode || "#FFF",
                                                fontSize: "20px",
                                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                            }} />
                                        </div>

                                        {/* Title with subtle underline */}
                                        <h3 style={{
                                            margin: 0,
                                            color: achievementTitleColorCode || "#FFF",
                                            fontSize: "18px",
                                            fontWeight: 700,
                                            letterSpacing: "0.3px",
                                            textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                            position: "relative",
                                            paddingBottom: "6px"
                                        }}>
                                            Thành tựu cá nhân
                                            <span style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                width: "40px",
                                                height: "3px",
                                                background: "rgba(255,255,255,0.6)",
                                                borderRadius: "3px",
                                                transition: "width 0.3s ease"
                                            }}></span>
                                        </h3>
                                    </div>
                                    :
                                    <></>
                                }

                                {/* Content area with parchment-like texture */}
                                {achievementBackground !== "" ?
                                    <div
                                        style={{
                                            backgroundImage: achievementBackground ? `url("${achievementBackground}")` : "none",
                                            padding: "22px 20px",
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                            position: "relative"
                                        }}
                                    >
                                        <div style={{
                                            display: "grid",
                                            gap: "16px",
                                            position: "relative",
                                            zIndex: 1
                                        }}>
                                            {achievements && achievements.length > 0 ? (
                                                achievements.slice(0, 4).map((item, index) => (
                                                    <ElegantAchievementItem
                                                        key={item.id}
                                                        item={item}
                                                        index={index}
                                                        color={achievementColorCode}
                                                        borderColor={achievementBorder}
                                                    />
                                                ))
                                            ) : (
                                                <div style={{
                                                    textAlign: "center",
                                                    color: achievementColorCode || "#5D4037",
                                                    padding: "24px 16px",
                                                    fontStyle: "italic",
                                                    background: "rgba(255,255,255,0.8)",
                                                    borderRadius: "14px",
                                                    border: `1px dashed ${achievementBorder || "rgba(255, 168, 0, 0.3)"}`,
                                                    backdropFilter: "blur(4px)",
                                                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                                    fontSize: "15px",
                                                    transition: "all 0.3s ease",
                                                    ":hover": {
                                                        transform: "scale(1.01)",
                                                        boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
                                                    }
                                                }}>
                                                    <GiInkSwirl size={28} style={{
                                                        opacity: 0.3,
                                                        marginBottom: "10px",
                                                        transition: "transform 0.5s ease",
                                                        ":hover": {
                                                            transform: "rotate(15deg)"
                                                        }
                                                    }} />
                                                    <div>Hành trình thơ ca của bạn bắt đầu từ đây...</div>
                                                </div>
                                            )}
                                        </div>

                                        {achievements && achievements.length > 4 && (
                                            <div style={{
                                                textAlign: "center",
                                                marginTop: "20px",
                                                position: "relative",
                                                zIndex: 1
                                            }}>
                                                <a
                                                    href="#"
                                                    style={{
                                                        color: achievementTitleColorCode || "#D4A017",
                                                        fontSize: "14px",
                                                        fontWeight: 600,
                                                        textDecoration: "none",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "8px",
                                                        transition: "all 0.3s ease",
                                                        padding: "10px 22px",
                                                        borderRadius: "12px",
                                                        background: "rgba(255, 215, 0, 0.1)",
                                                        border: `1px solid ${achievementBorder || "rgba(255, 215, 0, 0.15)"}`,
                                                        backdropFilter: "blur(6px)",
                                                        boxShadow: "0 4px 12px rgba(255, 193, 7, 0.1)",
                                                        ":hover": {
                                                            background: "rgba(255, 215, 0, 0.2)",
                                                            transform: "translateY(-2px)",
                                                            boxShadow: "0 6px 16px rgba(255, 193, 7, 0.15)"
                                                        }
                                                    }}
                                                >
                                                    Xem các thành tựu
                                                    <span style={{
                                                        fontSize: "16px",
                                                        transition: "transform 0.3s ease",
                                                        ":hover": {
                                                            transform: "translateX(3px)"
                                                        }
                                                    }}>→</span>
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    :
                                    <></>
                                }
                            </div>

                            {/* Statistics Section - Modern Data Visualization */}
                            <div
                                style={{
                                    borderRadius: "20px",
                                    border: statisticBorder !== "" ? `1px solid ${statisticBorder}` : "none",
                                    background: statisticBackground || "none",
                                    boxShadow: "0 12px 30px rgba(126, 87, 194, 0.08)",
                                    position: "relative",
                                    overflow: "hidden",
                                    backdropFilter: "blur(8px)",
                                    zIndex: 1,
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    ":hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 15px 35px rgba(126, 87, 194, 0.12)"
                                    },
                                    height: statisticBorder !== "" && statisticBackground === "" && statisticTitleBackground === "" ? "500px" : "auto"
                                }}
                            >
                                {/* Header with subtle gradient */}
                                {
                                    statisticTitleBackground !== "" ?
                                        <div style={{
                                            backgroundImage: statisticTitleBackground ? `url("${statisticTitleBackground}")` : "linear-gradient(145deg, #7E57C2, #673AB7)",
                                            padding: "20px 24px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "16px",
                                            position: "relative",
                                            overflow: "hidden"
                                        }}>
                                            {/* Decorative swirl */}
                                            <div style={{
                                                position: "absolute",
                                                top: -20,
                                                right: -20,
                                                opacity: 0.08,
                                                transform: "rotate(15deg)",
                                                fontSize: "80px",
                                                color: statisticTitleColorCode || "#FFF"
                                            }}>
                                                <GiInkSwirl />
                                            </div>

                                            {/* Icon with soft glow */}
                                            <div style={{
                                                background: "rgba(255,255,255,0.3)",
                                                width: "44px",
                                                height: "44px",
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                                backdropFilter: "blur(6px)",
                                                border: "1px solid rgba(255,255,255,0.3)"
                                            }}>
                                                <FaPenAlt style={{
                                                    color: statisticTitleColorCode || "#FFF",
                                                    fontSize: "18px",
                                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                                }} />
                                            </div>

                                            {/* Title with subtle underline */}
                                            <h3 style={{
                                                margin: 0,
                                                color: statisticTitleColorCode || "#FFF",
                                                fontSize: "18px",
                                                fontWeight: 700,
                                                letterSpacing: "0.3px",
                                                textShadow: "0 1px 4px rgba(0,0,0,0.2)",
                                                position: "relative",
                                                paddingBottom: "6px"
                                            }}>
                                                Thống kê trang cá nhân
                                                <span style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    width: "40px",
                                                    height: "3px",
                                                    background: "rgba(255,255,255,0.6)",
                                                    borderRadius: "3px",
                                                    transition: "width 0.3s ease"
                                                }}></span>
                                            </h3>
                                        </div>
                                        :
                                        <></>
                                }

                                {/* Content with responsive grid */}
                                {
                                    statisticBackground !== "" ?
                                        <div
                                            style={{
                                                backgroundImage: statisticBackground ? `url("${statisticBackground}")` : "none",
                                                padding: "22px 18px",
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                position: "relative"
                                            }}
                                        >
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                                                gap: "16px",
                                                color: statisticColorCode || "#5E35B1",
                                                position: "relative",
                                                zIndex: 1
                                            }}>
                                                <ElegantStatItem
                                                    icon={<FaBook style={{ fontSize: "20px" }} />}
                                                    label="Bài thơ"
                                                    value={userStatistic?.totalPoems || 0}
                                                    color={statisticColorCode}
                                                    accentColor="#7E57C2"
                                                />
                                                <ElegantStatItem
                                                    icon={<FaBookmark style={{ fontSize: "20px" }} />}
                                                    label="Bộ sưu tập"
                                                    value={userStatistic?.totalCollections || 0}
                                                    color={statisticColorCode}
                                                    accentColor="#7E57C2"
                                                />
                                                <ElegantStatItem
                                                    icon={<FaHeadphones style={{ fontSize: "20px" }} />}
                                                    label="Bản ghi âm"
                                                    value={userStatistic?.totalPersonalAudios || 0}
                                                    color={statisticColorCode}
                                                    accentColor="#7E57C2"
                                                />
                                                <ElegantStatItem
                                                    icon={<FaHeart style={{ fontSize: "20px", color: "#FF5252" }} />}
                                                    label="Lượt thích"
                                                    value={userStatistic?.totalLikes || 0}
                                                    color={statisticColorCode}
                                                    accentColor="#FF5252"
                                                />
                                                <ElegantStatItem
                                                    icon={<FaUserFriends style={{ fontSize: "20px" }} />}
                                                    label="Đang theo dõi"
                                                    value={userStatistic?.totalFollowings || 0}
                                                    color={statisticColorCode}
                                                    accentColor="#7E57C2"
                                                />
                                                <ElegantStatItem
                                                    icon={<FaUserFriends style={{ transform: "scaleX(-1)", fontSize: "20px" }} />}
                                                    label="Lượt theo dõi"
                                                    value={userStatistic?.totalFollowers || 0}
                                                    color={statisticColorCode}
                                                    accentColor="#7E57C2"
                                                />
                                            </div>
                                        </div>
                                        : <></>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

const ElegantAchievementItem = ({ item, index, color, borderColor }) => {
    const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#7E57C2"];
    const medalIcons = ["🥇", "🥈", "🥉", "🎖️"];

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "18px 20px",
                background: "rgba(255,255,255,0.9)",
                borderRadius: "14px",
                border: `1px solid ${borderColor || "rgba(255, 215, 0, 0.1)"}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                backdropFilter: "blur(6px)",
                ":hover": {
                    transform: "translateX(8px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)"
                },
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Background decorative element */}
            <div style={{
                position: "absolute",
                right: -30,
                top: -30,
                width: "80px",
                height: "80px",
                background: rankColors[index] || rankColors[3],
                opacity: 0.08,
                borderRadius: "50%"
            }}></div>

            {/* Medal/Rank indicator */}
            <div style={{
                flexShrink: 0,
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${rankColors[index] || rankColors[3]}, ${rankColors[index + 1] || "#9C27B0"})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFF",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                fontSize: "20px",
                position: "relative",
                zIndex: 1,
                transition: "transform 0.3s ease",
                ":hover": {
                    transform: "rotate(10deg) scale(1.1)"
                }
            }}>
                {medalIcons[item.rank - 1] || medalIcons[3]}
            </div>

            {/* Content */}
            <div style={{
                flex: 1,
                position: "relative",
                zIndex: 1
            }}>
                <div style={{
                    color: color || "#5D4037",
                    fontSize: "15px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    letterSpacing: "0.2px"
                }}>
                    {item.name}
                </div>
            </div>
        </div>
    );
};

const ElegantStatItem = ({ icon, label, value, color, accentColor }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 16px",
        background: "rgba(255,255,255,0.95)",
        borderRadius: "16px",
        border: "1px solid rgba(126, 87, 194, 0.08)",
        boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
        transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
        backdropFilter: "blur(6px)",
        ":hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.1)"
        },
        position: "relative",
        overflow: "hidden"
    }}>
        {/* Top accent bar */}
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${accentColor || "#7E57C2"}, ${lightenColor(accentColor || "#7E57C2", 20)})`,
            transition: "all 0.3s ease"
        }}></div>

        {/* Icon with gradient background */}
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            position: "relative",
            zIndex: 1
        }}>
            <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, rgba(${hexToRgb(accentColor || "#7E57C2").r}, ${hexToRgb(accentColor || "#7E57C2").g}, ${hexToRgb(accentColor || "#7E57C2").b}, 0.12) 0%, rgba(255,255,255,0.4) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                ":hover": {
                    transform: "rotate(10deg)"
                }
            }}>
                {icon}
            </div>
            <span style={{
                fontSize: "14px",
                fontWeight: 600,
                color: color || "#5E35B1",
                letterSpacing: "0.3px"
            }}>
                {label}
            </span>
        </div>

        {/* Value with gradient text */}
        <span style={{
            fontSize: "24px",
            fontWeight: 700,
            background: `linear-gradient(135deg, ${accentColor || "#7E57C2"}, ${lightenColor(accentColor || "#7E57C2", 10)})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            position: "relative",
            zIndex: 1,
            textShadow: "0 2px 4px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
            ":hover": {
                transform: "scale(1.05)"
            }
        }}>
            {value}
        </span>

        {/* Subtle decorative element */}
        <div style={{
            position: "absolute",
            bottom: -20,
            right: -20,
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: `rgba(${hexToRgb(accentColor || "#7E57C2").r}, ${hexToRgb(accentColor || "#7E57C2").g}, ${hexToRgb(accentColor || "#7E57C2").b}, 0.05)`,
            zIndex: 0
        }}></div>
    </div>
);

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 126, g: 87, b: 194 };
}

// Helper function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return `#${(
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
}


export default TemplateDetails;