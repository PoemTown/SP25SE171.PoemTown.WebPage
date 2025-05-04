import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, Modal, Form, Input, message, Image, Upload, Col, Row, Divider, Radio, Descriptions, Collapse } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const ComplaintsManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolveModalVisible, setResolveModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    const complaintStatusMap = {
        3: { text: "Đang chờ", color: "gold", icon: <ClockCircleOutlined /> },
        1: { text: "Đã chấp nhận", color: "green", icon: <CheckCircleOutlined /> },
        2: { text: "Đã từ chối", color: "red", icon: <CloseCircleOutlined /> },
    };

    const fetchComplaints = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem("accessToken");
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1?sortOptions=2`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { pageNumber: page, pageSize }
            });

            setComplaints(response.data.data);
            setPagination({
                current: response.data.pageNumber,
                pageSize: response.data.pageSize,
                total: response.data.totalRecords,
            });
        } catch (error) {
            message.error("Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleResolve = async (values) => {
        try {
            const accessToken = localStorage.getItem("accessToken");

            // Upload images first
            const images = await Promise.all(
                fileList.map(file =>
                    axios.post(`${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/image`,
                        { file: file.originFileObj },
                        { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'multipart/form-data' } }
                    ).then(res => res.data.data)
                )
            );

            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/withdrawal-complaints/v1/${selectedComplaint.id}/resolve`,
                {
                    resolveDescription: values.resolveDescription,
                    status: values.status,
                    images: images
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            message.success("Complaint resolved successfully");
            setResolveModalVisible(false);
            fetchComplaints(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error(error.response?.data?.errorMessage || "Failed to resolve complaint");
        }
    };

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={complaintStatusMap[status].color} icon={complaintStatusMap[status].icon}>
                    {complaintStatusMap[status].text}
                </Tag>
            )
        },
        {
            title: 'Thời gian tạo',
            dataIndex: 'createdTime',
            key: 'createdTime',
            render: text => moment(text).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setSelectedComplaint(record);
                            setDetailModalVisible(true);
                        }}
                    >
                        Xem chi tiết
                    </Button>
                    {record.status === 3 && (
                        <Button
                            type="primary"
                            onClick={() => {
                                setSelectedComplaint(record);
                                setResolveModalVisible(true);
                            }}
                        >
                            Giải quyết
                        </Button>
                    )}
                </Space>
            )
        }
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={complaints}
                rowKey="id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => fetchComplaints(page, pageSize)
                }}
            />

            {/* Detail Modal */}
            <Modal
                title={`Chi tiết khiếu nại #${selectedComplaint?.id}`}
                visible={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={800}
            >
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Tiêu đề">{selectedComplaint?.title}</Descriptions.Item>
                    <Descriptions.Item label="Mô tả">{selectedComplaint?.description}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={complaintStatusMap[selectedComplaint?.status]?.color}>
                            {complaintStatusMap[selectedComplaint?.status]?.text}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian tạo">
                        {moment(selectedComplaint?.createdTime).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                </Descriptions>

                <Collapse ghost defaultActiveKey={[]} style={{ marginTop: 16 }}>
                    {/* Complaint Images Collapse */}
                    {selectedComplaint?.complaintImages?.length > 0 && (
                        <Collapse.Panel
                            header={`Ảnh đính kèm khiếu nại (${selectedComplaint.complaintImages.length})`}
                            key="1"
                        >
                            <Image.PreviewGroup>
                                <Row gutter={[16, 16]}>
                                    {selectedComplaint.complaintImages.map((img, i) => (
                                        <Col span={6} key={i}>
                                            <Image
                                                src={img.image}
                                                style={{ borderRadius: 8 }}
                                                alt={`Complaint Image ${i + 1}`}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Image.PreviewGroup>
                        </Collapse.Panel>
                    )}

                    {/* Resolve Images Collapse */}
                    {selectedComplaint?.resolveImages?.length > 0 && (
                        <Collapse.Panel
                            header={`Ảnh giải quyết (${selectedComplaint.resolveImages.length})`}
                            key="2"
                        >
                            <Image.PreviewGroup>
                                <Row gutter={[16, 16]}>
                                    {selectedComplaint.resolveImages.map((img, i) => (
                                        <Col span={6} key={i}>
                                            <Image
                                                src={img.image}
                                                style={{ borderRadius: 8 }}
                                                alt={`Resolve Image ${i + 1}`}
                                            />
                                            <div style={{ textAlign: 'center', marginTop: 4 }}>
                                                <Tag color="blue">Phản hồi từ hệ thống</Tag>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Image.PreviewGroup>
                        </Collapse.Panel>
                    )}
                </Collapse>
            </Modal>

            {/* Resolve Modal (keep existing resolve modal but add image section) */}
            <Modal
                title={`Giải quyết khiếu nại #${selectedComplaint?.id}`}
                visible={resolveModalVisible}
                onCancel={() => setResolveModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form form={form} onFinish={handleResolve} layout="vertical">
                    <Form.Item
                        name="status"
                        label="Trạng thái giải quyết"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Radio.Group>
                            <Radio value={1}>Chấp nhận</Radio>
                            <Radio value={2}>Từ chối</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item
                        name="resolveDescription"
                        label="Mô tả giải quyết"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả giải quyết' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        label="Ảnh minh chứng giải quyết"
                        extra="Tải lên ảnh minh chứng giải quyết (tối đa 5 ảnh)"
                    >
                        <Upload
                            multiple
                            maxCount={5}
                            fileList={fileList}
                            onChange={({ fileList }) => setFileList(fileList)}
                            beforeUpload={() => false}
                            accept="image/*"
                        >
                            <Button>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ float: "right" }}>
                            Xác nhận giải quyết
                        </Button>
                    </Form.Item>
                </Form>
                <hr style={{ border: "1px solid #f1f1f1" }} />
                <Divider orientation="center">Ảnh khiếu nại ban đầu</Divider>
                <Image.PreviewGroup>
                    <Row gutter={[16, 16]}>
                        {selectedComplaint?.complaintImages?.map((img, i) => (
                            <Col span={6} key={i}>
                                <Image
                                    src={img.image}
                                    style={{ borderRadius: 8 }}
                                    alt={`Complaint Image ${i + 1}`}
                                />
                            </Col>
                        ))}
                    </Row>
                </Image.PreviewGroup>
            </Modal>
        </>
    );
};


export default ComplaintsManagement;