import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../SignalR/UseChat";

const CreateNewChat = ({ userData, refreshKey }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const jwtToken = localStorage.getItem("accessToken");

  // Ref cho container chứa tin nhắn
  const chatContainerRef = useRef(null);

  // Hàm updateMessages cập nhật tin nhắn mới từ SignalR
  const updateMessages = (fromUserId, message) => {
      const displayName = userData.displayName; // Lấy tên hiển thị của userData
      setChatMessages((prevMessages) => [
          ...prevMessages,
          {
              fromUser: { displayName },
              messageText: message,
              createdTime: new Date().toISOString(),
          },
      ]);
  };

  const { sendMessage } = useChat(jwtToken, updateMessages);

  // Mỗi khi chatMessages thay đổi, cuộn container tin nhắn xuống cuối
  useEffect(() => {
      if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
      }
  }, [chatMessages]);



// Khi chọn cuộc trò chuyện mới, fetch tin nhắn của cuộc đó
    useEffect(() => {
        if (userData) {
          console.log(userData)
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
        if (!response.ok)
            throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
        const data = await response.json();
        setChatMessages(data.data);
        setChatInput("");
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
}

  const handleSendMessage = async (e) => {
      e.preventDefault();
      // Gửi tin nhắn
      const newMessage = await sendMessage(userData.userId, chatInput);
      if (newMessage) {
          setChatMessages((prevMessages) => [...prevMessages, newMessage]);
          setChatInput("");
      }
  };

  function formatDate(isoString) {
      const date = new Date(isoString);
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
  }

  return (
      <div style={styles.container}>
          {/* Chat area: hiển thị nội dung chat */}
          <div style={styles.chatArea}>
              <header style={styles.chatHeader}>
                  <img
                      src={userData.avatar}
                      alt="avatar"
                      style={styles.avatarChat}
                  />
                  <h3>{userData.displayName}</h3>
              </header>
              <div style={styles.chatMessages} ref={chatContainerRef}>
                  {chatMessages.map((msg, index) => (
                      <div key={msg.id || index} style={styles.messageBubble}>
                          <strong>{msg.fromUser.displayName}: </strong>
                          <span>{msg.messageText}</span>
                          <div style={styles.messageTime}>
                              {formatDate(msg.createdTime)}
                          </div>
                      </div>
                  ))}
              </div>
              <form style={styles.chatInputContainer} onSubmit={handleSendMessage}>
                  <input
                      type="text"
                      placeholder="Nhập tin nhắn..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      style={styles.chatInput}
                  />
                  <button
                      type="submit"
                      style={{
                          ...styles.sendButton,
                          opacity: chatInput.trim() ? 1 : 0.5,
                          cursor: chatInput.trim() ? "pointer" : "not-allowed"
                      }}
                      disabled={!chatInput.trim()}
                  >
                      Gửi
                  </button>
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
  },
  chatArea: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#fafafa",
      overflow: "hidden",
  },
  chatHeader: {
      padding: "15px",
      borderBottom: "1px solid #ddd",
      backgroundColor: "#f5f5f5",
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
  messageBubble: {
      padding: "10px",
      marginBottom: "10px",
      backgroundColor: "#fff",
      borderRadius: "5px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      overflowWrap: "break-word",
      wordBreak: "break-word",
      maxWidth: "100%",
      whiteSpace: "pre-wrap",
  },
  messageTime: {
      fontSize: "10px",
      color: "#999",
      textAlign: "right",
      marginTop: "5px",
  },
  chatInputContainer: {
      display: "flex",
      borderTop: "1px solid #ddd",
      padding: "10px",
      backgroundColor: "#fff",
  },
  chatInput: {
      flex: 1,
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      outline: "none",
      fontSize: "14px",
  },
  sendButton: {
      padding: "10px 20px",
      marginLeft: "10px",
      border: "none",
      backgroundColor: "#4A90E2",
      color: "#fff",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
  },
};
export default CreateNewChat;
