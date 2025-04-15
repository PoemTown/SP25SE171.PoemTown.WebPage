import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select, Spin } from "antd";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, ComposedChart, Line, CartesianGrid
} from "recharts";

const { Option } = Select;
const poemTypeMapping = {
    1: "Thơ Tự Do",
    2: "Thơ Lục Bát",
    3: "Thơ Song Thất Lục Bát",
    4: "Thơ Thất Ngôn Tứ Tuyệt",
    5: "Thơ Ngũ Ngôn Tứ Tuyệt",
    6: "Thơ Thất Ngôn Bát Cú",
    7: "Thơ Bốn Chữ",
    8: "Thơ Năm Chữ",
    9: "Thơ Sáu Chữ",
    10: "Thơ Bảy Chữ",
    11: "Thơ Tám Chữ"
};

const reportStatusMapping = {
    1: "Đang chờ duyệt",
    2: "Đã được duyệt",
    3: "Đã bị từ chối"
};

const userReportStatusMapping = {
    1: "Đang chờ duyệt",
    2: "Đã được duyệt",
    3: "Đã bị từ chối",
    4: "Đã bị khóa"
};

const plagiarismStatusMapping = {
    1: "Chờ kiểm duyệt",
    2: "Đã xác nhận đạo văn",
    3: "Không đạo văn"
};

const orderStatusMapping = {
    1: "Đang chờ thanh toán",
    2: "Đã thanh toán",
    3: "Đã hủy"
};

const periodOptions = [
    { value: 1, label: "Theo ngày" },
    { value: 2, label: "Theo tháng" },
    { value: 3, label: "Theo năm" },
    { value: 4, label: "15 ngày" },
];

const orderTypeMapping = {
    1: "Nạp tiền ví điện tử",
    2: "Master Templates",
    3: "File ghi âm",
    4: "Bài thơ"
};

// const incomeTypeMapping = {
//     1: "Nạp tiền ví điện tử",
//     2: "Mua Master Templates"
// };
const incomeTypeMapping = {
    2: "Mua mẫu thiết kế",
    3: "Mua bản ghi âm",
    9: "Phí dịch vụ nạp tiền"
};

const profitTypeMapping = {
    1: "Nguồn thu",
    2: "Rút tiền",
    3: "Lợi nhuận"
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Hàm fetch dữ liệu chung
const fetchWithAuth = async (url, period = null) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const fullUrl = period ? `${url}?period=${period}` : url;
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        throw error;
    }
};

const fetchData = async (period, setData, url) => {
    try {
        const result = await fetchWithAuth(url, period);
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: sample.period || poemTypeMapping[sample.type] || `Type ${sample.type}`,
                Value: sample.totalSamples || sample.totalSamples || sample.totalPoems
            }));
            setData(transformedData);
        }
    } catch (error) {
        console.error(`Error fetching data:`, error);
    }
};

const fetchTransactions = async (period, setData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/transactions`,
            period
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.samples.map(sample => ({
                period: sample.period,
                samples: sample.totalSamples,
                amounts: sample.totalAmount
            }));
            setData({
                chartData: transformedData,
                totals: {
                    totalSamples: result.data.samples.totalDataSamples,
                    totalAmount: result.data.samples.totalDataAmount
                }
            });
        }
    } catch (error) {
        console.error("Error fetching transactions statistics:", error);
    }
};

const fetchReportPoems = async (setReportData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/report-poems`
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: reportStatusMapping[sample.type] || `Status ${sample.type}`,
                value: sample.totalPoems
            }));
            setReportData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching report poems statistics:", error);
    }
};

const fetchReportUsers = async (setReportUserData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/report-users`
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: userReportStatusMapping[sample.type] || `Status ${sample.type}`,
                value: sample.totalUsers
            }));
            setReportUserData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching report users statistics:", error);
    }
};

const fetchReportPlagiarismPoems = async (setReportPlagiarismData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/report-plagiarism-poems`
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: plagiarismStatusMapping[sample.type] || `Status ${sample.type}`,
                value: sample.totalPoems
            }));
            setReportPlagiarismData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching report plagiarism poems statistics:", error);
    }
};

