// useChat.js
import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const API_BACKEND_URL = process.env.REACT_APP_API_BACKEND_URL
const CHAT_HUB_URL = `${API_BACKEND_URL}/hub/chatHub`; // đổi thành local nếu cần

export const useChat = (jwtToken, updateMessages) => {
  const connectionRef = useRef(null);

  useEffect(() => {
    const connect = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: () => jwtToken, // Nếu có dùng JWT
      })
      .withAutomaticReconnect() 
      .build();

    connect.on("ReceiveMessage", (fromUserId, message) => {
      // Gọi callback để cập nhật tin nhắn mới vào MessengerPage
      updateMessages(fromUserId, message);
    }); 

    connect
      .start()
      .then(() => console.log("✅ SignalR connected"))
      .catch(err => console.error("❌ SignalR connection error: ", err));

    connectionRef.current = connect;

    return () => {
      connect.stop();
    };
  }, [jwtToken, updateMessages]);

  const sendMessage = async (toUserId, message) => {
    try {
      const res = await axios.post(
        `${API_BACKEND_URL}/api/chat/send`,
        { toUserId, message },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
      );
      console.log(res.data.data);
      return res.data.data;
    } catch (error) {
      console.error("Gửi tin nhắn thất bại:", error);
    }
  };

  return { sendMessage };
};
