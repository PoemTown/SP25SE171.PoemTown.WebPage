import { useEffect, useState } from "react";
import CollectionCard from "../../../components/componentHomepage/CollectionCard";
import PoemCard from "../../../components/componentHomepage/PoemCard";

const YourBookmark = () => {
    const [isBookmarkCollectionTab, setIsBookmarkCollectionTab] = useState(false);
    const [data, setData] = useState([]);
    const [collections, setCollections] = useState([]);
    const [bookmarkedCollections, setBookmarkedCollections] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [likedPosts, setLikedPosts] = useState({});
    const [isHovered, setIsHovered] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
        fetchData("https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem")
    }, []);

    const accessToken = localStorage.getItem("accessToken");

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
    };

    const handleLike = async (postId) => {
        const isCurrentlyLiked = likedPosts[postId];
        const method = isCurrentlyLiked ? "DELETE" : "POST";

        try {
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/likes/v1/${postId}`,
                { method, headers }
            );

            if (response.ok) {
                setLikedPosts(prev => ({
                    ...prev,
                    [postId]: !isCurrentlyLiked
                }));


                setData(prevData => prevData.map(item =>
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

    const handleBookmark = async (id, isCollection = false) => {
        const endpoint = isCollection
            ? `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection/${id}`
            : `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem/${id}`;

        const currentState = isCollection
            ? bookmarkedCollections[id]
            : bookmarkedPosts[id];

        try {
            const response = await fetch(endpoint, {
                method: currentState ? "DELETE" : "POST",
                headers
            });

            if (response.ok) {
                if (isCollection) {
                    setBookmarkedCollections(prev => ({
                        ...prev,
                        [id]: !currentState
                    }));
                } else {
                    setBookmarkedPosts(prev => ({
                        ...prev,
                        [id]: !currentState
                    }));
                }
            }
        } catch (error) {
            console.error("Error updating bookmark:", error);
        }
    };

    const fetchData = async (apiUrl) => {
        try {
            const requestHeaders = {
                "Content-Type": "application/json",
                ...(accessToken && { Authorization: `Bearer ${accessToken}` })
            };

            const response = await fetch(apiUrl, { headers: requestHeaders });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            if (apiUrl.includes('/collections/') || apiUrl.includes('target-marks/v1/collection')) {
                // Handle collections data
                const initialCollectionBookmarks = {};
                data.data.forEach(item => {
                    initialCollectionBookmarks[item.id] = !!item.targetMark;
                });
                setBookmarkedCollections(initialCollectionBookmarks);
                setCollections(data.data);
                setData([]); // Clear poem data
            } else {
                // Handle poems data
                const initialBookmarkedState = {};
                const initialLikedState = {};
                data.data.forEach(item => {
                    initialLikedState[item.id] = !!item.like;
                    initialBookmarkedState[item.id] = !!item.targetMark;
                });
                setBookmarkedPosts(initialBookmarkedState);
                setLikedPosts(initialLikedState);
                setData(data.data);
                setCollections([]); // Clear collection data
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    const handleChangeToBookmarkPoem = () => {
        setIsBookmarkCollectionTab(false)
        fetchData("https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem");
    }

    const handleChangeToBookmarkCollection = () => {
        setIsBookmarkCollectionTab(true)
        fetchData("https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection");
    }

    return (
        <div style={{display: "flex", gap: "40px", margin: "20px 129px" }}>
            <div style={{flex: 2}}>
                <div>
                    <button style={isBookmarkCollectionTab ? styles.toggleBookmarkPoem : styles.toggleBookmarkPoemActive}
                        onClick={handleChangeToBookmarkPoem}
                    >
                        Bài thơ
                    </button>
                    <button style={isBookmarkCollectionTab ? styles.toggleBookmarkCollectionActive : styles.toggleBookmarkCollection}
                        onClick={handleChangeToBookmarkCollection}
                    >
                        Tập thơ
                    </button>
                    <hr style={{ border: "2px solid #FFD557", borderRadius: "5px" }} />
                </div>
                <div>
                    {data.map((item) => (
                        <PoemCard
                            key={item.id}
                            item={item}
                            liked={likedPosts[item.id]}
                            bookmarked={bookmarkedPosts[item.id]}
                            onBookmark={handleBookmark}
                            onLike={handleLike}
                            onHover={setIsHovered}
                        />
                    ))}
                    {collections.map((item) => (
                        <CollectionCard
                            key={item.id}
                            item={item}
                            onBookmark={handleBookmark}
                            isBookmarked={bookmarkedCollections[item.id] || false}
                        />
                    ))}
                </div>
            </div >
            <div style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "328px",
                flex: 1
            }}>
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
        </div>


    )
}

const styles = {
    toggleBookmarkPoem: {
        backgroundColor: "white",
        border: "1px solid #00000080",
        color: "#000",
        padding: "10px",
        borderRadius: "10px 0 0 10px",
        fontSize: "16px",
    },

    toggleBookmarkPoemActive: {
        backgroundColor: "#FFCD37B3",
        border: "2px solid #FFC823",
        color: "#fff",
        fontWeight: "bold",
        padding: "10px",
        borderRadius: "10px 0 0 10px",
        fontSize: "16px",
    },

    toggleBookmarkCollection: {
        backgroundColor: "white",
        border: "1px solid #00000080",
        color: "#000",
        padding: "10px",
        borderRadius: "0 10px 10px 0",
        fontSize: "16px",
    },

    toggleBookmarkCollectionActive: {
        backgroundColor: "#FFCD37B3",
        border: "2px solid #FFC823",
        color: "#fff",
        fontWeight: "bold",
        padding: "10px",
        borderRadius: "0 10px 10px 0",
        fontSize: "16px",

    },

}

export default YourBookmark;