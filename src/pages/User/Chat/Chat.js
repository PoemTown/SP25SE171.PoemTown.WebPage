import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../SignalR/UseChat";
import { Tooltip } from "antd";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
const MessengerPage = ({ refreshKey }) => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const jwtToken = localStorage.getItem("accessToken");
    const currentUserId = localStorage.getItem("userId");
    const chatContainerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


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

    const handleEmojiClick = (emojiData) => {
        setChatInput((prevInput) => prevInput + emojiData.emoji);
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
        const url = `${process.env.REACT_APP_API_BASE_URL}/chat/v1/partner?pageNumber=${pageNumber}&pageSize=${pageSize}`;
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
        const url = `${process.env.REACT_APP_API_BASE_URL}/chat/v1/partner/content?pageNumber=1&pageSize=100&targetUserId=${targetUserId}`;
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
            {/* Sidebar: danh sách cuộc trò chuyện */}
            <div style={styles.sidebar}>
                <header style={styles.sidebarHeader}>
                    <h2>Tin nhắn</h2>
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
                                {formatTime(conv.lastMessage.createdTime)}
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
        height: "80vh",
        maxWidth: "800px",
        minWidth:"800px",
        margin: "20px auto",
        borderRadius: "16px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        overflow: "hidden",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        backgroundColor: "#ffffff",
    },
    sidebar: {
        width: "240px",
        borderRight: "1px solid #f0f0f0",
        backgroundColor: "#f8f9fa",
        display: "flex",
        flexDirection: "column",
    },
    sidebarHeader: {
        padding: "11px 20px",
        borderBottom: "1px solid #e9ecef",
        backgroundColor: "#ffffff",
        h2: {
            margin: 0,
            fontSize: "20px",
            fontWeight: 600,
            color: "#212529",
        }
    },
    conversationList: {
        listStyleType: "none",
        margin: 0,
        padding: "8px 0",
        overflowY: "auto",
        flex: 1,
        "&::-webkit-scrollbar": {
            width: "6px",
        },
        "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "#ced4da",
            borderRadius: "4px",
        },
    },
    conversationItem: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        position: "relative",
        "&:hover": {
            backgroundColor: "#f1f3f5",
        },
        "&.active": {
            backgroundColor: "#e7f5ff",
            "&::after": {
                content: '""',
                position: "absolute",
                right: 0,
                top: 0,
                height: "100%",
                width: "3px",
                backgroundColor: "#4dabf7",
            }
        }
    },
    avatar: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        marginRight: "12px",
        border: "2px solid #fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    conversationDetails: {
        flex: 1,
        minWidth: 0,
    },
    conversationName: {
        display: "block",
        fontSize: "14px",
        fontWeight: 500,
        color: "#212529",
        marginBottom: "4px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    conversationMessage: {
        display: "block",
        fontSize: "13px",
        color: "#868e96",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    },
    conversationTime: {
        fontSize: "12px",
        color: "#adb5bd",
        marginLeft: "8px",
        whiteSpace: "nowrap",
    },
    chatArea: {
        flex: 2,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#ffffff",
        position: "relative",
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
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        marginRight: "12px",
        border: "2px solid #fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    chatMessages: {
        flex: 1,
        padding: "24px",
        overflowY: "auto",
        backgroundColor: "#f8fafb",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        "&::-webkit-scrollbar": {
            width: "8px",
        },
        "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
        },
        "&::-webkit-scrollbar-thumb": {
            background: "#ced4da",
            borderRadius: "4px",
        },
    },
    messageWrapper: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
    },
    avatarMessage: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        flexShrink: 0,
        marginTop: "4px",
    },
    messageBubble: {
        padding: "12px 16px",
        maxWidth: "75%",
        borderRadius: "16px",
        fontSize: "14px",
        lineHeight: 1.5,
        position: "relative",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        "&:after": {
            content: '""',
            position: "absolute",
            bottom: "-8px",
            width: 0,
            height: 0,
            border: "8px solid transparent",
        }
    },
    messageTime: {
        fontSize: "12px",
        color: "#868e96",
        marginTop: "6px",
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },
    chatInputContainer: {
        padding: "16px 24px",
        borderTop: "1px solid #e9ecef",
        backgroundColor: "#ffffff",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.03)",
    },
    chatInput: {
        flex: 1,
        padding: "12px 16px",
        border: "1px solid #e9ecef",
        borderRadius: "24px",
        fontSize: "14px",
        backgroundColor: "#ffffff",
        color: "#212529",
        transition: "border-color 0.2s",
        "&:focus": {
            outline: "none",
            borderColor: "#4dabf7",
            boxShadow: "0 0 0 3px rgba(77, 171, 247, 0.2)",
        }
    },
    sendButton: {
        padding: "10px",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: "#339af0",
        }
    },
    noConversation: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "#adb5bd",
        fontSize: "16px",
        backgroundColor: "#f8f9fa",
    },
};


export default MessengerPage;
