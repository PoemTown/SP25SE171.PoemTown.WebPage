import React, { useEffect, useState } from "react";
import {
    Button,
    Card,
    Grid,
    Spin,
    Typography,
    Tag,
    Divider,
    Space,
    Dropdown,
    Menu,
    InputNumber,
    Form,
    Modal,
    message,
    Pagination,
    Row,
    Col
} from "antd";
import {
    FcFolder,
    FcSalesPerformance,
    FcPaid,
    FcClock
} from "react-icons/fc";
import { DownOutlined, FieldTimeOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PoemCard = styled(Card)`
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
    cursor: pointer;
  }
`;

const StatusTag = styled(Tag)`
  position: absolute;
  top: 16px;
  right: 16px;
  font-weight: 600;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 12px;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
`;

const UsageRight = () => {
    const [form] = Form.useForm(); // Dùng cho modal nhập giá
    const [currentPage, setCurrentPage] = useState(1);
    const [activeButton, setActiveButton] = useState("mine");
    const [poems, setPoems] = useState([]);
    const [pageSize, setPageSize] = useState(5);
    const [selectedPoem, setSelectedPoem] = useState(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isPriceModalVisible, setIsPriceModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [total, setTotal] = useState(0);
    const [price, setPrice] = useState(null);
    const [commissionFee, setCommissionFee] = useState(null);
    const [time, setTime] = useState(null);
    const [showVersionOptions, setShowVersionOptions] = useState(false);
    const screens = useBreakpoint();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("mine");
    const navigate = useNavigate();
    const Status = Object.freeze({
        1: "Selling",
        3: "Free",
        4: "Default",
        2: "Not in sale"
    });

    function formatDate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }


    const versions = [
        {
            value: "3",
            title: "Miễn phí",
        },
        {
            value: "1",
            title: "Trả tiền",
        },
    ];
    const handleViewVersions = (poemId) => {
        navigate(`/poems/versions/${poemId}`);
    };

    const renderStatus = (status) => {
        const statusConfig = {
            true: { color: "green", text: "Đang bán" },
            false: { color: "gray", text: "Mới tạo" }
        };
        return (
            <Tag color={statusConfig[status].color}>
                {statusConfig[status].text}
            </Tag>
        );
    };

    const renderPoemCard = (poem) => (
        <PoemCard
            onClick={() => handleViewVersions(poem.id)}
            cover={
                <FcFolder style={{
                    fontSize: "4em",
                    padding: "24px",
                    opacity: 0.8
                }} />
            }
        >
            <StatusTag color={poem.status?.color}>
                {poem.status?.text}
            </StatusTag>

            <div style={{ padding: "0 16px 16px" }}>
                <Title level={5} ellipsis style={{ marginBottom: 8 }}>
                    {poem.title}
                </Title>

                <Text type="secondary" ellipsis>
                    {poem.description || "Không có mô tả"}
                </Text>

                <Divider dashed style={{ margin: "12px 0" }} />

                <StatsContainer>
                    <StatItem>
                        <FcPaid />
                        <Text strong>{poem.price?.toLocaleString() || 0}đ</Text>
                    </StatItem>

                    <StatItem>
                        <FcClock />
                        <Text strong>{poem.duration || "Vô hạn"}</Text>
                    </StatItem>

                    <StatItem>
                        <FcSalesPerformance />
                        <Text strong>{poem.salesCount || 0}</Text>
                    </StatItem>
                </StatsContainer>
            </div>
        </PoemCard>
    );
    const accessToken = localStorage.getItem("accessToken");

    // Hàm fetch chung cập nhật state "poems" và "total"
    async function fetchPoemsData(url) {
        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
            }

            const data = await response.json();
            const total = data.totalCount
                ? data.totalCount
                : data.totalPages
                    ? data.totalPages * pageSize
                    : 0;
            setTotal(total);
            console.log(data.data)
            setPoems(data.data);
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
            setPoems([]);
            setTotal(0);
        }
    }

    async function fetchPoems(page, size) {
        const baseUrl = `${process.env.REACT_APP_API_BASE_URL}/poems/v1/mine`;
        const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;
        await fetchPoemsData(url);
    }

    async function fetchBoughtPoems(page, size) {
        const baseUrl =
            `${process.env.REACT_APP_API_BASE_URL}/usage-rights/v1/bought-poem`;
        const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;
        await fetchPoemsData(url);
    }

    async function fetchSoldPoems(page, size) {
        const baseUrl =
            `${process.env.REACT_APP_API_BASE_URL}/usage-rights/v1/sold-poem`;
        const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;
        await fetchPoemsData(url);
    }


    async function enableFreeVersion(poemId) {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/free/${poemId}`,
                null, // nếu không có body, truyền null
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    }
                }
            );
            console.log("Enable Free Version success:", response.data);
        } catch (error) {
            console.error("Lỗi khi enable free version:", error);
            message.error(error.response?.data?.errorMessage || "Đã xảy ra lỗi!");
        }
    }
    async function enableSellVersion(poemId) {
        try {
            const body = {
                poemId: poemId,
                commissionPercentage: commissionFee,
                durationTime: time,
                price: price,
            };
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/enable-selling`,
                body, // nếu không có body, truyền null
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    }
                }
            );
            console.log("Enable Free Version success:", response.data);
        } catch (error) {
            console.error("Lỗi khi enable free version:", error);
            message.error(error.response?.data?.errorMessage || "Đã xảy ra lỗi!");
        }
    }

    // useEffect để fetch dữ liệu theo activeButton, currentPage và pageSize
    useEffect(() => {
        setIsLoading(true);
        switch (activeButton) {
            case "mine":
                fetchPoems(currentPage, pageSize).finally(() => setIsLoading(false));
                break;
            case "bought":
                fetchBoughtPoems(currentPage, pageSize).finally(() => setIsLoading(false));
                break;
            case "sold":
                fetchSoldPoems(currentPage, pageSize).finally(() => setIsLoading(false));
                break;
            default:
                setIsLoading(false);
        }
    }, [activeButton, currentPage, pageSize]);

    const handleRowClick = (poem) => {
        setSelectedPoem(poem);
        setIsDetailModalVisible(true);
    };

    const columns = [
        {
            title: "Icon",
            dataIndex: "icon",
            render: (_, poem) => <FcFolder size={32} />,
            width: 70,
        },
        {
            title: "Title",
            key: "title",
            render: (_, poem) => (poem.poem ? poem.poem.title : poem.title),
        },
        {
            title: "Description",
            key: "description",
            render: (_, poem) => (poem.poem ? poem.poem.description : poem.description),
        },
        {
            title: "Owner",
            key: "owner",
            render: (_, poem) => (poem.owner ? poem.owner.displayName : "Mine"),
        },

        ...(activeButton === "mine"
            ? [
                {
                    title: "Status",
                    key: "status",
                    render: (_, poem) => {
                        const saleVersion = poem.saleVersion;
                        if (!saleVersion) return "Unknown";

                        if (saleVersion.status === 1) return Status[1];
                        if (saleVersion.status === 3) return Status[3];
                        if (saleVersion.status === 2) return Status[2];

                        return Status[4];
                    },
                },
            ]
            : []),

        ...(activeButton === "sold"
            ? [
                {
                    title: "Buyer",
                    key: "buyer",
                    render: (_, poem) => poem.buyer ? poem.buyer.displayName : "Error",
                },
            ]
            : []),
        {
            title: "Action",
            key: "action",
            render: (_, poem) => (
                <Button type="link" onClick={() => handleRowClick(poem)}>
                    Select
                </Button>
            ),
        },
    ];


    const menu = (
        <Menu onClick={({ key }) => handleClick(key)}>
            <Menu.Item key="mine">Của tôi</Menu.Item>
            <Menu.Item key="bought">Đã mua</Menu.Item>
        </Menu>
    );

    // Khi thay đổi activeButton, reset trang về 1
    const handleClick = (type) => {
        setActiveButton(type);
        console.log(activeButton)

        setCurrentPage(1);
    };

    // Xử lý khi chọn phiên bản từ select box
    const handleSelectChange = (value) => {
        setSelectedVersion(value);
        if (value === "1") {
            // Nếu chọn trả tiền, hiện modal nhập giá
            setIsPriceModalVisible(true);
        } else {
            // Nếu chọn miễn phí, xoá giá (nếu có)
            setPrice(null);
            setCommissionFee(null);
            setTime(null)
        }
    };

    // Xử lý khi nhấn lưu ở modal nhập giá
    const handlePriceModalOk = () => {
        form
            .validateFields()
            .then((values) => {
                setPrice(values.price);
                setCommissionFee(values.commission)
                setTime(values.time);
                setIsPriceModalVisible(false);
            })
            .catch((err) => {
                console.log("Validation failed:", err);
            });

    };
    const handlePoemModalOk = async () => {
        console.log(selectedPoem.id);

        if (selectedVersion === "3") {
            await enableFreeVersion(selectedPoem.id);
        } else {
            await enableSellVersion(selectedPoem.id);
        }

        if (activeButton === "mine") {
            await fetchPoems(currentPage, pageSize);
        } else if (activeButton === "bought") {
            await fetchBoughtPoems(currentPage, pageSize);
        } else if (activeButton === "sold") {
            await fetchSoldPoems(currentPage, pageSize);
        }

        // Reset lại các state
        setPrice(null);
        setCommissionFee(null);
        setSelectedVersion(null);
        setTime(null);
        setShowVersionOptions(false);
        setIsDetailModalVisible(false);
        setIsLoading(false); // Để sau cùng là an toàn nhất
    };
    // Component phụ trợ
    const StatItem = ({ icon, value }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {React.cloneElement(icon, {
                style: {
                    color: '#666',
                    fontSize: 14
                }
            })}
            <Text style={{ fontSize: 12 }}>{value}</Text>
        </div>
    );

    return (
        <>
            <Container>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 24
                }}>
                    <Title level={3}>Quản lý Bản quyền</Title>
                    <div >

                        <Dropdown.Button
                            overlay={menu}
                            trigger={["click"]}
                            icon={<DownOutlined />}
                            style={{ float: "right" }}
                        >
                            {activeButton === "mine"
                                ? "Của tôi"
                                : activeButton === "bought"
                                    ? "Đã mua"
                                    : "Đã bán"}
                        </Dropdown.Button>
                    </div>

                </div>

                <Row gutter={[24, 24]}>
                    {poems.map(poem => (
                        <Col key={poem?.id} xs={24} sm={12} md={8} lg={6}>
                            <Card
                                hoverable
                                onClick={() => {
                                    if (activeButton !== "bought") {
                                        handleViewVersions(poem.poem ? poem.poem?.id : poem.id);
                                    }
                                }}
                                cover={
                                    <div style={{
                                        background: `linear(135deg, #${Math.floor(Math.random() * 16777215).toString(16)} 0%, #${Math.floor(Math.random() * 16777215).toString(16)} 100%)`,
                                        height: 160,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            padding: '12px 16px',
                                            background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                                            color: 'white'
                                        }}>
                                            <Text strong style={{ color: 'white' }}>
                                                {poem?.saleVersion?.price?.toLocaleString('vi-VN') || '0'}đ
                                            </Text>
                                            {poem?.copyRightValidFrom && (
                                                <div style={{ fontSize: 12 }}>
                                                    {poem?.copyRightValidFrom ?
                                                        `${formatDate(poem.copyRightValidFrom)} - ${formatDate(poem.copyRightValidTo)}` :
                                                        'Vô thời hạn'}
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                }
                                style={{
                                    borderRadius: 16,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                bodyStyle={{ padding: 16 }}
                            >
                                {poem.isSellUsageRight && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        display: 'flex',
                                        gap: 8,
                                        flexDirection: 'column',
                                        alignItems: 'flex-end'
                                    }}>
                                        {renderStatus(poem?.isSellUsageRight)}
                                    </div>
                                )}


                                <div style={{ marginTop: 8 }}>
                                    <Title
                                        level={5}
                                        ellipsis
                                        style={{
                                            marginBottom: 4,
                                            fontSize: 16,
                                            lineHeight: 1.3,
                                            minHeight: 44
                                        }}
                                    >
                                        {poem?.poem?.title || poem?.title || 'Không có tiêu đề'}
                                    </Title>

                                    <Text
                                        type="secondary"
                                        ellipsis={{ rows: 2 }}
                                        style={{
                                            fontSize: 13,
                                            lineHeight: 1.4,
                                            minHeight: 40,
                                            display: '-webkit-box',
                                            WebkitBoxOrient: 'vertical'
                                        }}
                                    >
                                        {poem?.poem?.description || poem?.description || 'Chưa có mô tả'}
                                    </Text>
                                </div>

                                <Divider
                                    dashed
                                    style={{
                                        margin: '12px 0',
                                        borderColor: '#f0f0f0'
                                    }}
                                />

                                <Space
                                    size="small"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <StatItem
                                        icon={<UserOutlined />}
                                        value={poem?.owner ? poem?.owner?.displayName : poem.user.displayName}
                                    />

                                    {/* <StatItem
                                        icon={<FieldTimeOutlined />}
                                        value={poem?.createdAt ? formatDate(poem.createdAt) : 'N/A'}
                                    /> */}
                                </Space>
                            </Card>
                        </Col>



                    ))}
                </Row>

                {/* Pagination và loading */}
                <div style={{
                    marginTop: 32,
                    display: "flex",
                    justifyContent: "center"
                }}>
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={total}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }}
                        showSizeChanger
                        pageSizeOptions={[12, 24, 48]}
                    />
                </div>

                {loading && (
                    <div style={{ textAlign: "center", padding: "48px 0" }}>
                        <Spin size="large" tip="Đang tải dữ liệu..." />
                    </div>
                )}
            </Container>
        </>
    );
};

export default UsageRight;
