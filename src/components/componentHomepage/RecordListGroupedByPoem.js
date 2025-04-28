import React, { useEffect, useRef, useState } from "react";
import { Modal, Switch, Table, Dropdown, Menu, Button, Spin, Collapse, message } from "antd";
import { IoIosLink, IoIosMore } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HeartFilled, LockFilled, PlayCircleFilled, ShoppingCartOutlined, DownOutlined } from "@ant-design/icons";
import { AiOutlineInfoCircle } from "react-icons/ai";

const { Panel } = Collapse;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const PoemRecordGroup = ({
    poem,
    records,
    showDeleteConfirm,
    isMine,
    showPurchaseConfirm
}) => {
    const navigate = useNavigate();
    const currentUser = localStorage.getItem("username");

    return (
        <div style={{ ...styles.cardContainer, width: '100%' }}>
            {/* Poem Header */}
            <div style={styles.poemHeader} onClick={() => navigate(`/poem/${poem?.id}`)}>
                <img
                    src={poem?.poemImage || "/anhminhhoa.png"}
                    alt="poem cover"
                    style={styles.poemCover}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/anhminhhoa.png";
                    }}
                />
                <div style={styles.poemInfo}>
                    <h3 style={styles.poemTitle}>{poem?.title || "Bài thơ đã bị gỡ"}</h3>
                    <p style={styles.poemAuthor}>Tác giả: {poem?.user?.displayName || "Không có"}</p>
                </div>
            </div>

            {/* Records Collapse */}
            <Collapse
                bordered={false}
                defaultActiveKey={['0']}
                expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                style={styles.collapse}
            >
                {records.map((record, index) => (
                    <Panel
                        header={
                            <RecordHeader
                                record={record}
                                isMine={isMine}
                                currentUser={currentUser}
                            />
                        }
                        key={index}
                        style={styles.panel}
                    >
                        <RecordContent
                            record={record}
                            showDeleteConfirm={showDeleteConfirm}
                            isMine={isMine}
                            showPurchaseConfirm={showPurchaseConfirm}
                        />
                    </Panel>
                ))}
            </Collapse>
        </div>
    );
};

const RecordHeader = ({ record, isMine, currentUser }) => {
    return (
        <div style={styles.recordHeader}>
            <div style={styles.recordHeaderLeft}>
                <img
                    src={record.owner?.avatar || "/default-avatar.png"}
                    alt="avatar"
                    style={styles.smallAvatar}
                />
                <span style={styles.recordTitle}>{record.fileName}</span>
            </div>
            <div style={styles.recordHeaderRight}>
                <span style={styles.recordInfo}>
                    {record.owner?.displayName} • {formatDate(record.createdTime)}
                </span>
                {(![
                    record.owner?.userName,
                    record.buyer?.userName,
                    ...(record.buyers?.map(b => b.userName) || []),
                ].includes(currentUser) && !record.isPublic) && (
                        <LockFilled style={{ color: '#ff4d4f', marginLeft: 8 }} />
                    )}
            </div>
        </div>
    );
};

