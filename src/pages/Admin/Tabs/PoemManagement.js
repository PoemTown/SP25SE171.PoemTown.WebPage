import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Card, Spin, Alert, Row, Col, Select, Avatar, Space, Typography, Pagination, Button } from 'antd';
import { HeartOutlined, MessageOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

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
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    'filterOptions.type': '',
    'filterOptions.status': '',
    'filterOptions.audio': '',
    sortOptions: '2',
    isDelete: false,
    pageNumber: 1,
    pageSize: 9,
    allowExceedPageSize: false,
  });

  // State để lưu trữ giá trị đang được chọn
  const [selectedFilters, setSelectedFilters] = useState({
    type: null,
    status: null
  });

  useEffect(() => {
    setLoading(true);
    getPoemPosts(filters)
      .then(data => {
        setPoems(data.data);
        setPagination({
          pageNumber: data.pageNumber,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          totalRecords: data.totalRecords
        });
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [filters]);

  const handleFilterChange = (key, value, filterName) => {
    setFilters(prev => ({ ...prev, [key]: value, pageNumber: 1 }));
    setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, pageNumber: page }));
  };

  const resetFilters = () => {
    setFilters(prev => ({
      ...prev,
      'filterOptions.type': '',
      'filterOptions.status': '',
      pageNumber: 1
    }));
    setSelectedFilters({
      type: null,
      status: null
    });
  };

  const poemTypes = [
    { value: '1', label: 'Thơ Tự Do' },
    { value: '2', label: 'Thơ Lục Bát' },
    { value: '3', label: 'Thơ Song Thất Lục Bát' },
    { value: '4', label: 'Thơ Thất Ngôn Tứ Tuyệt' },
    { value: '5', label: 'Thơ Ngũ Ngôn Tứ Tuyệt' },
    { value: '6', label: 'Thơ Thất Ngôn Bát Cú' },
    { value: '7', label: 'Thơ Bốn Chữ' },
    { value: '8', label: 'Thơ Năm Chữ' },
    { value: '9', label: 'Thơ Sáu Chữ' },
    { value: '10', label: 'Thơ Bảy Chữ' },
    { value: '11', label: 'Thơ Tám Chữ' }
  ];

  const statusOptions = [
    { value: '0', label: 'Draft' },
    { value: '1', label: 'Posted' },
    { value: '2', label: 'Suspended' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <Alert 
          message="Error loading poems" 
          description={error.message} 
          type="error" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Title level={2} style={{ color: '#2c3e50' }}>📜 Poem Collection</Title>
        <Paragraph style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Explore beautiful poems from our community
        </Paragraph>
      </div>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: '30px', alignItems: 'center' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select 
            placeholder="Select Poem Type"
            style={{ width: '100%' }}
            value={selectedFilters.type}
            onChange={value => handleFilterChange('filterOptions.type', value, 'type')}
            allowClear
            suffixIcon={<FilterOutlined />}
          >
            <Option value="">All Types</Option>
            {poemTypes.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select 
            placeholder="Select Status"
            style={{ width: '100%' }}
            value={selectedFilters.status}
            onChange={value => handleFilterChange('filterOptions.status', value, 'status')}
            allowClear
            suffixIcon={<FilterOutlined />}
          >
            <Option value="">All Statuses</Option>
            {statusOptions.map(status => (
              <Option key={status.value} value={status.value}>{status.label}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={24} md={8} lg={12} style={{ textAlign: 'right' }}>
          <Button 
            type="default" 
            icon={<ClearOutlined />} 
            onClick={resetFilters}
            disabled={!selectedFilters.type && !selectedFilters.status}
          >
            Reset Filters
          </Button>
        </Col>
      </Row>

      {/* Selected Filters Display */}
      {(selectedFilters.type || selectedFilters.status) && (
        <div style={{ marginBottom: '20px', padding: '10px 15px', background: '#f0f2f5', borderRadius: '4px' }}>
          <Space>
            <span style={{ fontWeight: '500' }}>Active Filters:</span>
            {selectedFilters.type && (
              <span>
                Type: <span style={{ color: '#1890ff' }}>
                  {poemTypes.find(t => t.value === selectedFilters.type)?.label || selectedFilters.type}
                </span>
              </span>
            )}
            {selectedFilters.status && (
              <span>
                Status: <span style={{ color: '#1890ff' }}>
                  {statusOptions.find(s => s.value === selectedFilters.status)?.label || selectedFilters.status}
                </span>
              </span>
            )}
          </Space>
        </div>
      )}

      {/* Poem List */}
      {poems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px', 
          color: '#7f8c8d'
        }}>
          <Paragraph>No poems found matching your criteria</Paragraph>
          <Button type="primary" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '25px',
            marginBottom: '30px'
          }}>
            {poems.map(poem => (
              <Card
                key={poem.id}
                hoverable
                style={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                bodyStyle={{ padding: '20px' }}
                cover={
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img 
                      alt={poem.title} 
                      src={poem.poemImage || 'https://via.placeholder.com/350x200?text=No+Image'} 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/350x200?text=No+Image';
                      }}
                    />
                  </div>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <Avatar src={poem.user?.avatar} size={40} />
                  <div style={{ marginLeft: '10px' }}>
                    <div style={{ fontWeight: '500' }}>{poem.user?.displayName || poem.user?.userName || 'Unknown'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      {new Date(poem.createdTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <Title level={4} style={{ marginBottom: '10px', color: '#2c3e50' }}>
                  {poem.title}
                </Title>
                
                <Paragraph 
                  style={{ 
                    color: '#7f8c8d',
                    marginBottom: '15px',
                    display: '-webkit-box',
                    WebkitLineClamp: '3',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {poem.description}
                </Paragraph>
                
                <Space style={{ color: '#7f8c8d' }}>
                  <Space>
                    <HeartOutlined style={{ color: '#e74c3c' }} />
                    <span>{poem.likeCount || 0}</span>
                  </Space>
                  <Space>
                    <MessageOutlined style={{ color: '#3498db' }} />
                    <span>{poem.commentCount || 0}</span>
                  </Space>
                </Space>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              marginTop: '30px'
            }}>
              <Pagination
                current={pagination.pageNumber}
                total={pagination.totalRecords}
                pageSize={pagination.pageSize}
                onChange={handlePageChange}
                showSizeChanger={false}
                style={{ marginBottom: '30px' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PoemManagement;