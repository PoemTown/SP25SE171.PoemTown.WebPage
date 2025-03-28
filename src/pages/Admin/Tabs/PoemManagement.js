import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Spin, Alert, Row, Col, Select, Avatar, Space } from 'antd';
import { HeartOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const API_URL = 'https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts';

export const getPoemPosts = async (filters) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_URL}?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching poem posts:', error);
    throw error;
  }
};

const PoemManagement = () => {
  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    'filterOptions.type': '',
    'filterOptions.status': '',
    'filterOptions.audio': '',
    sortOptions: '2',
    isDelete: false,
    pageNumber: 1,
    pageSize: 10,
    allowExceedPageSize: false,
  });

  useEffect(() => {
    setLoading(true);
    getPoemPosts(filters)
      .then(data => {
        setPoems(data.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) 
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: '50px' }} />;
  
  if (error) 
    return <Alert message="Error loading poems" description={error.message} type="error" showIcon style={{ margin: '20px auto', maxWidth: '600px' }} />;

  return (
    <div style={{ padding: '40px', maxWidth: '1500px', margin: 'auto', background: '#fefaf5', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <Title level={2} style={{ textAlign: 'center', color: '#4A4A4A' }}>📜 Poem Collection</Title>

      {/* Bộ lọc */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col span={6}>
          <Select 
            placeholder="Poem Type"
            style={{ width: '100%' }}
            onChange={value => handleFilterChange('filterOptions.type', value)}
            allowClear
          >
            <Option value="1">Thơ Tự Do</Option>
            <Option value="2">Thơ Lục Bát</Option>
            <Option value="3">Thơ Song Thất Lục Bát</Option>
            <Option value="4">Thơ Thất Ngôn Tứ Tuyệt</Option>
            <Option value="5">Thơ Ngũ Ngôn Tứ Tuyệt</Option>
            <Option value="6">Thơ Thất Ngôn Bát Cú</Option>
            <Option value="7">Thơ Bốn Chữ</Option>
            <Option value="8">Thơ Năm Chữ</Option>
            <Option value="9">Thơ Sáu Chữ</Option>
            <Option value="10">Thơ Bảy Chữ</Option>
            <Option value="11">Thơ Tám Chữ</Option>
          </Select>
        </Col>

        <Col span={6}>
          <Select 
            placeholder="Status"
            style={{ width: '100%' }}
            onChange={value => handleFilterChange('filterOptions.status', value)}
            allowClear
          >
            <Option value="0">Draft</Option>
            <Option value="1">Posted</Option>
            <Option value="2">Suspended</Option>
          </Select>
        </Col>
      </Row>

      {/* Danh sách bài thơ */}
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={poems}
        renderItem={poem => (
          <List.Item>
            <Card hoverable cover={<img alt="poem" src={poem.poemImage} style={{ borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }} />}> 
              <Space style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Avatar src={poem.user.avatar} size={40} />
                <Title level={5} style={{ margin: 0 }}>{poem.user.displayName}</Title>
              </Space>
              <Title level={4}>{poem.title}</Title>
              <Paragraph>{poem.description}</Paragraph>
              <Space>
                <HeartOutlined /> {poem.likeCount}
                <MessageOutlined /> {poem.commentCount}
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default PoemManagement;
