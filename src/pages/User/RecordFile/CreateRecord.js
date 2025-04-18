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
  Upload,
  Progress, // Thêm component Progress
  Row,
  Col,
  Card
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  // Thêm state mới
  const [currentFile, setCurrentFile] = useState(null);
  const accessToken = localStorage.getItem("accessToken");

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

  const handleCreateRecordFile = async () => {
    try {
      const values = await form.validateFields();
      const poemId = selectedPoem?.poemId;

      if (!poemId) {
        message.error("Không tìm thấy bài thơ!");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/record-files/v1`,
        {
          fileName: values.recordName,
          fileUrl: values.audioFile
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          params: { poemId }
        }
      );

      message.success("Tạo bản ghi âm thành công!");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error:", error);
      message.error("Có lỗi xảy ra khi tạo bản ghi âm!");
    }
  };


  const uploadProps = {
    name: "file",
    accept: "audio/*",
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError, onProgress }) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsAudioUploading(true);
        setCurrentFile(file);

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/audio`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "multipart/form-data"
            },
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percent);
              onProgress({ percent });
            }
          }
        );

        onSuccess(response.data);
        form.setFieldsValue({ audioFile: response.data.data });
        setAudioUrl(response.data.data);
        message.success(`${file.name} tải lên thành công`);
      } catch (error) {
        onError(error);
        message.error(`${file.name} tải lên thất bại`);
      } finally {
        setIsAudioUploading(false);
        setUploadProgress(0);
        setCurrentFile(null);
      }
    },
    beforeUpload: (file) => {
      if (!file.type.startsWith("audio/")) {
        message.error("Chỉ được phép tải lên file audio!");
        return false;
      }
      if (isAudioUploading) {
        message.warning("Vui lòng đợi file hiện tại upload xong");
        return false;
      }
      return true;
    }
  };


  const handleRowClick = (record) => {
    const poemId = record.poem?.id || record.id;
    setSelectedPoem({
      ...record,
      poemId
    });
    form.resetFields();
    setIsModalVisible(true);
  };


  const columns = [
    {
      title: "Icon",
      dataIndex: "icon",
      render: () => <FcFolder size={32} />,
      width: 70,
      align: 'center'
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (_, record) => (
        <div style={{ fontWeight: 500 }}>
          {record.poem ? record.poem.title : record.title}
        </div>
      )
    },
    {
      title: "Mô tả",
      key: "description",
      render: (_, record) => (
        <div style={{ color: '#666' }}>
          {record.poem ? record.poem.description : record.description}
        </div>
      )
    },
    {
      title: "Chủ sở hữu",
      key: "owner",
      render: (_, record) => (
        <div style={{ fontStyle: 'italic' }}>
          {record.poem?.user?.displayName || record.owner?.displayName || "Của bạn"}
        </div>
      )
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleRowClick({
            ...record,
            poemId: record.poem?.id || record.id // Đảm bảo có poemId
          })}
        >
          Chọn
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
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button
            onClick={onBack}
            type="primary"
            style={{
              padding: '0 24px',
              height: 40,
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            ← Quay lại
          </Button>
        </Col>
        <Col>
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button
              type="default"
              style={{
                width: 150,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              {activeButton === "mine" ? "Của tôi" : "Đã mua"}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
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
              pageSizeOptions: ["5", "10", "20"],
              locale: { items_per_page: '/ trang' }
            }}
            scroll={{ x: true }}
          />
        )}
      </Card>

      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 600 }}>
            {selectedPoem?.poem?.title || selectedPoem?.title}
          </div>
        }
        open={isModalVisible}
        onOk={handleCreateRecordFile}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Tạo bản ghi"
        cancelText="Hủy"
        okButtonProps={{
          disabled: isAudioUploading,
          style: { borderRadius: '6px' }
        }}
        cancelButtonProps={{ style: { borderRadius: '6px' } }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ recordName: "", audioFile: null }}
        >
          <Form.Item
            label="Tên bản ghi"
            name="recordName"
            rules={[{
              required: true,
              message: "Vui lòng nhập tên bản ghi!"
            }]}
          >
            <Input
              placeholder="Nhập tên bản ghi..."
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            label="File audio"
            name="audioFile"
            rules={[{
              required: true,
              message: "Vui lòng tải lên file audio!"
            }]}
            valuePropName="fileUrl"
          >
            <Upload {...uploadProps}>
              <Button
                icon={<UploadOutlined />}
                disabled={isAudioUploading}
                style={{ borderRadius: '6px' }}
              >
                Chọn file audio
              </Button>
            </Upload>
          </Form.Item>

          {isAudioUploading && (
            <div style={{ marginTop: 16 }}>
              <Progress
                percent={uploadProgress}
                status="active"
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#52c41a',
                }}
                showInfo={false}
              />
              <div style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'space-between',
                color: '#666'
              }}>
                <span>{currentFile?.name}</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          )}

          {audioUrl && (
            <div style={{ marginTop: 16 }}> 
              <audio
                controls
                src={form.getFieldValue('audioFile')}
                style={{ width: '100%' }}
              />
              <Button
                type="link"
                danger
                onClick={() => {
                  setAudioUrl("");
                  form.setFieldsValue({ audioFile: null }); // CHỈ CẦN RESET FORM
                }}
                style={{ marginTop: 8 }}
              >
                Xóa file
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}