const RecordContent = ({
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
    const audioRef = useRef(null);
    const [isSeeking, setIsSeeking] = useState(false);
    const [playStartTime, setPlayStartTime] = useState(0);
    const [totalPlayedTime, setTotalPlayedTime] = useState(0);
    const [hasCounted, setHasCounted] = useState(false);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/record/${record.id}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                message.success("Đã sao chép liên kết!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                message.error("Không sao chép được liên kết!");
            });
    };

    const overlayMenu = (
        <Menu>
            <Menu.Item key="detail" onClick={() => navigate(`/record/${record.id}`, {
                state: {
                    isMine: isMine,
                    initialData: record
                }
            })}>
                <div className="menu-item">
                    <AiOutlineInfoCircle className="menu-icon blue" />
                    Thông tin chi tiết
                </div>
            </Menu.Item>
            <Menu.Item key="copy" onClick={handleCopyLink}>
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

 
    const handlePlay = () => {
        if (audioRef.current.currentTime === 0) {
            resetCount();
        }
        setIsSeeking(false);
        setPlayStartTime(Date.now());
    };

    const handlePause = () => {
        if (!isSeeking) {
            const sessionTime = (Date.now() - playStartTime) / 1000;
            setTotalPlayedTime(prev => prev + sessionTime);
        }
    };

    const handleSeeking = () => {
        setIsSeeking(true);
        audioRef.current.pause();
    };

    const handleSeeked = () => {
        setIsSeeking(false);
        setPlayStartTime(Date.now());
        audioRef.current.play();
    };

    const handleTimeUpdate = () => {
        if (!isSeeking && !hasCounted) {
            const sessionTime = (Date.now() - playStartTime) / 1000;
            const newTotal = totalPlayedTime + sessionTime;

            if (newTotal >= 62) {
                handleCountView();
                setHasCounted(true);
            }
        }
    };

    const resetCount = () => {
        setHasCounted(false);
        setTotalPlayedTime(0);
        setPlayStartTime(0);
    };

    // Thêm event listeners cho audio element
    useEffect(() => {
        const audio = audioRef.current;

        if (audio) {
            const handleSeeking = () => setIsSeeking(true);
            const handleSeeked = () => setIsSeeking(false);

            audio.addEventListener('seeking', handleSeeking);
            audio.addEventListener('seeked', handleSeeked);

            // Cleanup function
            return () => {
                audio.removeEventListener('seeking', handleSeeking);
                audio.removeEventListener('seeked', handleSeeked);
            };
        }
    }, []);

    const handleCountView = async () => {
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/${record.id}/count-view`,
                null,
                {
                    headers: {
                        "Content-Type": "application/json",

                    },
                    params: {
                        duration: Math.floor(audioRef.current.currentTime)
                    }
                }
            );
            console.log('View counted!');
        } catch (error) {
            console.error('Failed to record view:', error);
        }
    };
    const isAllowedUser = [
        record.owner?.userName,
        record.buyer?.userName,
        ...(record.buyers?.map(b => b.userName) || [])
    ].includes(currentUser);
    return (
        <div style={styles.recordContent}>
            {/* Audio Player Section */}
            <div style={styles.audioSection}>
                {record.fileUrl ? (
                    <>
                        {(record.isAbleToRemoveFromPoem && !isAllowedUser) ||
                            (!isAllowedUser && !record.isPublic)
                            ? (
                                <div style={styles.purchaseBlock}>
                                    <LockFilled style={styles.lockIcon} />
                                    <p style={styles.purchaseText}>
                                        {record.isAbleToRemoveFromPoem
                                            ? "Bài thơ đã bị khóa do thu hồi bản quyền sử dụng"
                                            : "Mua để nghe bản ghi này"}
                                    </p>
                                    {!record.isAbleToRemoveFromPoem && (
                                        <Button
                                            type="primary"
                                            shape="round"
                                            size="small"
                                            onClick={() => showPurchaseConfirm(record.id, record.price)}
                                        >
                                            Mua ngay - {record.price === 0 ? "Miễn phí" : record.price.toLocaleString() + " VND"}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div style={styles.audioWrapper}>
                                    <audio ref={audioRef}
                                        onPlay={handlePlay}
                                        onPause={handlePause}
                                        onTimeUpdate={handleTimeUpdate}
                                        controls
                                        style={styles.audioPlayer}
                                        src={audioUrl} />
                                    <span style={styles.priceTag}>
                                        {record.price === 0 ? 'MIỄN PHÍ' : `${record.price.toLocaleString()} VND`}
                                    </span>
                                </div>
                            )
                        }
                    </>
                    //     [
                    //     record.owner?.userName,
                    //     record.buyer?.userName,
                    //         ...(record.buyers?.map(b => b.userName) || []),
                    // ].includes(currentUser) || record.isPublic ? (
                    // <div style={styles.audioWrapper}>
                    //     <audio controls style={styles.audioPlayer} src={audioUrl} />
                    //     <span style={styles.priceTag}>
                    //         {record.price === 0 ? 'MIỄN PHÍ' : `${record.price.toLocaleString()} VND`}
                    //     </span>
                    // </div>
                    // ) : (
                    // <div style={styles.purchaseBlock}>
                    //     <LockFilled style={styles.lockIcon} />
                    //     <p style={styles.purchaseText}>Mua để nghe bản ghi này</p>
                    //     <Button
                    //         type="primary"
                    //         shape="round"
                    //         size="small"
                    //         onClick={() => showPurchaseConfirm(record.id, record.price)}
                    //     >
                    //         Mua ngay - {record.price.toLocaleString()} VND
                    //     </Button>
                    // </div>
                    // )
                ) : (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Spin size="large" />
                    </div>
                )}
            </div>

            {/* Stats and Menu Section */}
            <div style={styles.recordFooter}>
                <div style={styles.stats}>
                    <div style={styles.statItem}>
                        <PlayCircleFilled /> {record.totalView || 0}
                    </div>
                    <div style={styles.statItem}>
                        <ShoppingCartOutlined /> {record.buyers?.length || 0}
                    </div>
                </div>
                <Dropdown overlay={overlayMenu} trigger={["click"]}>
                    <button style={styles.menuButton}>
                        <IoIosMore style={styles.menuIcon} />
                    </button>
                </Dropdown>
            </div>
        </div>
    );
};

const styles = {
    cardContainer: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        marginBottom: '20px',
        ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)'
        }
    },
    poemHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fafafa'
    },
    poemCover: {
        width: '60px',
        height: '60px',
        borderRadius: '8px',
        objectFit: 'cover',
        marginRight: '16px'
    },
    poemInfo: {
        flex: 1
    },
    poemTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 600,
        color: '#333'
    },
    poemAuthor: {
        margin: '4px 0 0',
        fontSize: '14px',
        color: '#666'
    },
    collapse: {
        backgroundColor: 'transparent'
    },
    panel: {
        borderBottom: '1px solid #f0f0f0'
    },
    recordHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '8px 0'
    },
    recordHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        overflow: 'hidden'
    },
    smallAvatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        marginRight: '12px',
        objectFit: 'cover'
    },
    recordTitle: {
        fontSize: '15px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    recordHeaderRight: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: '12px',
        color: '#666'
    },
    recordInfo: {
        fontSize: '13px',
        whiteSpace: 'nowrap'
    },
    recordContent: {
        padding: '0 16px 16px'
    },
    audioSection: {
        margin: '12px 0'
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
    recordFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    stats: {
        display: 'flex',
        gap: '16px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px',
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
    }
};

// Hàm helper để nhóm các bản ghi theo poem
export const groupRecordsByPoem = (records) => {
    const poemMap = {};
    const noPoemRecords = [];

    records.forEach(record => {
        if (!record.poem) {
            noPoemRecords.push(record);
            return;
        }

        const poemId = record.poem.id;
        if (!poemMap[poemId]) {
            poemMap[poemId] = {
                poem: record.poem,
                records: []
            };
        }
        poemMap[poemId].records.push(record);
    });

    const grouped = Object.values(poemMap);

    if (noPoemRecords.length > 0) {
        grouped.push({
            poem: null,
            records: noPoemRecords
        });
    }

    return grouped;
}   

// Component chính để hiển thị danh sách bản ghi đã được nhóm
const RecordListGroupedByPoem = ({ records, ...props }) => {
    const groupedRecords = groupRecordsByPoem(records);

    return (
        <div style={{ width: '100%' }}>
            {groupedRecords.map((group, index) => (
                <PoemRecordGroup
                    key={index}
                    poem={group.poem}
                    records={group.records}
                    {...props}
                />
            ))}
        </div>
    );
};

export default RecordListGroupedByPoem;