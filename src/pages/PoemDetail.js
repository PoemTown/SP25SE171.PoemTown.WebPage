import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { FiArrowLeft, FiBook, FiCalendar, FiHeadphones, FiMusic, FiTag } from 'react-icons/fi';
import { BiCommentDetail, BiLike, BiSolidLike } from 'react-icons/bi';
import { RiDeleteBinFill } from "react-icons/ri";
import { IoBookmark } from 'react-icons/io5';
import { CiBookmark, CiCirclePlus } from 'react-icons/ci';
import { Button, Dropdown, Menu, message, Collapse, Typography, Spin, Modal, Form, Input, Upload, Progress, Tag, Avatar, Tooltip, Empty } from 'antd';
import { IoIosLink, IoIosMore } from 'react-icons/io';
import { MdEdit, MdReport } from 'react-icons/md';
import { FaCheck, FaFacebookSquare, FaUserPlus } from 'react-icons/fa';
import Comment from '../components/componentHomepage/Comment';
import axios from 'axios';
import { BookOutlined, CalendarOutlined, DeleteOutlined, FacebookOutlined, FileTextOutlined, LoadingOutlined, TagOutlined, UploadOutlined, WarningFilled } from '@ant-design/icons';
import FacebookSharePlugin from '../components/componentHomepage/FaceBookShareButton';
import ReportPoemModal from '../components/componentHomepage/ReportPoemModal';
import ReportUserModal from '../components/componentHomepage/ReportUserModal';
const { Title, Text } = Typography;
const { Panel } = Collapse;
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
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReportModalUser, setShowReportModalUser] = useState(false);


    // Thêm state create record
    const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [audioUrl, setAudioUrl] = useState('');
    const [isAudioUploading, setIsAudioUploading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const storedRoles = JSON.parse(localStorage.getItem("role")) || [];
        // chỉ set khi khác nhau về giá trị
        if (JSON.stringify(storedRoles) !== JSON.stringify(roles)) {
          setRoles(storedRoles);
        }
      }, [roles]);

    const deletePermission = roles?.includes("ADMIN") || roles?.includes("MODERATOR");

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
                    `${process.env.REACT_APP_API_BASE_URL}/users/v1/profile/online/${poem?.user.userName}`,
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
        let isMounted = true;
        const fetchPoem = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/${id}/detail`, {
                    headers: requestHeaders
                });
                const data = await response.json();
                if (isMounted) { // Chỉ cập nhật state nếu component vẫn mounted
                    setPoem(data.data);
                    setBookmarked(data.data.targetMark || false);
                }
            } catch (error) {
                console.error("Error fetching poem:", error);
            }
        };
        fetchPoem();
        return () => {
            isMounted = false;
        };
    }, [id, accessToken]);

    useEffect(() => {
        let isMounted = true;
        const fetchComment = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/${id}?pageSize=100&allowExceedPageSize=true`, {
                    headers: requestHeaders
                });
                const data = await response.json();
                if (isMounted) {
                    setComments(data.data);
                }
            } catch (error) {
                console.error("Error fetching poem:", error);
            }
        }
        fetchComment();
        return () => {
            isMounted = false;
        };
    }, [id, accessToken])

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const handleCopyLink = () => {
        const url = `${window.location.origin}/poem/${id}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                message.success("Đã sao chép liên kết!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                message.error("Không sao chép được liên kết!");
            });
    };

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
                `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${id}`,
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
        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`;
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

    //------------------------------------------------Purchase------------------------------------------------
    //Purchase poem
    const handlePurchasePoem = async (poemId) => {
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/purchase`,
                null, // vì không cần gửi body
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        poemId: poemId,
                    },
                }
            );

            const data = response.data; // vì dùng axios, không cần `.json()`
            message.success("Thanh toán thành công");

        } catch (error) {
            console.error("Error fetching poem:", error);
            message.error(error.response?.data?.errorMessage || "Đã xảy ra lỗi!");
        }
    };


    const showPurchaseConfirm = (poemId, saleVersion) => {
        Modal.confirm({
            title: "Xác nhận mua phiên bản",
            content: (
                <div>
                    <p><strong>Giá:</strong> {saleVersion.price} VND</p>
                    <p><strong>Thời gian sử dụng:</strong> {saleVersion.durationTime} năm</p>
                    <p><strong>Hoa hồng:</strong> {saleVersion.commissionPercentage}%</p>
                    <p>Hành động này không thể hoàn tác!</p>
                </div>
            ),
            okText: "Mua",
            cancelText: "Hủy",
            okType: "primary",
            onOk() {
                handlePurchasePoem(poemId);
            },
        });
    };

    const handleReportUser = () => {
        setShowReportModalUser(true);
    };


    const handleReportPoem = () => {
        setShowReportModal(true);
    };

    //------------------------------------------------Purchase------------------------------------------------
    const defaultMenu = (
        <Menu>
            <Menu.Item key="report" onClick={handleReportPoem}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <MdReport color="red" size={16} /><div> Báo cáo </div>
                </div>
            </Menu.Item>
            <Menu.Item key="copylink" onClick={handleCopyLink}>
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
            <Menu.Item key="delete">
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
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1`, {
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
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/${id}`, {
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
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/respondent`, {
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
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/${id}?pageSize=100&allowExceedPageSize=true`, {
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
            let response;
            if (deletePermission) {
                response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/admin/${commentId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                });
            } else {
                response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/${commentId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                });
            }

            if (response.ok) {
                setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
                setReplyingTo(null);

                // Refresh comments and rebuild tree
                const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/comments/v1/${id}?pageSize=100&allowExceedPageSize=true`, {
                    headers: requestHeaders
                });
                const data = await res.json();

                // Force tree rebuild with fresh data
                setComments(data.data);

                // Immediately rebuild comment tree
                const newTree = buildCommentTree(data.data);
                setCommentTree(newTree);
            }
            message.success("Xóa bình luận thành công");
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
                `${process.env.REACT_APP_API_BASE_URL}/followers/${poem?.user.id}`,
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


    //------------------------------------------Create record---------------------------------------------------------------------------------------------//

    // Thêm props upload
    const uploadProps = {
        name: 'file',
        accept: 'audio/*',
        showUploadList: false,
        customRequest: async ({ file, onSuccess, onError, onProgress }) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
                setIsAudioUploading(true);
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/audio`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: (progressEvent) => {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgress(percent);
                            onProgress({ percent });
                        }
                    }
                );

                onSuccess(response.data);
                form.setFieldsValue({ audioFile: response.data.data });
                setAudioUrl(response.data.data);
                message.success('Tải lên thành công!');
            } catch (error) {
                onError(error);
                message.error('Tải lên thất bại!');
            } finally {
                setIsAudioUploading(false);
            }
        },
        beforeUpload: (file) => {
            if (!file.type.startsWith('audio/')) {
                message.error('Chỉ chấp nhận file audio!');
                return false;
            }
            return true;
        }
    };

    // Thêm hàm tạo record
    const handleCreateRecord = async () => {
        try {
            const values = await form.validateFields();
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/record-files/v1`,
                {
                    fileName: values.recordName,
                    fileUrl: audioUrl
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    params: {
                        poemId: poem.id // ✅ Truyền poemId đúng cách
                    }
                }
            );

            message.success('Tạo bản ghi thành công!');
            setShowCreateRecordModal(false);
            form.resetFields();
            setAudioUrl('');
        } catch (error) {
            console.log("Error" + error)
            message.error(error.response?.data?.errorMessage || 'Lỗi khi tạo bản ghi');
        }
    };


    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: 'cover',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            paddingBottom: '40px',
            fontFamily: "'Noto Serif', serif",
            color: '#333'
        }}>
            {/* Loading Overlay */}
            {isLoading && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                }}>
                    <Spin size="large" tip="Đang tải..." indicator={<LoadingOutlined style={{ color: '#8a63d2' }} />} />
                </div>
            )}

            {/* Header */}
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}

            {/* Main Content */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px',
                position: 'relative'
            }}>
                {/* Back Button */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#5a4b7a',
                    fontSize: '16px',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    width: 'fit-content',
                    ':hover': {
                        color: '#8a63d2',
                        backgroundColor: 'rgba(138, 99, 210, 0.1)'
                    }
                }} onClick={() => navigate(-1)}>
                    <FiArrowLeft size={20} />
                    <span>Quay về</span>
                </div>

                {/* Poem Layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '24px',
                    '@media (min-width: 992px)': {
                        gridTemplateColumns: '2fr 1fr'
                    }
                }}>
                    {/* Poem Content Column */}
                    <div>
                        {/* Poem Card */}
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            {/* Poem Header */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                '@media (min-width: 768px)': {
                                    flexDirection: 'row'
                                }
                            }}>
                                {/* Poem Cover */}
                                <div style={{
                                    width: '100%',
                                    maxWidth: '280px',
                                    height: '380px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    margin: '0 auto',
                                    position: 'relative',
                                    '@media (min-width: 768px)': {
                                        margin: '0'
                                    }
                                }}>
                                    <img
                                        src={poem?.poemImage || "/default-poem-cover.jpg"}
                                        alt='poem cover'
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center'
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        left: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        padding: '6px 10px',
                                        borderRadius: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '14px',
                                        color: '#5a4b7a'
                                    }}>
                                        <FiCalendar />
                                        <span>{formatDate(poem?.createdTime)}</span>
                                    </div>
                                </div>

                                {/* Poem Meta */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '12px'
                                    }}>
                                        <h1 style={{
                                            margin: 0,
                                            fontSize: '28px',
                                            fontWeight: 600,
                                            color: '#5d4c3c',
                                            lineHeight: 1.3,
                                            fontFamily: "'Playfair Display', serif"
                                        }}>
                                            {poem?.title}
                                        </h1>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: bookmarked ? '#FFCE1B' : '#8a7a9a',
                                                    fontSize: '20px',
                                                    transition: 'all 0.2s',
                                                    ':hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                                onClick={handleBookmark}
                                            >
                                                {bookmarked ? <IoBookmark /> : <CiBookmark />}
                                            </button>
                                            <Dropdown overlay={overlayMenu} trigger={["click"]}>
                                                <button style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#8a7a9a',
                                                    fontSize: '20px',
                                                    transition: 'all 0.2s',
                                                    ':hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}>
                                                    <IoIosMore />
                                                </button>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    <p style={{
                                        margin: '12px 0',
                                        fontSize: '16px',
                                        color: '#5a4b7a',
                                        lineHeight: 1.6
                                    }}>
                                        {poem?.description}
                                    </p>

                                    {/* Tags */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                        margin: '16px 0'
                                    }}>
                                        {poem?.collection && (
                                            <div
                                                style={{
                                                    backgroundColor: '#f3f0ff',
                                                    color: '#5a4b7a',
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '14px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    ':hover': {
                                                        backgroundColor: '#e6e0ff'
                                                    }
                                                }}
                                                onClick={() => navigate(`/collection/${poem?.collection.id}`)}
                                            >
                                                <FiBook size={14} />
                                                <span>Tập thơ: {poem?.collection?.collectionName}</span>
                                            </div>
                                        )}
                                        <div style={{
                                            backgroundColor: '#f0f5ff',
                                            color: '#3a5a8a',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            <FiTag size={14} />
                                            <span>Thể loại: {poem?.type?.name ?? ""}</span>
                                        </div>
                                    </div>

                                    {/* Interaction Bar */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '16px',
                                        marginBottom: '20px',
                                        paddingBottom: '16px',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}>
                                        {!poem?.isFamousPoet && (
                                            <>
                                                <Button
                                                    icon={poem?.like ? <BiSolidLike size={18} /> : <BiLike size={18} />}
                                                    onClick={handleLike}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: poem?.like ? '#2a7fbf' : '#8a7a9a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 12px',
                                                        ':hover': {
                                                            backgroundColor: 'rgba(42, 127, 191, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    {poem?.likeCount || 0}
                                                </Button>
                                                <Button
                                                    icon={<BiCommentDetail size={18} />}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#8a7a9a',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 12px',
                                                        ':hover': {
                                                            backgroundColor: 'rgba(138, 99, 210, 0.1)'
                                                        }
                                                    }}
                                                >
                                                    {poem?.commentCount || 0}
                                                </Button>
                                            </>
                                        )}
                                        <div style={{ marginLeft: 'auto', alignItems: 'center', display: 'flex', transform: 'scale(1.2)' }}>
                                            <FacebookSharePlugin url={window.location.href} />
                                        </div>

                                    </div>

                                    {!poem?.isMine && poem?.saleVersion?.status !== 4 && (
                                        <Button
                                            type="primary"
                                            onClick={() => {
                                                if (poem?.saleVersion?.status === 1) {
                                                    showPurchaseConfirm(poem.id, poem?.saleVersion);
                                                } else {
                                                    setShowCreateRecordModal(true);
                                                }
                                            }}
                                            style={{
                                                background: '#7d6b58',
                                                border: 'none',
                                                fontWeight: 500,
                                                height: '40px',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(138, 99, 210, 0.3)',
                                                ':hover': {
                                                    background: 'linear-gradient(135deg, #7a53c2, #5a3b9a)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            {poem?.saleVersion?.status === 1 ? "Mua ngay" : "Sử dụng"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Poem Text */}
                            <div style={{
                                marginTop: '32px',
                                padding: '24px',
                                backgroundColor: '#f8f5f0',
                                borderRadius: '8px',
                                borderLeft: '3px solid #7d6b58',
                                fontFamily: "'Noto Serif', serif",
                                display: "flex",
                                justifyContent: "center"
                            }}>
                                <div>
                                    {poem?.type?.name === "Thơ Lục Bát" ? (
                                        <div>
                                            {poem?.content.split("\n").map((line, index) => {
                                                const wordCount = line.trim().split(/\s+/).length;
                                                const isSixWords = wordCount === 6;

                                                return (
                                                    <p
                                                        key={index}
                                                        style={{
                                                            marginLeft: isSixWords ? "2em" : "0",
                                                            marginBottom: "0.3em",
                                                            fontFamily: "'Times New Roman', serif",
                                                            fontSize: "1.1rem",
                                                            textAlign: "left",
                                                        }}
                                                    >
                                                        {line}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                    ) : (

                                        <pre style={{
                                            whiteSpace: 'pre-wrap',
                                            fontFamily: "'Noto Serif', serif",
                                            fontSize: '18px',
                                            lineHeight: '2',
                                            color: '#5d4c3c',
                                            margin: 0,
                                            textAlign: "left"
                                        }}>
                                            {poem?.content}
                                        </pre>
                                    )}
                                </div>
                            </div>

                            {/* Comments Section */}
                            {!poem?.isFamousPoet && (
                                <div style={{ marginTop: '40px' }}>
                                    <h3 style={{
                                        color: '#5d4c3c',
                                        borderBottom: '1px solid #f0f0f0',
                                        paddingBottom: '12px',
                                        fontSize: '20px',
                                        fontWeight: 500,
                                        fontFamily: "'Playfair Display', serif",
                                        marginBottom: '24px'
                                    }}>
                                        <BiCommentDetail style={{ marginRight: '8px' }} />
                                        Bình luận ({poem?.commentCount || 0})
                                    </h3>

                                    <div style={{ marginBottom: '24px' }}>
                                        <Input.TextArea
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Viết bình luận của bạn..."
                                            rows={4}
                                            style={{
                                                marginBottom: '12px',
                                                borderRadius: '8px',
                                                borderColor: '#e0e0e0',
                                                ':focus': {
                                                    borderColor: '#8a63d2',
                                                    boxShadow: '0 0 0 2px rgba(138, 99, 210, 0.2)'
                                                }
                                            }}
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <Button
                                                onClick={handleSubmitComment}
                                                type="primary"
                                                style={{
                                                    background: '#b0a499',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '8px 24px',
                                                    height: 'auto',
                                                    fontWeight: 500
                                                }}
                                            >
                                                Đăng bình luận
                                            </Button>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '16px' }}>
                                        {commentTree.map((comment) => (
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
                                                isMine={comment.isMine}
                                                deletePermission={deletePermission}
                                                onDelete={handleDeleteComment}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Column */}
                    <div>
                        {/* Author Card */}
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <Avatar
                                    src={poem?.poetSample ? poem?.poetSample?.avatar : poem?.user?.avatar}
                                    size={72}
                                    onClick={() => navigate(poem?.isFamousPoet ? `/knowledge/poet/${poem?.poetSample?.id}` : `/user/${poem?.user.userName}`)}
                                    style={{
                                        cursor: 'pointer',
                                        border: '3px solid #fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <div>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        color: '#3a2a5a',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }} onClick={() => navigate(poem?.isFamousPoet ? `/knowledge/poet/${poem?.poetSample?.id}` : `/user/${poem?.user.userName}`)}>
                                        {poem?.poetSample ? poem?.poetSample?.name : poem?.user?.displayName}
                                        {!poem?.isFamousPoet && !poem?.isMine && (
                                            <Tooltip title="Báo cáo người dùng">
                                                <WarningFilled style={{
                                                    color: '#ff4d4f',
                                                    cursor: 'pointer',
                                                    fontSize: '16px'
                                                }} onClick={handleReportUser} />
                                            </Tooltip>
                                        )}
                                    </h4>
                                    {!poem?.poetSample && (
                                        <p style={{
                                            margin: '4px 0 0',
                                            fontSize: '14px',
                                            color: '#8a7a9a',
                                            cursor: 'pointer'
                                        }} onClick={() => navigate(`/user/${poem?.user.userName}`)}>
                                            @{poem?.user?.userName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {!poem?.isMine && !poem?.isFamousPoet && (
                                <Button
                                    onClick={handleFollow}
                                    block
                                    style={{
                                        background: poem?.isFollowed ? '#f0f0f0' : '#b0a499',
                                        color: poem?.isFollowed ? '#5a4b7a' : '#fff',
                                        border: 'none',
                                        height: '40px',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    icon={poem?.isFollowed ? <FaCheck /> : <CiCirclePlus />}
                                >
                                    {poem?.isFollowed ? 'Đã theo dõi' : 'Theo dõi'}
                                </Button>
                            )}
                        </div>

                        {/* Records Section */}
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            backdropFilter: 'blur(8px)'
                        }}>
                            <Collapse
                                ghost
                                expandIconPosition="end"
                                style={{ width: '100%' }}
                            >
                                <Panel
                                    header={
                                        <h3 style={{
                                            color: '#3a2a5a',
                                            borderBottom: '1px solid #f0f0f0',
                                            paddingBottom: '12px',
                                            fontSize: '20px',
                                            fontWeight: 500,
                                            fontFamily: "'Playfair Display', serif",
                                            marginTop: 0,
                                            marginBottom: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <FiMusic />
                                            <span>Bản ghi ({poem?.recordFiles?.data?.length || 0})</span>
                                        </h3>
                                    }
                                >
                                    <div style={{
                                        display: 'grid',
                                        gap: '12px'
                                    }}>
                                        {poem?.recordFiles?.data?.length > 0 ? (
                                            poem.recordFiles.data?.map(record => (
                                                <div
                                                    key={record.id}
                                                    onClick={() => navigate(`/record/${record.id}`)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#fff',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                                        display: 'flex',
                                                        gap: '12px',
                                                        alignItems: 'center',
                                                        transition: 'all 0.2s',
                                                        ':hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                        }
                                                    }}
                                                >
                                                    <Avatar
                                                        src={record.owner?.avatar || '/default-record-thumbnail.jpg'}
                                                        size={48}
                                                        style={{
                                                            borderRadius: '6px',
                                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                                        }}
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <h5 style={{
                                                            margin: 0,
                                                            fontSize: '15px',
                                                            color: '#3a2a5a',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            fontWeight: 500
                                                        }}>
                                                            {record.title}
                                                        </h5>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#8a7a9a',
                                                            marginTop: '4px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between'
                                                        }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FiHeadphones />
                                                                {record.totalView || 0} lượt nghe
                                                            </span>
                                                            <span style={{
                                                                fontWeight: 500,
                                                                color: record.price === 0 ? '#8a63d2' : '#ff6b6b'
                                                            }}>
                                                                {record.price === 0 ? 'Miễn phí' : `${record.price.toLocaleString()}₫`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{
                                                padding: '24px',
                                                textAlign: 'center',
                                                color: '#8a7a9a'
                                            }}>
                                                <FileTextOutlined style={{
                                                    fontSize: '32px',
                                                    color: '#d0c0e8',
                                                    marginBottom: '12px'
                                                }} />
                                                <p style={{ margin: 0 }}>Chưa có bản ghi nào</p>
                                            </div>
                                        )}
                                    </div>
                                </Panel>
                            </Collapse>


                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ReportPoemModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                poemId={poem?.id}
                accessToken={localStorage.getItem("accessToken")}
            />

            <Modal
                title="Tạo Bản Ghi Mới"
                open={showCreateRecordModal}
                onOk={handleCreateRecord}
                onCancel={() => setShowCreateRecordModal(false)}
                okText="Tạo"
                cancelText="Hủy"
                width={600}
                styles={{
                    header: {
                        borderBottom: '1px solid #f0f0f0',
                        paddingBottom: '12px',
                        marginBottom: '20px'
                    },
                    body: {
                        padding: '24px'
                    },
                    footer: {
                        borderTop: '1px solid #f0f0f0',
                        paddingTop: '16px'
                    }
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Tên bản ghi"
                        name="recordName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên bản ghi' }]}
                    >
                        <Input
                            placeholder="Nhập tên bản ghi..."
                            style={{
                                borderRadius: '6px',
                                padding: '10px 12px'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label="File audio"
                        name="audioFile"
                        rules={[{ required: true, message: 'Vui lòng tải lên file audio' }]}
                    >
                        <Upload {...uploadProps}>
                            <Button
                                icon={<UploadOutlined />}
                                loading={isAudioUploading}
                                style={{
                                    borderRadius: '6px',
                                    height: '40px'
                                }}
                            >
                                Chọn file audio
                            </Button>
                        </Upload>
                    </Form.Item>

                    {uploadProgress > 0 && (
                        <Progress
                            percent={uploadProgress}
                            status="active"
                            strokeColor={{
                                '0%': '#8a63d2',
                                '100%': '#6a4baa',
                            }}
                            style={{
                                marginBottom: '16px'
                            }}
                        />
                    )}

                    {audioUrl && (
                        <div style={{
                            marginTop: '16px',
                            backgroundColor: '#f9f7ff',
                            borderRadius: '8px',
                            padding: '12px'
                        }}>
                            <audio controls src={audioUrl} style={{ width: '100%' }} />
                            <Button
                                type="text"
                                danger
                                onClick={() => {
                                    setAudioUrl('');
                                    form.setFieldsValue({ audioFile: null });
                                }}
                                icon={<DeleteOutlined />}
                                style={{
                                    marginTop: '8px'
                                }}
                            >
                                Xóa file
                            </Button>
                        </div>
                    )}
                </Form>
            </Modal>

            <ReportUserModal
                visible={showReportModalUser}
                onClose={() => setShowReportModalUser(false)}
                userId={poem?.user?.id}
                accessToken={localStorage.getItem("accessToken")}
            />
        </div>
    );
};


export default PoemDetail;
