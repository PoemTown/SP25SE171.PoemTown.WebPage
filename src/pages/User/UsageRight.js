import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Spin,
    Dropdown,
    Menu,
    Typography,
    Divider,
    Descriptions,
    Select,
    InputNumber,
} from "antd";
import { FcFolder } from "react-icons/fc";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SectionIcon } from "lucide-react";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

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
    const navigate = useNavigate();
    const Status = Object.freeze({
        1: "Selling",
        3: "Free",
        4: "Default",
        2: "Not in sale"
    });

    function formatDate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getUTCDate() + 1).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = date.getUTCFullYear();
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
                throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            const total = data.totalCount
                ? data.totalCount
                : data.totalPages
                    ? data.totalPages * pageSize
                    : 0;
            setTotal(total);
            setPoems(data.data);
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
            setPoems([]);
            setTotal(0);
        }
    }

    async function fetchPoems(page, size) {
        const baseUrl = "https://api-poemtown-staging.nodfeather.win/api/poems/v1/mine";
        const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;
        await fetchPoemsData(url);
    }

    async function fetchBoughtPoems(page, size) {
        const baseUrl =
            "https://api-poemtown-staging.nodfeather.win/api/usage-rights/v1/bought-poem";
        const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;
        await fetchPoemsData(url);
    }

    async function fetchSoldPoems(page, size) {
        const baseUrl =
            "https://api-poemtown-staging.nodfeather.win/api/usage-rights/v1/sold-poem";
        const url = `${baseUrl}?pageNumber=${page}&pageSize=${size}`;
        await fetchPoemsData(url);
    }


    async function enableFreeVersion(poemId) {
        try {
            const response = await axios.put(
                `https://api-poemtown-staging.nodfeather.win/api/poems/v1/free/${poemId}`,
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
                `https://api-poemtown-staging.nodfeather.win/api/poems/v1/enable-selling`,
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
        if (activeButton === "mine") {
            fetchPoems(currentPage, pageSize).finally(() => setIsLoading(false));
        } else if (activeButton === "bought") {
            fetchBoughtPoems(currentPage, pageSize).finally(() => setIsLoading(false));
        } else if (activeButton === "sold") {
            fetchSoldPoems(currentPage, pageSize).finally(() => setIsLoading(false));
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
        <Menu>
            <Menu.Item key="mine" onClick={() => handleClick("mine")}>
                Của tôi
            </Menu.Item>
            <Menu.Item key="bought" onClick={() => handleClick("bought")}>
                Đã mua
            </Menu.Item>
            <Menu.Item key="sold" onClick={() => handleClick("sold")}>
                Đã bán
            </Menu.Item>
        </Menu>
    );

    // Khi thay đổi activeButton, reset trang về 1
    const handleClick = (type) => {
        setActiveButton(type);
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


    return (
        <>
            <div style={{ marginBottom: "50px" }}>
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
            <Table
                dataSource={poems}
                columns={columns}
                rowKey="id"
                onRow={(poem) => ({
                    onClick: () => handleRowClick(poem),
                })}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    onChange: (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ["1", "10", "15"],
                }}
            />

            {/* Modal chi tiết bản quyền sử dụng */}
            <Modal
                open={isDetailModalVisible}
                onCancel={() => {
                    setIsDetailModalVisible(false);
                    setPrice(null); // reset giá
                    setCommissionFee(null); // reset hoa hồng
                    setTime(null);
                    setSelectedVersion(null); // reset phiên bản nếu cần
                    setShowVersionOptions(false);

                }}
                onOk={handlePoemModalOk}
                centered
            >

                {selectedPoem ? (
                    <div>
                        <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
                            Chi tiết bản quyền sử dụng
                        </Title>
                        <Divider />

                        <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 600 }}>
                            <Descriptions.Item label="Tiêu đề">
                                {selectedPoem.poem ? selectedPoem.poem.title : selectedPoem.title}
                            </Descriptions.Item>
                            <Descriptions.Item label="Chủ sở hữu">
                                <span
                                    style={{ color: "#2a7fbf", cursor: "pointer" }}
                                    onClick={() =>
                                        navigate(
                                            `/user/${selectedPoem.owner
                                                ? selectedPoem.owner.userName
                                                : selectedPoem.user?.userName
                                            }`
                                        )
                                    }
                                >
                                    {selectedPoem.owner
                                        ? selectedPoem.owner.displayName
                                        : selectedPoem.user?.displayName}
                                </span>
                            </Descriptions.Item>
                            {selectedPoem.saleVersion && (
                                <>
                                    {selectedPoem.copyRightValidFrom && (
                                        <Descriptions.Item label="Thời hạn">
                                            {formatDate(selectedPoem.copyRightValidFrom)} đến{" "}
                                            {formatDate(selectedPoem.copyRightValidTo)}
                                        </Descriptions.Item>
                                    )}
                                    {!selectedPoem.copyRightValidFrom && (
                                        <Descriptions.Item label="Thời hạn">
                                            {selectedPoem.saleVersion.durationTime} năm
                                        </Descriptions.Item>
                                    )}
                                    <Descriptions.Item label="Phần trăm hoa hồng">
                                        {selectedPoem.saleVersion.commissionPercentage}%
                                    </Descriptions.Item>
                                </>
                            )}
                            <Descriptions.Item label="Giá">
                                {selectedPoem.saleVersion.price}{" "}
                                VND
                            </Descriptions.Item>
                        </Descriptions>

                        {!showVersionOptions && activeButton === 'mine' && (
                            <Button
                                type="primary"
                                onClick={() => setShowVersionOptions(true)}
                                style={{ marginTop: "20px" }}
                            >
                                Tuỳ chỉnh phiên bản
                            </Button>
                        )}

                        {showVersionOptions && (
                            <>
                                <Divider />
                                <Title level={4} style={{ textAlign: "center", marginBottom: "20px" }}>
                                    Tuỳ chỉnh phiên bản
                                </Title>
                                <Descriptions column={1} size="middle" labelStyle={{ fontWeight: 600 }}>
                                    <Descriptions.Item label="Phiên bản">
                                        <Select
                                            style={{ width: "100%" }}
                                            value={selectedVersion}
                                            onChange={handleSelectChange}
                                            placeholder="Hãy chọn phiên bản"
                                        >
                                            {versions.map((version) => (
                                                <Option key={version.value} value={version.value}>
                                                    {version.title}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Descriptions.Item>
                                    {price !== null && (
                                        <Descriptions.Item label="Giá tiền">
                                            {price} VND
                                        </Descriptions.Item>
                                    )}
                                    {commissionFee !== null && (
                                        <Descriptions.Item label="Phần trăm hoa hồng">
                                            {commissionFee}%
                                        </Descriptions.Item>
                                    )}
                                    {time !== null && (
                                        <Descriptions.Item label="Thời hạn sử dụng">
                                            {time} năm
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </>
                        )}
                    </div>
                ) : (
                    <p style={{ textAlign: "center" }}>Không có thông tin.</p>
                )}
            </Modal>

            {/* Modal nhập giá tiền (Price Input Modal) */}
            <Modal
                title="Nhập số tiền"
                open={isPriceModalVisible}
                onOk={handlePriceModalOk}
                onCancel={() => {
                    setIsPriceModalVisible(false);
                    setShowVersionOptions(false);
                    form.resetFields(); // reset lại các giá trị trong form nếu cần
                }}
                centered
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Giá tiền (VND)"
                        name="price"
                        rules={[{ required: true, message: "Vui lòng nhập giá tiền!" }]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} />
                    </Form.Item>
                    <Form.Item
                        label="Phần trăm hoa hồng (%)"
                        name="commission"
                        rules={[
                            { required: true, message: "Vui lòng nhập phần trăm hoa hồng!" },
                            {
                                type: "number",
                                min: 0,
                                max: 100,
                                message: "Phần trăm phải từ 0 đến 100",
                            },
                        ]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} max={100} />
                    </Form.Item>
                    <Form.Item
                        label="Thời hạn của bản quyền sử dụng"
                        name="time"
                        rules={[
                            { required: true, message: "Vui lòng nhập thời hạn!" },
                            {
                                type: "number",
                                min: 0,
                                max: 100,
                                message: "",
                            },
                        ]}
                    >
                        <InputNumber style={{ width: "100%" }} min={0} max={100} />
                    </Form.Item>
                </Form>
            </Modal>


            {isLoading && (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Spin size="large" tip="Đang tải dữ liệu..." />
                </div>
            )}
        </>
    );
};

export default UsageRight;
