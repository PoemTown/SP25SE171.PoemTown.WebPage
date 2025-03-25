import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const fetchData = async (period, setData) => {
    try {
        const accessToken = localStorage.getItem("accessToken");
        const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/statistics/v1/online-users?period=${period}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        const result = await response.json();
        if (result.statusCode === 200) {
            const transformedData = result.data.samples.map(sample => ({
                name: sample.period,
                Users: sample.totalOnlineUsers
            }));
            setData(transformedData);
        }
    } catch (error) {
        console.error(`Error fetching data for period ${period}:`, error);
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
                { name: "Bài thơ đã đăng", value: result.data.totalPostedPoems },
                { name: "File ghi âm", value: result.data.totalRecordFiles },
                { name: "Bộ sưu tập", value: result.data.totalCollections },
                { name: "Người dùng", value: result.data.totalUsers }
            ];
            setTotalStats(transformedData);
        }
    } catch (error) {
        console.error("Error fetching total statistics:", error);
    }
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ChartCard = ({ title, data }) => (
    <Card title={title} bordered={false} style={{ textAlign: 'center', marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Users" fill="#82ca9d" name="Người dùng mới" />
            </BarChart>
        </ResponsiveContainer>
    </Card>
);

const UserOnline = () => {
    const [todayData, setTodayData] = useState([]);
    const [monthData, setMonthData] = useState([]);
    const [yearData, setYearData] = useState([]);
    const [totalStats, setTotalStats] = useState([]);

    useEffect(() => {
        fetchData(1, setTodayData);
        fetchData(2, setMonthData);
        fetchData(3, setYearData);
        fetchTotalStatistics(setTotalStats);
    }, []);

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ textAlign: 'center' }}>User Online</h2>
            <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={12} lg={8}><ChartCard title="Theo ngày" data={todayData} /></Col>
                <Col xs={24} sm={12} lg={8}><ChartCard title="Theo tháng" data={monthData} /></Col>
                <Col xs={24} sm={12} lg={8}><ChartCard title="Theo năm" data={yearData} /></Col>
            </Row>
            <h2 style={{ textAlign: 'center', marginTop: 24 }}>Thống kê chi tiết</h2>
            <Card title="Thống kê tổng thể" bordered={false} style={{ textAlign: 'center', marginTop: 16 }}>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={totalStats}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            label
                        >
                            {totalStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    {totalStats.map((entry, index) => (
                        <div key={index} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 16 }}>
                            <span style={{ width: 12, height: 12, backgroundColor: COLORS[index % COLORS.length], marginRight: 4, display: 'inline-block' }}></span>
                            {entry.name}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default UserOnline;