const fetchTotalStatistics = async (setTotalStats) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/total`
        );
        if (result.statusCode === 200) {
            const transformedData = [
                { name: "Bài thơ đã đăng", value: result.data.totalPostedPoems, color: "#0088FE" },
                { name: "File ghi âm", value: result.data.totalRecordFiles, color: "#00C49F" },
                { name: "Bộ sưu tập", value: result.data.totalCollections, color: "#FFBB28" },
                { name: "Người dùng", value: result.data.totalUsers, color: "#FF8042" }
            ];
            setTotalStats(transformedData);
        }
    } catch (error) {
        console.error("Error fetching total statistics:", error);
    }
};

const fetchOrderStatus = async (setOrderStatusData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/order-status`
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: orderStatusMapping[sample.status] || `Status ${sample.status}`,
                value: sample.totalOrders,
                color: sample.status === 2 ? '#00C49F' :
                    sample.status === 1 ? '#FFBB28' : '#FF8042'
            }));
            setOrderStatusData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching order status statistics:", error);
    }
};

const fetchMasterTemplateOrders = async (setMasterTemplateData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/master-template-orders`
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: sample.templateName,
                tag: sample.tagName,
                value: sample.totalOrders
            }));
            setMasterTemplateData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching master template orders statistics:", error);
    }
};

const fetchOrderTypes = async (setOrderTypeData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/order-types`
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: orderTypeMapping[sample.orderType] || `Loại ${sample.orderType}`,
                value: sample.totalOrders,
                amount: sample.totalAmounts,
                color: sample.orderType === 1 ? '#0088FE' :
                    sample.orderType === 2 ? '#00C49F' :
                        sample.orderType === 3 ? '#FFBB28' : '#FF8042'
            }));
            setOrderTypeData({
                chartData: transformedData,
                totals: {
                    totalOrders: result.data.totalDataSamples,
                    totalAmounts: result.data.totalAmounts
                }
            });
        }
    } catch (error) {
        console.error("Error fetching order types statistics:", error);
    }
};

const getIncomeColor = (type) => {
    switch(type) {
        case 2:
            return "#6abf81";
        case 3:
            return "#fa00f7";
        case 9: 
            return "#006cff";
        default:
            return "#888888";
    }
}

const getProfitColor = (type) => {
    switch(type) {
        case 1: 
            return "#239d02";
        case 2:
            return "#ff0000";
        case 3:
            return "#022c9d";
    }
}

