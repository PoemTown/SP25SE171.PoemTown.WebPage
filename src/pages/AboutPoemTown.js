import React, { useEffect, useState } from 'react';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { useNavigate } from "react-router-dom";


const AboutPoemTown = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);
    const handleSignup = () => {
        navigate("/signup");
    };
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Conditional Header */}
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}

            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: '60px 20px',
                textAlign: 'center',
                borderRadius: '8px',
                marginBottom: '40px'
            }}>
                <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '20px' }}>Chào mừng đến với PoemTown</h1>
                <p style={{ fontSize: '1.2rem', color: '#34495e', maxWidth: '800px', margin: '0 auto' }}>
                    Nơi kết nối những tâm hồn yêu thơ ca và sáng tạo nghệ thuật
                </p>
            </section>

            {/* Main Content Section */}
            <section id="about-poemtown" style={{
                padding: '40px',
                margin: '20px 0',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    color: '#3498db',
                    borderBottom: '2px solid #3498db',
                    paddingBottom: '10px',
                    marginBottom: '20px'
                }}>Giới thiệu về PoemTown</h2>

                <div style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
                    <p>
                        PoemTown là một cộng đồng trực tuyến dành cho những người yêu thích thơ ca, nơi bạn có thể:
                    </p>
                    <ul style={{ margin: '20px 0', paddingLeft: '20px' }}>
                        <li>Chia sẻ các sáng tác thơ văn của mình</li>
                        <li>Kết nối với những tác giả cùng chí hướng</li>
                        <li>Tham gia các cuộc thi sáng tác định kỳ</li>
                        <li>Bình luận và thảo luận về các tác phẩm</li>
                        <li>Học hỏi từ các nhà thơ chuyên nghiệp</li>
                    </ul>

                    <h3 style={{ color: '#2c3e50', margin: '25px 0 15px' }}>Lịch sử hình thành</h3>
                    <p>
                        PoemTown được thành lập năm 2020 với mong muốn tạo ra một không gian sáng tạo lành mạnh
                        cho cộng đồng yêu thơ tại Việt Nam. Qua 3 năm phát triển, chúng tôi đã kết nối hơn 10.000
                        thành viên trên khắp cả nước.
                    </p>

                    <h3 style={{ color: '#2c3e50', margin: '25px 0 15px' }}>Tầm nhìn</h3>
                    <p>
                        Chúng tôi mong muốn trở thành nền tảng hàng đầu về thơ ca tại Việt Nam, nơi ươm mầm
                        và phát triển những tài năng văn học mới.
                    </p>
                </div>
            </section>

            {/* Features Section */}
            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
                margin: '40px 0'
            }}>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ color: '#e74c3c' }}>Đa dạng thể loại</h3>
                    <p>Thơ lục bát, tự do, haiku, và nhiều thể loại khác</p>
                </div>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ color: '#e74c3c' }}>Cộng đồng thân thiện</h3>
                    <p>Môi trường giao lưu văn minh, tích cực</p>
                </div>
                <div style={{
                    padding: '20px',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ color: '#e74c3c' }}>Sự kiện thường xuyên</h3>
                    <p>Cuộc thi sáng tác hàng tháng với nhiều giải thưởng hấp dẫn</p>
                </div>
            </section>

            {/* Call to Action */}
            {!isLoggedIn && (
                <section style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    margin: '40px 0',
                    backgroundColor: '#3498db',
                    color: 'white',
                    borderRadius: '8px'
                }}>
                    <h2>Tham gia cộng đồng PoemTown ngay hôm nay!</h2>
                    <p style={{ margin: '20px 0' }}>Đăng ký miễn phí để bắt đầu chia sẻ tác phẩm của bạn</p>
                    <button style={{
                        padding: '12px 24px',
                        backgroundColor: '#fff',
                        color: '#3498db',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                        onClick={handleSignup}
                    >
                        Đăng ký thành viên
                    </button>
                </section>
            )}
        </div>
    );
};

export default AboutPoemTown;