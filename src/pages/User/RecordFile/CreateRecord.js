import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Menu,
  Dropdown,
  Upload
} from "antd";
import { FcFolder } from "react-icons/fc";
import { DownOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";

export default function CreateRecord({ onBack }) {
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedPoem, setSelectedPoem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [poems, setPoems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [activeButton, setActiveButton] = useState("mine");

  const accessToken = localStorage.getItem("accessToken");

  const [data, setData] = useState({
    recordName: "",
    fileUrl: ""
  });

  const fetchPoems = async (page, size) => {
    const url = `${process.env.REACT_APP_API_BASE_URL}/poems/v1/mine?pageNumber=${page}&pageSize=${size}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error("Lỗi khi fetch poems");
      const result = await response.json();
      setTotal(result.totalPages || 0);
      setPoems(result.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch poems:", err);
      message.error("Không thể tải danh sách bài thơ của bạn.");
    }
  };

  const fetchBoughtPoems = async (page, size) => {
    const url = `${process.env.REACT_APP_API_BASE_URL}/usage-rights/v1/bought-poem?pageNumber=${page}&pageSize=${size}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error("Lỗi khi fetch bought poems");
      const result = await response.json();
      setTotal(result.totalPages || 0);
      setPoems(result.data || []);
    } catch (err) {
      console.error("Lỗi khi fetch bought poems:", err);
      message.error("Không thể tải danh sách bài thơ đã mua.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = activeButton === "mine" ? fetchPoems : fetchBoughtPoems;
    fetchData(currentPage, pageSize).finally(() => setIsLoading(false));
  }, [activeButton, currentPage, pageSize]);

  const handleCreateRecordFile = async (poemId) => {
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/record-files/v1`;
      const response = await axios.post(
        url,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          params: { poemId }
        }
      );
      message.success("Tạo bản ghi âm thành công!");
      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tạo bản ghi âm!");
    }
  };

  const uploadProps = {
    name: "file",
    action: `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/audio`,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    accept: "audio/*",
    showUploadList: false,
    beforeUpload: () => {
      setIsAudioUploading(true);
      return true;
    },
    onChange(info) {
      if (info.file.status === "done") {
        const uploadedUrl = info.file.response?.data;
        if (uploadedUrl) {
          message.success(`${info.file.name} tải lên thành công`);
          setData((prev) => ({ ...prev, fileUrl: uploadedUrl }));
        }
        setIsAudioUploading(false);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} tải lên thất bại.`);
        setIsAudioUploading(false);
      }
    }
  };

  const handleRowClick = (poem) => {
    setSelectedPoem(poem);
    form.resetFields();
    setData({ recordName: "", fileUrl: "" });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = {
        ...data,
        recordName: values.recordName
      };
      setData(updatedData);
      const poemId = selectedPoem.poem ? selectedPoem.poem.id : selectedPoem.id;
      await handleCreateRecordFile(poemId);
      setIsModalVisible(false);
    } catch (err) {
      console.error("Validation Failed:", err);
    }
  };

  const columns = [
    {
      title: "Icon",
      dataIndex: "icon",
      render: () => <FcFolder size={32} />,
      width: 70
    },
    {
      title: "Title",
      key: "title",
      render: (_, record) => record.poem ? record.poem.title : record.title
    },
    {
      title: "Description",
      key: "description",
      render: (_, record) => record.poem ? record.poem.description : record.description
    },
    {
      title: "Owner",
      key: "owner",
      render: (_, record) => record.poem?.user?.displayName || record.owner?.displayName || "Mine"
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleRowClick(record)}>
          Select
        </Button>
      )
    }
  ];

  const menu = (
    <Menu>
      <Menu.Item key="mine" onClick={() => handleClick("mine")}>Của tôi</Menu.Item>
      <Menu.Item key="bought" onClick={() => handleClick("bought")}>Đã mua</Menu.Item>
    </Menu>
  );

  const handleClick = (type) => {
    setActiveButton(type);
    setCurrentPage(1);
  };

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
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        ← Quay Lại Danh Sách
      </Button>

      <div style={{ marginBottom: "50px" }}>
        <Dropdown.Button
          overlay={menu}
          trigger={["click"]}
          icon={<DownOutlined />}
          style={{ float: "right" }}
        >
          {activeButton === "mine" ? "Của tôi" : "Đã mua"}
        </Dropdown.Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <Table
          dataSource={poems}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            pageSizeOptions: ["1", "10", "15"]
          }}
        />
      )}

      <Modal
        title={
          selectedPoem
            ? `Tạo audio cho bài thơ: ${selectedPoem.poem ? selectedPoem.poem.title : selectedPoem.title}`
            : "Tạo bản ghi âm"
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ recordName: "record_file" }}
        >
          <Form.Item
            label="Tên bản ghi âm"
            name="recordName"
            rules={[{ required: true, message: "Vui lòng nhập tên bản ghi âm!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Chọn file audio" name="audioFile">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} disabled={isAudioUploading}>
                Chọn file audio
              </Button>
            </Upload>
          </Form.Item>
          {isAudioUploading && (
            <div style={{ marginTop: "8px" }}>
              <Spin size="small" /> Đang tải file audio...
            </div>
          )}
          {data.fileUrl && (
            <Form.Item label="Audio đã tải lên">
              <audio controls src={data.fileUrl} style={{ width: "100%" }} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}