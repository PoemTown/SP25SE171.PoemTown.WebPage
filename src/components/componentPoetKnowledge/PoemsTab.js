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

    useEffect(() => {
        const storedRoles = JSON.parse(localStorage.getItem("role")) || [];
        setRoles(storedRoles);
        fetchPoems();
    }, [poetId]);

    const fetchPoems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/poems/v1/poet-sample/${poetId}`,
            );
            
            if (response.data && response.data.data) {
                setPoems(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching poems:", error);
            message.error("Đã có lỗi xảy ra khi tải danh sách thơ");
        } finally {
            setLoading(false);
        }
    };

    const canCreatePoem = roles.includes("ADMIN") || roles.includes("MODERATOR");

    const handleBookmark = async (poemId) => {
        try {
            // Gọi API bookmark
            const response = await axios.post(
                `https://api-poemtown-staging.nodfeather.win/api/bookmarks/v1/${poemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.success) {
                // Cập nhật trạng thái bookmark
                if (bookmarkedPoems.includes(poemId)) {
                    setBookmarkedPoems(bookmarkedPoems.filter(id => id !== poemId));
                } else {
                    setBookmarkedPoems([...bookmarkedPoems, poemId]);
                }
            }
        } catch (error) {
            console.error("Error bookmarking poem:", error);
            message.error("Đã có lỗi xảy ra khi đánh dấu bài thơ");
        }
    };

    const handleLike = async (poemId) => {
        try {
            // Gọi API like
            const response = await axios.post(
                `https://api-poemtown-staging.nodfeather.win/api/likes/v1/${poemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.success) {
                // Cập nhật trạng thái like
                if (likedPoems.includes(poemId)) {
                    setLikedPoems(likedPoems.filter(id => id !== poemId));
                } else {
                    setLikedPoems([...likedPoems, poemId]);
                }
                // Cập nhật danh sách bài thơ để refresh số lượng like
                fetchPoems();
            }
        } catch (error) {
            console.error("Error liking poem:", error);
            message.error("Đã có lỗi xảy ra khi thích bài thơ");
        }
    };

    const handleMove = async (collectionId, poemId) => {
        try {
            // Gọi API di chuyển bài thơ
            const response = await axios.put(
                `https://api-poemtown-staging.nodfeather.win/api/poems/v1/${poemId}/move/${collectionId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.success) {
                message.success("Đã di chuyển bài thơ thành công");
                fetchPoems(); // Refresh danh sách
            }
        } catch (error) {
            console.error("Error moving poem:", error);
            message.error("Đã có lỗi xảy ra khi di chuyển bài thơ");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
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
                        marginBottom: "20px",
                    }}
                >
                    SÁNG TÁC THƠ
                </button>
            )}

            {isCreatingPoem ? (
                <CreatePoemForPoetSample
                    collections={collections}
                    poetId={poetId}
                    setDrafting={false}
                    onBack={() => {
                        setIsCreatingPoem(false);
                        fetchPoems(); // Refresh danh sách sau khi tạo mới
                    }}
                />
            ) : (
                <Spin spinning={loading}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {poems.length > 0 ? (
                            poems.map((poem) => (
                                <PoemCard
                                    key={poem.id}
                                    item={poem}
                                    bookmarked={bookmarkedPoems.includes(poem.id)}
                                    liked={likedPoems.includes(poem.id)}
                                    onBookmark={handleBookmark}
                                    onLike={handleLike}
                                    collections={collections}
                                    handleMove={handleMove}
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