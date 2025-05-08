import React, { useEffect, useState } from "react";
import { Card, Row, Col, Select, Spin, Statistic, Divider, Typography } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Line, CartesianGrid, Area
} from "recharts";
import {
  UserOutlined, FileTextOutlined, AudioOutlined, 
  FolderOutlined, ShoppingOutlined, LineChartOutlined,
  MoneyCollectOutlined, ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const { Title, Text } = Typography;
const { Option } = Select;

// Constants and mappings
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

const incomeTypeMapping = {
  2: "Mua mẫu thiết kế",
  9: "Phí dịch vụ nạp tiền"
};

const profitTypeMapping = {
  1: "Nguồn thu",
  2: "Rút tiền",
  3: "Lợi nhuận"
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#A05195'];

// Helper functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

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
        name: sample.period || poemTypeMapping[sample.type] || `${sample.type}`,
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
        value: sample.totalPoems,
        color: sample.type === 2 ? '#00C49F' : sample.type === 1 ? '#FFBB28' : '#FF8042'
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
        value: sample.totalUsers,
        color: sample.type === 2 ? '#00C49F' : 
               sample.type === 1 ? '#FFBB28' : 
               sample.type === 3 ? '#FF8042' : '#8884D8'
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
        value: sample.totalPoems,
        color: sample.type === 2 ? '#FF6B6B' : 
               sample.type === 1 ? '#FFBB28' : '#4ECDC4'
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
      setTotalStats({
        totalPostedPoems: result.data.totalPostedPoems,
        totalRecordFiles: result.data.totalRecordFiles,
        totalCollections: result.data.totalCollections,
        totalUsers: result.data.totalUsers
      });
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
  switch (type) {
    case 2:
      return "#6abf81";
    case 9:
      return "#006cff";
    default:
      return "#888888";
  }
}

const getProfitColor = (type) => {
  switch (type) {
    case 1:
      return "#239d02";
    case 2:
      return "#ff0000";
    case 3:
      return "#022c9d";
    default:
      return "#888888";
  }
}

const fetchIncomes = async (period, setIncomeData) => {
  try {
    const result = await fetchWithAuth(
      `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/incomes`,
      period
    );
    if (result.statusCode === 200) {
      const filteredData = result.data.incomeTypeStatistics.filter(
        type => type.incomeType !== 3
      );

      const transformedData = filteredData.map(type => ({
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
    console.error("Error fetching profits statistics:", error);
  }
};

// Custom Components
const StatCard = ({ title, value, icon, color, prefix, suffix }) => {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        height: '100%'
      }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{
          backgroundColor: `${color}20`,
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16
        }}>
          {React.cloneElement(icon, { 
            style: { 
              fontSize: 24, 
              color: color 
            } 
          })}
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
          <Title level={3} style={{ margin: '4px 0 0', color: color }}>
            {prefix}{value}{suffix}
          </Title>
        </div>
      </div>
    </Card>
  );
};

const ChartCard = ({
  title,
  children,
  filter,
  onFilterChange,
  loading,
  extra,
  height = 400
}) => (
  <Card
    title={<Text strong>{title}</Text>}
    bordered={false}
    style={{
      borderRadius: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      height: '100%'
    }}
    bodyStyle={{ padding: '16px 0' }}
    extra={
      <>
        {extra}
        {filter && (
          <Select
            defaultValue={1}
            style={{ width: 120, marginLeft: 8 }}
            onChange={onFilterChange}
          >
            {periodOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        )}
      </>
    }
  >
    {loading ? (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    ) : (
      <div style={{ height }}>
        {children}
      </div>
    )}
  </Card>
);

const PieChartCard = ({ title, data, loading }) => {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      data: data.map(item => item.value),
      backgroundColor: data.map(item => item.color || COLORS[data.indexOf(item) % COLORS.length]),
      borderWidth: 1,
    }]
  };

  const options = {
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <ChartCard title={title} loading={loading}>
      <div style={{ height: 350 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </ChartCard>
  );
};

const IncomeBarChart = ({ data, loading }) => {
    const allPeriods = Array.from(new Set(
        data.flatMap(item => item.samples.map(s => s.period))
      )).sort();      

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
    <ChartCard title="Thống kê thu nhập" loading={loading}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fill: '#666' }} 
            axisLine={{ stroke: '#ddd' }} 
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fill: '#666' }} 
            axisLine={{ stroke: '#ddd' }} 
            label={{ 
              value: "Số tiền", 
              angle: -90, 
              position: "insideLeft",
              style: { fill: '#666' }
            }} 
          />
          
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            formatter={(value, name, props) => {
              const incomeType = name.replace('amount_', '');
              const income = data.find(item => item.incomeType.toString() === incomeType);
              return [formatCurrency(value), income?.name];
            }}
          />
          
          <Legend />
          
          {data.map((item) => (
            <Bar
              key={`bar_amount_${item.incomeType}`}
              yAxisId="left"
              dataKey={`amount_${item.incomeType}`}
              name={item.name}
              fill={item.color}
              barSize={30}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const ProfitChart = ({ data, loading }) => {
    const allPeriods = Array.from(new Set(
        data.flatMap(item => item.samples.map(s => s.period))
      )).sort();
      
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
    <ChartCard title="Thống kê lợi nhuận" loading={loading}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fill: '#666' }} 
            axisLine={{ stroke: '#ddd' }} 
          />
          <YAxis 
            yAxisId="left" 
            tick={{ fill: '#666' }} 
            axisLine={{ stroke: '#ddd' }} 
            label={{ 
              value: "Số tiền", 
              angle: -90, 
              position: "insideLeft",
              style: { fill: '#666' }
            }} 
          />

          <Tooltip
            contentStyle={{
              background: '#fff',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            formatter={(value, name, props) => {
              const profitType = name.replace('amount_', '');
              const profit = data.find(item => item.profitType.toString() === profitType);
              return [formatCurrency(value), profit?.name];
            }}
          />

          <Legend />
          
          {/* Income (1) and Withdrawal (2) as bars */}
          {data.map(item => {
            if (item.profitType === 3) return null;
            return (
              <Bar
                key={`bar_amount_${item.profitType}`}
                yAxisId="left"
                dataKey={`amount_${item.profitType}`}
                name={item.name}
                fill={item.color}
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
            );
          })}
          
          {/* Profit (3) as line */}
          {data.map(item => {
            if (item.profitType !== 3) return null;
            return (
              <Line
                key={`line_amount_${item.profitType}`}
                yAxisId="left"
                type="monotone"
                dataKey={`amount_${item.profitType}`}
                name={`Số tiền - ${item.name}`}
                stroke={item.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const UserOnlineChart = ({ data, loading, onFilterChange }) => (
  <ChartCard 
    title="Người dùng online" 
    filter 
    onFilterChange={onFilterChange}
    loading={loading}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <YAxis 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="Value" 
          name="Số lượng người dùng" 
          fill="#45B7D1" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

const PoemUploadChart = ({ data, loading, onFilterChange }) => (
  <ChartCard 
    title="Bài thơ đã đăng tải" 
    filter 
    onFilterChange={onFilterChange}
    loading={loading}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <YAxis 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        />
        <Legend />
        <Bar 
          dataKey="Value" 
          name="Số lượng bài thơ" 
          fill="#A05195" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

const TransactionChart = ({ data, totals, loading, onFilterChange }) => (
  <ChartCard 
    title="Thống kê giao dịch" 
    filter 
    onFilterChange={onFilterChange}
    loading={loading}
    extra={
      <div style={{ display: 'flex', gap: 16 }}>
        <Statistic
          title="Tổng giao dịch"
          value={totals.totalSamples}
          prefix={<ShoppingOutlined />}
          valueStyle={{ fontSize: 16 }}
        />
        <Statistic
          title="Tổng giá trị"
          value={formatCurrency(totals.totalAmount)}
          prefix={<MoneyCollectOutlined />}
          valueStyle={{ fontSize: 16 }}
        />
      </div>
    }
  >
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="period" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <YAxis 
          yAxisId="left" 
          orientation="left" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
          label={{ 
            value: 'Số lượng', 
            angle: -90, 
            position: 'insideLeft',
            style: { fill: '#666' }
          }} 
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
          label={{ 
            value: 'Giá trị', 
            angle: 90, 
            position: 'insideRight',
            style: { fill: '#666' }
          }} 
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          formatter={(value, name) => {
            if (name === 'Số lượng giao dịch') {
              return [value, name];
            } else {
              return [formatCurrency(value), name];
            }
          }}
        />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="samples"
          barSize={20}
          name="Số lượng giao dịch"
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="amounts"
          name="Tổng giá trị"
          stroke="#ff7300"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </ChartCard>
);

const MasterTemplateChart = ({ data, loading }) => (
  <ChartCard title="Đơn hàng Master Template" loading={loading}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          type="number" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={150} 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          formatter={(value, name, props) => [
            value,
            `Tag: ${props.payload.tag}`,
            `Template: ${props.payload.name}`
          ]}
        />
        <Legend />
        <Bar 
          dataKey="value" 
          name="Số lượng đơn hàng" 
          fill="#8884d8" 
          radius={[0, 4, 4, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

const OrderTypeChart = ({ data, totals, loading }) => (
  <ChartCard 
    title="Phân loại đơn hàng" 
    loading={loading}
    extra={
      <div style={{ display: 'flex', gap: 16 }}>
        <Statistic
          title="Tổng đơn hàng"
          value={totals.totalOrders}
          prefix={<ShoppingOutlined />}
          valueStyle={{ fontSize: 16 }}
        />
        <Statistic
          title="Tổng giá trị"
          value={formatCurrency(totals.totalAmounts)}
          prefix={<MoneyCollectOutlined />}
          valueStyle={{ fontSize: 16 }}
        />
      </div>
    }
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <YAxis 
          tick={{ fill: '#666' }} 
          axisLine={{ stroke: '#ddd' }} 
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          formatter={(value, name) => {
            if (name === 'Số lượng') {
              return [value, name];
            } else {
              return [formatCurrency(value), name];
            }
          }}
        />
        <Legend />
        <Bar 
          dataKey="value" 
          name="Số lượng" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
        <Bar 
          dataKey="amount" 
          name="Giá trị" 
          fill="#82ca9d" 
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Main Component
const Dashboard = () => {
  const [onlineData, setOnlineData] = useState([]);
  const [poemData, setPoemData] = useState([]);
  const [poemTypeData, setPoemTypeData] = useState([]);
  const [reportPoemData, setReportPoemData] = useState([]);
  const [reportUserData, setReportUserData] = useState([]);
  const [reportPlagiarismData, setReportPlagiarismData] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalPostedPoems: 0,
    totalRecordFiles: 0,
    totalCollections: 0,
    totalUsers: 0
  });
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
  const [loading, setLoading] = useState({
    online: false,
    poem: false,
    poemType: false,
    reportPoem: false,
    reportUser: false,
    reportPlagiarism: false,
    totalStats: false,
    transactions: false,
    orderStatus: false,
    masterTemplate: false,
    orderTypes: false,
    incomes: false,
    profits: false
  });

  // Fetch data functions with loading states
  const fetchDataWithLoading = async (fetchFn, dataKey, ...args) => {
    try {
      setLoading(prev => ({ ...prev, [dataKey]: true }));
      await fetchFn(...args);
    } finally {
      setLoading(prev => ({ ...prev, [dataKey]: false }));
    }
  };

  useEffect(() => {
    fetchDataWithLoading(
      (period) => fetchData(period, setOnlineData, `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/online-users`),
      'online',
      onlinePeriod
    );
  }, [onlinePeriod]);

  useEffect(() => {
    fetchDataWithLoading(
      (period) => fetchData(period, setPoemData, `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/poem-uploads`),
      'poem',
      poemPeriod
    );
  }, [poemPeriod]);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchData(null, setPoemTypeData, `${process.env.REACT_APP_API_BASE_URL}/statistics/v1/poem-types`),
      'poemType'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchReportPoems(setReportPoemData),
      'reportPoem'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchReportUsers(setReportUserData),
      'reportUser'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchReportPlagiarismPoems(setReportPlagiarismData),
      'reportPlagiarism'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchTotalStatistics(setTotalStats),
      'totalStats'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      (period) => fetchTransactions(period, setTransactionData),
      'transactions',
      transactionPeriod
    );
  }, [transactionPeriod]);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchOrderStatus(setOrderStatusData),
      'orderStatus'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchMasterTemplateOrders(setMasterTemplateData),
      'masterTemplate'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      () => fetchOrderTypes(setOrderTypeData),
      'orderTypes'
    );
  }, []);

  useEffect(() => {
    fetchDataWithLoading(
      (period) => fetchIncomes(period, setIncomeData),
      'incomes',
      incomePeriod
    );
  }, [incomePeriod]);

  useEffect(() => {
    fetchDataWithLoading(
      (period) => fetchProfit(period, setProfitData),
      'profits',
      profitPeriod
    );
  }, [profitPeriod]);

  const handleOnlineFilterChange = (value) => {
    setOnlinePeriod(value);
  };

  const handlePoemFilterChange = (value) => {
    setPoemPeriod(value);
  };

  const handleTransactionFilterChange = (value) => {
    setTransactionPeriod(value);
  };

  const handleIncomeFilterChange = (value) => {
    setIncomePeriod(value);
  };

  const handleProfitFilterChange = (value) => {
    setProfitPeriod(value);
  };

  const totalOrders = orderStatusData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ padding: 24 }}>
      
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng người dùng"
            value={totalStats.totalUsers}
            icon={<UserOutlined />}
            color="#FF8042"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Bài thơ đã đăng"
            value={totalStats.totalPostedPoems}
            icon={<FileTextOutlined />}
            color="#0088FE"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="File ghi âm"
            value={totalStats.totalRecordFiles}
            icon={<AudioOutlined />}
            color="#00C49F"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Bộ sưu tập"
            value={totalStats.totalCollections}
            icon={<FolderOutlined />}
            color="#8884D8"
          />
        </Col>
      </Row>

      {/* Transaction Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng số đơn hàng"
            value={totalOrders}
            icon={<ShoppingOutlined />}
            color="#A05195"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng số giao dịch"
            value={transactionData.totals.totalSamples}
            icon={<LineChartOutlined />}
            color="#45B7D1"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Tổng giá trị giao dịch"
            value={formatCurrency(transactionData.totals.totalAmount)}
            icon={<MoneyCollectOutlined />}
            color="#6abf81"
            prefix=""
          />
        </Col>
      </Row>

      {/* Main Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <IncomeBarChart 
            data={incomeData} 
            loading={loading.incomes} 
          />
        </Col>
        <Col xs={24} lg={12}>
          <ProfitChart 
            data={profitData} 
            loading={loading.profits} 
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <UserOnlineChart 
            data={onlineData} 
            loading={loading.online}
            onFilterChange={handleOnlineFilterChange}
          />
        </Col>
        <Col xs={24} lg={12}>
          <PoemUploadChart 
            data={poemData} 
            loading={loading.poem}
            onFilterChange={handlePoemFilterChange}
          />
        </Col>
        
        <Col xs={24}>
          <TransactionChart 
            data={transactionData.chartData} 
            totals={transactionData.totals}
            loading={loading.transactions}
            onFilterChange={handleTransactionFilterChange}
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <MasterTemplateChart 
            data={masterTemplateData} 
            loading={loading.masterTemplate}
          />
        </Col>
        <Col xs={24} lg={12}>
          <OrderTypeChart 
            data={orderTypeData.chartData} 
            totals={orderTypeData.totals}
            loading={loading.orderTypes}
          />
        </Col>
        
        <Col xs={24} md={12} lg={8}>
          <PieChartCard 
            title="Số lượng bài thơ theo loại" 
            data={poemTypeData.map(item => ({ 
              ...item, 
              value: item.Value,
              color: COLORS[poemTypeData.indexOf(item) % COLORS.length]
            }))} 
            loading={loading.poemType}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <PieChartCard 
            title="Trạng thái đơn hàng" 
            data={orderStatusData} 
            loading={loading.orderStatus}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <PieChartCard 
            title="Báo cáo bài thơ" 
            data={reportPoemData} 
            loading={loading.reportPoem}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <PieChartCard 
            title="Báo cáo người dùng" 
            data={reportUserData} 
            loading={loading.reportUser}
          />
        </Col>
        <Col xs={24} md={12} lg={8}>
          <PieChartCard 
            title="Kiểm tra đạo văn" 
            data={reportPlagiarismData} 
            loading={loading.reportPlagiarism}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;