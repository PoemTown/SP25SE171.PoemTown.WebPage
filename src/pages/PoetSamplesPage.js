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
    Image,
    Avatar,
    Space,
    Tag,
    Tooltip
} from 'antd';
import {
    SearchOutlined,
    ReloadOutlined,
    UserOutlined,
    CalendarOutlined,
    ArrowRightOutlined,
    StarFilled,
    FireFilled,
    CrownFilled
} from '@ant-design/icons';
import axios from 'axios';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const PoetSamplesPage = () => {
    const [poets, setPoets] = useState([]);
    const [titleSamples, setTitleSamples] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTitles, setLoadingTitles] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
        totalPages: 1
    });
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTitleSamples = useCallback(async () => {
        try {
            setLoadingTitles(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/title-samples/v1`
            );
            if (response.data.statusCode === 200) {
                setTitleSamples(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching title samples:', err);
        } finally {
            setLoadingTitles(false);
        }
    }, []);

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
                `${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1?${queryParams.toString()}`
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
                setError('Không thể tải danh sách nhà thơ');
                message.error(response.data.message || 'Không thể tải danh sách nhà thơ');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Lỗi không xác định');
            message.error('Có lỗi xảy ra khi tải dữ liệu: ' + 
                (err.response?.data?.message || 'Vui lòng thử lại sau'));
        } finally {
            setLoading(false);
        }
    }, [searchQuery, pagination.current, pagination.pageSize]);

    useEffect(() => {
        fetchTitleSamples();
        fetchPoets();
    }, [fetchTitleSamples, fetchPoets]);

    const handlePageChange = (page, pageSize) => {
        setPagination(prev => ({ ...prev, current: page, pageSize }));
    };

    const handleSearch = () => {
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchPoets();
    };
    
    const navigate = useNavigate();
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Không rõ';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };
    
    const isLoggedIn = !!localStorage.getItem('accessToken');
    
    const getGenderLabel = (gender) => {
        switch(gender?.toLowerCase()) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            default: return 'Không rõ';
        }
    };

    const getTitleConfig = (titleName) => {
        const titleConfigs = {
            'Chuyên gia thơ 8 chữ': { icon: <StarFilled />, color: 'gold' },
            'Chuyên gia thể thơ 9 chữ': { icon: <StarFilled />, color: 'volcano' },
            'Lục bát': { icon: <FireFilled />, color: 'red' },
            'Trữ tình': { icon: <CrownFilled />, color: 'purple' },
            'Tự do': { icon: <FireFilled />, color: 'green' },
            'Tình yêu': { icon: <CrownFilled />, color: 'pink' },
            'Sứ giả hòa bình': { icon: <StarFilled />, color: 'blue' },
            'Cảm xúc': { icon: <FireFilled />, color: 'orange' },
            'Chuyên gia tâm lý': { icon: <CrownFilled />, color: 'cyan' }
        };

        return titleConfigs[titleName] || null;
    };

    const getPoetBadges = (poet) => {
        if (!poet.titleSamples || poet.titleSamples.length === 0) {
            return [];
        }

        if (!loadingTitles && titleSamples.length > 0) {
            const poetTitleIds = poet.titleSamples.map(t => t.id);
            const matchedTitles = titleSamples.filter(title => 
                poetTitleIds.includes(title.id));

            return matchedTitles
                .map(title => {
                    const titleConfig = getTitleConfig(title.name);
                    return titleConfig ? {
                        icon: titleConfig.icon,
                        color: titleConfig.color,
                        tooltip: title.name,
                        shortName: title.name.split(' ')[0]
                    } : null;
                })
                .filter(Boolean);
        }

        return [];
    };

    return (
        <div style={{
            backgroundImage: 'url(/caa00115cae5d0ce60dd640c616c93b2.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            minHeight: '100vh'
        }}>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div style={{
                padding: '24px',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {/* Hero Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px',
                    padding: '40px 20px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    borderRadius: '16px',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <Title level={1} style={{
                        marginBottom: '16px',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '42px'
                    }}>
                        Khám Phá Thế Giới Thi Ca
                    </Title>
                    <Text style={{
                        display: 'block',
                        fontSize: '18px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '800px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Tìm hiểu và cảm nhận những tác phẩm bất hủ từ các nhà thơ nổi tiếng qua các thời kỳ
                    </Text>
                </div>

                {/* Search Section */}
                <Card bordered={false}
                    style={{
                        marginBottom: '32px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        background: 'white'
                    }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <Row gutter={[16, 16]} align="middle" justify="center">
                        <Col xs={24} sm={18} md={16} lg={14}>
                            <Input
                                placeholder="Tìm kiếm nhà thơ theo tên..."
                                prefix={<SearchOutlined />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                allowClear
                                onPressEnter={handleSearch}
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px'
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
                                        borderRadius: '10px',
                                        height: '48px',
                                        width: '100%'
                                    }}
                                >
                                    Tìm kiếm
                                </Button>
                                <Button
                                    icon={<ReloadOutlined />}
                                    size="large"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setPagination(prev => ({ ...prev, current: 1 }));
                                        fetchPoets();
                                    }}
                                    style={{
                                        borderRadius: '10px',
                                        height: '48px',
                                        width: '100%'
                                    }}
                                >
                                    Làm mới
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                {/* Main Content */}
                <div style={{ marginTop: '16px' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '400px',
                            background: 'white',
                            borderRadius: '16px'
                        }}>
                            <Spin size="large" tip="Đang tải dữ liệu..." />
                        </div>
                    ) : error ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span style={{ color: '#666' }}>
                                    Không thể tải danh sách nhà thơ. <a onClick={fetchPoets} style={{ color: '#1890ff' }}>Thử lại</a>
                                </span>
                            }
                            style={{
                                padding: '80px 0',
                                background: 'white',
                                borderRadius: '16px'
                            }}
                        />
                    ) : (
                        <>
                            {poets.length === 0 ? (
                                <Card style={{ borderRadius: '16px' }}>
                                    <Empty
                                        description={
                                            <Text style={{ color: '#666' }}>
                                                Không tìm thấy nhà thơ nào phù hợp
                                            </Text>
                                        }
                                    />
                                </Card>
                            ) : (
                                <>
                                    <Row gutter={[24, 24]}>
                                        {poets.map(poet => {
                                            const badges = getPoetBadges(poet);
                                            return (
                                                <Col key={poet.id} xs={24} sm={12} md={8} lg={6}>
                                                    <Card
                                                        onClick={() => navigate(`/knowledge/poet/${poet.id}`)}
                                                        hoverable
                                                        style={{
                                                            borderRadius: '16px',
                                                            height: '100%',
                                                            overflow: 'hidden'
                                                        }}
                                                        cover={
                                                            <div style={{ 
                                                                height: '220px', 
                                                                overflow: 'hidden', 
                                                                position: 'relative'
                                                            }}>
                                                                {poet.avatar ? (
                                                                    <Image
                                                                        alt={poet.name}
                                                                        src={poet.avatar}
                                                                        height="100%"
                                                                        width="100%"
                                                                        style={{ objectFit: 'cover' }}
                                                                        preview={false}
                                                                        fallback="https://via.placeholder.com/300x200?text=Ảnh+nhà+thơ"
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        height: '100%',
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
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
                                                                
                                                                {/* Badges display with horizontal scroll */}
                                                                {badges.length > 0 && (
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        bottom: '12px',
                                                                        left: '12px',
                                                                        right: '12px',
                                                                        display: 'flex',
                                                                        gap: '8px',
                                                                        overflowX: 'auto',
                                                                        paddingBottom: '8px',
                                                                        scrollbarWidth: 'none',
                                                                        msOverflowStyle: 'none',
                                                                    }}>
                                                                        {badges.map((badge, index) => (
                                                                            <Tooltip key={index} title={badge.tooltip}>
                                                                                <Tag icon={badge.icon} color={badge.color} style={{
                                                                                    borderRadius: '20px',
                                                                                    padding: '4px 12px',
                                                                                    fontWeight: 600,
                                                                                    margin: 0,
                                                                                    flexShrink: 0,
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {badge.shortName}
                                                                                </Tag>
                                                                            </Tooltip>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        }
                                                    >
                                                        <div style={{ marginBottom: '12px' }}>
                                                            <Tag color={poet.gender?.toLowerCase() === 'male' ? '#1890ff' : '#eb2f96'}>
                                                                {getGenderLabel(poet.gender)}
                                                            </Tag>
                                                        </div>

                                                        <Title level={4} style={{
                                                            marginBottom: '8px',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {poet.name}
                                                        </Title>

                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginBottom: '12px',
                                                            color: '#666'
                                                        }}>
                                                            <CalendarOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                                            <Text>{formatDate(poet.dateOfBirth)}</Text>
                                                        </div>

                                                        <Paragraph
                                                            ellipsis={{
                                                                rows: 3,
                                                                expandable: true,
                                                                symbol: <span style={{ color: '#1890ff' }}>Xem thêm</span>
                                                            }}
                                                            style={{
                                                                marginBottom: '16px',
                                                                minHeight: '72px'
                                                            }}
                                                        >
                                                            {poet.bio || 'Chưa có tiểu sử'}
                                                        </Paragraph>

                                                        <Button
                                                            type="primary"
                                                            ghost
                                                            style={{
                                                                width: '100%'
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/knowledge/poet/${poet.id}`);
                                                            }}
                                                        >
                                                            Khám phá thơ
                                                        </Button>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

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
                                            showTotal={(total) => `Tổng cộng ${total} nhà thơ`}
                                            style={{
                                                padding: '16px 24px',
                                                background: 'white',
                                                borderRadius: '16px'
                                            }}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '80px',
                    padding: '40px 0',
                    textAlign: 'center',
                    color: '#666',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <Text style={{ fontSize: '16px' }}>
                        © {new Date().getFullYear()} Bộ sưu tập Thơ ca
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default PoetSamplesPage;