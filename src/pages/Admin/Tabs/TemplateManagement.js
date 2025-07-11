import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Input, Form, Tag, Select, Upload, message, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import TemplateDetails from "../Form/TemplateDetails";

const STATUS_LABELS = {
  1: { text: "Khả dụng", color: "green" },
  2: { text: "Không khả dụng", color: "gray" },
  3: { text: "Hết hàng", color: "red" }
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
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data function (reusable)
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates`
      );

      if (response.data?.statusCode === 200 && Array.isArray(response.data.data)) {
        const validItems = response.data.data
          .filter(item => item != null)
          .map(item => ({
            id: item.id || Date.now().toString(),
            templateName: item.templateName || "Không có tên",
            price: item.price || 0,
            coverImage: item.coverImage || "",
            status: item.status || 2,
            tagName: item.tagName || "Không có tag",
            isBought: item.isBought || false,
            type: item.type || 2
          }));

        setItems(validItems);
      } else {
        console.error("Invalid API response structure:", response.data);
        message.error("Dữ liệu từ API không hợp lệ");
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Check if item is default (cannot be edited/deleted)
  const isDefaultItem = (item) => {
    return item?.tagName?.toUpperCase() === "DEFAULT";
  };

  // Handle edit item
  const handleEdit = (record) => {
    if (!record || isDefaultItem(record)) {
      message.warning("Không thể chỉnh sửa mẫu DEFAULT");
      return;
    }

    setEditingItem(record);
    setCoverImageUrl(record.coverImage || "");
    form.setFieldsValue({
      templateName: record.templateName || "",
      price: record.price || 0,
      tagName: record.tagName || "",
      status: record.status || 2,
    });
    setIsModalVisible(true);
  };

  // Handle delete item
  const handleDelete = async (id) => {
    const itemToDelete = items.find(item => item?.id === id);
    if (!itemToDelete || isDefaultItem(itemToDelete)) {
      message.warning("Không thể xóa mẫu DEFAULT!");
      return;
    }

    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setActionLoading(true);
        try {
          const response = await axios.delete(
            `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/${id}`,
            {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200) {
            message.success("Xóa thành công!");
            await fetchData(); // Refresh data after delete
          } else {
            message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
          }
        } catch (error) {
          console.error("Lỗi khi xóa:", error);
          message.error("Xóa thất bại!");
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Handle save (edit)
  const handleOk = async () => {
    if (!coverImageUrl) {
      message.error("Vui lòng tải lên ảnh bìa trước khi lưu!");
      return;
    }

    setActionLoading(true);
    try {
      const values = await form.validateFields();
      const updatedValues = {
        ...values,
        coverImage: coverImageUrl,
        id: editingItem?.id
      };

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates`,
        updatedValues,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Cập nhật thành công!");
        setIsModalVisible(false);
        await fetchData(); // Refresh data after update
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra!");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle add new item
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setCoverImageUrl(null);
    setIsAddModalVisible(true);
  };

  // Handle save new item
  const handleAddOk = async () => {
    if (!coverImageUrl) {
      message.error("Vui lòng tải lên ảnh bìa trước khi lưu!");
      return;
    }

    setActionLoading(true);
    try {
      const values = await form.validateFields();
      const newItem = {
        ...values,
        coverImage: coverImageUrl
      };

      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates`,
        newItem,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Thêm mới thành công!");
        setIsAddModalVisible(false);
        await fetchData(); // Refresh data after add
      }
    } catch (error) {
      console.error("Error:", error);
      message.error("Thêm mới thất bại!");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/${id}`
      );

      if (response.data?.statusCode === 200 && response.data.data) {
        setDetailItem(response.data.data);
        setDetailModalVisible(true);
        setSelectedTemplateId(id);
      } else {
        console.error("Invalid detail response:", response.data);
        message.error("Dữ liệu chi tiết không hợp lệ");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
      message.error("Không thể tải chi tiết");
    }
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
        `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates/cover-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.statusCode === 201 && response.data.data) {
        setCoverImageUrl(response.data.data);
        message.success("Upload ảnh thành công!");
        return true;
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
        loading={loading}
      >
        {items.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
            {items.map((item) => {
              if (!item) return null;

              const isDefault = isDefaultItem(item);
              return (
                <Card
                  key={item.id}
                  title={item.templateName}
                  extra={
                    <>
                      <Tooltip title={isDefault ? "Không thể chỉnh sửa mẫu DEFAULT" : ""}>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => handleEdit(item)}
                          style={{ marginRight: 8 }}
                          disabled={isDefault}
                        />
                      </Tooltip>
                      <Tooltip title={isDefault ? "Không thể xóa mẫu DEFAULT" : ""}>
                        <Button
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(item.id)}
                          danger
                          disabled={isDefault}
                        />
                      </Tooltip>
                    </>
                  }
                  style={{ width: 250, position: "relative" }}
                >
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt="Cover"
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "8px"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/250x150?text=No+Image";
                      }}
                    />
                  )}
                  <p>Giá: {item.price} VND</p>
                  <p>Trạng thái: <Tag color={STATUS_LABELS[item.status]?.color}>
                    {STATUS_LABELS[item.status]?.text}
                  </Tag></p>
                  <p>Tag: <Tag color={isDefault ? "gold" : "volcano"}>{item.tagName}</Tag></p>
                  <p>Loại: {TYPE_LABELS[item.type] || "Không xác định"}</p>
                  <div style={{ position: "absolute", bottom: 8, right: 8 }}>
                    <Button type="primary" onClick={() => handleViewDetails(item.id)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <p>Không có dữ liệu để hiển thị.</p>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa sản phẩm"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{
          disabled: !coverImageUrl || actionLoading,
          loading: actionLoading,
          title: !coverImageUrl ? "Vui lòng tải lên ảnh bìa trước khi lưu" : undefined
        }}
        cancelButtonProps={{
          disabled: actionLoading
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
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
          <Form.Item label="Ảnh bìa" required>
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
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/250x150?text=Image+Error";
                }}
              />
            )}
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
            <Select>
              <Select.Option value={1}>Khả dụng</Select.Option>
              <Select.Option value={2}>Không khả dụng</Select.Option>
              <Select.Option value={3}>Hết hàng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        title="Thêm mới sản phẩm"
        visible={isAddModalVisible}
        onOk={handleAddOk}
        onCancel={() => setIsAddModalVisible(false)}
        okButtonProps={{
          disabled: !coverImageUrl || actionLoading,
          loading: actionLoading,
          title: !coverImageUrl ? "Vui lòng tải lên ảnh bìa trước khi lưu" : undefined
        }}
        cancelButtonProps={{
          disabled: actionLoading
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical"
          initialValues={{
            status: 2 // Default value for the "status" field
          }}
        >
          <Form.Item name="templateName" label="Tên sản phẩm" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="tagName" label="Tag" rules={[{ required: true, message: "Vui lòng nhập tag!" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Ảnh bìa" required>
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
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/250x150?text=Image+Error";
                }}
              />
            )}
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}>
            <Select>
              <Select.Option value={1}>Khả dụng</Select.Option>
              <Select.Option value={2}>Không khả dụng</Select.Option>
              <Select.Option value={3}>Hết hàng</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      {detailItem && (
        <TemplateDetails
          visible={detailModalVisible}
          onClose={() => setDetailModalVisible(false)}
          detailItem={detailItem}
          id={selectedTemplateId}
          onSuccess={reloadDetails}
        />
      )}
    </div>
  );
};

export default TemplateManagement;