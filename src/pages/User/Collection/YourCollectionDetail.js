import React, { useEffect, useState } from "react";
import { Button } from 'antd';
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { FiThumbsUp, FiBookmark } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
const YourCollectionDetail = ({ collection }) => {
    const [poems, setPoem] = useState([]);

    useEffect(() => {
        const fetchPoemsByCollection = async () => {
            console.log(collection.id);
            const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxN2I4ZjQ1NC0xZjkwLTQyODAtZGNjNy0wOGRkNGI3MWViNTIiLCJUb2tlbkhhc2giOiI2NmNhN2RlZjFiZjE5NjU2Y2ZjYmI5ZjAyM2ZkNDQ1YjIzYWVmMmNlOTI2ODI2ODJkMDg1NDczZWY1MmNhMGI2Iiwicm9sZSI6IlVTRVIiLCJuYmYiOjE3NDAyMTc5NjgsImV4cCI6MTc0MDIyMTU2OCwiaWF0IjoxNzQwMjE3OTY4LCJpc3MiOiJZb3VyQXBwSXNzdWVyIiwiYXVkIjoiWW91ckFwcEF1ZGllbmNlIn0.HlcCm5fcuEe6xao1VmfnFOkG9OLSoKXq6tqf4KdVq14';
            try {
                const response = await fetch(
                    `https://localhost:7108/api/poems/v1/${collection.id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                const data = await response.json();
                if (data.statusCode === 200) {
                    setPoem(data.data);
                    console.log(data.data);
                }
            } catch (error) {
                console.error("Error fetching collections:", error);
            }
        };
        fetchPoemsByCollection();
    }, []);

    function formatDate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getUTCDate()).padStart(2, '0'); // Lấy ngày (DD)
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Lấy tháng (MM)
        const year = date.getUTCFullYear(); // Lấy năm (YYYY)
        
        return `${day}-${month}-${year}`;
    }

    const handleUpdate = () => {
        
    };
    return (
        <>
            <div style={{ width: '80%', margin: '0 auto', padding: '5px' }}>
                <div
                    key={collection.id}
                    style={{
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
                                {collection.name}
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
                                <span>{collection.totalPoem}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <MdOutlineKeyboardVoice />
                                <span>24</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ color: "#007bff", cursor: 'pointer' }}>
                        Chỉnh sửa <span><MdEdit /></span>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                {/* Phần danh sách bài thơ (BÊN TRÁI) */}
                <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "15px" }}>
                    {poems.map((poem) => (
                        <div key={poem.id} style={{ flex: "1" }}>
                            <div style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "15px",
                                backgroundColor: "#fff",
                                fontFamily: "Arial, sans-serif",
                                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)"
                            }}>
                                {/* Header */}
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                                    <img
                                        src="./@.png"
                                        alt="Avatar"
                                        style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
                                    />
                                    <div>
                                        <strong>{poem.user.displayName} -</strong> <span style={{ color: "#777" }}> {formatDate(poem.createdTime)}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 style={{ margin: "5px 0" }}>{poem.title}</h3>
                                <p style={{ color: "#555", fontSize: "14px" }}>
                                    {poem.description}
                                </p>

                                <blockquote style={{
                                    fontStyle: "italic",
                                    borderRadius: "5px",
                                    paddingLeft: '10px',
                                    color: "#444",
                                    fontSize: "14px",
                                    maxWidth: "100%",
                                    whiteSpace: "pre-line", // Giữ dấu xuống dòng
                                    lineHeight: "1.6",
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 4, // Giới hạn 4 dòng
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}>
                                    {poem.content}
                                </blockquote>

                                <p style={{ fontWeight: "bold", color: "#007bff", fontSize: "14px" }}>Tập thơ: {collection.name}</p>

                                {/* Footer */}
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginTop: "10px",
                                    fontSize: "14px",
                                    color: "#777"
                                }}>
                                    <div style={{ display: "flex", gap: "15px" }}>
                                        <span><FiThumbsUp /> 3.150</span>
                                        <span><FaRegComment /> 1.253</span>
                                        <span><FiBookmark /> 675</span>
                                    </div>
                                    <a href="#" style={{ color: "#007bff", textDecoration: "none" }}>Xem bài thơ &gt;</a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Phần thống kê (BÊN PHẢI) */}
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <div style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        border: `1px solid black`,
                        padding: "15px",
                        marginBottom: "15px"
                    }}>
                        <h3 style={{ fontWeight: "bold", textAlign: 'center' }}>Thống kê tập thơ</h3>
                        <ul style={{ fontSize: "14px", color: "#555", listStyle: "none", padding: 0 }}>
                            <li>Tổng bài viết: <span>16</span></li>
                            <li>Tổng audio : <span>14</span></li>
                            <li>Tổng lượt theo dõi: <span>2.148</span></li>
                            <li>Ngày phát hành: <span>14/8/2023</span></li>
                            <li>Cập nhật gần nhất: <span>27/11/2024</span></li>
                        </ul>
                    </div>
                </div>
            </div>

        </>
    );
};

export default YourCollectionDetail;
