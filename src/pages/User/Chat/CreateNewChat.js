import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../SignalR/UseChat";
import { IoMdClose, IoMdSend } from "react-icons/io";
const CreateNewChat = ({ userData, refreshKey, onClose }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const jwtToken = localStorage.getItem("accessToken");
  const currentUserId = localStorage.getItem("userId");
  const chatContainerRef = useRef(null);
  const utcDate = new Date(); // Thời gian UTC hiện tại
  const utcPlus7Date = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000); // Thêm 7 giờ vào thời gian UTC

  const formattedDate = utcPlus7Date.toISOString();
  const updateMessages = (fromUserId, message) => {
    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        fromUser: { id: fromUserId, displayName: userData.displayName, avatar: userData.avatar },
        messageText: message,
        createdTime: formattedDate,

      },
    ]);
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
    const url = `https://api-poemtown-staging.nodfeather.win/api/chat/v1/partner/content?pageNumber=1&pageSize=100&targetUserId=${targetUserId}`;
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
  function formatDate(isoString) {
    const date = new Date(isoString);

    // Lấy giờ và phút theo múi giờ UTC+7
    const hours = String(date.getHours()).padStart(2, "0"); // getHours() tự động tính theo múi giờ cài đặt của hệ thống
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
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
                  <div>{msg.messageText}</div>
                  <div style={styles.messageTime}>{formatDate(msg.createdTime)}</div>
                </div>
              </div>
            );
          })}
        </div>
        <form style={styles.chatInputContainer} onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            style={styles.chatInput}
          />
          <div
            style={{
              ...styles.sendButton,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: chatInput.trim() ? "pointer" : "not-allowed", // Thêm hiệu ứng con trỏ khi có thể gửi
            }}
            onClick={chatInput.trim() ? handleSendMessage : null} // Gọi hàm gửi tin nhắn khi có input
          >
            <IoMdSend style={{ fontSize: "24px", color: "blue" }} /> {/* Chỉnh kích thước biểu tượng */}
          </div>


        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "90vh",
    fontFamily: "Arial, sans-serif",
    backgroundSize: "cover",
    backgroundColor: "#fff",

  },
  chatArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(0,0,0,0.2)", // Độ trong suốt để nhìn thấy nền
    overflow: "hidden",
  },
  chatHeader: {
    position: "relative", 
    padding: "15px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#3B1E1E",
    color: "#fff",
    display: "flex",
    alignItems: "center",
  },
  avatarChat: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
  },
  chatMessages: {
    flex: 1,
    padding: "15px",
    overflowY: "auto",
    maxHeight: "calc(100vh - 180px)",
    paddingRight: "10px",
  },
  messageWrapper: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  avatarMessage: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    marginRight: "10px",
  },
  messageBubble: {
    padding: "10px",
    maxWidth: "75%",
    borderRadius: "15px",
    wordWrap: "break-word",
    whiteSpace: "pre-wrap",
    position: "relative",
    fontSize: "14px",
  },
  messageTime: {
    fontSize: "10px",
    color: "#aaa",
    textAlign: "right",
    marginTop: "5px",
  },
  chatInputContainer: {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  chatInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "rgb(211, 209, 209)", // Nền mờ đen
    color: "#303030 ", // Màu chữ trắng cho dễ đọc trên nền tối
  },
  sendButton: {
    marginLeft: "10px",
    border: "none",
    //backgroundColor: "#4A90E2",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  closeIcon: {
    position: "absolute",
    top: "15px",
    right: "15px",
    fontSize: "24px",
    cursor: "pointer",
    color: "#fff",
  },
};

export default CreateNewChat;
