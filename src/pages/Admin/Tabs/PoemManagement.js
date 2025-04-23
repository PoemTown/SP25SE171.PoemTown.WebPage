import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { 
  Card, Spin, Alert, Row, Col, Select, Avatar, Space, Typography, 
  Pagination, Button, Tag, Tooltip, Divider, Badge, Input 
} from 'antd';
import { 
  HeartOutlined, MessageOutlined, FilterOutlined, ClearOutlined, 
  SortAscendingOutlined, StarOutlined, ShoppingOutlined, BookOutlined,
  SearchOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const API_URL = 'https://api-poemtown-staging.nodfeather.win/api/poems/v1/posts';

// Debounce function
const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
};

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
    'filterOptions.status': '',
    'filterOptions.title': '',
    sortOptions: '1', 
    pageNumber: 1,
    pageSize: 10,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    status: null,
    title: '',
    sort: '1'
  });

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce((filters) => {
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
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetch(filters);
    return () => {
      // Cleanup function to cancel any pending debounce calls
      debouncedFetch.cancel?.();
    };
  }, [filters, debouncedFetch]);

  const handleFilterChange = (key, value, filterName) => {
    const newFilters = { 
      ...filters, 
      [key]: value, 
      pageNumber: 1
    };
    setFilters(newFilters);
    setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSearch = (value) => {
    handleFilterChange('filterOptions.title', value, 'title');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedFilters(prev => ({ ...prev, title: value }));
    setFilters(prev => ({ 
      ...prev, 
      'filterOptions.title': value,
      pageNumber: 1
    }));
  };

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, pageNumber: page, pageSize }));
  };

  const resetFilters = () => {
    const newFilters = {
      'filterOptions.status': '',
      'filterOptions.title': '',
      sortOptions: '1',
      pageNumber: 1,
      pageSize: 10
    };
    setFilters(newFilters);
    setSelectedFilters({
      status: null,
      title: '',
      sort: '1'
    });
  };

  const statusOptions = [
    { value: '0', label: 'Draft', color: 'default' },
    { value: '1', label: 'Posted', color: 'green' },
    { value: '2', label: 'Suspended', color: 'red' },
    { value: '3', label: 'Pending', color: 'yellow' },
  ];

  const sortOptions = [
    { value: '1', label: 'Lượt like tăng dần' },
    { value: '2', label: 'Lượt like giảm dần' },
    { value: '3', label: 'Bình luận tăng dần' },
    { value: '4', label: 'Bình luận giảm dần' },
    { value: '5', label: 'Sắp xếp theo a - z' },
    { value: '6', label: 'Sắp xếp theo z - a' },
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
        <Title level={2} style={{ color: '#2c3e50' }}>📜 Quản lý bài thơ</Title>
        <Paragraph style={{ color: '#7f8c8d', fontSize: '16px' }}>
          Khám phá và quản lý các bài thơ trong cộng đồng
        </Paragraph>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '30px', alignItems: 'center' }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Search
            placeholder="Tìm kiếm theo tên bài thơ"
            allowClear
            enterButton={<SearchOutlined />}
            value={selectedFilters.title}
            onChange={handleInputChange}
            onSearch={handleSearch}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select 
            placeholder="Chọn trạng thái"
            style={{ width: '100%' }}
            value={selectedFilters.status}
            onChange={value => handleFilterChange('filterOptions.status', value, 'status')}
            allowClear
            suffixIcon={<FilterOutlined />}
          >
            <Option value="">Tất cả trạng thái</Option>
            {statusOptions.map(status => (
              <Option key={status.value} value={status.value}>
                <Tag color={status.color}>{status.label}</Tag>
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Sắp xếp theo"
            style={{ width: '100%' }}
            value={selectedFilters.sort}
            onChange={value => handleFilterChange('sortOptions', value, 'sort')}
            suffixIcon={<SortAscendingOutlined />}
          >
            {sortOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} style={{ textAlign: 'right' }}>
          <Button 
            type="default" 
            icon={<ClearOutlined />} 
            onClick={resetFilters}
            disabled={!selectedFilters.status && !selectedFilters.title && selectedFilters.sort === '1'}
          >
            Đặt lại bộ lọc
          </Button>
        </Col>
      </Row>

      {(selectedFilters.title || selectedFilters.status || selectedFilters.sort !== '1') && (
        <div style={{ marginBottom: '20px', padding: '10px 15px', background: '#f0f2f5', borderRadius: '4px' }}>
          <Space>
            <span style={{ fontWeight: '500' }}>Bộ lọc đang áp dụng:</span>
            {selectedFilters.title && (
              <span>
                Tên bài thơ: <span style={{ color: '#1890ff' }}>"{selectedFilters.title}"</span>
              </span>
            )}
            {selectedFilters.status && (
              <span>
                Trạng thái: <Tag color={statusOptions.find(s => s.value === selectedFilters.status)?.color}>
                  {statusOptions.find(s => s.value === selectedFilters.status)?.label || selectedFilters.status}
                </Tag>
              </span>
            )}
            {selectedFilters.sort !== '1' && (
              <span>
                Sắp xếp: <span style={{ color: '#1890ff' }}>
                  {sortOptions.find(s => s.value === selectedFilters.sort)?.label || selectedFilters.sort}
                </span>
              </span>
            )}
          </Space>
        </div>
      )}

      {poems.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '5px', 
          color: '#7f8c8d'
        }}>
          <Paragraph>Không tìm thấy bài thơ nào phù hợp</Paragraph>
          <Button type="primary" onClick={resetFilters}>
            Đặt lại bộ lọc
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
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  position: 'relative'
                }}
                bodyStyle={{ padding: '20px' }}
                cover={
                  <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      alt={poem.title} 
                      src={poem.poemImage} 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                    {poem.isFamousPoet && (
                      <div style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        background: 'rgba(0,0,0,0.5)', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        color: 'white'
                      }}>
                        <StarOutlined /> Nhà thơ nổi tiếng
                      </div>
                    )}
                    {poem.isSellUsageRight && (
                      <div style={{ 
                        position: 'absolute', 
                        bottom: '10px', 
                        left: '10px', 
                        background: 'rgba(0,0,0,0.5)', 
                        padding: '5px 10px', 
                        borderRadius: '4px',
                        color: 'white'
                      }}>
                        <ShoppingOutlined /> Bản quyền: {poem.price?.toLocaleString()}đ
                      </div>
                    )}
                  </div>
                }
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <Avatar src={poem.user?.avatar} size={40} />
                  <div style={{ marginLeft: '10px', flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{poem.user?.displayName || poem.user?.userName || 'Ẩn danh'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      {dayjs(poem.createdTime).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                  <Tag color={statusOptions.find(s => s.value === poem.status?.toString())?.color}>
                    {statusOptions.find(s => s.value === poem.status?.toString())?.label}
                  </Tag>
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
                  {poem.description || 'Không có mô tả'}
                </Paragraph>
                
                <Divider style={{ margin: '10px 0' }} />
                
                <Space size="large" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space>
                    <Tooltip title="Lượt thích">
                      <Badge count={poem.likeCount || 0}>
                        <HeartOutlined style={{ color: '#e74c3c', fontSize: '18px' }} />
                      </Badge>
                    </Tooltip>
                    <Tooltip title="Bình luận">
                      <Badge count={poem.commentCount || 0}>
                        <MessageOutlined style={{ color: '#3498db', fontSize: '18px' }} />
                      </Badge>
                    </Tooltip>
                  </Space>
                  
                  {poem.collection && (
                    <Tooltip title={`Tập thơ: ${poem.collection.collectionName}`}>
                      <Tag icon={<BookOutlined />} color="purple">
                        {poem.collection.collectionName}
                      </Tag>
                    </Tooltip>
                  )}
                </Space>
              </Card>
            ))}
          </div>

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
                showSizeChanger
                pageSizeOptions={['10', '20', '50', '100']}
                showTotal={(total, range) => `${range[0]}-${range[1]} trong ${total} bài thơ`}
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