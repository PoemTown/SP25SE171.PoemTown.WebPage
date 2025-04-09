import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../SignalR/UseChat";
import { IoMdClose, IoMdSend } from "react-icons/io";
import { Tooltip } from "antd";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";

const CreateNewChat = ({ userData, refreshKey, onClose }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const jwtToken = localStorage.getItem("accessToken");
  const currentUserId = localStorage.getItem("userId");
  const chatContainerRef = useRef(null);
  const utcDate = new Date(); // Thời gian UTC hiện tại
  const utcPlus7Date = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // Thêm 7 giờ vào thời gian UTC
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const formattedDate = utcPlus7Date.toISOString();
  const updateMessages = (fromUserId, message) => {
    const currentTimeUTC = new Date().toISOString();
    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        fromUser: { id: fromUserId, displayName: userData.displayName, avatar: userData.avatar },
        messageText: message,
        createdTime: currentTimeUTC,

      },
    ]);
  };
  const handleEmojiClick = (emojiData) => {
    setChatInput((prevInput) => prevInput + emojiData.emoji);
  };

  const { sendMessage } = useChat(jwtToken, updateMessages);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (userData) {
      fetchContentChat(userData.userId);
    }
  }, [userData]);

  async function fetchContentChat(targetUserId) {
    const url = `${process.env.REACT_APP_API_BASE_URL}/chat/v1/partner/content?pageNumber=1&pageSize=100&targetUserId=${targetUserId}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!response.ok) throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
      const data = await response.json();
      setChatMessages(data.data);
      setChatInput("");
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const newMessage = await sendMessage(userData.userId, chatInput);
    if (newMessage) {
      setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      setChatInput("");
    }
  };
  function formatTime(isoString) {
    const date = new Date(isoString);

    // Lấy giờ và phút theo múi giờ UTC+7
    const hours = String(date.getHours()).padStart(2, "0"); // getHours() tự động tính theo múi giờ cài đặt của hệ thống
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN"); // → "09/04/2025"
  }
  return (
    <div style={styles.container}>
      <div style={styles.chatArea}>
        <header style={styles.chatHeader}>
          <img src={userData.avatar} alt="avatar" style={styles.avatarChat} />
          <h3>{userData.displayName}</h3>
          {/* Icon X để đóng chat, gọi hàm onClose khi click */}
          <IoMdClose style={styles.closeIcon} onClick={onClose} />

        </header>
        <div style={styles.chatMessages} ref={chatContainerRef}>
          {chatMessages.map((msg, index) => {
            const isMine = msg.fromUser.id == currentUserId;
            const isLastMessage = index === chatMessages.length - 1 || msg.fromUser.id !== chatMessages[index + 1].fromUser.id;
            return (
              <div key={msg.id || index} style={{
                ...styles.messageWrapper,
                justifyContent: isMine ? "flex-end" : "flex-start",
              }}>
                {!isMine && (
                  <img
                    src={msg.fromUser.avatar}
                    alt="avatar"
                    style={{
                      ...styles.avatarMessage,
                      visibility: isLastMessage ? "visible" : "hidden", // Avatar luôn giữ không gian nhưng chỉ hiện ở dòng cuối
                    }}
                  />
                )}
                <div
                  style={{
                    ...styles.messageBubble,
                    backgroundColor: isMine ? "#FEE9A3" : "#3B1E1E",
                    color: isMine ? "#000" : "#fff",
                    borderTopLeftRadius: isMine ? "12px" : "4px",
                    borderTopRightRadius: isMine ? "4px" : "12px",
                    textAlign: isMine ? "left" : "left",
                  }}
                >
                  <Tooltip title={formatDate(msg.createdTime)}>
                    <div>{msg.messageText}</div>
                  </Tooltip>
                  <div style={styles.messageTime}>{formatTime(msg.createdTime)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <form style={styles.chatInputContainer} onSubmit={handleSendMessage}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            {/* Nút chọn emoji */}
            <div style={{ position: "relative" }}>
              <BsEmojiSmile
                style={{ fontSize: "24px", cursor: "pointer", color: "#555" }}
                title="Gửi emoji"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
              />
              {/* Bảng emoji hiển thị khi showEmojiPicker = true */}
              {showEmojiPicker && (
                <div style={{ position: "absolute", bottom: "40px", zIndex: 999 }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            {/* Input chat */}
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={styles.chatInput}
            />

            {/* Nút gửi */}
            <div
              style={{
                ...styles.sendButton,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: chatInput.trim() ? "pointer" : "not-allowed",
              }}
              onClick={chatInput.trim() ? handleSendMessage : null}
            >
              <IoMdSend style={{ fontSize: "24px", color: "blue" }} />
            </div>
          </div>
        </form>

      </div>
    </div >
  );
};

const styles = {
  container: {
    display: "flex",
    height: "70vh",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f9f9f9",
  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fdfdfd",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  chatHeader: {
    padding: "16px 24px",
        borderBottom: "1px solid #e9ecef",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#ffffff",
        h3: {
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
            color: "#212529",
        }
  },
  avatarChat: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    marginRight: "12px",
  },
  closeIcon: {
    position: "absolute",
    top: "15px",
    right: "20px",
    fontSize: "22px",
    cursor: "pointer",
    color: "#000",
  },
  chatMessages: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 180px)",
    backgroundColor: "#f4f4f4",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  avatarMessage: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    marginRight: "8px",
  },
  messageBubble: {
    padding: "10px 14px",
    maxWidth: "70%",
    borderRadius: "16px",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  messageTime: {
    fontSize: "11px",
    color: "#888",
    textAlign: "right",
    marginTop: "6px",
  },
  chatInputContainer: {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: "#ffffff",

    borderTop: "1px solid #ddd",
  },
  chatInput: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "20px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "#fff",
    color: "#333",
  },
  sendButton: {
    marginLeft: "10px",
    padding: "8px 8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  },
};

export default CreateNewChat;
