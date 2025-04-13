import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Spin,
    Pagination,
    Input,
    Button,
    Empty,
    message,
    Typography,
    Divider,
    Image,
    Avatar,
    Space,
    Tag
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    CalendarOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const PoetSamplesPage = () => {
    const [poets, setPoets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
        totalPages: 1
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPoets = useCallback(async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (searchQuery) {
                queryParams.append('name', searchQuery);
            }

            queryParams.append('pageNumber', pagination.current);
            queryParams.append('pageSize', pagination.pageSize);

            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/poet-samples/v1?${queryParams.toString()}`
            );

            if (response.data.statusCode === 200) {
                setPoets(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    current: response.data.pageNumber,
                    pageSize: response.data.pageSize,
                    total: response.data.totalRecords,
                    totalPages: response.data.totalPages
                }));
            } else {
                setError('Failed to fetch poet samples');
                message.error(response.data.message || 'Failed to fetch poet samples');
            }
        } catch (err) {
            setError(err.message);
            message.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchPoets();
    }, [fetchPoets]);

    const handlePageChange = (page, pageSize) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchPoets();
    };
    const navigate = useNavigate();
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };
    const isLoggedIn = !!localStorage.getItem('accessToken');
    return (
        <div>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div style={{
                padding: '24px',
                maxWidth: '1400px',
                margin: '0 auto',
                minHeight: '100vh',
                background: '#f8f9fa'
            }}>
                {/* Header Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px',
                    padding: '20px 0'
                }}>
                    <Title level={2} style={{
                        marginBottom: '8px',
                        color: '#2c3e50',
                        fontWeight: 600,
                        fontSize: '32px'
                    }}>
                        Discover Poets
                    </Title>
                    <Text type="secondary" style={{
                        display: 'block',
                        fontSize: '16px',
                        color: '#7f8c8d'
                    }}>
                        Explore the world of poetry through its greatest creators
                    </Text>
                </div>

                {/* Search Section */}
                <Card bordered={false}
                    style={{
                        marginBottom: '32px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        background: '#fff'
                    }}>
                    <Row gutter={[16, 16]} align="middle" justify="center">
                        <Col xs={24} sm={18} md={16} lg={14}>
                            <Input
                                placeholder="Search for poets by name..."
                                prefix={<SearchOutlined style={{ color: '#7f8c8d' }} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                                onPressEnter={handleSearch}
                                size="large"
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #dfe6e9'
                                }}
                            />
                        </Col>
                        <Col xs={24} sm={6} md={4} lg={3}>
                            <Space>
                                <Button
                                    type="primary"
                                    onClick={handleSearch}
                                    loading={loading}
                                    icon={<SearchOutlined />}
                                    size="large"
                                    style={{
                                        borderRadius: '8px',
                                        background: '#3498db',
                                        borderColor: '#3498db',
                                        fontWeight: 500
                                    }}
                                >
                                    Search
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Content Section */}
                <div style={{ marginTop: '16px' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '400px'
                        }}>
                            <Spin size="large" tip="Loading poets..." />
                        </div>
                    ) : error ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span style={{ color: '#7f8c8d' }}>
                                    Failed to load poets. <a onClick={fetchPoets} style={{ color: '#3498db' }}>Retry</a>
                                </span>
                            }
                            style={{
                                padding: '60px 0',
                                background: '#fff',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                            }}
                        />
                    ) : (
                        <>
                            <Row gutter={[24, 24]}>
                                {poets.map(poet => (
                                    <Col key={poet.id} xs={24} sm={12} md={8} lg={6}>
                                        <Card
                                            onClick={() => navigate(`/knowledge/poet/${poet.id}`)}
                                            hoverable
                                            bordered={false}
                                            style={{
                                                borderRadius: '12px',
                                                height: '100%',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                                transition: 'all 0.3s ease',
                                                background: '#fff'
                                            }}
                                            bodyStyle={{
                                                padding: '16px',
                                                ':hover': {
                                                    transform: 'translateY(-5px)',
                                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                                }
                                            }}
                                            cover={
                                                <div style={{
                                                    height: '200px',
                                                    overflow: 'hidden',
                                                    borderTopLeftRadius: '12px',
                                                    borderTopRightRadius: '12px',
                                                    background: '#dfe6e9'
                                                }}>
                                                    {poet.avatar ? (
                                                        <Image
                                                            alt={poet.name}
                                                            src={poet.avatar}
                                                            height="100%"
                                                            width="100%"
                                                            style={{
                                                                objectFit: 'cover',
                                                                objectPosition: 'center'
                                                            }}
                                                            preview={false}
                                                            fallback="https://via.placeholder.com/300x200?text=Poet+Image"
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            height: '100%',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            background: 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)'
                                                        }}>
                                                            <Avatar
                                                                size={80}
                                                                icon={<UserOutlined />}
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    fontSize: '48px',
                                                                    color: '#fff'
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            }
                                        >
                                            <div style={{ marginBottom: '12px' }}>
                                                <Tag color="#3498db" style={{
                                                    borderRadius: '4px',
                                                    padding: '2px 8px',
                                                    fontWeight: 500
                                                }}>
                                                    {poet.gender || 'Unknown'}
                                                </Tag>
                                            </div>

                                            <Title level={4} style={{
                                                marginBottom: '8px',
                                                color: '#2c3e50'
                                            }}>
                                                {poet.name}
                                            </Title>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '12px',
                                                color: '#7f8c8d'
                                            }}>
                                                <CalendarOutlined style={{ marginRight: '8px' }} />
                                                <Text>{formatDate(poet.dateOfBirth)}</Text>
                                            </div>

                                            <Paragraph
                                                ellipsis={{
                                                    rows: 3,
                                                    expandable: true,
                                                    symbol: <span style={{ color: '#3498db' }}>Read more <ArrowRightOutlined /></span>
                                                }}
                                                style={{
                                                    color: '#636e72',
                                                    marginBottom: '16px',
                                                    lineHeight: '1.6'
                                                }}
                                            >
                                                {poet.bio || 'No biography available'}
                                            </Paragraph>

                                            <Button
                                                type="link"
                                                style={{
                                                    color: '#3498db',
                                                    padding: 0,
                                                    fontWeight: 500
                                                }}
                                            >
                                                View Poems
                                            </Button>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {poets.length > 0 && (
                                <div style={{
                                    marginTop: '48px',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <Pagination
                                        current={pagination.current}
                                        pageSize={pagination.pageSize}
                                        total={pagination.total}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        showQuickJumper
                                        pageSizeOptions={['12', '24', '48', '96']}
                                        showTotal={(total) => (
                                            <Text style={{ color: '#7f8c8d' }}>
                                                Total <Text strong>{total}</Text> poets found
                                            </Text>
                                        )}
                                        style={{
                                            padding: '16px 24px',
                                            background: '#fff',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '60px',
                    padding: '20px 0',
                    textAlign: 'center',
                    color: '#7f8c8d'
                }}>
                    <Text>© {new Date().getFullYear()} Poetry Collection. All rights reserved.</Text>
                </div>
            </div></div>

    );
};

export default PoetSamplesPage;