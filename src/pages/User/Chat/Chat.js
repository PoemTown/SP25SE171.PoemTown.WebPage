import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../SignalR/UseChat";

const MessengerPage = ({ refreshKey }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const jwtToken = localStorage.getItem("accessToken");
    const currentUserId = localStorage.getItem("userId");
    const chatContainerRef = useRef(null);
  

    // Hàm updateMessages cập nhật tin nhắn mới từ SignalR
    const updateMessages = (fromUserId, message) => {
        if (selectedConversation && selectedConversation.id === fromUserId) {
          const fromUser = {
            displayName: selectedConversation.fromUser
              ? selectedConversation.fromUser.displayName
              : selectedConversation.displayName,
            avatar: selectedConversation.avatar,
          };
      
          // Tạo thời gian hiện tại theo UTC, sau đó chuyển sang ISO string
          const currentTimeUTC = new Date().toISOString();
      
          setChatMessages((prevMessages) => [
            ...prevMessages,
            {
              fromUser,
              messageText: message,
              createdTime: currentTimeUTC, // Lấy thời gian hiện tại ngay lúc nhận
            },
          ]);
        }
        fetchChatPartner();
      };
      


    const { sendMessage } = useChat(jwtToken, updateMessages);

    // Lấy danh sách cuộc trò chuyện khi refreshKey thay đổi
    useEffect(() => {
        fetchChatPartner();
    }, [refreshKey]);

    // Khi chọn cuộc trò chuyện mới, fetch tin nhắn của cuộc đó
    useEffect(() => {
        if (selectedConversation) {
            fetchContentChat(selectedConversation.id);
        }
    }, [selectedConversation]);

    // Mỗi khi chatMessages thay đổi, cuộn container tin nhắn xuống cuối
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    async function fetchChatPartner(pageNumber = 1, pageSize = 10) {
        const url = `https://api-poemtown-staging.nodfeather.win/api/chat/v1/partner?pageNumber=${pageNumber}&pageSize=${pageSize}`;
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
            setConversations(data.data);
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

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
            setChatMessages(data.data.map(msg => ({
                ...msg,
                fromMe: msg.fromUser.id === selectedConversation.id, // Determine if the message is from the current user
            })));
            setChatInput("");
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Gửi tin nhắn đến cuộc trò chuyện đã chọn (selectedConversation.id)
        const newMessage = await sendMessage(selectedConversation.id, chatInput);
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
            {/* Sidebar: danh sách cuộc trò chuyện */}
            <div style={styles.sidebar}>
                <header style={styles.sidebarHeader}>
                    <h2>Messenger</h2>
                </header>
                <ul style={styles.conversationList}>
                    {conversations.map((conv) => (
                        <li
                            key={conv.id}
                            style={styles.conversationItem}
                            onClick={() => setSelectedConversation(conv)}
                        >
                            <img src={conv.avatar} alt="avatar" style={styles.avatar} />
                            <div style={styles.conversationDetails}>
                                <span style={styles.conversationName}>
                                    {conv.fromUser
                                        ? conv.fromUser.displayName
                                        : conv.displayName}
                                </span>
                                <span style={styles.conversationMessage}>
                                    {conv.lastMessage.messageText}
                                </span>
                            </div>
                            <div style={styles.conversationTime}>
                                {formatDate(conv.lastMessage.createdTime)}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {/* Chat area: hiển thị nội dung chat của cuộc trò chuyện được chọn */}
            <div style={styles.chatArea}>
                {selectedConversation ? (
                    <>
                        <header style={styles.chatHeader}>
                            <img src={selectedConversation.avatar} alt="avatar" style={styles.avatarChat} />
                            <h3>{selectedConversation.displayName}</h3>
                        </header>

                        <div style={styles.chatMessages} ref={chatContainerRef}>
                            {chatMessages.map((msg, index) => {
                                const isMine = msg.fromUser.id == currentUserId;
                                const isLastMessage = index === chatMessages.length - 1 || msg.fromUser.id !== chatMessages[index + 1].fromUser.id;


                                return (
                                    <div
                                        key={msg.id || index}
                                        style={{
                                            ...styles.messageWrapper,
                                            justifyContent: isMine ? "flex-end" : "flex-start",
                                        }}
                                    >
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
                            <button type="submit" style={styles.sendButton} disabled={!chatInput.trim()}>
                                Gửi
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={styles.noConversation}>Chọn một cuộc trò chuyện để bắt đầu</div>
                )}
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
    sidebar: {
        width: "240px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
    },
    sidebarHeader: {
        padding: "10.5px",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#f5f5f5",
        textAlign: "center",
    },
    conversationList: {
        listStyleType: "none",
        margin: 0,
        padding: 0,
        overflowY: "auto",
    },
    conversationItem: {
        display: "flex",
        alignItems: "center",
        padding: "10px",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    avatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        marginRight: "10px",
    },
    conversationDetails: {
        flex: 1,
        width: "40px",
        height: "40px"
    },
    conversationName: {
        display: "block",
        fontWeight: "bold",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    conversationMessage: {
        display: "block",
        color: "#666",
        fontSize: "14px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    conversationTime: {
        fontSize: "12px",
        color: "#999",
    },
    chatArea: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(0, 0, 0, 0.1)", // nền mờ mờ
        backdropFilter: "blur(4px)",
        width: "400px",       // Đặt chiều rộng cố định cho container
        maxWidth: "400px",    // Giới hạn chiều rộng tối đa
    },
    chatHeader: {
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
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        marginRight: "10px",
    },
    messageBubble: {
        padding: "10px 14px",
        maxWidth: "70%",              // Giới hạn chiều rộng của bubble tin nhắn
        borderRadius: "15px",
        wordWrap: "break-word",       // Cho phép xuống dòng nếu từ quá dài
        overflowWrap: "break-word",   // Hỗ trợ tương tự
        whiteSpace: "normal",         // Cho phép nội dung xuống dòng
        fontSize: "14px",
    },
    messageTime: {
        fontSize: "11px",
        color: "#ccc",
        textAlign: "right",
        marginTop: "4px",
    },
    chatInputContainer: {
        display: "flex",
        padding: "10px",
        borderTop: "1px solid #ddd",
        backgroundColor: "#fff",
    },
    chatInput: {
        flex: 1,
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "14px",
    },
    sendButton: {
        marginLeft: "10px",
        padding: "10px 20px",
        backgroundColor: "#4A90E2",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        cursor: "pointer",
    },
    noConversation: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#777",
        fontSize: "16px",
    },
};

export default MessengerPage;
