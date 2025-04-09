// useChat.js
import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const CHAT_HUB_URL = "https://api-poemtown-staging.nodfeather.win/hub/chatHub"; // đổi thành local nếu cần

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
        "https://api-poemtown-staging.nodfeather.win/api/chat/send",
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
