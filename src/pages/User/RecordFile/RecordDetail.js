import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Spin, Card, Typography, Divider, Modal, Input, message, notification, Tag } from "antd";
import { LeftOutlined, LockFilled, PlayCircleFilled, ShoppingCartOutlined } from "@ant-design/icons";
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
                    min={10000}
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

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '40px 20px',
                //background: 'linear-gradient(to bottom, #f8f5f0 0%, #fff 100%)',
                minHeight: '100vh'
            }}>
                <Button
                    type="text"
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '0',
                        marginBottom: '40px',
                        color: '#7d6b58',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <LeftOutlined style={{ marginRight: '8px' }} />
                    Trở về trang trước
                </Button>

                <div style={{
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    background: '#fff',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid #eeeae4'
                }}>
                    {/* Ribbon decoration */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '120px',
                        height: '120px',
                        background: 'url(/poetry-ribbon.png) no-repeat',
                        backgroundSize: 'contain',
                        opacity: 0.15
                    }} />

                    {isMine && (
                        <div style={{
                            padding: '20px 32px',
                            background: '#f8f5f0',
                            borderBottom: '1px solid #eeeae4',
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <Button
                                danger
                                onClick={showDeleteConfirm}
                                style={{
                                    background: '#ffebee',
                                    borderColor: 'transparent',
                                    color: '#c62828'
                                }}
                            >
                                Xóa bản ghi
                            </Button>
                            {record.poem?.isFamousPoet === false && (
                                <Button
                                    type="primary"
                                    onClick={handleToggleStatus}
                                    disabled={!record.isPublic}
                                    style={{
                                        background: record.isPublic ? '#7d6b58' : '#b0a499',
                                        borderColor: 'transparent',
                                        fontWeight: 500
                                    }}
                                >
                                    {record.isPublic ? 'Chuyển sang riêng tư' : 'Đang ở chế độ riêng tư'}
                                </Button>
                            )}

                        </div>
                    )}

                    {/* Main content */}
                    <div style={{ padding: '40px 32px' }}>
                        {/* Poem Section */}
                        <div style={{ marginBottom: '48px' }}>
                            <div style={{
                                maxWidth: '800px',
                                margin: '0 auto',
                                position: 'relative',
                                padding: '40px',
                                // background: `
                                //     repeating-linear-gradient(
                                //         #fff,
                                //         #fff 29px,
                                //         #7d6b58 30px,
                                //         #7d6b58 31px
                                //     )`,
                                boxShadow: '0 4px 12px rgba(125, 107, 88, 0.15)',
                                display: "flex",
                                justifyContent: "center"
                            }}>

                                <div>
                                    <h1 style={{
                                        fontSize: '2.4rem',
                                        color: '#5d4c3c',
                                        marginBottom: '32px',
                                        fontFamily: '"Playfair Display", serif',
                                        textAlign: 'center'
                                    }}>
                                        {record.poem?.title || "Không có tiêu đề"}
                                    </h1>
                                    {record.poem?.type?.name === "Thơ Lục Bát" ? (
                                        <div>
                                            {record.poem?.content.split("\n").map((line, index) => {
                                                const wordCount = line.trim().split(/\s+/).length;
                                                const isSixWords = wordCount === 6;

                                                return (
                                                    <p
                                                        key={index}
                                                        style={{
                                                            marginLeft: isSixWords ? "2em" : "0",
                                                            marginBottom: "0.3em",
                                                            fontFamily: "'Times New Roman', serif",
                                                            fontSize: "1.1rem",
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        {line}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    ) : (

                                        <pre style={{
                                            whiteSpace: 'pre-wrap',
                                            fontFamily: '"Cormorant Garamond", serif',
                                            fontSize: '1.3rem',
                                            lineHeight: '2.2',
                                            color: '#5d4c3c',
                                            margin: 0,
                                        }}>
                                            {record.poem?.content || "Nội dung chưa có sẵn"}
                                        </pre>
                                    )}
                                    <div style={{
                                        marginTop: '32px',
                                        textAlign: 'right',
                                        fontStyle: 'italic',
                                        color: '#7d6b58'
                                    }}>
                                        — {record.poem?.user.displayName || "Khuyết danh"}
                                    </div>
                                </div>





                            </div>
                        </div>

                        {/* Record Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '48px',
                            alignItems: 'start'
                        }}>
                            {/* Audio Section */}
                            <div>
                                <AudioPlayer
                                    record={record}
                                    currentUser={currentUser}
                                    showPurchaseConfirm={() => showPurchaseConfirm(record.id, record.price)}
                                    style={{
                                        background: '#f8f5f0',
                                        borderRadius: '16px',
                                        padding: '24px'
                                    }}
                                />
                            </div>

                            {/* Metadata */}
                            <div>
                                <div style={{
                                    background: '#f8f5f0',
                                    borderRadius: '16px',
                                    padding: '24px'
                                }}>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        color: '#7d6b58',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginBottom: '24px'
                                    }}>
                                        Thông tin bản ghi
                                    </h3>

                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <span style={{ color: '#7d6b58', minWidth: '100px' }}>Người đăng:</span>
                                            <span style={{ color: '#5d4c3c' }}>{record.owner?.displayName}</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <span style={{ color: '#7d6b58', minWidth: '100px' }}>Ngày đăng:</span>
                                            <span style={{ color: '#5d4c3c' }}>
                                                {new Date(record.createdTime).toLocaleDateString("vi-VN", {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <span style={{ color: '#7d6b58', minWidth: '100px' }}>Lượt nghe:</span>
                                            <span style={{ color: '#5d4c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <PlayCircleFilled style={{ color: '#7d6b58' }} />
                                                {record.playCount || 0}
                                            </span>
                                        </div>

                                        {isMine && (
                                            <>
                                                <Divider style={{ margin: '16px 0', borderColor: '#eeeae4' }} />

                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <span style={{ color: '#7d6b58', minWidth: '100px' }}>Trạng thái:</span>
                                                    <Tag
                                                        color={record.isPublic ? '#7d6b58' : '#b0a499'}
                                                        style={{
                                                            borderRadius: '8px',
                                                            textTransform: 'uppercase',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {record.isPublic ? 'Công khai' : 'Riêng tư'}
                                                    </Tag>
                                                </div>

                                                {!record.isPublic && (
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <span style={{ color: '#7d6b58', minWidth: '100px' }}>Giá bán:</span>
                                                        <span style={{
                                                            color: '#5d4c3c',
                                                            fontWeight: 600,
                                                            fontFeatureSettings: '"tnum"'
                                                        }}>
                                                            {record.price === 0
                                                                ? 'Miễn phí'
                                                                : `${record.price.toLocaleString()}₫`
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Buyers List */}
                                {record.buyers?.length > 0 && (
                                    <div style={{ marginTop: '32px' }}>
                                        <h4 style={{
                                            fontSize: '1rem',
                                            color: '#7d6b58',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <ShoppingCartOutlined />
                                            <span>Đã được mua bởi</span>
                                        </h4>

                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                            gap: '12px'
                                        }}>
                                            {record.buyers.map((buyer, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => navigate(`/user/${buyer.userName}`)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '12px',
                                                        background: '#fff',
                                                        borderRadius: '12px',
                                                        border: '1px solid #eeeae4',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s',
                                                        ':hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        src={buyer.avatar || "/default-avatar.png"}
                                                        alt={buyer.displayName}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover',
                                                            border: '2px solid #eeeae4'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{
                                                            color: '#5d4c3c',
                                                            fontWeight: 500,
                                                            lineHeight: 1.4
                                                        }}>
                                                            {buyer.displayName || "Ẩn danh"}
                                                        </div>
                                                        <div style={{
                                                            color: '#7d6b58',
                                                            fontSize: '0.85rem'
                                                        }}>
                                                            {/* {new Date(buyer.purchasedDate).toLocaleDateString("vi-VN")} */}
                                                            @{buyer.userName || "Ẩn danh"}
                                                        </div>
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
            </div>
        </>
    );
};

export default RecordDetail;