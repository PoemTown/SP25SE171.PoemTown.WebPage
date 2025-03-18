import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Input, Form, Tag, Select, Upload, message } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import TemplateDetails from "../Form/TemplateDetails";

const STATUS_LABELS = {
    1: { text: "Active", color: "green" },
    2: { text: "Inactive", color: "gray" },
    3: { text: "Out of Stock", color: "red" }
};

const TYPE_LABELS = {
    1: "Bundle",
    2: "Single"
};

const TemplateManagement = () => {
    const [items, setItems] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [detailItem, setDetailItem] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [coverImageUrl, setCoverImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [form] = Form.useForm();
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    // Fetch data from API
    useEffect(() => {
        axios.get("https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates")
            .then((response) => {
                console.log("API Response:", response.data);
                if (response.data && response.data.statusCode === 200 && response.data.data) {
                    setItems(response.data.data.map(item => ({
                        id: item.id,
                        templateName: item.templateName || "Không có tên", 
                        price: item.price || 0,
                        coverImage: item.coverImage || "",
                        status: item.status || 2,
                        tagName: item.tagName || "Không có tag",
                        isBought: item.isBought || false,
                        type: item.type || 2
                    })));
                } else {
                    console.error("Dữ liệu từ API không hợp lệ:", response.data);
                }
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    // Handle edit item
    const handleEdit = (record) => {
        if (!record) {
            console.error("Dữ liệu chỉnh sửa không hợp lệ:", record);
            return;
        }
        setEditingItem(record);
        setCoverImageUrl(record.coverImage || "");
        form.setFieldsValue({
            templateName: record.templateName || "",
            price: record.price || 0,
            tagName: record.tagName || "",
            coverImage: record.coverImage || "",
            status: record.status || 2,
        });
        setIsModalVisible(true);
    };

    // Handle delete item
    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa?",
            content: "Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    const response = await fetch(
                        `https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates/${id}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Xóa không thành công");
                    }
                    window.location.reload();
                } catch (error) {
                    console.error("Lỗi khi xóa:", error);
                    message.error("Xóa thất bại!");
                }
            },
            onCancel: () => {
                console.log("Hủy xóa");
            },
        });
    };

    // Handle save (edit or add)
    const handleOk = () => {
        form.validateFields().then((values) => {
            const updatedValues = { ...values, coverImage: coverImageUrl };
            const accessToken = localStorage.getItem("accessToken");

            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            };

            if (editingItem) {
                updatedValues.id = editingItem.id;

                axios
                    .put(
                        "https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates",
                        updatedValues,
                        config
                    )
                    .then((response) => {
                        console.log("API Response:", response.data);
                        if (response.status === 200) {
                            setItems(items.map((item) =>
                                item.id === editingItem.id ? { ...editingItem, ...updatedValues } : item
                            ));
                            message.success("Cập nhật thành công!");
                            setIsModalVisible(false);
                        } else {
                            message.error("Cập nhật thất bại: Phản hồi không hợp lệ từ API");
                        }
                    })
                    .catch((error) => {
                        console.error("Error updating item:", error);
                        message.error("Cập nhật thất bại!");
                    });
            }
        });
    };

    // Handle add new item
    const handleAdd = () => {
        form.resetFields();
        setCoverImageUrl(null);
        setIsAddModalVisible(true);
    };

    // Handle save new item
    const handleAddOk = () => {
        form.validateFields().then((values) => {
            if (!values.templateName || !values.price || !values.tagName || !values.coverImage || !values.status) {
                message.error("Vui lòng điền đầy đủ thông tin!");
                return;
            }
            const newValues = { ...values, coverImage: coverImageUrl };
            const accessToken = localStorage.getItem("accessToken");

            const config = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            };

            axios
                .post(
                    "https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates",
                    newValues,
                    config
                )
                .then((response) => {
                    console.log("API Response:", response.data);
                    if (response.status === 200) {
                        setItems([...items, response.data.data]);
                        message.success("Thêm mới thành công!");
                        setIsAddModalVisible(false);
                        window.location.reload();
                    } else {
                        message.error("Thêm mới thất bại: Phản hồi không hợp lệ từ API");
                    }
                })
                .catch((error) => {
                    console.error("Error adding item:", error);
                    message.error("Thêm mới thất bại!");
                });
        });
    };

    // Handle view details
    const handleViewDetails = (id) => {
        axios.get(`https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates/${id}`)
            .then((response) => {
                if (response.data && response.data.statusCode === 200 && response.data.data) {
                    setDetailItem(response.data.data);
                    setDetailModalVisible(true);
                    setSelectedTemplateId(id);
                } else {
                    console.error("Dữ liệu chi tiết không hợp lệ:", response.data);
                }
            })
            .catch((error) => console.error("Error fetching detail:", error));
    };
    
    const reloadDetails = () => {
        if (selectedTemplateId) {
            handleViewDetails(selectedTemplateId);
        }
    };

    // Handle image upload
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const accessToken = localStorage.getItem("accessToken");
        setUploading(true);

        try {
            const response = await axios.post(
                "https://api-poemtown-staging.nodfeather.win/api/template/v1/master-templates/cover-image",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.statusCode === 201) {
                setCoverImageUrl(response.data.data);
                message.success("Upload ảnh thành công!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            message.error("Upload ảnh thất bại!");
        } finally {
            setUploading(false);
        }

        return false;
    };

    return (
        <div style={{ padding: 24 }}>
            <Card
                title="Quản lý hàng hóa"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm mới
                    </Button>
                }
            >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
                    {items && items.length > 0 ? (
                        items.map((item) => {
                            if (!item) return null; 
                            return (
                                <Card
                                    key={item.id}
                                    title={item.templateName || "Không có tên"}
                                    extra={
                                        <>
                                            <Button icon={<EditOutlined />} onClick={() => handleEdit(item)} style={{ marginRight: 8 }} />
                                            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)} danger />
                                        </>
                                    }
                                    style={{ width: 250, position: "relative" }}
                                >
                                    {item.coverImage && (
                                        <img
                                            src={item.coverImage}
                                            alt="Cover"
                                            style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "8px", marginBottom: "8px" }}
                                        />
                                    )}
                                    <p>Giá: {item.price} VND</p>
                                    <p>Trạng thái: <Tag color={STATUS_LABELS[item.status]?.color}>{STATUS_LABELS[item.status]?.text}</Tag></p>
                                    <p>Tag: <Tag color="volcano">{item.tagName}</Tag></p>
                                    <p>Loại: {TYPE_LABELS[item.type] || "Không xác định"}</p>
                                    <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                                        <Button type="primary" onClick={() => handleViewDetails(item.id)}>Coi chi tiết</Button>
                                    </div>
                                </Card>
                            );
                        })
                    ) : (
                        <p>Không có dữ liệu để hiển thị.</p>
                    )}
                </div>
            </Card>

            {/* Edit Modal */}
            <Modal title="Chỉnh sửa sản phẩm" visible={isModalVisible} onOk={handleOk} onCancel={() => setIsModalVisible(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item name="templateName" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="tagName" label="Tag" rules={[{ required: true, message: "Vui lòng nhập tag!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="coverImage" label="Ảnh bìa" rules={[{ required: true, message: "Vui lòng chọn ảnh bìa!" }]}>
                        <Upload
                            name="coverImage"
                            listType="picture"
                            beforeUpload={handleUpload}
                            maxCount={1}
                            accept="image/*"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                {uploading ? "Đang tải lên..." : "Chọn ảnh"}
                            </Button>
                        </Upload>
                        {coverImageUrl && (
                            <img
                                src={coverImageUrl}
                                alt="Cover Preview"
                                style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
                            />
                        )}
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
                        <Select>
                            <Select.Option value={1}>Active</Select.Option>
                            <Select.Option value={2}>Inactive</Select.Option>
                            <Select.Option value={3}>Out of Stock</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Add Modal */}
            <Modal title="Thêm mới sản phẩm" visible={isAddModalVisible} onOk={handleAddOk} onCancel={() => setIsAddModalVisible(false)}>
                <Form form={form} layout="vertical">
                    <Form.Item name="templateName" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item name="tagName" label="Tag" rules={[{ required: true, message: "Vui lòng nhập tag!" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="coverImage" label="Ảnh bìa" rules={[{ required: true, message: "Vui lòng chọn ảnh bìa!" }]}>
                        <Upload
                            name="coverImage"
                            listType="picture"
                            beforeUpload={handleUpload}
                            maxCount={1}
                            accept="image/*"
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} loading={uploading}>
                                {uploading ? "Đang tải lên..." : "Chọn ảnh"}
                            </Button>
                        </Upload>
                        {coverImageUrl && (
                            <img
                                src={coverImageUrl}
                                alt="Cover Preview"
                                style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
                            />
                        )}
                    </Form.Item>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
                        <Select>
                            <Select.Option value={1}>Active</Select.Option>
                            <Select.Option value={2}>Inactive</Select.Option>
                            <Select.Option value={3}>Out of Stock</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Detail Modal */}
            <TemplateDetails 
            visible={detailModalVisible} 
            onClose={() => setDetailModalVisible(false)} 
            detailItem={detailItem} 
            id={selectedTemplateId}
            onSuccess={reloadDetails} 
        />
        </div>
    );
};

export default TemplateManagement;