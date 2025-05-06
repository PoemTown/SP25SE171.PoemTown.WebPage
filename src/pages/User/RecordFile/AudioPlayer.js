import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Spin } from "antd";
import { LockFilled } from "@ant-design/icons";

const AudioPlayer = ({ record, currentUser, showPurchaseConfirm }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState("00:00");
  const [previewEnded, setPreviewEnded] = useState(false);
  const audioRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");

  const formatDuration = (sec) => {
    if (!sec || isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60),
          s = Math.floor(sec % 60);
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  useEffect(() => {
    let metadataAudio;
    const fetchAudio = async () => {
      try {
        const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        const resp = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/audio-stream/${record.id}`,
          { responseType: "blob", headers }
        );
        const url = URL.createObjectURL(resp.data);
        setAudioUrl(url);

        // tạo audio tạm để đọc duration gốc
        metadataAudio = new Audio(url);
        metadataAudio.onloadedmetadata = () => {
          setDuration(formatDuration(metadataAudio.duration));
        };
      } catch (err) {
        console.error(err);
        setAudioUrl(null);
        setDuration("00:00");
      }
    };

    if (record.fileUrl) {
      setPreviewEnded(false);
      fetchAudio();
    }
    return () => {
      if (metadataAudio) {
        metadataAudio.pause();
        metadataAudio.src = "";
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [record, accessToken]);

  const isAllowedUser = [
    record.owner?.userName,
    record.buyer?.userName,
    ...(record.buyers?.map(b => b.userName) || []),
    ...(record.coOwners?.map(co => co.userName) || []),
  ].includes(currentUser);

  const onTimeUpdate = () => {
    const aud = audioRef.current;
    if (!aud) return;
    // nếu có giá >0, chưa mua và đã chạy >=30s → stop preview
    if (record.price > 0 && !isAllowedUser && aud.currentTime >= 30) {
      aud.pause();
      setPreviewEnded(true);
    }
  };

  return (
    <div style={styles.audioSection}>
      {record.fileUrl ? (
        record.price > 0 && !isAllowedUser && previewEnded ? (
          <div style={styles.purchaseBlock}>
            <LockFilled style={styles.lockIcon} />
            <p style={styles.purchaseText}>
              Hết 30 giây nghe thử. Mua để nghe tiếp.
            </p>
            <Button
              type="primary"
              shape="round"
              size="large"
              onClick={() => showPurchaseConfirm(record.id, record.price)}
            >
              Mua ngay – {record.price.toLocaleString()} VND
            </Button>
          </div>
        ) : (
          <div style={styles.audioWrapper}>
            <audio
              ref={audioRef}
              controls
              src={audioUrl}
              onTimeUpdate={onTimeUpdate}
              style={styles.audioPlayer}
            />
            {/* <span style={styles.duration}>{duration}</span> */}
            <span style={styles.priceTag}>
              {record.price === 0 ? "MIỄN PHÍ" : `${record.price.toLocaleString()} VND`}
            </span>
          </div>
        )
      ) : (
        <Spin size="large" />
      )}
    </div>
  );
};

const styles = {
  audioSection: { margin: "12px 0" },
  duration: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: 500,
  },
  audioWrapper: {
    position: "relative",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "8px",
  },
  audioPlayer: { width: "100%", height: "40px" },
  priceTag: {
    position: "absolute",
    top: "-10px",
    right: "10px",
    background: `linear-gradient(135deg, #7d6b58, #5d4c3c)`,

    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 500,
  },
  purchaseBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
    border: "1px dashed #ff4d4f",
    borderRadius: "8px",
    textAlign: "center",
  },
  lockIcon: { fontSize: "24px", color: "#ff4d4f" },
  purchaseText: { margin: 0, color: "#ff4d4f", fontSize: "14px" },
};

export default AudioPlayer;
