import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Spin, Card, Typography, Divider, Modal, Input, message, notification } from "antd";
import { LockFilled, PlayCircleFilled, ShoppingCartOutlined } from "@ant-design/icons";
import AudioPlayer from "./AudioPlayer";
import Headeruser from "../../../components/Headeruser";
import Headerdefault from "../../../components/Headerdefault";

const { Title, Text } = Typography;

const RecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = localStorage.getItem("username");
    const accessToken = localStorage.getItem("accessToken");
    const location = useLocation();
    const priceRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [isMine, setIsMine] = useState(
        location.state?.isMine ?? false
    );
    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/${id}/detail`,
                    {
                        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
                    }
                );
                const recordData = response.data.data;
                setRecord(recordData);

                // Tính toán isMine từ cả location state và dữ liệu API
                const computedIsMine = location.state?.isMine ??
                    recordData?.owner?.userName === currentUser;
                setIsMine(computedIsMine);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching record:", error);
                navigate("/404");
            }
        };
        setIsLoggedIn(!!accessToken);
        fetchRecord();
    }, [id, accessToken, navigate, location.state, currentUser]);

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '20% auto' }} />;
    }

    const handleToggleStatus = async () => {
        if (!record.isPublic) {
            message.info("Không thể chuyển từ chế độ riêng tư sang công khai");
            return;
        }

        Modal.confirm({
            title: "Chuyển sang chế độ riêng tư",
            content: (
                <Input
                    type="number"
                    min={0}
                    placeholder="Nhập giá bán"
                    ref={priceRef}
                    onKeyDown={(e) => {
                        if (['e', 'E', '-', '+'].includes(e.key)) e.preventDefault();
                    }}
                />
            ),
            onOk: async () => {
                const price = priceRef.current?.input.value;
                if (!price || price < 0) {
                    message.error("Vui lòng nhập giá hợp lệ");
                    return;
                }

                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/enable-selling`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({ recordId: record.id, price: parseFloat(price) }),
                        }
                    );
                    window.location.reload();

                    message.success("Đã chuyển sang chế độ riêng tư thành công");
                } catch (error) {
                    console.error("Update status error:", error);
                    message.error("Cập nhật trạng thái thất bại");
                }
            }
        });
    };
    const showDeleteConfirm = () => {
        Modal.confirm({
            title: "Xác nhận xóa bản ghi",
            content: "Bạn có chắc chắn muốn xóa bản ghi này?",
            onOk: async () => {
                try {
                    await axios.delete(
                        `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/${record.id}`,
                        { headers: { Authorization: `Bearer ${accessToken}` } }
                    );
                    message.success("Xóa bản ghi thành công");
                    navigate(-1);
                } catch (error) {
                    message.error("Xóa bản ghi thất bại");
                }
            }
        });
    };

    const showPurchaseConfirm = (id, price) => {
        Modal.confirm({
          title: "Bạn có chắc chắn muốn mua với số tiền " + price.toLocaleString('vi-VN') + " VND ?",
          content: "Hành động này không thể hoàn tác!",
          okText: "Mua",
          cancelText: "Hủy",
          okType: "primary",
          onOk() {
            handlePurchaseRecord(id);
          },
        });
      };

          async function handlePurchaseRecord(recordId) {
              console.log(recordId);
              const url = `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/purchase`;
          
              try {
                const response = await axios.put(url, null, {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                  params: {
                    recordId: recordId, // Truyền recordId vào query params
                  },
                });
          
                notification.info({
                    message: 'Thông báo',
                    description: response.data.message,
                  });
                  
                  window.location.reload();
              } catch (error) {
                message.error(error.response?.data?.errorMessage || "Đã xảy ra lỗi!");
              }
            }
    return (
        <>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}

            <div style={styles.container}>

                <Button type="link" onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Quay lại
                </Button>

                <Card style={styles.card}>
                    {isMine && (
                        <div style={styles.ownerControls}>
                            <Button danger onClick={showDeleteConfirm} style={{ marginRight: 8 }}>
                                Xóa bản ghi
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleToggleStatus}
                                disabled={!record.isPublic}
                            >
                                {record.isPublic ? 'Chuyển sang riêng tư' : 'Đang ở chế độ riêng tư'}
                            </Button>
                        </div>
                    )}
                    {/* Phần thông tin bài thơ */}
                    <div style={styles.section}>
                        <Title level={3} style={styles.sectionTitle}>Thông tin bài thơ</Title>
                        <div style={styles.poemContent}>
                            <Title level={4}>{record.poem?.title || "Không có tiêu đề"}</Title>
                            <Text style={styles.poemText}>
                                <div style={{ margin: "0px auto", display: "inline-block", boxSizing: "border-box" }}>
                                    <p style={{ whiteSpace: "pre-wrap", textAlign: "left", fontSize: "1.2rem", lineHeight: "2" }}>
                                        {record.poem?.content}
                                    </p>
                                </div>
                                {/* {record.poem?.content || "Nội dung chưa có sẵn"} */}
                            </Text>
                            <Divider />
                            <Text strong>Tác giả: </Text>
                            <Text>{record.poem?.user.displayName || "Không rõ tác giả"}</Text>
                        </div>
                    </div>

                    {/* Phần thông tin bản ghi */}
                    <div style={styles.section}>
                        <Title level={3} style={styles.sectionTitle}>Thông tin bản ghi</Title>
                        <div style={styles.recordInfo}>
                            {/* Audio Player */}
                            <AudioPlayer
                                record={record}
                                currentUser={currentUser}
                                showPurchaseConfirm={() => showPurchaseConfirm(record.id, record.price)} // Thêm logic mua nếu cần
                            />

                            {/* Thông tin chi tiết */}
                            <div style={styles.metaSection}>
                                {isMine && (
                                    <>
                                        <div style={styles.metaItem}>
                                            <Text strong>Trạng thái: </Text>
                                            <Text>{record.isPublic ? 'Công khai' : 'Riêng tư'}</Text>
                                        </div>
                                        {!record.isPublic && (
                                            <div style={styles.metaItem}>
                                                <Text strong>Giá bán: </Text>
                                                <Text>{record.price === 0 ? 'MIỄN PHÍ' : `${record.price.toLocaleString()} VND`}</Text>
                                            </div>
                                        )}
                                    </>

                                )}
                                <div style={styles.metaItem}>
                                    <Text strong>Người đăng: </Text>
                                    <Text>{record.owner?.displayName}</Text>
                                </div>
                                <div style={styles.metaItem}>
                                    <Text strong>Ngày đăng: </Text>
                                    <Text>{new Date(record.createdTime).toLocaleDateString("vi-VN")}</Text>
                                </div>
                                <div style={styles.metaItem}>
                                    <Text strong>Lượt nghe: </Text>
                                    <Text><PlayCircleFilled /> {record.playCount || 0}</Text>
                                </div>
                                <div style={styles.metaItem}>
                                    <Text strong>Lượt mua: </Text>
                                    <Text><ShoppingCartOutlined /> {record.buyers?.length || 0}</Text>

                                    {record.buyers?.length > 0 && (
                                        <div style={styles.buyerList}>
                                            <div style={styles.buyerContainer}>
                                                {record.buyers.map((buyer, index) => (
                                                    <div key={index} style={styles.buyerCard}
                                                        onClick={() => navigate(`/user/${buyer.userName}`)}
                                                    >
                                                        <img
                                                            src={buyer.avatar || "/default-avatar.png"}
                                                            alt={buyer.displayName}
                                                            style={styles.buyerAvatar}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "/default-avatar.png";
                                                            }}
                                                        />
                                                        <div style={styles.buyerInfo}>
                                                            <Text strong style={styles.buyerName}>
                                                                {buyer.displayName || "Khách mua ẩn danh"}
                                                            </Text>
                                                            <Text type="secondary" style={styles.buyerUsername}>
                                                                @{buyer.userName || "unknown"}
                                                            </Text>
                                                            {buyer.purchasedDate && (
                                                                <Text type="secondary" style={styles.purchaseDate}>
                                                                    {new Date(buyer.purchasedDate).toLocaleDateString("vi-VN")}
                                                                </Text>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card >
            </div >
        </>

    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
    },
    backButton: {
        marginBottom: '20px',
        fontSize: '16px'
    },
    card: {
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    section: {
        marginBottom: '40px'
    },
    sectionTitle: {
        color: '#1890ff',
        marginBottom: '24px'
    },
    poemContent: {
        textAlign:"center",
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '24px',
        whiteSpace: 'pre-line'
    },
    poemText: {
        fontSize: '16px',
        lineHeight: '1.8'
    },
    recordInfo: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
        }
    },
    metaSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    metaItem: {
        display: 'flex',
        gap: '8px',
        fontSize: '16px'
    },
    buyerList: {
        marginTop: 12,
        borderTop: '1px solid #f0f0f0',
        paddingTop: 12
    },
    buyerContainer: {
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'
    },
    buyerCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'translateY(-2px)'
        }
    },
    buyerAvatar: {

        width: '48px',
        height: '48px',
        borderRadius: '50%',
        marginRight: '12px',
        objectFit: 'cover'
    },
    buyerInfo: {
        flex: 1,
        minWidth: 0
    },
    buyerName: {
        display: 'block',
        fontSize: '14px',
        lineHeight: 1.4
    },
    buyerUsername: {
        display: 'block',
        fontSize: '12px'
    },
    purchaseDate: {
        display: 'block',
        fontSize: '12px',
        color: '#666',
        marginTop: '4px'
    },
    buyerList: {
        marginTop: 12,
        paddingTop: 12,
        borderTop: '1px solid #f0f0f0'
    },
    buyerContainer: {
        display: 'grid',
        gap: '12px',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        marginTop: 8
    },
    buyerCard: {
        display: 'flex',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'transform 0.2s',
        ':hover': {
            transform: 'translateY(-2px)'
        }
    },
    buyerAvatar: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        marginRight: 12,
        objectFit: 'cover',
        backgroundColor: '#f0f0f0'
    },
    buyerInfo: {
        flex: 1,
        minWidth: 0
    },
    buyerName: {
        display: 'block',
        fontSize: 14,
        lineHeight: 1.4,
        fontWeight: 500
    },
    buyerUsername: {
        display: 'block',
        fontSize: 12,
        color: '#666'
    },
    purchaseDate: {
        display: 'block',
        fontSize: 12,
        color: '#999',
        marginTop: 4
    }
};

export default RecordDetail;