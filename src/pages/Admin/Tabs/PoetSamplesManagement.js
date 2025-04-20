import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Modal,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  message,
  Spin,
  Badge,
  Image,
  Row,
  Col,
  Card,
  Pagination,
  Typography,
  Space,
  Avatar,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  FireFilled,
  CrownFilled
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PoetSamplesManagement = () => {
  // State management
  const [poets, setPoets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [titleSamples, setTitleSamples] = useState([]);
  const [titleSamplesLoading, setTitleSamplesLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0
  });
  const [filters, setFilters] = useState({
    name: '',
    pageNumber: 1,
    pageSize: 12
  });
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentPoet, setCurrentPoet] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [editPreviewImage, setEditPreviewImage] = useState('');
  const navigate = useNavigate();

  // Validate title samples selection
  const validateTitleSamples = (_, value) => {
    if (value && value.length > 2) {
      return Promise.reject(new Error('Chỉ được chọn tối đa 2 chuyên môn!'));
    }
    return Promise.resolve();
  };

  // Fetch poets data
  const fetchPoets = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') queryParams.append(key, value);
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1?${queryParams.toString()}`
      );

      if (response.data.statusCode === 200) {
        setPoets(response.data.data);
        setPagination({
          current: response.data.pageNumber,
          pageSize: response.data.pageSize,
          total: response.data.totalRecords
        });
      } else {
        setError('Failed to fetch poet samples');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch title samples data
  const fetchTitleSamples = useCallback(async () => {
    try {
      setTitleSamplesLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/title-samples/v1`
      );

      if (response.data.statusCode === 200) {
        setTitleSamples(response.data.data);
      } else {
        message.error('Failed to fetch title samples');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setTitleSamplesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPoets();
    fetchTitleSamples();
  }, [fetchPoets, fetchTitleSamples]);

  // Image upload handler
  const handleUpload = async (file, isEdit = false) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.statusCode === 201) {
        message.success('Upload ảnh thành công!');
        if (isEdit) {
          setEditPreviewImage(response.data.data);
          editForm.setFieldsValue({ avatar: response.data.data });
        } else {
          setPreviewImage(response.data.data);
          form.setFieldsValue({ avatar: response.data.data });
        }
        return false;
      } else {
        message.error(response.data.message || 'Upload ảnh thất bại');
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi upload ảnh:', error);
      message.error(error.response?.data?.message || 'Lỗi khi upload ảnh');
      return false;
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage('');
      form.setFieldsValue({ avatar: '' });
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ có thể tải lên file ảnh!');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      setFileList([file]);
      handleUpload(file);
      return false;
    },
    fileList,
    maxCount: 1,
    accept: 'image/*',
    listType: 'picture',
    showUploadList: false
  };

  const editUploadProps = {
    onRemove: () => {
      setEditFileList([]);
      setEditPreviewImage('');
      editForm.setFieldsValue({ avatar: '' });
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Chỉ có thể tải lên file ảnh!');
        return false;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Ảnh phải nhỏ hơn 5MB!');
        return false;
      }

      setEditFileList([file]);
      handleUpload(file, true);
      return false;
    },
    fileList: editFileList,
    maxCount: 1,
    accept: 'image/*',
    listType: 'picture',
    showUploadList: false
  };

  // Function to handle adding title samples
  const handleAddTitleSamples = async (poetId, titleSampleIds) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      // Tạo query string với nhiều titleSampleIds
      const queryParams = new URLSearchParams();
      titleSampleIds.forEach(id => queryParams.append('titleSampleIds', id));

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/title-samples/v1/${poetId}?${queryParams.toString()}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.data.statusCode === 200) {
        message.success('Thêm chuyên môn thơ thành công!');
        return true;
      } else {
        message.error(response.data.message || 'Thêm chuyên môn thơ thất bại');
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi thêm chuyên môn thơ:', error);
      message.error(error.response?.data?.message || 'Lỗi khi thêm chuyên môn thơ');
      return false;
    }
  };

  // Function to handle removing title samples
  const handleRemoveTitleSamples = async (poetId, titleSampleIds) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      // Tạo query string với nhiều titleSampleIds
      const queryString = titleSampleIds
        .map(id => `titleSampleIds=${encodeURIComponent(id)}`)
        .join('&');

      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/title-samples/v1/${poetId}/title-samples?${queryString}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.data.statusCode === 202) {
        message.success('Xóa chuyên môn thơ thành công!');
        return true;
      } else {
        message.error(response.data.message || 'Xóa chuyên môn thơ thất bại');
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi xóa chuyên môn thơ:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa chuyên môn thơ');
      return false;
    }
  };

  const handleCreateSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const formattedDate = values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null;

      const requestBody = {
        name: values.name,
        bio: values.bio,
        dateOfBirth: formattedDate,
        gender: values.gender,
        avatar: values.avatar || '',
        titleSampleIds: values.titleSampleIds || []
      };

      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.statusCode === 201) {
        message.success('Tạo nhà thơ mới thành công!');
        setIsCreateModalVisible(false);
        form.resetFields();
        setFileList([]);
        setPreviewImage('');
        await fetchPoets();
      } else {
        message.error(response.data.message || 'Tạo nhà thơ thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhà thơ:', error);
      message.error(error.response?.data?.message || 'Lỗi khi tạo nhà thơ');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit poet
  const handleEditPoet = (poet) => {
    setCurrentPoet(poet);
    setIsEditModalVisible(true);

    const formattedDate = poet.dateOfBirth ? dayjs(poet.dateOfBirth) : null;

    editForm.setFieldsValue({
      name: poet.name,
      bio: poet.bio,
      dateOfBirth: formattedDate,
      gender: poet.gender,
      avatar: poet.avatar || '',
      titleSampleIds: poet.titleSamples?.map(sample => sample.id) || []
    });

    if (poet.avatar) {
      setEditPreviewImage(poet.avatar);
    }
  };

  const handleEditSubmit = async () => {
    try {
      setLoading(true);
      const values = await editForm.validateFields();

      const formattedDate = values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null;

      const requestBody = {
        id: currentPoet.id,
        name: values.name,
        bio: values.bio,
        dateOfBirth: formattedDate,
        gender: values.gender,
        avatar: values.avatar || '',
      };

      const accessToken = localStorage.getItem('accessToken');

      // First update the poet info
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.statusCode === 202) {
        // Then handle title samples changes
        const currentTitleSampleIds = currentPoet.titleSamples?.map(sample => sample.id) || [];
        const newTitleSampleIds = values.titleSampleIds || [];

        // Find IDs to add (exist in new but not in current)
        const idsToAdd = newTitleSampleIds.filter(id => !currentTitleSampleIds.includes(id));

        // Find IDs to remove (exist in current but not in new)
        const idsToRemove = currentTitleSampleIds.filter(id => !newTitleSampleIds.includes(id));

        // Add new title samples
        if (idsToAdd.length > 0) {
          await handleAddTitleSamples(currentPoet.id, idsToAdd);
        }

        // Remove old title samples
        if (idsToRemove.length > 0) {
          await handleRemoveTitleSamples(currentPoet.id, idsToRemove);
        }

        message.success('Cập nhật nhà thơ thành công!');
        setIsEditModalVisible(false);
        editForm.resetFields();
        setEditFileList([]);
        setEditPreviewImage('');
        await fetchPoets();
      } else {
        message.error(response.data.message || 'Cập nhật nhà thơ thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật nhà thơ:', error);
      message.error(error.response?.data?.message || 'Lỗi khi cập nhật nhà thơ');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete poet
  const handleDeletePoet = async (poetId) => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1?poetSampleId=${poetId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.data.statusCode === 202) {
        message.success('Xóa nhà thơ thành công!');
        await fetchPoets();
      } else {
        message.error(response.data.message || 'Xóa nhà thơ thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi xóa nhà thơ:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa nhà thơ');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setFilters({
      ...filters,
      pageNumber: page,
      pageSize: pageSize
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setFilters({
      ...filters,
      name: value,
      pageNumber: 1
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      name: '',
      pageNumber: 1,
      pageSize: 12
    });
  };

  if (loading && poets.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          maxWidth: '500px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Title level={3} style={{ color: '#ff4d4f' }}>Đã xảy ra lỗi</Title>
          <Text type="secondary">{error}</Text>
          <div style={{ marginTop: '16px' }}>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      background: '#f5f7fa',
      minHeight: '100vh',
      maxWidth: '170vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: '#fff',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
      }}>
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Quản lý Nhà thơ
          </Title>
          <Text type="secondary">{pagination.total} nhà thơ</Text>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalVisible(true)}
          size="large"
        >
          Thêm nhà thơ
        </Button>
      </div>

      {/* Search and filter */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên nhà thơ..."
          allowClear
          enterButton={<Button type="primary" icon={<SearchOutlined />}>Tìm kiếm</Button>}
          size="large"
          onSearch={handleSearch}
          style={{ width: '100%', maxWidth: '400px' }}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={resetFilters}
          size="large"
        >
          Làm mới
        </Button>
      </div>

      {/* Poets list */}
      <Row gutter={[24, 24]}>
        {poets.map(poet => (
          <Col key={poet.id} xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card
              hoverable
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                height: '420px',
                display: 'flex',
                flexDirection: 'column'
              }}
              cover={
                <div style={{
                  height: '180px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Image
                    alt={poet.name}
                    src={poet.avatar || 'https://via.placeholder.com/300x200?text=No+Image'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    fallback="https://via.placeholder.com/300x200?text=No+Image"
                    preview={false}
                  />
                </div>
              }
              bodyStyle={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '16px'
              }}
            >
              <Title
                level={5}
                style={{
                  marginBottom: '12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'pointer',
                  color: '#000'
                }}
                title={poet.name}
                onClick={() => navigate(`/knowledge/poet/${poet.id}`)}
              >
                {poet.name}
              </Title>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
                gap: '8px'
              }}>
                <Badge
                  count={poet.gender}
                  style={{
                    backgroundColor: poet.gender === 'Female' ? '#ff4d4f' :
                      poet.gender === 'Male' ? '#1890ff' : '#722ed1',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                />
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#666',
                  marginLeft: 'auto'
                }}>
                  <CalendarOutlined style={{ marginRight: '4px' }} />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {poet.dateOfBirth ? dayjs(poet.dateOfBirth).format('DD/MM/YYYY') : 'Không rõ'}
                  </Text>
                </div>
              </div>

              <div style={{
                height: '72px',
                marginBottom: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Text
                  style={{
                    color: '#666',
                    lineHeight: '1.5',
                    fontSize: '13px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}
                >
                  {poet.bio || 'Chưa có thông tin tiểu sử'}
                </Text>
                {poet.bio && poet.bio.length > 150 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    background: 'linear-gradient(90deg, transparent, white 50%)',
                    paddingLeft: '20px',
                    color: '#1890ff'
                  }}>...</div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Button
                  type="link"
                  size="small"
                  style={{
                    padding: '0',
                    color: '#1890ff',
                    fontWeight: 500
                  }}
                  onClick={() => {
                    Modal.info({
                      title: `Thông tin chi tiết: ${poet.name}`,
                      width: 700,
                      content: (
                        <div>
                          <div style={{ display: 'flex', marginBottom: '16px', gap: '16px' }}>
                            <Image
                              width={200}
                              src={poet.avatar || 'https://via.placeholder.com/300x200?text=No+Image'}
                              style={{ borderRadius: '8px' }}
                            />
                            <div>
                              <p><strong>Giới tính:</strong> {poet.gender}</p>
                              <p><strong>Ngày sinh:</strong> {poet.dateOfBirth ? dayjs(poet.dateOfBirth).format('DD/MM/YYYY') : 'Không rõ'}</p>
                              {poet.titleSamples && poet.titleSamples.length > 0 && (
                                <div>
                                  <p><strong>Chuyên môn:</strong></p>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                                    {poet.titleSamples.map(sample => {
                                      // Ánh xạ tên chuyên môn với icon và màu sắc tương ứng
                                      const getStyle = (name) => {
                                        const styles = {
                                          'Chuyên gia thơ 8 chữ': { icon: <StarFilled style={{ fontSize: '16px' }} />, color: 'gold' },
                                          'Chuyên gia thể thơ 9 chữ': { icon: <StarFilled style={{ fontSize: '16px' }} />, color: 'volcano' },
                                          'Lục bát': { icon: <FireFilled style={{ fontSize: '16px' }} />, color: 'red' },
                                          'Trữ tình': { icon: <CrownFilled style={{ fontSize: '16px' }} />, color: 'purple' },
                                          'Tự do': { icon: <FireFilled style={{ fontSize: '16px' }} />, color: 'green' },
                                          'Tình yêu': { icon: <CrownFilled style={{ fontSize: '16px' }} />, color: 'pink' },
                                          'Sứ giả hòa bình': { icon: <StarFilled style={{ fontSize: '16px' }} />, color: 'blue' },
                                          'Cảm xúc': { icon: <FireFilled style={{ fontSize: '16px' }} />, color: 'orange' },
                                          'Chuyên gia tâm lý': { icon: <CrownFilled style={{ fontSize: '16px' }} />, color: 'cyan' }
                                        };
                                        
                                        // Mặc định nếu không tìm thấy
                                        return styles[name] || { icon: <StarFilled style={{ fontSize: '16px' }} />, color: 'gray' };
                                      };
                                      
                                      const style = getStyle(sample.name);
                                      
                                      return (
                                        <div
                                          key={sample.id}
                                          style={{
                                            backgroundColor: style.color,
                                            color: '#fff',
                                            padding: '8px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                          }}
                                        >
                                          {style.icon}
                                          <span>{sample.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4>Tiểu sử:</h4>
                            <p style={{ whiteSpace: 'pre-line' }}>{poet.bio || 'Chưa có thông tin tiểu sử'}</p>
                          </div>
                        </div>
                      )
                    });
                  }}
                >
                  Xem chi tiết →
                </Button>

                <Space>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPoet(poet);
                    }}
                    style={{ color: '#1890ff' }}
                  />
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa nhà thơ này?"
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDeletePoet(poet.id);
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'center',
        background: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
      }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={handlePaginationChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Tổng ${total} nhà thơ`}
        />
      </div>

      {/* Create Poet Modal */}
      <Modal
        title={<span style={{ fontSize: '20px', fontWeight: '600' }}>Thêm nhà thơ mới</span>}
        visible={isCreateModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
          setFileList([]);
          setPreviewImage('');
        }}
        okText="Tạo mới"
        cancelText="Hủy bỏ"
        width={700}
        confirmLoading={loading}
        bodyStyle={{ padding: '24px' }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={<Text strong>Tên nhà thơ</Text>}
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhà thơ!' },
                  { max: 100, message: 'Tên không được vượt quá 100 ký tự' }
                ]}
              >
                <Input placeholder="Nhập tên nhà thơ" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<Text strong>Giới tính</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select placeholder="Chọn giới tính" size="large">
                  <Option value="Male">Nam</Option>
                  <Option value="Female">Nữ</Option>
                  <Option value="Other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateOfBirth"
            label={<Text strong>Ngày sinh</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              disabledDate={current => current && current > dayjs()}
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label={<Text strong>Tiểu sử</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập tiểu sử!' },
              { max: 1000, message: 'Tiểu sử không được vượt quá 1000 ký tự' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập tiểu sử nhà thơ..."
              showCount
              maxLength={1000}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            name="titleSampleIds"
            label={<Text strong>Chuyên môn thơ</Text>}
            extra={<Text type="secondary">Chọn các chuyên môn thơ của nhà thơ (tối đa 2)</Text>}
            rules={[
              { validator: validateTitleSamples }
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn chuyên môn thơ"
              size="large"
              loading={titleSamplesLoading}
              optionFilterProp="label"
              maxTagCount={2}
              maxTagTextLength={10}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {titleSamples.map(sample => (
                <Option
                  key={sample.id}
                  value={sample.id}
                  label={sample.name}
                >
                  {sample.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="avatar"
            label={<Text strong>Ảnh đại diện</Text>}
            extra={<Text type="secondary">Tải lên ảnh đại diện (tối đa 5MB, định dạng JPG/PNG)</Text>}
          >
            <div>
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  size="large"
                  block
                >
                  {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
                </Button>
              </Upload>

              {(previewImage || form.getFieldValue('avatar')) && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Image
                    src={previewImage || form.getFieldValue('avatar')}
                    alt="Ảnh đại diện"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: '1px dashed #d9d9d9'
                    }}
                  />
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Poet Modal */}
      <Modal
        title={<span style={{ fontSize: '20px', fontWeight: '600' }}>Chỉnh sửa nhà thơ</span>}
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditFileList([]);
          setEditPreviewImage('');
        }}
        okText="Cập nhật"
        cancelText="Hủy bỏ"
        width={700}
        confirmLoading={loading}
        bodyStyle={{ padding: '24px' }}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label={<Text strong>Tên nhà thơ</Text>}
                rules={[
                  { required: true, message: 'Vui lòng nhập tên nhà thơ!' },
                  { max: 100, message: 'Tên không được vượt quá 100 ký tự' }
                ]}
              >
                <Input placeholder="Nhập tên nhà thơ" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<Text strong>Giới tính</Text>}
                rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
              >
                <Select placeholder="Chọn giới tính" size="large">
                  <Option value="Male">Nam</Option>
                  <Option value="Female">Nữ</Option>
                  <Option value="Other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateOfBirth"
            label={<Text strong>Ngày sinh</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              disabledDate={current => current && current > dayjs()}
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label={<Text strong>Tiểu sử</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập tiểu sử!' },
              { max: 1000, message: 'Tiểu sử không được vượt quá 1000 ký tự' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập tiểu sử nhà thơ..."
              showCount
              maxLength={1000}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            name="titleSampleIds"
            label={<Text strong>Chuyên môn thơ</Text>}
            extra={<Text type="secondary">Chọn các chuyên môn thơ của nhà thơ (tối đa 2)</Text>}
            rules={[
              { validator: validateTitleSamples }
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn chuyên môn thơ"
              size="large"
              loading={titleSamplesLoading}
              optionFilterProp="label"
              maxTagCount={2}
              maxTagTextLength={10}
              filterOption={(input, option) =>
                option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(selectedValues) => {
                editForm.setFieldsValue({ titleSampleIds: selectedValues });
              }}
            >
              {titleSamples.map(sample => (
                <Option
                  key={sample.id}
                  value={sample.id}
                  label={sample.name}
                >
                  {sample.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="avatar"
            label={<Text strong>Ảnh đại diện</Text>}
            extra={<Text type="secondary">Tải lên ảnh đại diện (tối đa 5MB, định dạng JPG/PNG)</Text>}
          >
            <div>
              <Upload {...editUploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  size="large"
                  block
                >
                  {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
                </Button>
              </Upload>

              {(editPreviewImage || editForm.getFieldValue('avatar')) && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <Image
                    src={editPreviewImage || editForm.getFieldValue('avatar')}
                    alt="Ảnh đại diện"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      borderRadius: '8px',
                      border: '1px dashed #d9d9d9'
                    }}
                  />
                </div>
              )}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PoetSamplesManagement;