import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Card,
    Tag,
    Timeline,
    List,
    Avatar,
    Spin,
    Typography,
    Collapse,
    Empty,
    Button,
    Modal,
    Form,
    InputNumber,
    Switch,
    notification,
    Divider
} from "antd";
import {
    ShoppingCartOutlined,
    HistoryOutlined,
    GiftOutlined,
    DollarOutlined,
    HourglassOutlined
} from "@ant-design/icons";
import axios from "axios";
import Headeruser from "../../components/Headeruser";
import Headerdefault from "../../components/Headerdefault";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const PoemVersionPage = () => {
    const { poemId } = useParams();
    const [version, setVersion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const accessToken = localStorage.getItem("accessToken");
    const Status = Object.freeze({
        1: "Trả phí",
        3: "Miễn phí",
        4: "Default",
        2: "Không sử dụng"
    });
    useEffect(() => {
        fetchVersions();
        setIsLoggedIn(!!accessToken);
    }, [poemId]);

    const fetchVersions = async () => {
        try {
            const pageSize = 100;        // hoặc giá trị từ state
            const pageNumber = 1;       // hoặc giá trị từ state
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/usage-rights/v1/poem-version/${poemId}?pageSize=${pageSize}&pageNumber=${pageNumber}`
                ,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setVersion(response.data.data);

        } catch (error) {
            console.error("Error fetching versions:", error);
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải dữ liệu phiên bản'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFreeVersion = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/free/${poemId}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            notification.success({
                message: 'Thành công',
                description: 'Đã chuyển sang phiên bản miễn phí'
            });
            fetchVersions();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: error.response?.data?.errorMessage || 'Cập nhật thất bại'
            });
        }
    };

    const handleSellVersion = async (values) => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/enable-selling`,
                {
                    poemId,
                    ...values
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            notification.success({
                message: 'Thành công',
                description: 'Cập nhật phiên bản trả phí thành công'
            });
            setIsModalVisible(false);
            fetchVersions();
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: error.response?.data?.errorMessage || 'Cập nhật thất bại'
            });
        }
    };

    const currentVersion = version?.find(v => v?.isInUse) || null;
    const olderVersions = version?.filter(v => !v?.isInUse) || [];
    console.log(olderVersions)
    const BuyerList = ({ usageRights }) => (
        <List
            itemLayout="horizontal"
            dataSource={usageRights || []}
            renderItem={usageRights => (
                <List.Item>
                    <Collapse
                        ghost
                        expandIconPosition="end"
                        style={{ width: '100%' }}
                    >
                        <Panel
                            key={usageRights.buyer?.id}
                            header={
                                <List.Item.Meta
                                    avatar={<Avatar src={usageRights.buyer?.avatar || "/default-avatar.png"} />}
                                    title={<Text strong>{usageRights.buyer?.displayName || "Không tên"}</Text>}
                                    description={`@${usageRights.buyer?.userName || "unknown"}`}
                                />
                            }
                        >
                            <div style={{ paddingLeft: 42 }}>
                                <div style={{ marginBottom: 8 }}>
                                    <Text type="secondary">
                                        <ShoppingCartOutlined /> Ngày mua: {
                                            usageRights.copyRightValidFrom ?
                                                new Date(usageRights.copyRightValidFrom).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                }) :
                                                "N/A"
                                        }
                                    </Text>
                                </div>

                                <div>
                                    <Text type="secondary">
                                        <HourglassOutlined /> Ngày hết hạn: {
                                            usageRights?.copyRightValidTo ?
                                                new Date(usageRights.copyRightValidTo).toLocaleDateString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                }) :
                                                "Vô thời hạn"
                                        }
                                    </Text>
                                </div>
                            </div>
                        </Panel>
                    </Collapse>
                </List.Item>
            )}
            locale={{ emptyText: "Chưa có người mua phiên bản này" }}
        />
    );

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '20% auto' }} />;
    }

    if (!version || !Array.isArray(version)) {
        return <Empty description="Không tìm thấy dữ liệu phiên bản" style={{ marginTop: 80 }} />;
    }

    return (
        <>{isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
                <Title level={2} style={{ marginBottom: 24 }}>
                    <HistoryOutlined /> {version[0]?.poem?.title || 'Quản lý phiên bản'}
                </Title>

                {/* Phiên bản hiện tại */}
                <Card
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Tag color="green">PHIÊN BẢN HIỆN TẠI</Tag>
                            <Text strong>#{currentVersion?.id?.slice(0, 8)}</Text>
                        </div>
                    }
                    style={{ marginBottom: 24 }}
                    extra={
                        <div style={{ display: 'flex', gap: 12 }}>
                            <Button
                                type="primary"
                                icon={<GiftOutlined />}
                                onClick={handleFreeVersion}
                                disabled={currentVersion?.price === 0}
                            >
                                Miễn phí
                            </Button>
                            <Button
                                type="primary"
                                icon={<DollarOutlined />}
                                onClick={() => setIsModalVisible(true)}
                                disabled={currentVersion?.price > 0}
                            >
                                Bán lại
                            </Button>
                        </div>
                    }
                >
                    <div className="version-details-grid">
                        <DetailItem
                            label="Trạng thái"
                            value={Status[currentVersion?.status] || "Không xác định"}
                            icon={<Tag color={currentVersion?.price === 0 ? "green" : "gold"} />}
                        />
                        <DetailItem
                            label="Giá"
                            value={currentVersion?.price === 0 ?
                                "Miễn phí" :
                                `${currentVersion?.price?.toLocaleString()} VND`
                            }
                        />
                        <DetailItem
                            label="Thời hạn"
                            value={currentVersion?.durationTime > 50 || currentVersion?.durationTime === 0 ?
                                "Vô thời hạn" :
                                `${currentVersion?.durationTime} năm kể từ ngày bán`
                            }
                        />
                        <DetailItem
                            label="Hoa hồng"
                            value={currentVersion?.commissionPercentage === 0 ?
                                "Không có" :
                                `${currentVersion?.commissionPercentage}%`
                            }
                        />
                    </div>

                    <Divider />

                    <Title level={5} style={{ marginBottom: 12 }}>
                        <ShoppingCartOutlined /> Người đã mua ({currentVersion?.usageRights?.length || 0})
                    </Title>
                    <BuyerList usageRights={currentVersion?.usageRights} />
                </Card>

                {/* Modal cài đặt bán */}
                <Modal
                    title="Cài đặt phiên bản trả phí"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    onOk={() => form.submit()}
                    okText="Lưu cài đặt"
                    cancelText="Huỷ bỏ"
                    centered
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            price: 0,
                            commissionPercentage: 0,
                            durationTime: 1
                        }}
                        onFinish={handleSellVersion}
                    >
                        <Form.Item
                            label="Giá bán (VND)"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={10000}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Phần trăm hoa hồng (%)"
                            name="commissionPercentage"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập phần trăm hoa hồng'
                                },
                                {
                                    type: 'number',
                                    min: 0,
                                    max: 100,
                                    message: 'Phần trăm phải từ 0 đến 100'
                                }
                            ]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Thời hạn (năm)"
                            name="durationTime"
                            rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                                addonAfter={
                                    <Switch
                                        checkedChildren="Vô thời hạn"
                                        unCheckedChildren="Giới hạn"
                                        onChange={checked =>
                                            form.setFieldsValue({ durationTime: checked ? 999 : 1 })
                                        }
                                    />
                                }
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Lịch sử phiên bản */}
                <Collapse ghost defaultActiveKey={[]}>
                    <Panel
                        header={`LỊCH SỬ PHIÊN BẢN (${olderVersions?.length || 0})`}
                        key="history"
                        extra={<HistoryOutlined style={{ fontSize: 16 }} />}
                    >
                        {olderVersions?.length > 0 ? (
                            <Timeline mode="alternate">
                                {olderVersions.map((version) => (
                                    <Timeline.Item
                                        label={version?.createdTime ?
                                            new Date(version.createdTime).toLocaleDateString() :
                                            'N/A'
                                        }
                                    >
                                        <Card
                                            title={`Version ${version?.id?.slice(0, 8)}`}
                                            style={{ width: '100%' }}
                                            extra={<Tag color="volcano">CŨ</Tag>}
                                        >
                                            <div className="version-details-grid"> 
                                                <DetailItem
                                                    label="Trạng thái"
                                                    value={Status[version?.status] || "Không xác định"}
                                                    icon={<Tag color={version?.price === 0 ? "green" : "gold"} />}
                                                />
                                                <DetailItem
                                                    label="Giá"
                                                    value={version?.price === 0 ?
                                                        "Miễn phí" :
                                                        `${version?.price?.toLocaleString()} VND`
                                                    }
                                                />
                                                <DetailItem
                                                    label="Thời hạn"
                                                    value={version?.durationTime > 50 || version?.durationTime === 0 ?
                                                        "Vô thời hạn" :
                                                        `${version?.durationTime} năm`
                                                    }
                                                />
                                                <DetailItem
                                                    label="Hoa hồng"
                                                    value={version?.commissionPercentage === 0 ?
                                                        "Không có" :
                                                        `${version?.commissionPercentage}%`
                                                    }
                                                />
                                            </div>

                                            <Title level={5} style={{ marginBottom: 12, marginTop: 16 }}>
                                                <ShoppingCartOutlined /> Người đã mua ({version?.usageRights?.length || 0})
                                            </Title>
                                            <List
                                                dataSource={version?.usageRights || []}
                                                renderItem={usageRights => (
                                                    <List.Item>
                                                        <Collapse
                                                            ghost
                                                            expandIconPosition="end"
                                                            style={{ width: '100%' }}
                                                        >
                                                            <Panel
                                                                key={usageRights.buyer?.id}
                                                                header={
                                                                    <List.Item.Meta
                                                                        avatar={<Avatar src={usageRights.buyer?.avatar || "/default-avatar.png"} />}
                                                                        title={<Text strong>{usageRights.buyer?.displayName || "Không tên"}</Text>}
                                                                        description={`@${usageRights.buyer?.userName || "unknown"}`}
                                                                    />
                                                                }
                                                            >
                                                                <div style={{ paddingLeft: 42 }}>
                                                                    <div style={{ marginBottom: 8 }}>
                                                                        <Text type="secondary">
                                                                            <ShoppingCartOutlined /> Ngày mua: {
                                                                                usageRights.copyRightValidFrom ?
                                                                                    new Date(usageRights.copyRightValidFrom).toLocaleDateString('vi-VN', {
                                                                                        day: '2-digit',
                                                                                        month: '2-digit',
                                                                                        year: 'numeric'
                                                                                    }) :
                                                                                    "N/A"
                                                                            }
                                                                        </Text>
                                                                    </div>

                                                                    <div>
                                                                        <Text type="secondary">
                                                                            <HourglassOutlined /> Ngày hết hạn: {
                                                                                usageRights?.copyRightValidTo ?
                                                                                    new Date(usageRights.copyRightValidTo).toLocaleDateString('vi-VN', {
                                                                                        day: '2-digit',
                                                                                        month: '2-digit',
                                                                                        year: 'numeric'
                                                                                    }) :
                                                                                    "Vô thời hạn"
                                                                            }
                                                                        </Text>
                                                                    </div>
                                                                </div>
                                                            </Panel>
                                                        </Collapse>
                                                    </List.Item>
                                                )}
                                                locale={{ emptyText: "Chưa có người mua phiên bản này" }}
                                            />
                                        </Card>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                        ) : (
                            <Empty description="Không có phiên bản cũ nào" />
                        )}
                    </Panel>
                </Collapse>
            </div>
        </>
    );
};


const DetailItem = ({ label, value, icon }) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {icon}
        <Text strong>{label}:</Text>
        <Text>{value}</Text>
    </div>
);

export default PoemVersionPage;