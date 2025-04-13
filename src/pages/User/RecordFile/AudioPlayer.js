import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Spin } from "antd";
import { LockFilled } from "@ant-design/icons";

const AudioPlayer = ({ record, currentUser, showPurchaseConfirm }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [duration, setDuration] = useState('00:00');
    const accessToken = localStorage.getItem("accessToken");

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
        <div style={styles.audioSection}>
            {record.fileUrl ? (
                [
                    record.owner?.userName,
                    record.buyer?.userName,
                    ...(record.buyers?.map(b => b.userName) || []),
                ].includes(currentUser) || record.isPublic ? (
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
                            size="large"
                            onClick={() => showPurchaseConfirm(record.id, record.price)}
                        >
                            Mua ngay - {record.price.toLocaleString()} VND
                        </Button>
                    </div>
                )
            ) : (
                <Spin size="large" />
            )}
        </div>
    );
}; 
const styles = {
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
export default AudioPlayer;
