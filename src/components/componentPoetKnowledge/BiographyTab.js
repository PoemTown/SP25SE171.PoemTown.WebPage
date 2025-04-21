import React from "react";
import PropTypes from "prop-types";

const BiographyTab = ({ poet, formatDate }) => {
    // Format date with safety checks
    const formatDateLocal = (dateString) => {
        if (!dateString) return "Chưa rõ";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Chưa rõ";
            
            const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return date.toLocaleDateString('vi-VN', options);
        } catch {
            return "Chưa rõ";
        }
    };

    // Safe data getter with fallbacks
    const getPoetData = (field) => poet?.[field] || (field === 'bio' ? "Đang cập nhật tiểu sử..." : "Chưa rõ");

    // Gender translation with emoji
    const renderGender = () => {
        switch (poet?.gender?.toLowerCase()) {
            case 'male': return <span>Nam <span className="gender-emoji">👨</span></span>;
            case 'female': return <span>Nữ <span className="gender-emoji">👩</span></span>;
            default: return <span>Khác <span className="gender-emoji">🧑</span></span>;
        }
    };

    return (
        <div className="poet-biography">
            {/* Hero Banner with poet name */}
            <div className="hero-banner" style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`
            }}>
                <h1 className="poet-title">{getPoetData('name')}</h1>
                <div className="poet-subtitle">Nhà thơ • Tác giả tiêu biểu</div>
            </div>

            {/* Main Content */}
            <div className="container">
                <div className="profile-section">
                    {/* Avatar Card */}
                    <div className="avatar-card">
                        <div className="avatar-wrapper">
                            <img 
                                src={getPoetData('avatar') || '/default-poet-avatar.jpg'} 
                                alt={`Chân dung ${getPoetData('name')}`}
                                onError={(e) => e.target.src = '/default-poet-avatar.jpg'}
                            />
                            <div className="avatar-border"></div>
                        </div>
                        
                        <div className="quick-info">
                            <div className="info-item">
                                <span className="icon">📅</span>
                                <div>
                                    <div className="label">Ngày sinh</div>
                                    <div className="value">{formatDate ? formatDate(poet?.dateOfBirth) : formatDateLocal(poet?.dateOfBirth)}</div>
                                </div>
                            </div>
                            
                            <div className="info-item">
                                <span className="icon">👤</span>
                                <div>
                                    <div className="label">Giới tính</div>
                                    <div className="value">{renderGender()}</div>
                                </div>
                            </div>
                            
                            {poet?.address && (
                                <div className="info-item">
                                    <span className="icon">📍</span>
                                    <div>
                                        <div className="label">Quê quán</div>
                                        <div className="value">{getPoetData('address')}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Biography Card */}
                    <div className="biography-card">
                        <div className="section-header">
                            <h2>
                                <span className="icon-text">📜</span>
                                Tiểu sử
                            </h2>
                            <div className="divider"></div>
                        </div>
                        
                        <div className="bio-content">
                            {getPoetData('bio').split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                        
                      
                    </div>
                </div>

              
            </div>

            {/* CSS Styles */}
            <style jsx>{`
                .poet-biography {
                    font-family: 'Playfair Display', serif;
                    color: #333;
                    line-height: 1.6;
                }
                
                .hero-banner {
                    height: 300px;
                    background-size: cover;
                    background-position: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    color: white;
                    padding: 20px;
                    margin-bottom: 50px;
                }
                
                .poet-title {
                    font-size: 3.5rem;
                    margin: 0;
                    font-weight: 700;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                    letter-spacing: 1px;
                }
                
                .poet-subtitle {
                    font-size: 1.2rem;
                    opacity: 0.9;
                    margin-top: 10px;
                    font-style: italic;
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                }
                
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                
                .profile-section {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 60px;
                }
                
                .avatar-card {
                    flex: 1;
                    min-width: 300px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .avatar-wrapper {
                    width: 220px;
                    height: 220px;
                    border-radius: 50%;
                    position: relative;
                    margin-bottom: 30px;
                }
                
                .avatar-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    position: relative;
                    z-index: 2;
                    border: 5px solid white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                }
                
                .avatar-border {
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    right: -10px;
                    bottom: -10px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    z-index: 1;
                }
                
                .quick-info {
                    width: 100%;
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                }
                
                .info-item {
                    display: flex;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .info-item:last-child {
                    border-bottom: none;
                }
                
                .info-item .icon {
                    font-size: 1.5rem;
                    margin-right: 15px;
                    color: #6c5ce7;
                }
                
                .label {
                    font-size: 0.9rem;
                    color: #666;
                    margin-bottom: 3px;
                }
                
                .value {
                    font-weight: 500;
                    font-size: 1.1rem;
                }
                
                .gender-emoji {
                    margin-left: 5px;
                }
                
                .biography-card {
                    flex: 2;
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                }
                
                .section-header {
                    margin-bottom: 25px;
                }
                
                .section-header h2 {
                    font-size: 1.8rem;
                    margin: 0 0 10px 0;
                    display: flex;
                    align-items: center;
                }
                
                .icon-text {
                    margin-right: 10px;
                }
                
                .divider {
                    height: 3px;
                    width: 60px;
                    background: linear-gradient(to right, #6c5ce7, #a29bfe);
                    border-radius: 3px;
                }
                
                .bio-content {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #444;
                }
                
                .bio-content p {
                    margin-bottom: 15px;
                }
                
                .literary-style {
                    margin-top: 40px;
                    padding-top: 30px;
                    border-top: 1px dashed #ddd;
                }
                
                .literary-style h3 {
                    font-size: 1.4rem;
                    margin: 0 0 15px 0;
                    display: flex;
                    align-items: center;
                }
                
                .style-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                
                .tag {
                    background: #f0f2f5;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    color: #555;
                }
                
                .works-preview {
                    margin: 60px 0;
                }
                
                .works-preview h2 {
                    font-size: 1.8rem;
                    margin: 0 0 30px 0;
                    display: flex;
                    align-items: center;
                }
                
                .works-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 30px;
                }
                
                .work-item {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
                    transition: transform 0.3s ease;
                }
                
                .work-item:hover {
                    transform: translateY(-5px);
                }
                
                .work-cover {
                    height: 180px;
                    background-size: cover;
                    background-position: center;
                }
                
                .work-item h3 {
                    margin: 15px 15px 5px;
                    font-size: 1.2rem;
                }
                
                .work-item p {
                    margin: 0 15px 15px;
                    font-size: 0.9rem;
                    color: #666;
                }
                
                @media (max-width: 768px) {
                    .profile-section {
                        flex-direction: column;
                    }
                    
                    .poet-title {
                        font-size: 2.5rem;
                    }
                    
                    .hero-banner {
                        height: 250px;
                        margin-bottom: 30px;
                    }
                }
                
                @media (max-width: 480px) {
                    .poet-title {
                        font-size: 2rem;
                    }
                    
                    .works-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

BiographyTab.propTypes = {
    poet: PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
        dateOfBirth: PropTypes.string,
        gender: PropTypes.string,
        address: PropTypes.string,
        bio: PropTypes.string,
        style: PropTypes.string
    }),
    formatDate: PropTypes.func
};

BiographyTab.defaultProps = {
    poet: {
        name: "Nhà thơ",
        avatar: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        bio: "Đang cập nhật tiểu sử...",
        style: ""
    }
};

export default BiographyTab;