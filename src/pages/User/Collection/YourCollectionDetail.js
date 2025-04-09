import React, { useEffect, useState } from "react";
import { Button, Dropdown, Menu, message, Modal, Spin } from 'antd';
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { IoIosMore } from "react-icons/io";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { FiThumbsUp, FiBookmark, FiArrowLeft } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
import CreateCollection from "./CreateCollection";
import axios from "axios";
import PoemCard from "../../../components/componentHomepage/PoemCard";

const YourCollectionDetail = ({ collection, handleBack, avatar }) => {
    const [poems, setPoem] = useState([]);
    const [collectionDetails, setCollectionDetails] = useState([]);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(0);
    const [collections, setCollections] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [data, setData] = useState([]);

    const [moveMenuItems, setMoveMenuItems] = useState([]);
    const [selectedPoemId, setSelectedPoemId] = useState(null);
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [likedPosts, setLikedPosts] = useState({});


    const accessToken = localStorage.getItem("accessToken");
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
    };
    const [isLoading, setIsLoading] = useState(true); // <-- Thêm state isLoading

    useEffect(() => {
        fetchCollections();
        fetchData();
    }, [collection, reloadTrigger]);
    const fetchData = async () => {
        console.log(collection);

        try {
            //  Gọi API lấy chi tiết bộ sưu tập
            const response1 = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1/${collection.id}/detail`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data1 = await response1.json();
            if (data1.statusCode === 200) {
                setCollectionDetails(data1.data);
                console.log("Collection Details:", data1.data);
            }

            // Gọi API lấy danh sách bài thơ trong bộ sưu tập
            const response2 = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/${collection.id}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const data2 = await response2.json();
            if (data2.statusCode === 200) {
                const initialBookmarkedState = {};
                const initialLikedState = {};

                data2.data.forEach(item => {
                    initialLikedState[item.id] = !!item.like;
                    initialBookmarkedState[item.id] = !!item.targetMark;
                });
                setPoem(data2.data);
                setBookmarkedPosts(initialBookmarkedState);
                setLikedPosts(initialLikedState);

                console.log("Poems:", data2.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false); // <-- Tắt loading sau khi fetch xong
        }
    };
    const fetchCollections = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const data = await response.json();
            if (data.statusCode === 200) {
                console.log("Response:", data.data);
                setCollections(data.data.map((collection) => ({
                    id: collection.id,
                    name: collection.collectionName,
                })));
                console.log(collections)
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
        }
    };

    const handleDelete = () => {
        console.log("Xóa bài thơ:");
    };

    const handleMove = async (collectionId, poemId) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1/${collectionId}/${poemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setReloadTrigger((prev) => !prev);
            console.log("Chuyển bài thơ:", collectionId, poemId);
            console.log("Update Response:", response.data);
            message.success("Cập nhật tập thơ thành công!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.errorMessage);
            message.error(error.response?.data.errorMessage);
        }
        
    };

    function formatDate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}-${month}-${year}`;
    }

    const handleMouseEnter = (poemId) => {
        console.log("SubMenu được mở, gọi API hoặc cập nhật dữ liệu...");
        fetchCollections();
        console.log("aaaa" + collections);
        setMoveMenuItems(
            collections.map((collection) => (
                <Menu.Item key={collection.id} onClick={() => handleMove(collection.id, poemId)}>
                    📂 {collection.name}
                </Menu.Item>
            ))
        );
    };

    const menu = (poemId) => (
        <Menu>
            <Menu.Item key="delete" onClick={handleDelete}>
                
            </Menu.Item>
            <Menu.SubMenu key="move" title="🔄 Chuyển bài thơ" onTitleMouseEnter={() => handleMouseEnter(poemId)}>
                {moveMenuItems.length > 0 ? moveMenuItems : <Menu.Item>Đang tải...</Menu.Item>}
            </Menu.SubMenu>
        </Menu>
    );
    const handleMoveToUpdate = () => {
        setSelectedCollection(1);
    };

    const handleBackDetail = () => {
        setSelectedCollection(0);
        setReloadTrigger((prev) => !prev);
    };


    const handleLike = async (postId) => {

        const isCurrentlyLiked = likedPosts[postId];
        const method = isCurrentlyLiked ? "DELETE" : "POST";

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${postId}`,
                { method, headers }
            );

            if (response.ok) {
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: !isCurrentlyLiked
                }));


                setPoem(prevData => prevData.map(item =>
                    item.id === postId ? {
                        ...item,
                        likeCount: isCurrentlyLiked ? item.likeCount - 1 : item.likeCount + 1
                    } : item
                ));
            }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };


    const handleBookmark = async (id) => {

        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`;

        const currentState = bookmarkedPosts[id];

        try {
            const response = await fetch(endpoint, {
                method: currentState ? "DELETE" : "POST",
                headers
            });

            if (response.ok) {
                setBookmarkedPosts(prev => ({
                    ...prev,
                    [id]: !currentState
                }));
            }
        } catch (error) {
            console.error("Error updating bookmark:", error);
        }
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

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
                    <div style={{ margin: '0 auto', padding: '5px' }}>
                        <div
                            key={collection.id}
                            style={{
                                display: 'flex',
                                padding: "16px",
                                marginBottom: "20px",
                                position: 'relative',
                                gap: '16px',
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                backgroundColor: '#fff',
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    width: "260px",
                                    height: "146px",
                                    display: "flex",
                                    justifyContent: "center", // căn giữa theo chiều ngang
                                    alignItems: "center",     // căn giữa theo chiều dọc
                                }}
                            >
                                <img
                                    src={collectionDetails.collectionImage ? collectionDetails.collectionImage : "./collection1.png"}
                                    alt="Ảnh bộ sưu tập"
                                    style={{
                                        maxHeight: "100%",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                    }}
                                />
                            </div>

                            <div style={{ flex: 4, position: 'relative', paddingBottom: '50px' /* thêm padding dưới */ }}>
                                <div>
                                    <p style={{ marginBottom: '2%', fontWeight: 'bold', fontSize: '1.2rem', marginTop: "0" }}>
                                        Bộ sưu tập: {collectionDetails.collectionName}
                                    </p>
                                    <p
                                        style={{
                                            marginRight: '2%',
                                            marginBottom: '1%',
                                            marginTop: '1%',
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            maxWidth: "100%",
                                            fontSize: '1rem',
                                            color: "#555"
                                        }}
                                    >
                                        Mô tả: {collectionDetails.collectionDescription}
                                    </p>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "20px",
                                        position: 'absolute',
                                        bottom: 10,
                                        width: '100%',
                                    }}
                                >
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

                            <div onClick={handleMoveToUpdate} style={{ color: "#007bff", cursor: 'pointer', fontSize: '1rem' }}>
                                Chỉnh sửa <span><MdEdit /></span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        {poems.map((poem) => (

                            <PoemCard
                                key={poem.id} 
                                item={poem}
                                liked={likedPosts[poem.id]}
                                bookmarked={bookmarkedPosts[poem.id]}
                                onBookmark={handleBookmark}
                                onLike={handleLike}
                                onHover={setIsHovered}
                                collections={collections}
                                handleMove={handleMove}
                            />

                        ))}
                    </div>

                    {/* <div style={{ flex: 1, minWidth: "300px" }}>
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
                        </div> */}
                </div>
            ) : (
                <div style={{ padding: "0px" }}>
                    <CreateCollection handleBackDetail={handleBackDetail} collection={collectionDetails} />
                </div>
            )}
        </div>
    );
};

export default YourCollectionDetail;
