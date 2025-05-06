import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Spin, Card, Typography, Divider, Modal, Input, message, notification, Tag, Space, InputNumber } from "antd";
import { CalendarOutlined, LeftOutlined, LockFilled, PlayCircleFilled, ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import AudioPlayer from "./AudioPlayer";
import Headeruser from "../../../components/Headeruser";
import Headerdefault from "../../../components/Headerdefault";
import { CiEdit } from "react-icons/ci";
import {
    FiUser,
    FiPlay,
    FiPause,
    FiSkipBack,
    FiSkipForward,
    FiVolume2,
    FiRadio
} from "react-icons/fi";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { RiSecurePaymentLine } from "react-icons/ri";
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
    const nameRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMine, setIsMine] = useState(
        location.state?.isMine ?? false
    );
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);

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
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/users/v1/profile/online/${currentUser}`,
                    { method: "GET", headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} }
                );

                const result = await response.json();
                if (response.ok && result.data) {
                    const mainBackground = result.data.userTemplateDetails.find(item => item.type === 4);
                    if (mainBackground) {
                        setBackgroundImage(mainBackground.image ? encodeURI(mainBackground.image) : null);
                    }

                } else {
                    console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
                }

            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            } finally {
            }
        }
        fetchRecord();
        fetchData();
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
                if (!price || price < 10000 || price > 100000000) {
                    message.error("Vui lòng nhập giá nhỏ nhất là 10.000đ và bé hơn 100.000.000đ");

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

    const handleEdit = async () => {
        Modal.confirm({
            title: "Chỉnh sửa bản ghi âm",
            content: (
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                        ref={nameRef}
                        placeholder="Name"
                        defaultValue={record.fileName}
                    />
                    {!record.isPublic && (
                        <Input
                            type="number"
                            min={0}
                            ref={priceRef}
                            defaultValue={record.price}
                            onKeyDown={e => ['e', 'E', '-', '+'].includes(e.key) && e.preventDefault()}
                        />
                    )}
                </Space>
            ),
            onOk: async () => {
                const name = nameRef.current.input.value?.trim();
                const priceValue = record.isPublic ? 0 : parseFloat(priceRef.current.input.value);
                if (record.isPublic === false && !priceValue || priceValue < 10000 || priceValue > 100000000) {
                    message.error("Vui lòng nhập giá nhỏ nhất là 10.000đ và bé hơn 100.000.000đ");

                    return;
                }
                if (!name) {
                    message.error("Vui lòng nhập tên");
                    return;
                }
                console.log(record.id)
                try {
                    const response = await fetch(
                        `${process.env.REACT_APP_API_BASE_URL}/record-files/v1`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                id: record.id,
                                fileName: name,
                                price: priceValue
                            }),
                        }
                    );
                    window.location.reload();
                    message.success("Đã thay đổi thành công");
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
            <div style={{
                backgroundImage: `url("${backgroundImage}")`,
                backgroundSize: 'cover',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                paddingBottom: '40px',
                fontFamily: "'Noto Serif', serif",
                color: '#333'
            }}>
                {isLoggedIn ? <Headeruser /> : <Headerdefault />}

                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '40px 20px',
                    // backgroundImage: `url("${backgroundImage}")`,
                    backgroundSize: 'cover',
                    backgroundAttachment: 'fixed',
                    //background: 'linear-gradient(to bottom,rgb(238, 155, 11) 0%, #fff 100%)',
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
                        background: 'rgba(255, 255, 255, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(8px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(8px) saturate(160%)',
                        overflow: 'hidden',
                        position: 'relative'
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

                        {currentUser === record.owner?.userName && (
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
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    borderRadius: "12px",
                                    boxShadow: "rgba(0, 0, 0, 0.08) 0px 4px 20px",
                                    backdropFilter: "blur(8px)",

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
                                    // boxShadow: '0 4px 12px rgba(125, 107, 88, 0.15)',
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
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    border: '1px solid #f0f0f0',
                                    position: 'relative',
                                    // maxWidth: "380px",

                                }}>
                                    {/* Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '8px',
                                                background: `linear-gradient(135deg, #7d6b58, #5d4c3c)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <BsMusicNoteBeamed size={20} color="#fff" />
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    color: '#1a1a1a'
                                                }}>
                                                    {record.title || "Bản ghi âm"}
                                                </div>
                                                <div style={{
                                                    fontSize: '13px',
                                                    color: '#666',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <FiUser size={14} />
                                                    {record.owner?.displayName}
                                                </div>
                                            </div>
                                        </div>


                                    </div>
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

                                </div>
                                {/* Metadata Section */}
                                <div className="metadata-container">
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                        border: '1px solid #f0f0f0',
                                        minHeight: "131px",
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                color: '#1a1a1a',
                                                margin: 0
                                            }}>
                                                Thông tin bản ghi
                                            </h3>
                                            {currentUser === record.owner?.userName && (
                                                <Button
                                                    type="text"
                                                    icon={<CiEdit size={16} />}
                                                    onClick={handleEdit}
                                                    style={{ padding: '4px', minWidth: '32px' }}
                                                />
                                            )}
                                        </div>

                                        {/* Compact Info Grid */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                            gap: '12px',
                                            marginBottom: '24px'
                                        }}>
                                            <InfoItem
                                                icon={<UserOutlined />}
                                                label="Người đăng"
                                                value={record.owner?.displayName}
                                            />
                                            <InfoItem
                                                icon={<CalendarOutlined />}
                                                label="Ngày đăng"
                                                value={new Date(record.createdTime).toLocaleDateString("vi-VN")}
                                            />
                                            <InfoItem
                                                icon={<ShoppingCartOutlined />}
                                                label="Lượt mua"
                                                value={record.buyers?.length || 0}
                                            />
                                            <InfoItem
                                                icon={<PlayCircleFilled />}
                                                label="Lượt nghe"
                                                value={record.playCount || 0}
                                            />
                                        </div>

                                        {/* Status & Price Row */}
                                        {isMine && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '16px',
                                                alignItems: 'center',
                                                paddingTop: '16px',
                                                borderTop: '1px solid #f0f0f0'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: '#666', fontSize: '14px' }}>Trạng thái:</span>
                                                    <Tag
                                                        color={record.isPublic ? 'success' : 'default'}
                                                        style={{
                                                            margin: 0,
                                                            borderRadius: '6px',
                                                            fontWeight: 500,
                                                            textTransform: 'uppercase',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        {record.isPublic ? 'Công khai' : 'Riêng tư'}
                                                    </Tag>
                                                </div>

                                                {!record.isPublic && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ color: '#666', fontSize: '14px' }}>Giá bán:</span>
                                                        <span style={{
                                                            fontWeight: 500,
                                                            color: record.price === 0 ? '#52c41a' : '#1a1a1a',
                                                            fontSize: '15px'
                                                        }}>
                                                            {record.price === 0
                                                                ? 'Miễn phí'
                                                                : `${record.price.toLocaleString()}₫`
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Buyers Section */}
                                    {record.buyers?.length > 0 && (
                                        <div style={{ marginTop: '16px' }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '12px'
                                            }}>
                                                <h4 style={{
                                                    fontSize: '15px',
                                                    fontWeight: 500,
                                                    color: '#1a1a1a',
                                                    margin: 0
                                                }}>
                                                    Đã được mua bởi
                                                </h4>
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: '#666',
                                                    cursor: 'pointer',
                                                    ':hover': { color: '#333' }
                                                }}>
                                                    Xem tất cả ({record.buyers.length})
                                                </span>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                gap: '12px',
                                                overflowX: 'auto',
                                                paddingBottom: '8px'
                                            }}>
                                                {record.buyers.map((buyer, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => navigate(`/user/${buyer.userName}`)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '8px 12px',
                                                            background: '#fff',
                                                            borderRadius: '8px',
                                                            border: '1px solid #f0f0f0',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            flexShrink: 0,
                                                            ':hover': {
                                                                borderColor: '#d9d9d9',
                                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                                                            }
                                                        }}
                                                    >
                                                        <img
                                                            src={buyer.avatar || "/default_avatar.png"}
                                                            alt={buyer.displayName}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <div>
                                                            <div style={{
                                                                fontSize: '14px',
                                                                fontWeight: 500,
                                                                color: '#1a1a1a',
                                                                lineHeight: 1.3
                                                            }}>
                                                                {buyer.displayName || "Ẩn danh"}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '12px',
                                                                color: '#666'
                                                            }}>
                                                                @{buyer.userName}
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
            </div>
        </>
    );



};
const controlButtonStyle = {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#666',
    transition: 'all 0.2s',
    ':hover': {
        background: 'rgba(125, 107, 88, 0.1)',
        color: '#7d6b58'
    }
};
const InfoItem = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
            color: '#8c8c8c',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}>
            {icon}
            {label}:
        </span>
        <span style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#1a1a1a'
        }}>
            {value}
        </span>
    </div>
)
export default RecordDetail;