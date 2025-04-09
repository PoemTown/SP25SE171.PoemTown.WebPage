import { message, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { LuBook } from "react-icons/lu";
import { MdEdit, MdOutlineKeyboardVoice } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import PoemCard from "../components/componentHomepage/PoemCard";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";

const CollectionDetail = () => {
    const [data, setData] = useState({
        id: null,
        collectionName: "",
        collectionDescription: "",
        collectionImage: "",
        rowVersion: "",
    });
    const { id } = useParams();
    const accessToken = localStorage.getItem("accessToken");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
    };
    const [poems, setPoem] = useState([]);
    const [collections, setCollections] = useState([]);
    const [collectionDetails, setCollectionDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [likedPosts, setLikedPosts] = useState({});
    const [isHovered, setIsHovered] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const fetchData = async () => {

            try {
                //  Gọi API lấy chi tiết bộ sưu tập
                const response1 = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/collections/v1/${id}/detail`,
                    { headers: requestHeaders }
                );
                const data1 = await response1.json();
                if (data1.statusCode === 200) {
                    setCollectionDetails(data1.data);
                    console.log("Collection Details:", data1.data);
                }

                // Gọi API lấy danh sách bài thơ trong bộ sưu tập
                const response2 = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/poems/v1/${id}`,
                    { headers: requestHeaders }
                );
                const data2 = await response2.json();
                if (data2.statusCode === 200) {
                    const initialBookmarkedState = {};
                    const initialLikedState = {};

                    data2.data.forEach(item => {
                        initialLikedState[item.id] = !!item.like;
                        initialBookmarkedState[item.id] = !!item.targetMark;
                    });

                    const collectionInfo = {
                        id: data1.data.id,
                        collectionName: data1.data.collectionName,
                    };

                    const updatedPoems = data2.data.map(item => ({
                        ...item,
                        collection: collectionInfo,
                      }));

                    setPoem(updatedPoems);
                    setBookmarkedPosts(initialBookmarkedState);
                    setLikedPosts(initialLikedState);

                    console.log("Poems:", updatedPoems);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false); // <-- Tắt loading sau khi fetch xong
            }
        };
        fetchCollections();
        fetchData();
    }, [id, reloadTrigger]);

    const fetchCollections = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1`,
                {
                    headers: requestHeaders,
                }
            );
            const data = await response.json();
            if (data.statusCode === 200) {
                console.log("Response:", data.data);
                setCollections(data.data.map((collection) => ({
                    id: collection.id,
                    name: collection.collectionName,
                })));
            }
        } catch (error) {
            console.error("Error fetching collections:", error);
        }
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

            console.log("Update Response:", response.data);
            setReloadTrigger((prev) => !prev);

            message.success("Cập nhật tập thơ thành công!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.errorMessage);
            message.error(error.response?.data.errorMessage);
        }

        console.log("Chuyển bài thơ:", collectionId, poemId);
    };


    
    const handleUpdate = async () => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Update Response:", response.data);
            setReloadTrigger((prev) => !prev);

            message.success("Cập nhật tập thơ thành công!");
        } catch (error) {
            console.error("Error:", error.response?.data || error.errorMessage);
            message.error(error.response?.data.errorMessage);
        }
    };

    const handleMoveToUpdate = () => {
        
    };

    const handleLike = async (postId) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

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

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}-${month}-${year}`;
    }

    const handleBookmark = async (id) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

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
            <div>
                {isLoggedIn ? <Headeruser /> : <Headerdefault />}

                <div
                    style={{ cursor: "pointer", color: "#007bff", fontSize: "18px", marginBottom: "10px", marginLeft: "20px", marginTop: "20px", fontWeight: "bold" }}
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft /> Quay về
                </div>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <div style={{ margin: '0 auto', padding: '5px' }}>
                        <div
                            key={id}
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
                                        width: "260px", height: "146px", objectFit: "cover", borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px"
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
                            {collectionDetails.isMine ?
                                <div onClick={handleMoveToUpdate} style={{ color: "#007bff", cursor: 'pointer', fontSize: '1rem' }}>
                                    Chỉnh sửa <span><MdEdit /></span>
                                </div>
                                :
                                <></>}
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", gap: "40px" }}>
                        <div style={{ flex: 7, display: "flex", flexDirection: "column", gap: "15px" }}>
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
                        <div style={{ flex: 3, minWidth: "300px" }}>
                            <div style={{
                                backgroundColor: "white",
                                borderRadius: "10px",
                                border: `1px solid #aaa`,
                                padding: "15px",
                                marginBottom: "15px"
                            }}>
                                <h3 style={{ fontWeight: "bold", textAlign: 'center', margin: "0" }}>Thống kê tập thơ</h3>
                                <ul style={{ fontSize: "14px", color: "#000", listStyle: "none", padding: 0, }}>
                                    <li><span style={{ fontWeight: "bold" }}>Tổng số bài thơ:</span> <span >{collectionDetails.totalChapter}</span></li>
                                    <li><span style={{ fontWeight: "bold" }}>Tổng số audio:</span> <span>{collectionDetails.totalRecord}</span></li>
                                    <li><span style={{ fontWeight: "bold" }}>Ngày phát hành:</span> <span>{formatDate(collectionDetails.createdTime)}</span></li>
                                    <li><span style={{ fontWeight: "bold" }}>Cập nhật gần nhất:</span> <span>{formatDate(collectionDetails.lastUpdatedTime)}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default CollectionDetail;