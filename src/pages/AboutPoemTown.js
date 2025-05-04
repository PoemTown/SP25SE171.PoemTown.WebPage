import React, { useEffect, useState } from 'react';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { CircularProgress, Alert } from '@mui/material';

const AboutPoemTown = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
        fetchContentData();
    }, []);

    const fetchContentData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/content-pages/v1`);
            setContents(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const handleSignup = () => {
        navigate("/signup");
    };

    const renderContent = (content) => {
        return content.split('\n')
            .filter(paragraph => paragraph.trim())
            .map((paragraph, index) => (
                <p key={index} style={{ 
                    marginBottom: '15px',
                    lineHeight: '1.6'
                }}>
                    {paragraph}
                </p>
            ));
    };

    if (loading) {
        return (
            <div>
                {isLoggedIn ? <Headeruser /> : <Headerdefault />}
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh'
                }}>
                    <CircularProgress />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                {isLoggedIn ? <Headeruser /> : <Headerdefault />}
                <div style={{ 
                    maxWidth: '800px',
                    margin: '40px auto',
                    padding: '20px'
                }}>
                    <Alert severity="error">
                        Error loading content: {error}
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            
            <main style={{ 
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px'
            }}>
                {/* Hero Banner */}
                <section style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '80px 20px',
                    textAlign: 'center',
                    borderRadius: '12px',
                    marginBottom: '40px',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <h1 style={{ 
                        fontSize: '2.8rem', 
                        marginBottom: '20px',
                        fontWeight: '700'
                    }}>
                        Chào mừng đến với PoemTown
                    </h1>
                    <p style={{ 
                        fontSize: '1.3rem', 
                        maxWidth: '800px', 
                        margin: '0 auto',
                        opacity: '0.9'
                    }}>
                        Nơi kết nối những tâm hồn yêu thơ ca và sáng tạo nghệ thuật
                    </p>
                </section>

                {/* Dynamic Content Sections */}
                {contents.length > 0 ? (
                    contents.map((content) => (
                        <article 
                            key={content.id}
                            style={{
                                padding: '40px',
                                margin: '30px 0',
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 2px 15px rgba(0,0,0,0.05)',
                                transition: 'transform 0.3s ease',
                                ':hover': {
                                    transform: 'translateY(-5px)'
                                }
                            }}
                        >
                            <h2 style={{
                                color: '#4a6baf',
                                borderBottom: '2px solid #e0e6ff',
                                paddingBottom: '12px',
                                marginBottom: '25px',
                                fontSize: '1.8rem'
                            }}>
                                {content.title}
                            </h2>
                            <div style={{ 
                                lineHeight: '1.7',
                                fontSize: '1.1rem',
                                color: '#444',
                                textAlign: "justify",

                            }}>
                                {renderContent(content.content)}
                            </div>
                        </article>
                    ))
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        margin: '30px 0'
                    }}>
                        <p style={{ fontSize: '1.1rem' }}>
                            Hiện chưa có nội dung nào được cập nhật.
                        </p>
                    </div>
                )}

                {/* Features Grid */}
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '25px',
                    margin: '50px 0'
                }}>
                    {[
                        {
                            title: 'Đa dạng thể loại',
                            description: 'Thơ lục bát, tự do, haiku, và nhiều thể loại khác',
                            icon: '✍️'
                        },
                        {
                            title: 'Cộng đồng thân thiện',
                            description: 'Môi trường giao lưu văn minh, tích cực',
                            icon: '👥'
                        },
                        {
                            title: 'Sự kiện thường xuyên',
                            description: 'Cuộc thi sáng tác hàng tháng với giải thưởng hấp dẫn',
                            icon: '🏆'
                        }
                    ].map((feature, index) => (
                        <div 
                            key={index}
                            style={{
                                padding: '30px',
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 3px 15px rgba(0,0,0,0.05)',
                                textAlign: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                fontSize: '2.5rem',
                                marginBottom: '15px'
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{
                                color: '#5a6abf',
                                marginBottom: '15px',
                                fontSize: '1.4rem'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{ 
                                color: '#666',
                                lineHeight: '1.6'
                            }}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </section>

                {/* Call to Action */}
                {!isLoggedIn && (
                    <section style={{
                        textAlign: 'center',
                        padding: '50px 20px',
                        margin: '50px 0',
                        background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '20px'
                        }}>
                            Tham gia cộng đồng PoemTown ngay hôm nay!
                        </h2>
                        <p style={{ 
                            fontSize: '1.1rem',
                            maxWidth: '700px',
                            margin: '0 auto 30px',
                            opacity: '0.9'
                        }}>
                            Đăng ký miễn phí để bắt đầu chia sẻ tác phẩm của bạn và kết nối với những người yêu thơ khác
                        </p>
                        <button 
                            onClick={handleSignup}
                            style={{
                                padding: '14px 32px',
                                backgroundColor: 'white',
                                color: '#4facfe',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                ':hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                                }
                            }}
                        >
                            Đăng ký thành viên
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
};

export default AboutPoemTown;