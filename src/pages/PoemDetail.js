import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Headeruser from '../components/Headeruser';
import Headerdefault from '../components/Headerdefault';
import { FiArrowLeft } from 'react-icons/fi';
import { BiCommentDetail, BiLike, BiSolidLike } from 'react-icons/bi';
import { RiDeleteBinFill } from "react-icons/ri";
import { IoBookmark } from 'react-icons/io5';
import { CiBookmark, CiCirclePlus } from 'react-icons/ci';
import { Button, Dropdown, Menu, message } from 'antd';
import { IoIosLink, IoIosMore } from 'react-icons/io';
import { MdEdit, MdReport } from 'react-icons/md';
import { FaCheck, FaUserPlus } from 'react-icons/fa';

const PoemDetail = () => {
    const { id } = useParams();
    const [poem, setPoem] = useState(null);
    const [bookmarked, setBookmarked] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();


    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };
    // Fetch poem details
    useEffect(() => {
        const fetchPoem = async () => {
            try {
                const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/poems/v1/${id}/detail`, {
                    headers: requestHeaders
                });
                const data = await response.json();
                setPoem(data.data);
                // Assume the API returns a property indicating if the poem is bookmarked
                setBookmarked(data.data.targetMark || false);
                console.log(data.data);
            } catch (error) {
                console.error("Error fetching poem:", error);
            }
        };
        fetchPoem();
    }, [id, accessToken]);

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
            message.error("Please login to like this post.");
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
            message.error("Please login to bookmark this post.");
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

    return (
        <>
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
                <div style={{ flex: 8, display: "flex", gap: "40px" }}>
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
                                objectPosition: "center"
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
                <div style={{ flex: 2, }}>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <img src={poem?.user.avatar} alt='avatar' style={{ width: "60px", height: "60px", borderRadius: "50%" }} />
                        <div>
                            <p onClick={() => navigate(`/user/${poem?.user.userName}`)} style={{ margin: 0, fontSize: "0.9rem", cursor: "pointer", color: "#005cc5" }}>{poem?.user.displayName}</p>
                            <p onClick={() => navigate(`/user/${poem?.user.userName}`)} style={{ margin: 0, fontSize: "0.875rem", cursor: "pointer" }}>@{poem?.user.userName}</p>
                            <div style={{marginTop: "10px"}}>
                                {poem?.isMine ? <></> :
                                    poem?.follow ? <Button  onClick={{}} variant="solid" color="primary" icon={<FaCheck />} iconPosition="end">Đã Theo dõi </Button> : <Button onClick={{}} variant="outlined" color="primary" icon={<CiCirclePlus />} iconPosition='end'>Theo dõi</Button>
                                }
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PoemDetail;
