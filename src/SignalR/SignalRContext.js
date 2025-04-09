import React, { createContext, useContext, useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

// Create the context
const SignalRContext = createContext();

// Custom hook to use the SignalR context
export const useSignalR = () => {
    return useContext(SignalRContext);
};

// SignalR provider component to wrap your app
export const SignalRProvider = ({ children }) => {
    const [announcementConnection, setAnnouncementConnection] = useState(null);
    const [announcements, setAnnouncements] = useState([]);

    const API_BACKEND_URL = process.env.REACT_APP_API_BACKEND_URL
    // Function to create the connection to AnnouncementHub
    const createAnnouncementConnection = (userId) => {

        if(userId == null) {
            return;
        }
        // Kết nối tới AnnouncementHub
        const newAnnouncementConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_BACKEND_URL}/hub/announcementHub`, {
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // Gọi đến AnnouncementHub để đăng ký connectionId với userId
        newAnnouncementConnection.start()
            .then(async () => {
                console.log("Connected to SignalR");

                // Manually register connection with the backend
                await newAnnouncementConnection.invoke("RegisterUserConnection", userId);
            })
            .catch(err => console.error("Connection failed:", err));

        // Kết nối và nhận data từ Hub, hàm ReceiveAnnouncement
        newAnnouncementConnection.on("ReceiveAnnouncement", (announcement) => {
            // console.log("New announcement:", announcement);
            // // setAnnuncements(prev => [...prev, announcement]);

            // setAnnouncements(prev => {
            //     const exists = prev.some(n => n.id === announcement.id);
            //     if (exists) {
            //         // If it exists, update it instead of adding a duplicate
            //         return prev.map(n => (n.id === announcement.id ? announcement : n));
            //     }
            //     return [announcement, ...prev]; // Add only if it's new
            // });
            setAnnouncements(prev => {
                const map = new Map();
        
                // Add new/updated one first
                map.set(announcement.id, announcement);
        
                // Add the rest, skipping the one we just added
                for (const a of prev) {
                    if (!map.has(a.id)) {
                        map.set(a.id, a);
                    }
                }
        
                // Optional: sort by createdTime DESC to keep it tidy
                const sorted = Array.from(map.values()).sort((a, b) =>
                    new Date(b.createdTime) - new Date(a.createdTime)
                );
        
                return sorted;
            });
        });

        setAnnouncementConnection(newAnnouncementConnection);
    };

    return (
        <SignalRContext.Provider value={{ announcementConnection, announcements, setAnnouncements, createAnnouncementConnection }}>
            {children}
        </SignalRContext.Provider>
    );
};
