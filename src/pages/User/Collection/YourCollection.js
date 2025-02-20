import React, { useEffect, useState } from "react";
import { Button } from 'antd';
import { FiArrowLeft } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import YourCollectionDetail from "./YourCollectionDetail";

const YourCollection = () => {
    const [collections, setCollection] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(null);
    useEffect(() => {
        const fetchCollections = async () => {
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxN2I4ZjQ1NC0xZjkwLTQyODAtZGNjNy0wOGRkNGI3MWViNTIiLCJUb2tlbkhhc2giOiI1YzU0ZGUxZDFjNjIxYWVjYTlkNzQ2Zjg5ODU4YjFlMWU2M2IyMjFiNTJjMGMzYzYwY2FlNjBhNzcyYmFkYzVjIiwicm9sZSI6IlVTRVIiLCJuYmYiOjE3NDAwMzM2NDUsImV4cCI6MTc0MDAzNzI0NSwiaWF0IjoxNzQwMDMzNjQ1LCJpc3MiOiJZb3VyQXBwSXNzdWVyIiwiYXVkIjoiWW91ckFwcEF1ZGllbmNlIn0.0QTwL5g3gSzUwMXAX6dRrRni7SL9bLZQYyIPR9d2nuc';
            try {
                const response = await fetch(
                    "https://localhost:7108/api/collections/v1",
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                const data = await response.json();
                if (data.statusCode === 200) {
                    setCollection(data.data.map((collection) => ({
                        id: collection.id,
                        name: collection.collectionName,
                        description: collection.collectionDescription,
                        totalPoem: collection.totalChapter
                    })));
                }
            } catch (error) {
                console.error("Error fetching collections:", error);
            }
        };
        fetchCollections();
    }, []);

    const handleMoveToDetail = (collection) => {
        setSelectedCollection(collection);
    };

    const handleBack = () => {
        setSelectedCollection(null);
    };

    return (
            <div>
                {selectedCollection ? (
                    <div style={{ padding: "0px" }}>
                        {/* 🔙 Icon quay về */}
                        <div 
                            style={{ cursor: "pointer", color: "#007bff", fontSize: "18px", marginBottom: "10px" }}
                            onClick={handleBack}
                        >
                            <FiArrowLeft /> Quay về
                        </div>
        
                        {/* Component chi tiết */}
                        <YourCollectionDetail collection={selectedCollection} />
                    </div>
                ) : (
                    <nav style={{ display: 'flex', gap: "20px" }}>
                        <div style={{ flex: 2 }}>
                            <div style={{ marginBottom: "2%" }}>
                                <Button type="primary">Bộ sưu tập mới</Button>
                            </div>
                            
                            {collections.map((collection) => (
                                <div
                                    key={collection.id}
                                    style={{
                                        borderRadius: "2px",
                                        border: "1px solid black",
                                        display: 'flex',
                                        paddingRight: "2%",
                                        marginBottom: "2%",
                                        position: 'relative',
                                        gap: '2%'
                                    }}
                                >
                                    <div style={{ flex: 1, width: "120px", height: "120px" }}>
                                        <img 
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                            src="./@.png"
                                            alt="Ảnh cá nhân" 
                                        />
                                    </div>
                                    <div style={{ flex: 4, position: 'relative' }}>
                                        <div>
                                            <p style={{ marginBottom: '1%', fontWeight: 'bold' }}>
                                                {collection.name} - <span style={{ color: "#007bff", fontWeight: "500" }}>Tabooqq253</span>
                                            </p>
                                            <p style={{
                                                marginRight: '2%',
                                                marginBottom: '1%',
                                                marginTop: 0,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                maxWidth: "100%",
                                            }}>
                                                {collection.description}
                                            </p>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "20px", position: 'absolute', bottom: 10, width: '100%' }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <LuBook />
                                                <span>{collection.totalPoem ?? 0}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <MdOutlineKeyboardVoice />
                                                <span>24</span>
                                            </div>
        
                                            {/* Link "Xem tuyển tập" */}
                                            <div 
                                                style={{ marginLeft: "auto", color: "#007bff", fontWeight: "500", cursor: "pointer" }}
                                                onClick={() => handleMoveToDetail(collection)}
                                            >
                                                <nav>Xem tuyển tập &gt;</nav>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
        
                        {/* Thành tựu và thống kê */}
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    backgroundColor: "white",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    border: `1px solid black`,
                                    marginBottom: "15px",
                                }}
                            >
                                <h3 style={{ fontWeight: "bold" }}>Thành tựu cá nhân</h3>
                                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                                    <li>🏆 Cúp vàng bài viết tháng 8/2024</li>
                                    <li>🏆 Cúp đồng tác giả tháng 8/2024</li>
                                    <li>🏆 Cúp vàng bài viết tháng 7/2024</li>
                                    <li>🥈 Cúp bạc tác giả tháng 6/2024</li>
                                </ul>
                                <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
                            </div>
        
                            <div
                                style={{
                                    backgroundColor: "white",
                                    padding: "15px",
                                    borderRadius: "10px",
                                    border: `1px solid black`,
                                }}
                            >
                                <h3 style={{ fontWeight: "bold" }}>Thống kê người dùng</h3>
                                <ul style={{ marginTop: "5px", fontSize: "14px", color: "#555" }}>
                                    <li>Tổng bài viết: 2</li>
                                    <li>Tổng bộ sưu tập: 5</li>
                                    <li>Tổng audio cá nhân: 16</li>
                                    <li>Tổng lượt xem: 662</li>
                                    <li>Tổng lượt thích: 233</li>
                                    <li>Đang theo dõi: 60</li>
                                    <li>Người theo dõi: 1,585</li>
                                    <li>Bookmark bài viết: 35</li>
                                    <li>Bookmark bộ sưu tập: 12</li>
                                </ul>
                                <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
                            </div>
                        </div>
                    </nav>
                )}
            </div>
        );
        
};

export default YourCollection;
