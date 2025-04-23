import React, { useEffect, useState } from 'react';
import { Collapse, Typography, Layout, Card, theme, Spin, Divider, Image } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;
const { Content } = Layout;

const StyledCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  border: none;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const PoetryTypeHeader = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 24px;
    background: ${props => props.color};
    margin-right: 12px;
    border-radius: 4px;
  }
`;

const PoemExampleCard = styled(Card)`
  margin-top: 16px;
  border-left: 3px solid ${props => props.color};
  background: ${props => props.theme.colorFillAlter};
`;

const PoetInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const KnowledgePage = () => {
    const {
        token: { colorBgContainer, borderRadiusLG, colorFillAlter },
    } = theme.useToken();

    const [poetryTypes, setPoetryTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const isLoggedIn = !!localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchPoetryTypes = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/poem-samples`);
                if (!response.ok) {
                    throw new Error('Failed to fetch poetry types');
                }
                const data = await response.json();
                setPoetryTypes(data.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPoetryTypes();
    }, []);

    const handlePoetClick = (poetId) => {
        navigate(`/knowledge/poet/${poetId}`);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Text type="danger">Error: {error}</Text>
            </div>
        );
    }

    const formatPoemContent = (content) => {
        return content.split('\n').map((line, i) => (
            <div key={i} style={{ marginBottom: i % 2 === 0 ? 0 : '1em' }}>
                {line}
            </div>
        ));
    };

    return (
        <div style={{ background: '#f5f7fa' }}>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <Layout style={{ padding: '24px', minHeight: '100vh', background: '#f5f7fa' }}>
                <Content style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <Card
                        style={{
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                            marginBottom: 24,
                            textAlign: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                        }}
                        bordered={false}
                    >
                        <Title level={2} style={{ marginBottom: 0 }}>
                            <BookOutlined style={{
                                marginRight: 12,
                                color: '#722ed1',
                                fontSize: '28px'
                            }} />
                            <Text style={{
                                background: 'linear-gradient(90deg, #1890ff, #722ed1)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 600
                            }}>
                                Các Thể Loại Thơ Cơ Bản
                            </Text>
                        </Title>
                        <Paragraph type="secondary" style={{ marginTop: 8 }}>
                            Khám phá các thể thơ truyền thống và hiện đại của Việt Nam
                        </Paragraph>
                    </Card>

                    <Collapse
                        accordion
                        bordered={false}
                        expandIconPosition="end"
                        style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}
                    >
                        {poetryTypes.map((type) => (
                            <Panel
                                header={
                                    <PoetryTypeHeader color={type.color}>
                                        {type.name}
                                    </PoetryTypeHeader>
                                }
                                key={type.id}
                                style={{
                                    borderLeft: `4px solid ${type.color}`,
                                    marginBottom: 8,
                                    borderRadius: 8,
                                    overflow: 'hidden'
                                }}
                            >
                                <Paragraph style={{ margin: 0, paddingLeft: 20 }}>
                                    {type.description.split('\n').map((line, index) => (
                                        <span key={index}>
                                            {line}
                                            <br />
                                        </span>
                                    ))}
                                </Paragraph>


                                {type.poem && (
                                    <>
                                        <Divider orientation="left" style={{ margin: '16px 0' }}>
                                            Ví dụ
                                        </Divider>
                                        <PoemExampleCard color={type.color}>
                                            <Title level={5} style={{ color: type.color }}>
                                                {type.poem.title}
                                            </Title>
                                            {type.poem.poemImage && (
                                                <Image
                                                    src={type.poem.poemImage}
                                                    alt={type.poem.title}
                                                    style={{ marginBottom: 16, maxHeight: 200, objectFit: 'cover' }}
                                                    preview={false}
                                                />
                                            )}
                                            <div style={{ whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                                                {formatPoemContent(type.poem.content)}
                                            </div>
                                            <Divider style={{ margin: '12px 0' }} />
                                            <PoetInfoWrapper
                                                onClick={() => handlePoetClick(type.poem.poetSample.id)}
                                            >
                                                {type.poem.poetSample.avatar && (
                                                    <Image
                                                        src={type.poem.poetSample.avatar}
                                                        alt={type.poem.poetSample.name}
                                                        width={48}
                                                        height={48}
                                                        style={{ borderRadius: '50%', marginRight: 12 }}
                                                        preview={false}
                                                    />
                                                )}
                                                <div>
                                                    <Text strong>{type.poem.poetSample.name}</Text>
                                                    <Paragraph type="secondary" style={{ margin: 0 }}>
                                                        {type.poem.collection.collectionName}
                                                    </Paragraph>
                                                </div>
                                            </PoetInfoWrapper>
                                        </PoemExampleCard>
                                    </>
                                )}
                            </Panel>
                        ))}
                    </Collapse>

                    <div style={{ marginTop: 24 }}>
                        <Title level={4} style={{ color: '#595959' }}>Mẹo làm thơ</Title>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                            <StyledCard>
                                <Text strong>Chọn thể loại phù hợp</Text>
                                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Mỗi thể thơ có đặc điểm riêng, chọn thể loại phù hợp với nội dung muốn truyền tải.
                                </Paragraph>
                            </StyledCard>
                            <StyledCard>
                                <Text strong>Chú ý vần điệu</Text>
                                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Vần điệu giúp bài thơ dễ đọc, dễ nhớ và có nhạc tính.
                                </Paragraph>
                            </StyledCard>
                            <StyledCard>
                                <Text strong>Kiểm tra số chữ</Text>
                                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                                    Đảm bảo đúng số chữ quy định của thể thơ bạn chọn.
                                </Paragraph>
                            </StyledCard>
                        </div>
                    </div>
                </Content>
            </Layout>
        </div>
    );
};

export default KnowledgePage;