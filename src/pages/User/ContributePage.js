import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Spin, message, theme } from "antd";
import dayjs from "dayjs";
import 'dayjs/locale/vi';

const ContributePage = () => {
    const { token: themeToken } = theme.useToken();
    const [contributionData, setContributionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllContributions = async () => {
            try {
                let currentPage = 1;
                let hasMore = true;
                const allPoems = [];
                const pageSize = 20;

                while (hasMore) {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_BASE_URL}/poems/v1/mine?pageNumber=${currentPage}&pageSize=${pageSize}&filterOptions.status=1`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                            },
                        }
                    );

                    const { data, total } = await response.json();
                    allPoems.push(...data);
                    hasMore = currentPage * pageSize < total;
                    currentPage++;
                }

                // Process data into monthly contributions
                
                const monthlyCounts = allPoems.reduce((acc, poem) => {
                    const month = dayjs(poem.createdAt).format("YYYY-MM");
                    acc[month] = (acc[month] || 0) + 1;
                    return acc;
                }, {});
                console.log(monthlyCounts)
                // Generate data for last 12 months
                const now = new Date();
                const fullYearData = Array.from({ length: 12 }).map((_, i) => {
                    const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1); // lùi về 11 tháng trước
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                    const label = `${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
                    // Ví dụ "Mar 2024"
                    // const monthLabel = date.toLocaleString("en-US", {
                    //     month: "short",
                    //     year: "numeric",
                    // });
                    

                    return {
                        month: label,
                        count: monthlyCounts[key] || 0,
                    };
                });

                setContributionData(fullYearData);
            } catch (error) {
                message.error("Error fetching contribution data!");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllContributions();
    }, []);
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: themeToken.colorBgElevated,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    boxShadow: themeToken.boxShadowSecondary,
                    border: `1px solid ${themeToken.colorBorder}`
                }}>
                    <p style={{
                        margin: 0,
                        color: themeToken.colorText,
                        fontWeight: 500
                    }}>{label}</p>
                    <p style={{
                        margin: 0,
                        color: themeToken.colorPrimary,
                        fontSize: '1.1em'
                    }}>{payload[0].value} bài thơ</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
            <h1 style={{
                textAlign: "center",
                fontFamily: "'Crimson Pro', serif",
                fontSize: "2.5rem",
                color: "rgb(176, 164, 153)",
                marginBottom: 40,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
                Đóng góp
            </h1>

            <Spin spinning={loading}>
                <div style={{
                    background: themeToken.colorBgContainer,
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    border: `1px solid ${themeToken.colorBorder}`,
                    height: 500
                }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={contributionData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={themeToken.colorBorder}
                            />
                            <XAxis
                                dataKey="month"
                                label={{
                                    value: 'Tháng',
                                    position: 'bottom',
                                    style: {
                                        fill: themeToken.colorTextSecondary,
                                        fontSize: 14
                                    }
                                }}
                                tick={{
                                    fill: themeToken.colorTextTertiary
                                }}
                            />
                            <YAxis
                                label={{
                                    value: 'Số bài thơ',
                                    angle: -90,
                                    position: 'left',
                                    style: {
                                        fill: themeToken.colorTextSecondary,
                                        fontSize: 14,
                                    }
                                }}
                                tick={{
                                    fill: themeToken.colorTextTertiary
                                }}
                                tickFormatter={(value) => `${value} bài`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke={themeToken.colorPrimary}
                                strokeWidth={3}
                                dot={{
                                    fill: themeToken.colorPrimary,
                                    stroke: themeToken.colorBgLayout,
                                    strokeWidth: 2,
                                    r: 5
                                }}
                                activeDot={{
                                    r: 8,
                                    fill: themeToken.colorPrimary
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>


                </div>
                <div style={{
                    textAlign: "center",
                    marginTop: 24,
                    color: themeToken.colorTextSecondary,
                    fontStyle: "italic",
                    fontSize: "1.3em",
                    fontFamily: "'Playfair Display', serif",
                }}>
                    Đóng góp thơ của bạn vào diễn đàn của chúng tôi trong 1 năm qua
                </div>
            </Spin>
        </div>
    );
};
export default ContributePage;