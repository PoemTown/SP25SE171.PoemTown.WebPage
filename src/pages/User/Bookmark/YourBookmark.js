import { useEffect, useState } from "react";
import CollectionCard from "../../../components/componentHomepage/CollectionCard";
import PoemCard from "../../../components/componentHomepage/PoemCard";
import { message } from "antd";

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
        fetchData(`${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem`)
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
                `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${postId}`,
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
        if (isLoggedIn === false) {
            message.error("Vui lòng đăng nhập để sử dụng chức năng này!");
            return;
        }
        const endpoint = isCollection
            ? `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection/${id}`
            : `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`;

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
        fetchData(`${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem`);
    }

    const handleChangeToBookmarkCollection = () => {
        setIsBookmarkCollectionTab(true)
        fetchData(`${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection`);
    }

    return (
        <div style={{display: "flex", gap: "40px", margin: "0", width: "100%" }}>
            <div style={{width: "100%"}}>
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
                <div style={{}}>
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