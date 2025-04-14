import React, { useEffect, useState } from "react";
import { Modal, Switch, Table, Dropdown, Menu, Button, Spin } from "antd";
import { IoIosLink, IoIosMore } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeartFilled, LockFilled, PlayCircleFilled, ShoppingCartOutlined } from "@ant-design/icons";
import { AiOutlineInfoCircle } from "react-icons/ai";
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};


const RecordCard = ({
    record,
    showDeleteConfirm,
    isMine,
    showPurchaseConfirm
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const navigate = useNavigate();
    const [duration, setDuration] = useState('00:00');
    const currentUser = localStorage.getItem("username");
    const accessToken = localStorage.getItem("accessToken");

    const overlayMenu = (
        <Menu>
            <Menu.Item key="detail" onClick={() => navigate(`/record/${record.id}`, {
                state: {
                    isMine: isMine, // Truyền giá trị isMine qua state
                    initialData: record // Có thể truyền thêm dữ liệu
                }
            })}>
                <div className="menu-item">
                    <AiOutlineInfoCircle className="menu-icon blue" />
                    Thông tin chi tiết
                </div>
            </Menu.Item>
            <Menu.Item key="copy">
                <div className="menu-item">
                    <IoIosLink className="menu-icon" />
                    Sao chép liên kết
                </div>
            </Menu.Item>
            {record.owner?.userName === currentUser && (
                <Menu.Item key="delete" danger onClick={() => showDeleteConfirm(record.id)}>
                    ❌ Xóa bản ghi
                </Menu.Item>
            )}
        </Menu>
    );
    const formatDuration = (seconds) => {
        if (!seconds || isNaN(seconds)) return '00:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    useEffect(() => {
        let audio = null;

        const fetchAudio = async () => {
            try {
                const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/audio-stream/${record.id}`,
                    { responseType: "blob", headers }
                );

                const url = URL.createObjectURL(response.data);
                setAudioUrl(url);

                // Tạo audio element để lấy duration
                audio = new Audio(url);

                audio.onloadedmetadata = () => {
                    setDuration(formatDuration(audio.duration));
                };

                audio.onerror = () => {
                    console.error("Error loading audio metadata");
                    setDuration('00:00');
                };

            } catch (error) {
                console.error("Error fetching audio:", error);
                setAudioUrl(null);
                setDuration('00:00');
            }
        };

        if (record.fileUrl) fetchAudio();
        return () => {
            if (audio) {
                audio.pause();
                audio.removeAttribute('src');
                audio.load();
            }
        };
    }, [record, accessToken]);

    return (
        <div style={styles.cardContainer}>
            {/* Cover Image Section */}
            <div style={styles.coverContainer}>
                <img
                    src={record.poem?.poemImage || "/anhminhhoa.png"}
                    alt="cover"
                    style={styles.coverImage}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/anhminhhoa.png";
                    }}
                />
                {/* Trong phần coverContainer */}
                <div style={styles.coverOverlay}>
                    <span style={styles.duration}>{duration}</span>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.content}>
                {/* Header Section */}
                <div style={styles.header}>
                    <div style={styles.userInfo}>
                        <img
                            src={record.owner?.avatar || "/default-avatar.png"}
                            alt="avatar"
                            style={styles.avatar}
                            onClick={() => navigate(`/user/${record.owner?.userName}`)}
                        />
                        <div style={styles.metaInfo}>
                            <h3
                                style={styles.title}
                            >
                                {record.fileName}
                            </h3>
                            {record.poem?.title && (
                                <p
                                    onClick={() => navigate(`/poem/${record.poem.id}`)}
                                    style={styles.poemTitle}>
                                    Thơ: {record.poem.title}
                                </p>
                            )}
                            <p style={styles.creator}>
                                {record.owner?.displayName} • {formatDate(record.createdTime)}
                            </p>
                        </div>
                    </div>
                    <Dropdown overlay={overlayMenu} trigger={["click"]}>
                        <button style={styles.menuButton}>
                            <IoIosMore style={styles.menuIcon} />
                        </button>
                    </Dropdown>
                </div>

                {/* Audio Player Section */}
                <div style={styles.audioSection}>

                    {
                        record.fileUrl ? (
                            [
                                record.owner?.userName,
                                record.buyer?.userName,
                                ...(record.buyers?.map(b => b.userName) || []),
                            ].includes(currentUser) || record.isPublic ? ( // Hoặc bài thơ này được đặt ở chế độ công khai

                                <div style={styles.audioWrapper}>
                                    <audio controls style={styles.audioPlayer} src={audioUrl} />
                                    <span style={styles.priceTag}>
                                        {record.price === 0 ? 'MIỄN PHÍ' : `${record.price.toLocaleString()} VND`}
                                    </span>
                                </div>
                            ) : (
                                <div style={styles.purchaseBlock}>
                                    <LockFilled style={styles.lockIcon} />
                                    <p style={styles.purchaseText}>Mua để nghe bản ghi này</p>
                                    <Button
                                        type="primary"
                                        shape="round"
                                        size="small"
                                        onClick={() => showPurchaseConfirm(record.id, record.price)}
                                    >
                                        Mua ngay - {record.price.toLocaleString()} VND
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <Spin size="large" />
                            </div>
                        )}
                </div>

                {/* Stats Section */}
                <div style={styles.stats}>
                    <div style={styles.statItem}>
                        <PlayCircleFilled /> {record.playCount || 0}
                    </div>
                    <div style={styles.statItem}>
                        <ShoppingCartOutlined /> {record.buyers?.length || 0}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết bản ghi"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                bodyStyle={styles.modalBody}
            >
                {/* Modal content */}
            </Modal>
        </div>
    );
};

const styles = {
    cardContainer: {
        width: 'calc(33.333% - 40px)',
        minWidth: '300px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        marginBottom: '40px',
        ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)'
        },
        '@media (max-width: 1200px)': {
            width: 'calc(50% - 40px)'
        },
        '@media (max-width: 768px)': {
            width: '100%',
            minWidth: 'unset'
        }
    },
    coverContainer: {
        position: 'relative',
        aspectRatio: '1/1',
        backgroundColor: '#f0f0f0'
    },

    coverImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    coverOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 12px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ffffff'
    },
    content: {
        padding: '16px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        cursor: 'pointer',
        objectFit: 'cover'
    },
    metaInfo: {
        flex: 1,
        minWidth: 0
    },
    title: {
        margin: 0,
        fontSize: '16px',
        fontWeight: 600,
        color: '#333',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        ':hover': {
            color: '#1890ff'
        }
    },
    poemTitle: {
        margin: '2px 0 0',
        fontSize: '13px',
        color: '#666',
        fontStyle: 'italic',
        overflow: 'hidden',
        cursor: 'pointer',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '90%',
        ':hover': {
            color: '#1890ff',
        }
    },
    creator: {
        margin: '4px 0 0',
        fontSize: '12px',
        color: '#666'
    },
    menuButton: {
        border: 'none',
        background: 'none',
        padding: '8px',
        cursor: 'pointer',
        ':hover': {
            backgroundColor: '#f5f5f5',
            borderRadius: '50%'
        }
    },
    menuIcon: {
        fontSize: '20px',
        color: '#666'
    },
    audioSection: {
        margin: '12px 0'
    },
    duration: {
        fontSize: '14px',
        fontWeight: 500,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: '4px 8px',
        borderRadius: '4px',
    },
    audioWrapper: {
        position: 'relative',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '8px'
    },
    audioPlayer: {
        width: '100%',
        height: '40px'
    },
    priceTag: {
        position: 'absolute',
        top: '-10px',
        right: '10px',
        backgroundColor: '#1890ff',
        color: '#fff',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500
    },
    purchaseBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '16px',
        border: '1px dashed #ff4d4f',
        borderRadius: '8px',
        textAlign: 'center'
    },
    lockIcon: {
        fontSize: '24px',
        color: '#ff4d4f'
    },
    purchaseText: {
        margin: 0,
        color: '#ff4d4f',
        fontSize: '14px'
    },
    stats: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginTop: '12px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px',
        color: '#666'
    },
    modalBody: {
        padding: '24px'
    }
};

export default RecordCard;