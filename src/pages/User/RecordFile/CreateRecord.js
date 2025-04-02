import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message, Spin } from "antd";
import { FcFolder } from "react-icons/fc";
import axios from "axios";

export default function CreateRecord({ onBack }) {
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [combinedPoems, setCombinedPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  const [data, setData] = useState({
    recordName: "",
    fileUrl: ""
  });

  // Sửa hàm fetchPoems trả về mảng
  async function fetchPoems(page = 1, size = 8) {
    const baseUrl = "https://api-poemtown-staging.nodfeather.win/api/poems/v1/mine";
    const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      // Trả về mảng dữ liệu
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Lỗi khi gọi API fetchPoems:", error);
      return [];
    }
  }

  // Sửa hàm fetchBoughtPoems trả về mảng
  async function fetchBoughtPoems(page = 1, size = 8) {
    const baseUrl = "https://api-poemtown-staging.nodfeather.win/api/usage-rights/v1/bought-poem";
    const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      console.error("Lỗi khi gọi API fetchBoughtPoems:", error);
      return [];
    }
  }

  // useEffect để fetch và kết hợp dữ liệu
  useEffect(() => {
    async function fetchAllRecords() {
      setIsLoading(true);
      try {
        // Gọi song song cả 2 API và nhận kết quả trả về
        const [fetchedPoems, fetchedBoughtPoems] = await Promise.all([
          fetchPoems(currentPage, pageSize),
          fetchBoughtPoems(currentPage, pageSize)
        ]);

        // Kết hợp 2 mảng trả về
        const combined = [...fetchedPoems, ...fetchedBoughtPoems];
        setCombinedPoems(combined);
        console.log("Combined:", combined);
      } catch (error) {
        console.error("Lỗi khi kết hợp dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAllRecords();
  }, [currentPage, pageSize]);

  const handleCreateRecordFile = async (poemId) => {
    try {
      const url = "https://api-poemtown-staging.nodfeather.win/api/record-files/v1";
      const response = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        params: { poemId }
      });

      message.success("Tạo bản ghi âm thành công!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra!");
    }
  };

  const handleUploadAudio = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setIsAudioUploading(true);
      try {
        const response = await fetch(
          "https://api-poemtown-staging.nodfeather.win/api/record-files/v1/audio",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            body: formData
          }
        );

        if (!response.ok) throw new Error("Failed to upload audio");

        const result = await response.json();
        const uploadedAudioUrl = result.data;

        message.success("Audio tải lên thành công!");
        sessionStorage.setItem("recordAudio", uploadedAudioUrl);
        setData((prev) => ({ ...prev, fileUrl: uploadedAudioUrl }));
      } catch (error) {
        message.error("Lỗi khi tải audio lên!");
        console.error(error);
      } finally {
        setIsAudioUploading(false);
      }
    }
  };

  // Khi click vào một dòng trong bảng
  const handleRowClick = (poem) => {
    setSelectedPoem(poem);
    form.resetFields();
    setData({
      recordName: "",
      fileUrl: ""
    });
    setIsModalVisible(true);
  };

  // Khi bấm nút Lưu của Modal
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setData((prev) => ({ ...prev, ...values }));
      if (selectedPoem) {
        const poemId = selectedPoem.poem ? selectedPoem.poem.id : selectedPoem.id;
        await handleCreateRecordFile(poemId);
      }
      setIsModalVisible(false);
    } catch (errorInfo) {
      console.error("Validation Failed:", errorInfo);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    {
      title: "Icon",
      dataIndex: "icon",
      render: (_, record) => <FcFolder size={32} />,
      width: 70,
    },
    {
      title: "Title",
      key: "title",
      render: (_, record) => {
        // Nếu record có thuộc tính 'poem', hiển thị record.poem.title, nếu không thì hiển thị record.title
        return record.poem ? record.poem.title : record.title;
      },
    },
    {
      title: "Description",
      key: "description",
      render: (_, record) => {
        return record.poem ? record.poem.description : record.description;
      },
    },
    {
      title: "Owner",
      key: "owner",
      render: (_, record) => {
        // Kiểm tra nếu record có thuộc tính 'poem'
        if (record.poem && record.poem.user) {
          return record.poem.user.displayName;
        }
        // Nếu không có, hiển thị owner trực tiếp từ record
        return record.owner ? record.owner.displayName : "Mine";
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleRowClick(record)}>
          Select
        </Button>
      ),
    },
  ];
  
  

  return (
    <>
      <Button
        onClick={onBack}
        style={{
          marginBottom: 16,
          padding: "12px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "all 0.3s ease"
        }}
      >
        ← Quay Lại Danh Sách
      </Button>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <Table
          dataSource={combinedPoems} // Dùng combinedPoems
          columns={columns}
          rowKey="id"
          onRow={(poem) => ({
            onClick: () => handleRowClick(poem)
          })}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "15"]
          }}
        />
      )}

      <Modal
        title={
          selectedPoem
      ? `Nhập thông tin tạo audio cho bài thơ: ${selectedPoem.poem ? selectedPoem.poem.title : selectedPoem.title}`
      : "Nhập thông tin"
        }
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        {selectedPoem && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{ recordName: "record_file" }}
            onValuesChange={(changedValues, allValues) => {
              console.log("Form values:", allValues);
              setData((prev) => ({ ...prev, ...allValues }));
            }}
          >
            <Form.Item
              label="Tên bản ghi âm"
              name="fileName"
              rules={[
                { required: true, message: "Vui lòng nhập tên bản ghi âm!" }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Chọn file audio" name="audioFile">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleUploadAudio}
                disabled={isAudioUploading}
              />
            </Form.Item>
            {isAudioUploading && (
              <div style={{ marginTop: "8px" }}>
                <Spin size="small" /> Đang tải file audio...
              </div>
            )}
            {data.fileUrl && (
              <Form.Item label="Audio đã tải lên">
                <audio controls src={data.fileUrl} style={{ width: "100%" }}>
                  Trình duyệt không hỗ trợ audio.
                </audio>
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>
    </>
  );
}
