import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Tag, message, Select } from 'antd';
import { UploadOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const BankManagement = () => {
    const [banks, setBanks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentBank, setCurrentBank] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [form] = Form.useForm();

    const statusMap = {
        1: { text: 'Hoạt động', color: 'green' },
        2: { text: 'Ngừng hoạt động', color: 'red' }
    };

    // Lấy danh sách ngân hàng
    const fetchBanks = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/bank-types/v1`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setBanks(response.data.data);
        } catch (error) {
            message.error('Lỗi khi tải danh sách ngân hàng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
    }, []);

    // Xử lý gửi form
    const handleSubmit = async (values) => {
        try {
            const method = editMode ? 'put' : 'post';
            const url = editMode
                ? `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1`
                : `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1`;

            await axios[method](url, editMode ? values : values, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            message.success(`Thao tác ${editMode ? 'cập nhật' : 'tạo mới'} ngân hàng thành công`);
            setModalVisible(false);
            fetchBanks();
        } catch (error) {
            message.error(error.response?.data?.errorMessage || 'Thao tác thất bại');
        }
    };
    const uploadButton = (
        <div>
            {uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}
            <div style={{ marginTop: 8 }}>
                {uploadLoading ? 'Đang tải lên...' : 'Chọn ảnh'}
            </div>
        </div>
    );

    // Xử lý xóa
    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa ngân hàng này?',
            onOk: async () => {
                try {
                    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/${id}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    });
                    message.success('Xóa ngân hàng thành công');
                    fetchBanks();
                } catch (error) {
                    message.error('Xóa thất bại');
                }
            }
        });
    };

    // Xử lý tải ảnh lên
    const handleImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/bank-types/v1/upload-icon`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    }
                }
            );

            form.setFieldsValue({ imageIcon: response.data.data });
            return response.data.data;
        } catch (error) {
            message.error('Tải ảnh lên thất bại');
            return false;
        }
    };

    const columns = [
        {
            title: 'Tên ngân hàng',
            dataIndex: 'bankName',
            key: 'bankName',
        },
        {
            title: 'Mã ngân hàng',
            dataIndex: 'bankCode',
            key: 'bankCode',
        },
        {
            title: 'Biểu tượng',
            dataIndex: 'imageIcon',
            key: 'imageIcon',
            render: image => image && (
                <div style={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    overflow: 'hidden'
                }}>
                    <img 
                        src={image} 
                        alt="biểu tượng" 
                        style={{ 
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            display: 'block' 
                        }}
                    />
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            render: (_, record) => (
                <div>
                    <Button onClick={() => {
                        setCurrentBank(record);
                        setEditMode(true);
                        form.setFieldsValue(record);
                        setModalVisible(true);
                    }}>Sửa</Button>

                    <Button danger onClick={() => handleDelete(record.id)}>
                        Xóa
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditMode(false);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm ngân hàng mới
                </Button>
            </div>

            <Table
                dataSource={banks}
                columns={columns}
                loading={loading}
                rowKey="id"
            />

            <Modal
                title={`${editMode ? 'Chỉnh sửa' : 'Thêm'} ngân hàng`}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleSubmit}
                    layout="vertical"
                    initialValues={{ status: 1 }}
                >
                    {editMode && (
                        <Form.Item name="id" hidden>
                            <Input />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="bankName"
                        label="Tên ngân hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="bankCode"
                        label="Mã ngân hàng"
                        rules={[{ required: true, message: 'Vui lòng nhập mã ngân hàng' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="imageIcon"
                        label="Biểu tượng"
                        rules={[{ required: true, message: 'Vui lòng tải lên biểu tượng' }]}
                    >
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            customRequest={async ({ file }) => {
                                setUploadLoading(true);
                                try {
                                    const url = await handleImageUpload(file);
                                    if (url) {
                                        message.success('Tải ảnh lên thành công');
                                    }
                                } catch (error) {
                                    message.error('Tải ảnh lên thất bại');
                                } finally {
                                    setUploadLoading(false);
                                }
                            }}
                        >
                            {form.getFieldValue('imageIcon') ? (
                                <img
                                    src={form.getFieldValue('imageIcon')}
                                    alt="biểu tượng"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        display: 'block'
                                    }}
                                />
                            ) : uploadButton}
                        </Upload>
                        <div style={{ marginTop: 8, color: '#999' }}>
                            Kích thước đề xuất: 100x100px
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Select.Option value={1}>Hoạt động</Select.Option>
                            <Select.Option value={2}>Ngừng hoạt động</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editMode ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BankManagement;