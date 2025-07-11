import React, { useState, useEffect } from "react";
import { Spin, message } from "antd";
import CreatePoemForPoetSample from "./CreatePoemForPoetSample";
import PoemCard from "../componentHomepage/PoemPoetSampleCard";
import axios from "axios";

const PoemsTab = ({ collections, poetId }) => {
    const [isCreatingPoem, setIsCreatingPoem] = useState(false);
    const [roles, setRoles] = useState([]);
    const [poems, setPoems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookmarkedPoems, setBookmarkedPoems] = useState([]);
    const [likedPoems, setLikedPoems] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const storedRoles = JSON.parse(localStorage.getItem("role")) || [];
        setRoles(storedRoles);
        fetchPoems();
    }, [poetId]);

    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    const fetchPoems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/poet-sample/${poetId}`,
                {
                    headers: requestHeaders,
                }
            );

            if (response.data && response.data.data) {
                setPoems(response.data.data);
                const initialBookmarkedState = {};
                response.data.data.forEach(item => {
                    initialBookmarkedState[item.id] = !!item.targetMark;
                });
                setBookmarkedPoems(initialBookmarkedState);
            }
        } catch (error) {
            console.error("Error fetching poems:", error);
            message.error("Đã có lỗi xảy ra khi tải danh sách thơ");
        } finally {
            setLoading(false);
        }
    };

    const canCreatePoem = roles.includes("ADMIN") || roles.includes("MODERATOR");

    const handleBookmark = async (id) => {
        try {
            if (!isLoggedIn) {
                message.error("Vui lòng đăng nhập để sử dụng chức năng này");
                return;
            }
            const endpoint = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`;

            const currentState = bookmarkedPoems[id];
            const response = await fetch(endpoint, {
                method: currentState ? "DELETE" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                setBookmarkedPoems(prev => ({
                    ...prev,
                    [id]: !currentState
                }));
            }
        } catch (error) {
            console.error("Error bookmarking poem:", error);
            message.error("Đã có lỗi xảy ra khi đánh dấu bài thơ");
        }
    };

    const handleLike = async (poemId) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${poemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.success) {
                if (likedPoems.includes(poemId)) {
                    setLikedPoems(likedPoems.filter(id => id !== poemId));
                } else {
                    setLikedPoems([...likedPoems, poemId]);
                }
                fetchPoems();
            }
        } catch (error) {
            console.error("Error liking poem:", error);
            message.error("Đã có lỗi xảy ra khi thích bài thơ");
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

            if (response.data.statusCode === 200) {
                message.success("Đã di chuyển bài thơ thành công");
                fetchPoems();
            }
        } catch (error) {
            console.error("Error moving poem:", error);
            message.error("Đã có lỗi xảy ra khi di chuyển bài thơ");
        }
    };

    return (
        <div style={{ padding: "0", maxWidth: "1200px" }}>
            {canCreatePoem && !isCreatingPoem && (
                <button
                    onClick={() => setIsCreatingPoem(true)}
                    style={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "12px 20px",
                        borderRadius: "5px",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "block",
                        marginTop: "10px",
                        marginLeft: "40px",
                        marginBottom: "40px"
                    }}
                >
                    SÁNG TÁC THƠ
                </button>
            )}

            {isCreatingPoem ? (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                    paddingTop: "40px",
                    paddingLeft: "30%"
                }}>
                    <div style={{
                        maxWidth: "800px",
                        width: "100%",
                        padding: "0 40px",
                        margin: "0 auto",
                    }}>

                        <CreatePoemForPoetSample
                            collections={collections}
                            poetId={poetId}
                            setDrafting={false}
                            onBack={() => {
                                setIsCreatingPoem(false);
                                fetchPoems();
                            }}
                            onPoemCreated={fetchPoems}
                        />
                    </div>
                </div>
            ) : (
                <Spin spinning={loading}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                        {poems.length > 0 ? (
                            poems.map((poem) => (
                                <PoemCard
                                    key={poem.id}
                                    item={poem}
                                    bookmarked={bookmarkedPoems[poem.id] || false}
                                    liked={likedPoems.includes(poem.id)}
                                    onBookmark={handleBookmark}
                                    onLike={handleLike}
                                    collections={collections}
                                    handleMove={handleMove}
                                    poetId={poetId}
                                    onPoemCreated={fetchPoems}
                                />
                            ))
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "40px",
                                color: "#666",
                                fontSize: "16px"
                            }}>
                                {loading ? "Đang tải..." : "Chưa có bài thơ nào trong tập này"}
                            </div>
                        )}
                    </div>
                </Spin>
            )}
        </div>
    );
};

export default PoemsTab;