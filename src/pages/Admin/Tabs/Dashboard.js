import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

const periodOptions = [
    { value: 1, label: "Theo ngày" },
    { value: 2, label: "Theo tuần" },
    { value: 3, label: "Theo tháng" }
];

const fetchData = async (period, setData, url) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`${url}?period=${period}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: sample.period || poemTypeMapping[sample.type] || `Type ${sample.type}`,
                Value: sample.totalOnlineUsers || sample.totalSamples || sample.totalPoems
            }));
            setData(transformedData);
        }
    } catch (error) {
        console.error(`Error fetching data:`, error);
    }
};

const fetchReportPoems = async (setReportData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1/report-poems", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: reportStatusMapping[sample.type] || `Status ${sample.type}`,
                Value: sample.totalPoems
            }));
            setReportData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching report poems statistics:", error);
    }
};

const fetchReportUsers = async (setReportUserData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1/report-users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: userReportStatusMapping[sample.type] || `Status ${sample.type}`,
                Value: sample.totalUsers
            }));
            setReportUserData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching report users statistics:", error);
    }
};

const fetchReportPlagiarismPoems = async (setReportPlagiarismData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1/report-plagiarism-poems", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: plagiarismStatusMapping[sample.type] || `Status ${sample.type}`,
                Value: sample.totalPoems
            }));
            setReportPlagiarismData(transformedData);
        }
    } catch (error) {
        console.error("Error fetching report plagiarism poems statistics:", error);
    }
};

const fetchTotalStatistics = async (setTotalStats) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1/total", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
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

const ChartCard = ({ title, data, filter, onFilterChange }) => (
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
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Value" fill="#82ca9d" />
            </BarChart>
        </ResponsiveContainer>
    </Card>
);

const KPIBox = ({ title, value, color }) => (
    <Card style={{ backgroundColor: color, color: "#fff", textAlign: "center", padding: "16px", fontSize: "18px" }}>
        <h3>{title}</h3>
        <h2>{value}</h2>
    </Card>
);

const UserOnline = () => {
    const [onlineData, setOnlineData] = useState([]);
    const [poemData, setPoemData] = useState([]);
    const [poemTypeData, setPoemTypeData] = useState([]);
    const [reportPoemData, setReportPoemData] = useState([]);
    const [reportUserData, setReportUserData] = useState([]);
    const [reportPlagiarismData, setReportPlagiarismData] = useState([]);
    const [totalStats, setTotalStats] = useState([]);
    const [onlinePeriod, setOnlinePeriod] = useState(1);
    const [poemPeriod, setPoemPeriod] = useState(1);

    useEffect(() => {
        fetchData(onlinePeriod, setOnlineData, "https://api-poemtown-staging.nodfeather.win/api/statistics/v1/online-users");
    }, [onlinePeriod]);

    useEffect(() => {
        fetchData(poemPeriod, setPoemData, "https://api-poemtown-staging.nodfeather.win/api/statistics/v1/poem-uploads");
    }, [poemPeriod]);

    useEffect(() => {
        fetchData(null, setPoemTypeData, "https://api-poemtown-staging.nodfeather.win/api/statistics/v1/poem-types");
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

    const handleOnlineFilterChange = (value) => {
        setOnlinePeriod(value);
    };

    const handlePoemFilterChange = (value) => {
        setPoemPeriod(value);
    };

    return (
        <div style={{ padding: 24 }}>
            <Row gutter={[16, 16]} justify="center">
                {totalStats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <KPIBox title={stat.name} value={stat.value} color={stat.color} />
                    </Col>
                ))}
            </Row>

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
                <Col span={12}>
                    <ChartCard title="Số lượng bài thơ theo loại" data={poemTypeData} />
                </Col>
                <Col span={12}>
                    <ChartCard title="Báo cáo bài thơ theo trạng thái" data={reportPoemData} />
                </Col>
                <Col span={12}>
                    <ChartCard title="Báo cáo người dùng theo trạng thái" data={reportUserData} />
                </Col>
                <Col span={12}>
                    <ChartCard title="Báo cáo bài thơ đạo văn" data={reportPlagiarismData} />
                </Col>
            </Row>
        </div>
    );
};

export default UserOnline;