import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../SignalR/UseChat";

const MessengerPage = ({ refreshKey }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const jwtToken = localStorage.getItem("accessToken");

    // Ref cho container chứa tin nhắn
    const chatContainerRef = useRef(null);

    // Hàm updateMessages cập nhật tin nhắn mới từ SignalR
    const updateMessages = (fromUserId, message) => {
        if (selectedConversation && selectedConversation.id === fromUserId) {
            const displayName = selectedConversation.fromUser
                ? selectedConversation.fromUser.displayName
                : selectedConversation.displayName;
            setChatMessages((prevMessages) => [
                ...prevMessages,
                {
                    fromUser: { displayName },
                    messageText: message,
                    createdTime: new Date().toISOString(),
                    fromMe: fromUserId === selectedConversation.id, // Determine if the message is from the current user
                },
            ]);
        }

        // Gọi lại fetchChatPartner khi nhận được tin nhắn mới
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
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
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
                            <img
                                src={selectedConversation.avatar}
                                alt="avatar"
                                style={styles.avatarChat}
                            />
                            <h3>{selectedConversation.name}</h3>
                        </header>
                        <div style={styles.chatMessages} ref={chatContainerRef}>
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={msg.id || index}
                                    style={{
                                        ...styles.messageBubble,
                                        alignSelf: msg.fromMe ? "flex-end" : "flex-start",
                                        backgroundColor: msg.fromMe ? "#DCF8C6" : "#fff",
                                    }}
                                >
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
                    </>
                ) : (
                    <div style={styles.noConversation}>
                        <p>Chọn một cuộc trò chuyện để xem tin nhắn</p>
                    </div>
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
        width: "300px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
    },
    sidebarHeader: {
        padding: "15px",
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
        borderRadius: "5px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        overflowWrap: "break-word",
        wordBreak: "break-word",
        maxWidth: "70%",
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
    noConversation: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#666",
    },
};

export default MessengerPage;
