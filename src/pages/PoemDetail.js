import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { FiArrowLeft } from 'react-icons/fi';
import { BiCommentDetail, BiLike, BiSolidLike } from 'react-icons/bi';
import { RiDeleteBinFill } from "react-icons/ri";
import { IoBookmark } from 'react-icons/io5';
import { CiBookmark, CiCirclePlus } from 'react-icons/ci';
import { Button, Dropdown, Menu, message, Spin } from 'antd';
import { IoIosLink, IoIosMore } from 'react-icons/io';
import { MdEdit, MdReport } from 'react-icons/md';
import { FaCheck, FaUserPlus } from 'react-icons/fa';
import Comment from '../components/componentHomepage/Comment';

const PoemDetail = () => {
    const { id } = useParams();
    const [poem, setPoem] = useState(null);
    const [comments, setComments] = useState(null);
    const [bookmarked, setBookmarked] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTexts, setReplyTexts] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [commentTree, setCommentTree] = useState([]);
    const [userData, setUserData] = useState([]);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();


    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };
    // Fetch poem details
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const response = await fetch(
                    `https://api-poemtown-staging.nodfeather.win/api/users/v1/profile/online/${poem?.user.userName}`,
                    { method: "GET", headers: requestHeaders }
                );

                if (!isMounted) return;

                const result = await response.json();
                if (response.ok && result.data) {
                    setUserData({
                        displayName: result.data.displayName,
                        email: result.data.email,
                        userName: result.data.userName,
                        userId: result.data.id,
                        avatar: result.data.avatar,
                        isMine: result.data.isMine,
                        isFollowed: result.data.isFollowed,
                        totalFollowers: result.data.totalFollowers,
                        totalFollowings: result.data.totalFollowings,
                        userStatistic: result.data.userStatistic,
                        achievements: result.data.achievements
                    });
                    //    const cover = result.data.userTemplateDetails.find(item => item.type === 1);
                    //    if (cover) {
                    //        setCoverImage(cover.image ? encodeURI(cover.image) : null);
                    //        setCoverColorCode(cover.colorCode ? cover.colorCode : "#000000");
                    //    }

                    //    const navBackground = result.data.userTemplateDetails.find(item => item.type === 2);
                    //    if (navBackground) {
                    //        setNavBackground(navBackground.image ? encodeURI(navBackground.image) : null);
                    //        setNavColorCode(navBackground.colorCode ? navBackground.colorCode : "#000000");
                    //    }

                    //    const navBorder = result.data.userTemplateDetails.find(item => item.type === 3);
                    //    if (navBorder) {
                    //        setNavBorder(navBorder.colorCode || "#cccccc");
                    //    }

                    const mainBackground = result.data.userTemplateDetails.find(item => item.type === 4);
                    if (mainBackground) {
                        setBackgroundImage(mainBackground.image ? encodeURI(mainBackground.image) : null);
                    }

                    //    const achievementBorder = result.data.userTemplateDetails.find(item => item.type === 5)
                    //    if (achievementBorder) {
                    //        setAchievementBorder(achievementBorder.colorCode || "#cccccc");
                    //    }

                    //    const achievementBackground = result.data.userTemplateDetails.find(item => item.type === 6)
                    //    if (achievementBackground) {
                    //        setAchievementBackground(achievementBackground.image || "none");
                    //        setAchievementBackgroundColorCode(achievementBackground.colorCode || "#000000");
                    //    }

                    //    const statisticBorder = result.data.userTemplateDetails.find(item => item.type === 7)
                    //    if (statisticBorder) {
                    //        setStatisticBorder(statisticBorder.colorCode || "#cccccc");
                    //    }

                    //    const statisticBackground = result.data.userTemplateDetails.find(item => item.type === 8)
                    //    if (statisticBackground) {
                    //        setStatisticBackground(statisticBackground.image || "none");
                    //        setStatisticBackgroundColorCode(statisticBackground.colorCode || "#000000");
                    //    }
                    //    const achievementTitle = result.data.userTemplateDetails.find(item => item.type === 9);
                    //    if (achievementTitle) {
                    //        setAchievementTitleBackground(achievementTitle.image || "none");
                    //        setAchievementTitleColorCode(achievementTitle.colorCode || "#000000")
                    //    }

                    //    const statisticTitle = result.data.userTemplateDetails.find(item => item.type === 10);
                    //    if (statisticTitle) {
                    //        setStatisticTitleBackground(statisticTitle.image || "none");
                    //        setStatisticTitleColorCode(statisticTitle.colorCode || "#000000");
                    //    }
                } else {
                    console.error("Lỗi khi lấy dữ liệu người dùng:", result.message);
                }

            } catch (error) {
                if (!isMounted) return;
                console.error("Lỗi khi gọi API:", error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();
        return () => { isMounted = false }; // Cleanup
    }, [poem]);

    useEffect(() => {
        const fetchPoem = async () => {
            try {
                const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/poems/v1/${id}/detail`, {
                    headers: requestHeaders
                });
                const data = await response.json();
                setPoem(data.data);
                console.log(data.data)
                // Assume the API returns a property indicating if the poem is bookmarked
                setBookmarked(data.data.targetMark || false);
            } catch (error) {
                console.error("Error fetching poem:", error);
            }
        };
        fetchPoem();
    }, [id, accessToken]);

    useEffect(() => {
        const fetchComment = async () => {
            try {
                const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/comments/v1/${id}?pageSize=100&allowExceedPageSize=true`, {
                    headers: requestHeaders
                });
                const data = await response.json();
                setComments(data.data);
            } catch (error) {
                console.error("Error fetching poem:", error);
            }
        }
        fetchComment();
    }, [])

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('vi-VN', options);
    };

    // Like handler function (as before)
    const handleLike = async () => {
        if (!isLoggedIn) {
            message.error("Bạn phải đăng nhập để sử dụng chức năng này");
            return;
        }
        const isCurrentlyLiked = poem?.like;
        const method = isCurrentlyLiked ? "DELETE" : "POST";
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        };

        try {
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/likes/v1/${id}`,
                { method, headers }
            );
            if (response.ok) {
                setPoem(prev => ({
                    ...prev,
                    like: !prev.like,
                    likeCount: prev.likeCount + (isCurrentlyLiked ? -1 : 1)
                }));
            }
        } catch (error) {
            console.error("Error updating like:", error);
        }
    };

    // Bookmark handler function
    const handleBookmark = async () => {
        if (!isLoggedIn) {
            message.error("Bạn phải đăng nhập để sử dụng chức năng này");
            return;
        }
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        };

        // Endpoint for bookmarking a poem
        const endpoint = `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/poem/${id}`;
        const method = bookmarked ? "DELETE" : "POST";

        try {
            const response = await fetch(endpoint, {
                method,
                headers,
            });
            if (response.ok) {
                setBookmarked(!bookmarked);
            }
        } catch (error) {
            console.error("Error updating bookmark:", error);
        }
    };

    const defaultMenu = (
        <Menu>
            <Menu.Item key="report">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MdReport color="red" size={16} /><div> Báo cáo </div>
                </div>
            </Menu.Item>
            <Menu.Item key="copylink">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <IoIosLink color="#666" size={16} /><div> Sao chép liên kết </div>
                </div>
            </Menu.Item>
            <Menu.Item key="follow">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <FaUserPlus color="#666" size={16} /><div> Theo dõi người dùng </div>
                </div>
            </Menu.Item>
        </Menu>
    );

    const ownerMenu = (
        <Menu>
            <Menu.Item key="report">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MdEdit color='#FFCE1B' size={16} /> <div>Chỉnh sửa</div>
                </div>
            </Menu.Item>
            <Menu.Item key="copylink">
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <RiDeleteBinFill color='#f00' size={16} /> <div>Xóa bài thơ</div>
                </div>
            </Menu.Item>
        </Menu>
    );

    const overlayMenu = poem?.isMine
        ? ownerMenu
        : defaultMenu;

    const poemType = {
        1: "Thơ tự do",
        2: "Thơ Lục bát",
        3: "Thơ Song thất lục bát",
        4: "Thơ Thất ngôn tứ tuyệt",
        5: "Thơ Ngũ ngôn tứ tuyệt",
        6: "Thơ Thất ngôn bát cú",
        7: "Thơ bốn chữ",
        8: "Thơ năm chữ",
        9: "Thơ sáu chữ",
        10: "Thơ bảy chữ",
        11: "Thơ tám chữ",
    }

    const buildCommentTree = useCallback((comments) => {
        const map = {};
        const tree = [];
        const depthMap = new Map();

        // First pass: create map of all comments
        comments?.forEach(comment => {
            map[comment.id] = { ...comment, replies: [] };
        });

        // Second pass: calculate depths after all comments are in map
        comments?.forEach(comment => {
            let depth = 0;
            let currentId = comment.parentCommentId;

            // Traverse parent chain using the complete map
            while (currentId && map[currentId]) {
                depth++;
                currentId = map[currentId].parentCommentId;
            }
            depthMap.set(comment.id, depth);
        });

        // Third pass: adjust parent relationships
        comments?.forEach(comment => {
            const originalDepth = depthMap.get(comment.id);
            let parentId = comment.parentCommentId;

            // For comments deeper than 3 levels
            if (originalDepth > 3) {
                let currentParentId = parentId;
                let stepsToClimb = originalDepth - 3;

                // Find nearest ancestor at depth 3
                while (stepsToClimb > 0 && currentParentId) {
                    currentParentId = map[currentParentId]?.parentCommentId;
                    stepsToClimb--;
                }

                if (currentParentId && map[currentParentId]) {
                    parentId = currentParentId;
                }
            }

            // Add to tree structure
            if (parentId && map[parentId]) {
                map[parentId].replies.push(map[comment.id]);
            } else {
                tree.push(map[comment.id]);
            }
        });

        return tree;
    }, []);

    useEffect(() => {
        if (comments) {
            setCommentTree(buildCommentTree(comments));
        }
    }, [comments, buildCommentTree]);

    const handleSubmitComment = async () => {
        if (!isLoggedIn) {
            message.error("Vui lòng đăng nhập để bình luận");
            return;
        }
        if (!newComment.trim()) {
            message.error("Bình luận không được để trống");
            return;
        }

        try {
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/comments/v1", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ poemId: id, content: newComment })
            });

            if (response.ok) {
                message.success("Đăng bình luận thành công");
                setNewComment("");
                // Refresh comments
                const res = await fetch(`https://api-poemtown-staging.nodfeather.win/api/comments/v1/${id}`, {
                    headers: requestHeaders
                });
                const data = await res.json();
                setComments(data.data);
            }
        } catch (error) {
            console.error("Lỗi khi đăng bình luận:", error);
            message.error("Đã xảy ra lỗi khi đăng bình luận");
        }
    };

    const handleReplyChange = (commentId, text) => {
        setReplyTexts(prev => ({
            ...prev,
            [commentId]: text
        }));
    };

    const handleCancelReply = (commentId) => {
        setReplyingTo(null);
        setReplyTexts(prev => ({
            ...prev,
            [commentId]: ""
        }));
    };

    const handleSubmitReply = async (commentId) => {
        if (!isLoggedIn) {
            message.error("Bạn phải đăng nhập để sử dụng chức năng này");
            return;
        }
        const content = replyTexts[commentId]?.trim();
        console.log(commentId)
        if (!content) {
            message.error("Bình luận không được để trống");
            return;
        }

        try {
            const response = await fetch("https://api-poemtown-staging.nodfeather.win/api/comments/v1/respondent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    parrentCommentId: commentId,
                    content: content
                })
            });

            if (response.ok) {
                setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
                setReplyingTo(null);

                // Refresh comments and rebuild tree
                const res = await fetch(`https://api-poemtown-staging.nodfeather.win/api/comments/v1/${id}?pageSize=100&allowExceedPageSize=true`, {
                    headers: requestHeaders
                });
                const data = await res.json();

                // Force tree rebuild with fresh data
                setComments(data.data);

                // Immediately rebuild comment tree
                const newTree = buildCommentTree(data.data);
                setCommentTree(newTree);
            }
            message.success("Đăng bình luận thành công");

        } catch (error) {
            console.error("Lỗi khi đăng bình luận:", error);
            message.error("Đã xảy ra lỗi khi đăng bình luận");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!isLoggedIn) {
            message.error("Vui lòng đăng nhập để thực hiện hành động này");
            return;
        }

        try {
            const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/comments/v1/${commentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
                setReplyingTo(null);

                // Refresh comments and rebuild tree
                const res = await fetch(`https://api-poemtown-staging.nodfeather.win/api/comments/v1/${id}?pageSize=100&allowExceedPageSize=true`, {
                    headers: requestHeaders
                });
                const data = await res.json();

                // Force tree rebuild with fresh data
                setComments(data.data);

                // Immediately rebuild comment tree
                const newTree = buildCommentTree(data.data);
                setCommentTree(newTree);
            }
            message.success("Đăng bình luận thành công");
        } catch (error) {
            console.error("Lỗi khi xóa bình luận:", error);
            message.error("Đã xảy ra lỗi khi xóa bình luận");
        }
    };

    const handleFollow = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Bạn cần đăng nhập để theo dõi người dùng!");
            return;
        }

        try {
            const method = poem?.isFollowed ? "DELETE" : "POST";
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/followers/${poem?.user.id}`,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                // Update local state immediately
                setPoem(prev => ({
                    ...prev,
                    isFollowed: !prev.isFollowed,
                    user: {
                        ...prev.user,
                    }
                }));
                message.success(poem?.isFollowed
                    ? "Đã hủy theo dõi!"
                    : "Theo dõi thành công!"
                );
            } else {
                message.error("Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error following/unfollowing:", error);
            message.error("Đã xảy ra lỗi!");
        }
    };

    return (
        <div style={{
            backgroundImage: `url("${backgroundImage}")`
        }}>
            {isLoading && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                    }}
                >
                    <Spin size="large" tip="Đang tải..." />
                </div>
            )}
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div
                style={{
                    cursor: "pointer",
                    color: "#007bff",
                    fontSize: "18px",
                    marginBottom: "10px",
                    marginLeft: "20px",
                    marginTop: "20px",
                    fontWeight: "bold"
                }}
                onClick={() => navigate(-1)}
            >
                <FiArrowLeft /> Quay về
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "40px" }}>
                <div style={{ flex: 8, display: "flex", flexDirection: "column", gap: "40px" }}>
                    <div style={{ flex: 1, display: "flex", gap: "40px" }}>
                        <div style={{
                            width: "336px",
                            height: "536px",
                            border: "1px solid #000",
                            marginLeft: "20px"
                        }}>
                            <img
                                src={poem?.poemImage || "/anhminhhoa.png"}
                                alt='poem image'
                                style={{
                                    width: "336px",
                                    maxWidth: "336px",
                                    height: "100%",
                                    objectFit: "cover",
                                    objectPosition: "center",
                                    border: "2px solid #fff"
                                }}
                            />
                        </div>
                        <div style={{ width: "100%" }}>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                                Ngày xuất bản: {formatDate(poem?.createdTime)}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
                                <p style={{ margin: 0, fontWeight: "bold", fontSize: "2rem" }}>
                                    {poem?.title}
                                </p>
                                <div style={{ display: "flex", flexDirection: "row" }}>
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px",
                                            fontSize: "1.2rem",
                                            color: "#666",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                        onClick={handleBookmark}
                                    >
                                        {bookmarked ? <IoBookmark size={20} color="#FFCE1B" /> : <CiBookmark size={20} />}
                                    </button>
                                    <Dropdown overlay={overlayMenu} trigger={["click"]}>
                                        <button style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px",
                                            fontSize: "1.2rem",
                                            color: "#666",
                                            display: "flex",
                                            alignItems: "center",
                                        }}>
                                            <IoIosMore />
                                        </button>
                                    </Dropdown>
                                </div>
                            </div>
                            <p style={{ margin: 0 }}>
                                Mô tả: {poem?.description}
                            </p>
                            <p style={{ margin: 0 }}>
                                Tập thơ: <span style={{ color: "#007bff", cursor: "pointer" }} onClick={() => navigate(`/collection/${poem?.collection.id}`)}>
                                    {poem?.collection?.collectionName}
                                </span>
                            </p>
                            <p style={{ margin: 0 }}>Thể loại: {poemType[poem?.type]}</p>
                            <div style={{ display: "flex", flexDirection: "row", gap: "30px", marginTop: "10px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {poem?.like ? (
                                        <BiSolidLike onClick={handleLike} size={20} color="#2a7fbf" style={{ cursor: "pointer" }} />
                                    ) : (
                                        <BiLike onClick={handleLike} size={20} style={{ cursor: "pointer" }} />
                                    )}
                                    <span>{poem?.likeCount || 0}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <BiCommentDetail size={20} style={{ cursor: "pointer" }} />
                                    <span>{poem?.commentCount || 0}</span>
                                </div>
                            </div>
                            <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
                                <div style={{ margin: "0px auto", display: "inline-block", boxSizing: "border-box" }}>
                                    <p style={{ whiteSpace: "pre-wrap", textAlign: "left", fontSize: "1.2rem", lineHeight: "2" }}>
                                        “{poem?.content}”
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1, margin: "0 129px" }}>
                        <h1>Bình luận</h1>
                        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column" }}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Viết bình luận..."
                                style={{
                                    width: '100%',
                                    padding: 8,
                                    marginBottom: 8,
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    minHeight: 80,
                                    boxSizing: "border-box"
                                }}
                            />
                            <button
                                onClick={handleSubmitComment}
                                style={{
                                    padding: '6px 16px',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    alignSelf: "flex-end",
                                    margin: 0
                                }}
                            >
                                Đăng bình luận
                            </button>
                        </div>
                        {commentTree.map((comment) => {
                            return (
                                <Comment
                                    key={comment.id}
                                    comment={comment}
                                    depth={0}
                                    currentReply={replyingTo}
                                    replyTexts={replyTexts}
                                    onReply={setReplyingTo}
                                    onSubmitReply={handleSubmitReply}
                                    onCancelReply={(commentId) => {
                                        setReplyingTo(null);
                                        setReplyTexts(prev => ({
                                            ...prev,
                                            [commentId]: ""
                                        }));
                                    }}
                                    onTextChange={handleReplyChange}
                                    isMine={comment.isMine} // Adjust this based on your auth system
                                    onDelete={handleDeleteComment}
                                />
                            )
                        })}
                    </div>
                </div>
                <div style={{ flex: 2, }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <img src={poem?.user.avatar} alt='avatar' style={{ width: "60px", height: "60px", borderRadius: "50%", border: "2px solid #fff" }} />
                        <div>
                            <p onClick={() => navigate(`/user/${poem?.user.userName}`)} style={{ margin: 0, fontSize: "0.9rem", cursor: "pointer", color: "#005cc5" }}>{poem?.user.displayName}</p>
                            <p onClick={() => navigate(`/user/${poem?.user.userName}`)} style={{ margin: 0, fontSize: "0.875rem", cursor: "pointer" }}>@{poem?.user.userName}</p>
                            <div style={{ marginTop: "10px" }}>
                                {poem?.isMine ? <></> :
                                    poem?.isFollowed ? <Button onClick={handleFollow} variant="solid" color="primary" icon={<FaCheck />} iconPosition="end">Đã Theo dõi </Button> : <Button onClick={handleFollow} variant="outlined" color="primary" icon={<CiCirclePlus />} iconPosition='end'>Theo dõi</Button>
                                }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};


export default PoemDetail;
