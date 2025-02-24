import React, { useEffect, useState } from "react";
import { Button, Dropdown, Menu, message } from 'antd';
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { IoIosMore } from "react-icons/io";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { FiThumbsUp, FiBookmark, FiArrowLeft } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
import CreateCollection from "./CreateCollection";
import axios from "axios";
const YourCollectionDetail = ({ collection, handleBack }) => {
    const [poems, setPoem] = useState([]);
    const [collectionDetails, setCollectionDetails] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(0);
    const accessToken = localStorage.getItem("accessToken");
    useEffect(() => {
        const fetchData = async () => {
            console.log(collection);
           
    
            try {
                //  Gọi API lấy chi tiết bộ sưu tập
                const response1 = await fetch(
                    `https://api-poemtown-staging.nodfeather.win/api/collections/v1/${collection.id}/detail`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const data1 = await response1.json();
                if (data1.statusCode === 200) {
                    setCollectionDetails(data1.data);
                    console.log("Collection Details:", data1.data);
                }
    
                // Gọi API lấy danh sách bài thơ trong bộ sưu tập
                const response2 = await fetch(
                    `https://api-poemtown-staging.nodfeather.win/api/poems/v1/${collection.id}`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                const data2 = await response2.json();
                if (data2.statusCode === 200) {
                    setPoem(data2.data);
                    console.log("Poems:", data2.data);
                }
    
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        fetchData();
    }, [reloadTrigger]);

    const handleDelete = () => {
        console.log("Xóa bài thơ:");
    };

    const handleMove = async(collectionId, poemId) => {
        try {
            
                const response = await axios.put(
                    `https://api-poemtown-staging.nodfeather.win/api/collections/v1/${collectionId}/${poemId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log("Update Response:", response.data);
                message.success("Cập nhật tập thơ thành công!");
                // 🆕 Nếu không có selectedCollection → tạo tập thơ mới
                console.log("Create Response:", response.data);
                message.success("Tạo tập thơ thành công!");
        } catch (error) {
            console.error("Error:", error);
            message.error("Có lỗi xảy ra!");
        }
        setReloadTrigger((prev) => !prev);
        console.log("Chuyển bài thơ:");
    };

    //----------------------------------------------------------------------------------------//
    function formatDate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getUTCDate()).padStart(2, '0'); // Lấy ngày (DD)
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Lấy tháng (MM)
        const year = date.getUTCFullYear(); // Lấy năm (YYYY)

        return `${day}-${month}-${year}`;
    }

    const menu = (
        <Menu>
            <Menu.Item key="delete" onClick={handleDelete}>
                ❌ Xóa bài thơ
            </Menu.Item>
            <Menu.Item key="move" onClick={handleMove}>
                🔄 Chuyển bài thơ
            </Menu.Item>
        </Menu>
    );
    const handleMoveToUpdate = () => {
        setSelectedCollection(1); 
    };

    const handleBackDetail = () => {
        setSelectedCollection(0); 
        setReloadTrigger((prev) => !prev); 
    };


    return (
        <div>

            {selectedCollection === 0 ? (
                <div>
                    <div
                        style={{ cursor: "pointer", color: "#007bff", fontSize: "18px", marginBottom: "10px" }}
                        onClick={handleBack}
                    >
                        <FiArrowLeft /> Quay về
                    </div>
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
                                        {collectionDetails.collectionName}
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
                                        {collectionDetails.collectionDescription}
                                    </p>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "20px", position: 'absolute', bottom: 10, width: '100%' }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <LuBook />
                                        <span>{collectionDetails.totalChapter}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        <MdOutlineKeyboardVoice />
                                        <span>{collectionDetails.totalRecord}</span>
                                    </div>
                                </div>
                            </div>
                            <div onClick={handleMoveToUpdate} style={{ color: "#007bff", cursor: 'pointer' }}>
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
                                            <Dropdown overlay={menu} trigger={["click"]}>
                                                <div style={{ marginLeft: "auto", cursor: "pointer" }}>
                                                    <IoIosMore size={20} />
                                                </div>
                                            </Dropdown>
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
                                    <li>Tổng bài viết: <span>{collectionDetails.totalChapter}</span></li>
                                    <li>Tổng audio : <span>{collectionDetails.totalRecord}</span></li>
                                    
                                    <li>Ngày phát hành: <span>{formatDate(collectionDetails.createdTime)}</span></li>
                                    <li>Cập nhật gần nhất: <span>{formatDate(collectionDetails.lastUpdatedTime)}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: "0px" }}>
                    <CreateCollection handleBackDetail={handleBackDetail} collection={collectionDetails}/>
                </div>
            )}
        </div>
    );

};

export default YourCollectionDetail;
