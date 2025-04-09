import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Input, Spin, Empty, Card, Avatar, message, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import PoemCard from '../components/componentHomepage/PoemCard';
import CollectionCard from '../components/componentHomepage/CollectionCard';
import UserCard from '../components/componentHomepage/UserCard';

const { TabPane } = Tabs;
const { Search } = Input;
const { Meta } = Card;

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ poem: [], collection: [], user: [] });
    const [error, setError] = useState('');
    const [likedPosts, setLikedPosts] = useState({});
    const [bookmarkedCollections, setBookmarkedCollections] = useState({});
    const [bookmarkedPosts, setBookmarkedPosts] = useState({});
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const accessToken = localStorage.getItem("accessToken");

    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    const query = searchParams.get('query') || '';
    const type = searchParams.get('type') || 'poem';

    const searchApis = {
        poem: `${process.env.REACT_APP_API_BASE_URL}/poems/v1/posts?filterOptions.title=${query}`,
        collection: `${process.env.REACT_APP_API_BASE_URL}/collections/v1/all?filterOptions.collectionName=${query}`,
        user: `${process.env.REACT_APP_API_BASE_URL}/users/v1?filterOptions.userName=${query}`,
    };

    // Example API service functions

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        console.log("results: ", results);
    }, [results])


    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response = await axios.get(searchApis[type], {
                    headers: requestHeaders
                });

                setResults(prev => ({ ...prev, [type]: response.data.data }));
                console.log(response.data);
                if (type === "collection") {
                    const initialCollectionBookmarks = {};
                    response.data.data.forEach(item => {
                        initialCollectionBookmarks[item.id] = !!item.targetMark;
                    });
                    setBookmarkedCollections(initialCollectionBookmarks);
                } else if (type === "poem") {
                    const initialBookmarkedState = {};
                    const initialLikedState = {};
                    response.data.data.forEach(item => {
                        initialLikedState[item.id] = !!item.like;
                        initialBookmarkedState[item.id] = !!item.targetMark;
                    });
                    setBookmarkedPosts(initialBookmarkedState);
                    setLikedPosts(initialLikedState);
                    setError('');
                }
            } catch (err) {
                setError('Error fetching results');
            }
            setLoading(false);
        };

        fetchResults();
    }, [searchParams]);

    const handleSearch = (value) => {
        setSearchParams({ query: value, type });
    };

    const handleTabChange = (activeKey) => {
        setSearchParams({ query, type: activeKey });
    };

    const handleBookmark = async (id, isCollection = false) => {
        if (!isLoggedIn) {
            message.error("Vui lòng đăng nhâp để sử dụng chức năng này");
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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
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

    const handleLike = async (postId) => {
        if (!isLoggedIn) {
            message.error("Vui lòng đăng nhập để sử dụng chức năng này");
            return; // Added return to prevent further execution
        }

        const isCurrentlyLiked = likedPosts[postId];
        const method = isCurrentlyLiked ? "DELETE" : "POST";

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${postId}`,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            if (response.ok) {
                setResults(prev => ({
                    ...prev,
                    poem: prev.poem.map(item =>
                        item.id === postId ? {
                            ...item,
                            likeCount: isCurrentlyLiked ? item.likeCount - 1 : item.likeCount + 1
                        } : item
                    )
                }));
                setLikedPosts(prev => ({ ...prev, [postId]: !isCurrentlyLiked }));
            }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };


    const renderPoemResults = () => {
        if (loading) return <Spin />;

        if (!results.poem?.length) return <Empty description="Không tìm thấy bài thơ nào" />;

        return results.poem?.map(poem => (
            <PoemCard
                key={poem.id}
                item={poem}
                bookmarked={bookmarkedPosts[poem.id]}
                liked={likedPosts[poem.id]}
                onBookmark={handleBookmark}
                onLike={handleLike}
            />
        ));
    };

    const renderCollectionsResults = () => {
        if (loading) return <Spin />;
        if (!results.collection?.length) return <Empty description="Không tìm thấy tập thơ nào" />;

        return results.collection?.map(collection => (
            <CollectionCard
                key={collection.id}
                item={collection}
                onBookmark={handleBookmark}
                isBookmarked={bookmarkedCollections[collection.id] || false}
            />
        ))
    }

    const renderUsersResults = () => {
        if (loading) return <Spin />;
        if (!results.user?.length) return <Empty description="Không tìm thấy người dùng nào" />;

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '16px'
            }}>
                {results.user.map(user => (
                    <UserCard key={user.id} user={user} />
                ))}
            </div>
        );
    };

    return (
        <div>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Search
                        placeholder="Tìm kiếm..."
                        enterButton
                        size="large"
                        defaultValue={query}
                        onSearch={handleSearch}
                        style={{ maxWidth: 600, width: '100%' }}
                    />
                </div>

                <Tabs activeKey={type} onChange={handleTabChange}>
                    <TabPane tab="Thơ" key="poem">
                        {renderPoemResults()}
                    </TabPane>
                    <TabPane tab="Tập thơ" key="collection">
                        {renderCollectionsResults()}
                    </TabPane>

                    <TabPane tab="Người dùng" key="user">
                        {renderUsersResults()}
                    </TabPane>
                </Tabs>

                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
            </div>
        </div>
    );
};

export default SearchPage;