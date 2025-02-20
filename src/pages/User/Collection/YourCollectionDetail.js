import React, { useEffect } from "react";
import { Button } from 'antd';
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { FiThumbsUp, FiBookmark } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
const YourCollectionDetail = ({ collection }) => {
    useEffect(() => {

    }, []);

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

            <div style={{ display: 'flex', gap: "20px" }}>
                <div style={{ flex: 2 }}>
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
                                <strong>KalenGuy34</strong> <span style={{ color: "#777" }}> - 27 tháng 11, 2024</span>
                            </div>
                        </div>

                        {/* Content */}
                        <h3 style={{ margin: "5px 0" }}>Chương I: Bùa chú quỷ quyệt</h3>
                        <p style={{ color: "#555", fontSize: "14px" }}>
                            Mô tả: Sự ra đi như đã được dự báo của chú bảy đã dẫn đến hàng loạt thảm kịch sau đó
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
                            {"  Lang thang khắp chốn rừng già\n" +
                                "Cỏ cây quy tụ, hồn trời khắp ngách\n" +
                                "Lão bảy cầm cần ngư dân\n" +
                                "Đứng lặng chết thinh, hình bóng phai dần aaaaaa\n" +
                                "Đứng lặng chết thinh, hình bóng phai dần\n" +
                                "Đứng lặng chết thinh, hình bóng phai dần\n" +
                                "Đứng lặng chết thinh, hình bóng phai dần\n" +
                                "Đứng lặng chết thinh, hình bóng phai dần\n" +
                                "Đứng lặng chết thinh, hình bóng phai dần"
                               
                            }
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

                {/* Thống kê */}
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            border: `1px solid black`,
                            marginBottom: "15px",
                            width: '300px'

                        }}
                    >
                        <h3 style={{ fontWeight: "bold", textAlign: 'center' }}>Thông kê tập thơ</h3>
                        <ul style={{ fontSize: "14px", color: "#555" }}>
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
