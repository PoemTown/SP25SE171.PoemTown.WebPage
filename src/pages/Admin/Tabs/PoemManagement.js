import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Spin, Alert, Row, Col, Select, Avatar, Space, Typography,
  Pagination, Button, Tag, Tooltip, Divider, Badge, Input,
  Dropdown, Menu, Modal, message
} from 'antd';
import {
  HeartOutlined, MessageOutlined, FilterOutlined, ClearOutlined,
  SortAscendingOutlined, StarOutlined, ShoppingOutlined, BookOutlined,
  SearchOutlined, ClockCircleOutlined, EyeOutlined,
  MoreOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const PoemManagement = () => {
  const navigate = useNavigate();

  const [poems, setPoems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poemTypes, setPoemTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalRecords: 0
  });

  const [filters, setFilters] = useState({
    'filterOptions.status': '',
    'filterOptions.title': '',
    'filterOptions.type': '',
    sortOptions: '',
    pageNumber: 1,
    pageSize: 10,
  });

  const [selectedFilters, setSelectedFilters] = useState({
    status: null,
    title: '',
    type: null,
    sort: ''
  });

  const debounceRef = useRef(null);

  const fetchPoemTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/poem-types/v1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setPoemTypes(response.data.data);
    } catch (err) {
      console.error('Error fetching poem types:', err);
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  const fetchPoems = useCallback(async (currentFilters) => {
    setLoading(true);
    try {
      const filtersToSend = { ...currentFilters };
      if (!filtersToSend.sortOptions) {
        delete filtersToSend.sortOptions;
      }

      const queryParams = new URLSearchParams(filtersToSend).toString();
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/poems?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const data = response.data;

      setPoems(data.data);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        totalRecords: data.totalRecords
      });
    } catch (err) {
      setError(err);
      console.error('Error fetching poems:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    (currentFilters) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        fetchPoems(currentFilters);
      }, 500);
    },
    [fetchPoems]
  );

  useEffect(() => {
    debouncedFetch(filters);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, debouncedFetch]);

  useEffect(() => {
    fetchPoemTypes();
  }, [fetchPoemTypes]);

  const handleFilterChange = (key, value, filterName) => {
    const newFilters = {
      ...filters,
      [key]: value,
      pageNumber: 1
    };
    setFilters(newFilters);
    setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSelectedFilters(prev => ({ ...prev, title: value }));
    const newFilters = {
      ...filters,
      'filterOptions.title': value,
      pageNumber: 1
    };
    setFilters(newFilters);
  };

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, pageNumber: page, pageSize }));
  };

  const resetFilters = () => {
    const newFilters = {
      'filterOptions.status': '',
      'filterOptions.title': '',
      'filterOptions.type': '',
      sortOptions: '',
      pageNumber: 1,
      pageSize: 10
    };
    setFilters(newFilters);
    setSelectedFilters({
      status: null,
      title: '',
      type: null,
      sort: ''
    });
  };

  const handleEditPoem = (poemId, currentStatus) => {
    let modal = Modal.info({
      title: 'Thay đổi trạng thái bài thơ',
      content: (
        <div>
          <p>Chọn trạng thái mới cho bài thơ:</p>
          <Select
            style={{ width: '100%', marginTop: '10px' }}
            defaultValue={currentStatus.toString()}
            onChange={(value) => {
              modal.destroy();
              updatePoemStatus(poemId, value);
            }}
          >
            <Option value="0">Bản nháp</Option>
            <Option value="1">Đã đăng</Option>
            <Option value="2">Bị tạm ngưng</Option>
            <Option value="3">Đang chờ duyệt</Option>

          </Select>
        </div>
      ),
      okText: 'Đóng',
      onOk: () => modal.destroy(),
      maskClosable: true
    });
  };

  const updatePoemStatus = async (poemId, status) => {
    setUpdatingStatus(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1/admin/${poemId}?status=${status}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        message.success('Cập nhật trạng thái bài thơ thành công');
        fetchPoems(filters);
      } else {
        message.error('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      console.error('Error updating poem status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeletePoem = (poemId) => {
    confirm({
      title: 'Xác nhận xóa bài thơ',
      content: 'Bạn có chắc chắn muốn xóa bài thơ này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        return new Promise((resolve, reject) => {
          const accessToken = localStorage.getItem('accessToken');
          axios.delete(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/admin/${poemId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
            .then(() => {
              message.success('Xóa bài thơ thành công');
              fetchPoems(filters);
              resolve();
            })
            .catch(error => {
              message.error('Xóa bài thơ thất bại: ' + (error.response?.data?.message || error.message));
              reject();
            });
        });
      }
    });
  };

  const statusOptions = [
    { value: '0', label: 'Draft', color: 'default' },
    { value: '1', label: 'Posted', color: 'green' },
    { value: '2', label: 'Suspended', color: 'red' },
    { value: '3', label: 'Pending', color: 'yellow' },
  ];

  const sortOptions = [
    { value: '', label: 'Mặc định (Mới nhất)', icon: <ClockCircleOutlined /> },
    { value: '1', label: 'Lượt like tăng dần' },
    { value: '2', label: 'Lượt like giảm dần' },
    { value: '3', label: 'Bình luận tăng dần' },
    { value: '4', label: 'Bình luận giảm dần' },
    { value: '5', label: 'Sắp xếp theo a - z' },
    { value: '6', label: 'Sắp xếp theo z - a' },
  ];

  if ((loading && poems.length === 0) || loadingTypes) {
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
        <Col xs={24} sm={12} md={6} lg={6}>
          <Input
            placeholder="Tìm kiếm theo tên bài thơ"
            allowClear
            prefix={<SearchOutlined />}
            value={selectedFilters.title}
            onChange={handleInputChange}
            onPressEnter={() => debouncedFetch(filters)}
          />
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
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

        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            placeholder="Chọn loại thơ"
            style={{ width: '100%' }}
            value={selectedFilters.type}
            onChange={value => handleFilterChange('filterOptions.type', value, 'type')}
            allowClear
            loading={loadingTypes}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="">Tất cả loại thơ</Option>
            {poemTypes.map(type => (
              <Option key={type.id} value={type.id}>
                <Tag color={type.color}>{type.name}</Tag>
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6} lg={4}>
          <Select
            placeholder="Sắp xếp theo"
            style={{ width: '100%' }}
            value={selectedFilters.sort}
            onChange={value => handleFilterChange('sortOptions', value, 'sort')}
            suffixIcon={<SortAscendingOutlined />}
          >
            {sortOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.icon && <span style={{ marginRight: '8px' }}>{option.icon}</span>}
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} style={{ textAlign: 'right' }}>
          <Button
            type="default"
            icon={<ClearOutlined />}
            onClick={resetFilters}
            disabled={!selectedFilters.status && !selectedFilters.title && !selectedFilters.sort && !selectedFilters.type}
          >
            Đặt lại bộ lọc
          </Button>
        </Col>
      </Row>

      {(selectedFilters.title || selectedFilters.status || selectedFilters.sort || selectedFilters.type) && (
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
            {selectedFilters.type && (
              <span>
                Loại thơ: <Tag color={poemTypes.find(t => t.id === selectedFilters.type)?.color}>
                  {poemTypes.find(t => t.id === selectedFilters.type)?.name || selectedFilters.type}
                </Tag>
              </span>
            )}
            {selectedFilters.sort && (
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
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{
                  padding: '20px',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  height: '200px',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0
                }}>
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
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <StarOutlined style={{ fontSize: '14px' }} /> Nhà thơ nổi tiếng
                    </div>
                  )}
                  {poem.isSellUsageRight && (
                    <div style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <ShoppingOutlined style={{ fontSize: '14px' }} />
                      {poem.price?.toLocaleString()}đ
                    </div>
                  )}
                </div>

                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                      gap: '10px'
                    }}>
                      <Avatar src={poem.user?.avatar} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '1.4',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {poem.user?.displayName || poem.user?.userName || 'Ẩn danh'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#7f8c8d',
                          lineHeight: '1.4'
                        }}>
                          {dayjs(poem.createdTime).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                      <Tag color={statusOptions.find(s => s.value === poem.status?.toString())?.color}>
                        {statusOptions.find(s => s.value === poem.status?.toString())?.label}
                      </Tag>
                    </div>

                    <Title
                      level={4}
                      style={{
                        marginBottom: '12px',
                        color: '#2c3e50',
                        fontSize: '18px',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '50px'
                      }}
                    >
                      {poem.title}
                    </Title>

                    <Paragraph
                      style={{
                        color: '#7f8c8d',
                        marginBottom: '12px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '63px'
                      }}
                    >
                      {poem.description || 'Không có mô tả'}
                    </Paragraph>

                    {poem.poemType && (
                      <div style={{ marginBottom: '12px' }}>
                        <Tag
                          color={poemTypes.find(t => t.id === poem.poemType.id)?.color || '#2db7f5'}
                          style={{ marginRight: 0 }}
                        >
                          {poemTypes.find(t => t.id === poem.poemType.id)?.name || poem.poemType.name}
                        </Tag>
                      </div>
                    )}
                  </div>

                  <div>
                    <Divider style={{ margin: '12px 0' }} />
                    <Space
                      size="middle"
                      style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <Space size="middle">
                        <Tooltip title="Lượt thích">
                          <Badge count={poem.likeCount || 0} size="small">
                            <HeartOutlined style={{ color: '#e74c3c', fontSize: '18px' }} />
                          </Badge>
                        </Tooltip>
                        <Tooltip title="Bình luận">
                          <Badge count={poem.commentCount || 0} size="small">
                            <MessageOutlined style={{ color: '#3498db', fontSize: '18px' }} />
                          </Badge>
                        </Tooltip>
                      </Space>

                      <Space size="middle">
                        {poem.collection && (
                          <Tooltip title={`Tập thơ: ${poem.collection.collectionName}`}>
                            <Tag icon={<BookOutlined />} color="purple" style={{ marginRight: 0 }}>
                              {poem.collection.collectionName}
                            </Tag>
                          </Tooltip>
                        )}

                        <Tooltip title="Xem chi tiết">
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/poem/${poem.id}`)}
                            style={{ color: '#1890ff' }}
                          />
                        </Tooltip>

                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item
                                key="edit"
                                icon={<EditOutlined />}
                                onClick={() => handleEditPoem(poem.id, poem.status)}
                                disabled={updatingStatus}
                              >
                                Tùy chỉnh trạng thái
                              </Menu.Item>
                              <Menu.Item
                                key="delete"
                                icon={<DeleteOutlined />}
                                danger
                                onClick={() => handleDeletePoem(poem.id)}
                              >
                                Xóa
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={['click']}
                          placement="bottomRight"
                        >
                          <Button
                            type="text"
                            icon={<MoreOutlined />}
                            style={{ color: '#8c8c8c' }}
                            loading={updatingStatus}
                          />
                        </Dropdown>
                      </Space>
                    </Space>
                  </div>
                </div>
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