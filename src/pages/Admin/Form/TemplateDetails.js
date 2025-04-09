import React, { useState } from "react";
import { Modal, Button, Select, ColorPicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

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

    const handleAdd = () => {
        setNewItem({ colorCode: "#FFFFFF", image: "", type: 1 });
        setAddModalVisible(true);
    };

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
    
            if (response.status === 200)  {
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
    

    return (
        <>
            {/* Modal chi tiết sản phẩm */}
            <Modal
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px" }}>
                        <span>Chi tiết sản phẩm</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Button type="primary" onClick={handleAdd}>
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
                                <p><strong>Màu sắc:</strong></p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                                <p><strong>Loại:</strong> {typeMapping[item.type] || item.type}</p>
                                {item.image && <img src={item.image} alt="Hình ảnh" style={{ width: "100%", borderRadius: 8 }} />}
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
                onOk={handleAddSubmit}
                confirmLoading={submitting}
            >
                <p><strong>Màu sắc:</strong></p>
                <ColorPicker
                    value={newItem.colorCode}
                    onChange={(color) => setNewItem({ ...newItem, colorCode: color.toHexString() })}
                    showText
                />

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
            </Modal>

            {/* Modal chỉnh sửa */}
            <Modal
                title="Chỉnh sửa sản phẩm"
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleEditSubmit}
                confirmLoading={submitting}
            >
                <p><strong>Màu sắc:</strong></p>
                <ColorPicker
                    value={newItem.colorCode}
                    onChange={(color) => setNewItem({ ...newItem, colorCode: color.toHexString() })}
                    showText
                />

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
            </Modal>
        </>
    );
};

export default TemplateDetails;