const fetchIncomes = async (period, setIncomeData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/incomes`,
            period
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.incomeTypeStatistics.map(type => ({
                incomeType: type.incomeType,
                name: incomeTypeMapping[type.incomeType] || `Loại ${type.incomeType}`,
                color: getIncomeColor(type.incomeType),
                samples: type.samples.samples.map(sample => ({
                    period: sample.period,
                    totalSamples: sample.totalSamples,
                    totalAmount: sample.totalAmount
                }))
            }));
            setIncomeData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching incomes statistics:", error);
    }
};

const fetchProfit = async (period, setProfitData) => {
    try {
        const result = await fetchWithAuth(
            `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/profits`,
            period
        );
        if (result.statusCode === 200) {
            const transformedData = result.data.profitTypeStatisticResponses.map(type => ({
                profitType: type.profitType,
                name: profitTypeMapping[type.profitType] || `Loại ${type.profitType}`,
                color: getProfitColor(type.profitType),
                samples: type.samples.samples.map(sample => ({
                    period: sample.period,
                    totalSamples: sample.totalSamples,
                    totalAmount: sample.totalAmount
                }))
            }));
            setProfitData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching incomes statistics:", error);
    }
};

const ChartCard = ({
    title,
    data,
    filter,
    onFilterChange,
    isPieChart = false,
    isMixedChart = false,
    isCustomBarChart = false
}) => (
    <Card
        title={title}
        bordered={false}
        style={{ textAlign: 'center', marginBottom: 16 }}
        extra={filter && (
            <Select
                defaultValue={1}
                style={{ width: 120 }}
                onChange={onFilterChange}
            >
                {periodOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
            </Select>
        )}
    >
        <ResponsiveContainer width="100%" height={550}>
            {isPieChart ? (
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            ) : isMixedChart ? (
                <ComposedChart data={data}>
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" orientation="left" label={{ value: 'Số lượng', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Giá trị', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                        yAxisId="left"
                        dataKey="samples"
                        barSize={20}
                        fill="#8884d8"
                        name="Số lượng giao dịch"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="amounts"
                        stroke="#ff7300"
                        name="Tổng giá trị"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                    />
                </ComposedChart>
            ) : isCustomBarChart ? (
                <BarChart data={data} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip
                        formatter={(value, name, props) => [
                            value,
                            `Tag: ${props.payload.tag}`,
                            `Template: ${props.payload.name}`
                        ]}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Số lượng đơn hàng" fill="#8884d8">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            ) : (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Value" fill="#82ca9d" />
                </BarChart>
            )}
        </ResponsiveContainer>
    </Card>
);

const KPIBox = ({ title, value, color }) => (
    <Card style={{ backgroundColor: color, color: "#fff", textAlign: "center", padding: "16px", fontSize: "18px" }}>
        <h3>{title}</h3>
        <h2>{value}</h2>
    </Card>
);

const DoubleLineChart = ({ data }) => {
    // Lấy tất cả các kỳ (period) từ dữ liệu
    const allPeriods = Array.from(new Set(
        data.flatMap(item => item.samples.map(s => s.period))
    )).sort();

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = allPeriods.map(period => {
        const periodData = { period };
        data.forEach(item => {
            const sample = item.samples.find(s => s.period === period);
            periodData[`amount_${item.incomeType}`] = sample?.totalAmount || 0;
            periodData[`samples_${item.incomeType}`] = sample?.totalSamples || 0;
        });
        return periodData;
    });

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" label={{ value: "Số tiền", angle: -90, position: "insideLeft" }} />

                <Tooltip
                    content={({ payload }) => {

                        if (!payload || payload.length === 0) return null;
                        const row = payload[0].payload; // full chart row for that period

                        return (
                            <div className="custom-tooltip" style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
                                <p><strong>Kỳ: {row.period}</strong></p>
                                {data.map((item) => {
                                    const amount = row[`amount_${item.incomeType}`] ?? 0;
                                    const samples = row[`samples_${item.incomeType}`] ?? 0;

                                    return (
                                        <p key={item.incomeType} style={{ color: item.color }}>
                                            {item.name}: <br />
                                            - Số tiền: {amount} <br />
                                            - Số lượng: {samples}
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    }}
                />

                <Legend />
                {data.map(item => (
                    <>
                        <Line
                            key={`line_amount_${item.incomeType}`}
                            yAxisId="left"
                            type="linear"
                            dataKey={`amount_${item.incomeType}`}
                            name={`Số tiền - ${item.name}`}
                            stroke={item.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />

                    </>
                ))}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

const DoubleLineChartProfit = ({ data }) => {
    // Lấy tất cả các kỳ (period) từ dữ liệu
    const allPeriods = Array.from(new Set(
        data.flatMap(item => item.samples.map(s => s.period))
    )).sort();

    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = allPeriods.map(period => {
        const periodData = { period };
        data.forEach(item => {
            const sample = item.samples.find(s => s.period === period);
            periodData[`amount_${item.profitType}`] = sample?.totalAmount || 0;
            periodData[`samples_${item.profitType}`] = sample?.totalSamples || 0;
        });
        return periodData;
    });

    return (
        <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" label={{ value: "Số tiền", angle: -90, position: "insideLeft" }} />

                <Tooltip
                    content={({ payload }) => {

                        if (!payload || payload.length === 0) return null;
                        const row = payload[0].payload; // full chart row for that period

                        return (
                            <div className="custom-tooltip" style={{ background: "white", padding: "10px", border: "1px solid #ccc" }}>
                                <p><strong>Kỳ: {row.period}</strong></p>
                                {data.map((item) => {
                                    const amount = row[`amount_${item.profitType}`] ?? 0;
                                    const samples = row[`samples_${item.profitType}`] ?? 0;

                                    return (
                                        <p key={item.profitType} style={{ color: item.color }}>
                                            {item.name}: <br />
                                            - Số tiền: {amount} <br />
                                            - Số lượng: {samples}
                                        </p>
                                    );
                                })}
                            </div>
                        );
                    }}
                />

                <Legend />
                {data.map(item => (
                    <>
                        <Line
                            key={`line_amount_${item.profitType}`}
                            yAxisId="left"
                            type="linear"
                            dataKey={`amount_${item.profitType}`}
                            name={`Số tiền - ${item.name}`}
                            stroke={item.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />

                    </>
                ))}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

const UserOnline = () => {
    const [onlineData, setOnlineData] = useState([]);
    const [poemData, setPoemData] = useState([]);
    const [poemTypeData, setPoemTypeData] = useState([]);
    const [reportPoemData, setReportPoemData] = useState([]);
    const [reportUserData, setReportUserData] = useState([]);
    const [reportPlagiarismData, setReportPlagiarismData] = useState([]);
    const [totalStats, setTotalStats] = useState([]);
    const [transactionData, setTransactionData] = useState({
        chartData: [],
        totals: {
            totalSamples: 0,
            totalAmount: 0
        }
    });
    const [orderStatusData, setOrderStatusData] = useState([]);
    const [masterTemplateData, setMasterTemplateData] = useState([]);
    const [onlinePeriod, setOnlinePeriod] = useState(1);
    const [poemPeriod, setPoemPeriod] = useState(1);
    const [transactionPeriod, setTransactionPeriod] = useState(1);
    const [orderTypeData, setOrderTypeData] = useState({
        chartData: [],
        totals: {
            totalOrders: 0,
            totalAmounts: 0
        }
    });
    const [incomeData, setIncomeData] = useState([]);
    const [incomePeriod, setIncomePeriod] = useState(1);
    const [profitData, setProfitData] = useState([]);
    const [profitPeriod, setProfitPeriod] = useState(1);
    useEffect(() => {
        fetchData(onlinePeriod, setOnlineData, `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/online-users`);
    }, [onlinePeriod]);

    useEffect(() => {
        fetchData(poemPeriod, setPoemData, `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/poem-uploads`);
    }, [poemPeriod]);

    useEffect(() => {
        fetchData(null, setPoemTypeData, `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/poem-types`);
    }, []);

    useEffect(() => {
        fetchReportPoems(setReportPoemData);
    }, []);

    useEffect(() => {
        fetchReportUsers(setReportUserData);
    }, []);

    useEffect(() => {
        fetchReportPlagiarismPoems(setReportPlagiarismData);
    }, []);

    useEffect(() => {
        fetchTotalStatistics(setTotalStats);
    }, []);

    useEffect(() => {
        fetchTransactions(transactionPeriod, setTransactionData);
    }, [transactionPeriod]);

    useEffect(() => {
        fetchOrderStatus(setOrderStatusData);
    }, []);

    useEffect(() => {
        fetchMasterTemplateOrders(setMasterTemplateData);
    }, []);

    const handleOnlineFilterChange = (value) => {
        setOnlinePeriod(value);
    };

    const handlePoemFilterChange = (value) => {
        setPoemPeriod(value);
    };

    const handleTransactionFilterChange = (value) => {
        setTransactionPeriod(value);
    };

    const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);

    useEffect(() => {
        fetchOrderTypes(setOrderTypeData);
    }, []);

    useEffect(() => {
        fetchIncomes(incomePeriod, setIncomeData);
    }, [incomePeriod]);
    const handleIncomeFilterChange = (value) => {
        setIncomePeriod(value);
    };

    useEffect(() => {
        fetchProfit(profitPeriod, setProfitData);
    }, [profitPeriod]);
    const handleProfitFilterChange = (value) => {
        setProfitPeriod(value);
    };
    return (
        <div style={{ padding: 24 }}>
            <Row gutter={[16, 16]} justify="center">
                {totalStats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <KPIBox title={stat.name} value={stat.value} color={stat.color} />
                    </Col>
                ))}
                <Col xs={24} sm={12} lg={6}>
                    <KPIBox
                        title="Tổng số đơn hàng"
                        value={totalOrders}
                        color="#8884d8"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPIBox
                        title="Tổng số giao dịch"
                        value={transactionData.totals.totalSamples}
                        color="#0088FE"
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPIBox
                        title="Tổng giá trị giao dịch"
                        value={transactionData.totals.totalAmount}
                        color="#00C49F"
                    />
                </Col>
            </Row>
            <Col span={24}>
                <Card
                    title="Thống kê lợi nhuận"
                    bordered={false}
                    style={{ textAlign: 'center', marginBottom: 16 }}
                    extra={
                        <Select
                            defaultValue={1}
                            style={{ width: 120 }}
                            onChange={handleProfitFilterChange}
                        >
                            {periodOptions.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    }
                >
                    {profitData.length > 0 ? (
                        <DoubleLineChartProfit data={profitData} period={profitPeriod} />
                    ) : (
                        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Spin size="large" />
                        </div>
                    )}
                </Card>
            </Col>
            <Col span={24}>
                <Card
                    title="Thống kê thu nhập"
                    bordered={false}
                    style={{ textAlign: 'center', marginBottom: 16 }}
                    extra={
                        <Select
                            defaultValue={1}
                            style={{ width: 120 }}
                            onChange={handleIncomeFilterChange}
                        >
                            {periodOptions.map(option => (
                                <Option key={option.value} value={option.value}>{option.label}</Option>
                            ))}
                        </Select>
                    }
                >
                    {incomeData.length > 0 ? (
                        <DoubleLineChart data={incomeData} period={incomePeriod} />
                    ) : (
                        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Spin size="large" />
                        </div>
                    )}
                </Card>
            </Col>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <ChartCard
                        title="Người dùng online"
                        data={onlineData}
                        filter
                        onFilterChange={handleOnlineFilterChange}
                    />
                </Col>
                <Col span={24}>
                    <ChartCard
                        title="Bài thơ đã đăng tải"
                        data={poemData}
                        filter
                        onFilterChange={handlePoemFilterChange}
                    />
                </Col>
                <Col span={24}>
                    <ChartCard
                        title="Thống kê giao dịch"
                        data={transactionData.chartData}
                        filter
                        onFilterChange={handleTransactionFilterChange}
                        isMixedChart
                    />
                </Col>
                <Col span={24}>
                    <ChartCard
                        title="Đơn hàng Master Template"
                        data={masterTemplateData}
                        isCustomBarChart
                    />
                </Col>
                <Col span={12}>
                    <ChartCard
                        title="Số lượng bài thơ theo loại"
                        data={poemTypeData.map(item => ({ ...item, value: item.Value }))}
                        isPieChart
                    />
                </Col>
                <Col span={12}>
                    <ChartCard
                        title="Thống kê trạng thái đơn hàng"
                        data={orderStatusData}
                        isPieChart
                    />
                </Col>
                <Col span={12}>
                    <ChartCard
                        title="Báo cáo bài thơ theo trạng thái"
                        data={reportPoemData}
                        isPieChart
                    />
                </Col>
                <Col span={12}>
                    <ChartCard
                        title="Báo cáo người dùng theo trạng thái"
                        data={reportUserData}
                        isPieChart
                    />
                </Col>
                <Col span={12}>
                    <ChartCard
                        title="Báo cáo bài thơ đạo văn"
                        data={reportPlagiarismData}
                        isPieChart
                    />
                </Col>
                <Col span={12}>
                    <ChartCard
                        title="Phân loại đơn hàng"
                        data={orderTypeData.chartData}
                        isPieChart
                    />
                </Col>
            </Row>
        </div>
    );
};

export default UserOnline;