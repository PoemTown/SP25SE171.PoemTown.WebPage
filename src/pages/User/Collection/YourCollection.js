import React, { useEffect, useState } from "react";
import { Button, Dropdown, Menu, message, Modal } from 'antd';
import { FiArrowLeft } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { IoIosClose, IoIosLink, IoIosMore } from "react-icons/io";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import YourCollectionDetail from "./YourCollectionDetail";
import CreateCollection from "./CreateCollection";
import axios from "axios";
import { IoBookmark } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";
import { MoreOutlined } from "@ant-design/icons";

const YourCollection = ({ avatar }) => {
    const [collections, setCollection] = useState([]);
    const [statistic, setStatistic] = useState(null);

    const [selectedCollection, setSelectedCollection] = useState(null);
    const [reloadTrigger, setReloadTrigger] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const [bookmarkedCollections, setBookmarkedCollections] = useState(new Set());
    // const params = {
    //     /*"filterOptions.collectionName": filterOptions.collectionName,
    //     sortOptions,
    //     isDelete,
    //     pageNumber,
    //     pageSize,
    //     allowExceedPageSize,*/
    //     targetUserId
    // }; 

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const [collectionsResponse, statisticResponse] = await Promise.all([
                    fetch("https://api-poemtown-staging.nodfeather.win/api/collections/v1", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }),
                    fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1", {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }),
                ]);
                const [collectionsData, statisticData] = await Promise.all([
                    collectionsResponse.json(),
                    statisticResponse.json(),
                ]);
                if (collectionsData.statusCode === 200) {
                    const bookmarkedIds = new Set();
                    const formattedData = collectionsData.data.map((collection) => {
                        if (collection.targetMark) bookmarkedIds.add(collection.id);
                        return {
                            id: collection.id,
                            name: collection.collectionName,
                            description: collection.collectionDescription,
                            image: collection.collectionImage,
                            totalPoem: collection.totalChapter,
                            totalRecord: collection.totalRecord,
                            displayName: collection.user.displayName,
                            rowVersion: collection.rowVersion
                        };
                    });
                    setCollection(formattedData);
                    setBookmarkedCollections(bookmarkedIds);
                }
                if (statisticData.statusCode === 200) {
                    setStatistic(statisticData.data);
                }

            } catch (error) {
                console.error("Error fetching collections:", error);
            }
        };
        fetchCollections();
    }, [reloadTrigger]);

    const handleBookmark = async (id) => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const isBookmarked = bookmarkedCollections.has(id);
        const method = isBookmarked ? "DELETE" : "POST";

        try {
            await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection/${id}`,
                {
                    method,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            setBookmarkedCollections(prev => {
                const newSet = new Set(prev);
                if (isBookmarked) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }
                return newSet;
            });
        } catch (error) {
            console.error("Error updating bookmark:", error);
        }
    };

    const handleCreate = () => {
        setSelectedCollection(1); // Chuyển sang giao diện tạo bộ sưu tập
    };
    const handleDelete = async (id, rowVersion) => {

        try {
            const response = await axios.delete(`https://api-poemtown-staging.nodfeather.win/api/collections/v1/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                params: {
                    rowVersion: rowVersion
                }
            });

            console.log("Response:", response.data);
            setReloadTrigger((prev) => !prev); // Quay lại danh sách
            message.success("Xóa tập thơ thành công!");
        } catch (error) {
            console.error("Error:", error);
            message.error("Có lỗi xảy ra khi xóa tập thơ!");
        }
    };
    //----------------------------------------------------------------------------------------//
    const handleMoveToDetail = (collection) => {
        setSelectedCollection(collection); // Chuyển sang trang chi tiết
    };

    const handleBack = () => {
        setSelectedCollection(null);
        setReloadTrigger((prev) => !prev); // Quay lại danh sách
    };

    const showDeleteConfirm = (id, rowVersion) => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa?",
            content: "Hành động này không thể hoàn tác!",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk() {
                handleDelete(id, rowVersion);
            },
        });
    };

    //----------------------------------------------------------------------------------//
    return (
        <div style={{ margin: "20px 129px" }}>
            {selectedCollection === null ? (
                // ✅ Hiển thị danh sách bộ sưu tập
                <div style={{ display: 'flex', gap: "40px" }}>
                    <div style={{ flex: 2 }}>
                        <div style={{ marginBottom: "2%" }}>
                            <Button onClick={handleCreate} type="primary">Bộ sưu tập mới</Button>
                        </div>

                        {collections.map((collection) => (
                            <div
                                key={collection.id}
                                style={{
                                    borderRadius: "2px",
                                    border: "1px solid #ccc",
                                    display: 'flex',
                                    marginBottom: "2%",
                                    boxShadow: "0px 3px 6px 0px #0000004D",
                                    borderRadius: "5px"
                                }}
                            >
                                <div style={{ flex: 1, width: "260px", height: "146px" }}>
                                    <img
                                        style={{ width: "260px", height: "146px", objectFit: "cover", borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px" }}
                                        src={collection.image ? collection.image : "./default_collection.jpg"}
                                        alt="Ảnh cá nhân"
                                    />
                                </div>
                                <div style={{ flex: 4, display: "flex", flexDirection: "column", padding: "16px" }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}>
                                        <p style={{ marginBottom: '1%', fontWeight: 'bold', marginTop: 0 }}>
                                            {collection.name} - {" "}
                                            <span style={{ color: "#007bff", fontWeight: "600" }}>
                                                {collection?.displayName || "Anonymous"}
                                            </span>
                                        </p>
                                        <div style={{
                                            display: "flex",
                                            gap: "12px",
                                            alignItems: "center",
                                        }}>
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
                                                onClick={() => handleBookmark(collection.id)}
                                            >
                                                {bookmarkedCollections.has(collection.id) ? (
                                                    <IoBookmark color="#FFCE1B" />
                                                ) : (
                                                    <CiBookmark />
                                                )}
                                            </button>
                                            <Dropdown
                                                overlay={
                                                    <Menu>
                                                        <Menu.Item key="edit">
                                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                                <IoIosLink color="#666" size={"16"} /><div> Sao chép liên kết </div>
                                                            </div>
                                                        </Menu.Item>
                                                        <Menu.Item key="delete" onClick={() => showDeleteConfirm(collection.id, collection.rowVersion)}>
                                                            ❌ Xóa
                                                        </Menu.Item>
                                                    </Menu>
                                                }
                                                trigger={["click"]}
                                            >
                                                <MoreOutlined
                                                    style={{ fontSize: "20px", cursor: "pointer", color: "#555" }}
                                                    onClick={(e) => e.preventDefault()}
                                                />
                                            </Dropdown>
                                        </div>
                                    </div>
                                    <p style={{
                                        marginRight: '2%',
                                        marginBottom: 'auto',
                                        marginTop: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        maxWidth: "100%",
                                        flexGrow: 1
                                    }}>
                                        {collection.description}
                                    </p>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: "auto",
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <LuBook />
                                                <span>{collection.totalPoem}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <MdOutlineKeyboardVoice />
                                                <span>{collection.totalRecord}</span>
                                            </div>
                                        </div>
                                        <div
                                            style={{ color: "#007bff", fontWeight: "500", cursor: "pointer" }}
                                            onClick={() => handleMoveToDetail(collection)}
                                        >
                                            <span>Xem tuyển tập &gt;</span>
                                        </div>
                                    </div>
                                    {/* Xem chi tiết bộ sưu tập */}

                                    <div
                                        style={{
                                            marginLeft: "auto",
                                            fontWeight: "100",
                                            cursor: "pointer",
                                            position: 'absolute',
                                            right: 0,
                                            top: 10
                                        }}
                                        onClick={() => showDeleteConfirm(collection.id)}
                                    >
                                        <nav><IoIosClose size={25} /></nav>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Thành tựu và thống kê */}
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
                                <li>Tổng bài viết: {statistic?.totalPoems ?? 0}</li>
                                <li>Tổng bộ sưu tập: {statistic?.totalCollections ?? 0}</li>
                                <li>Tổng audio cá nhân: {statistic?.totalPersonalAudios ?? 0}</li>
                                <li>Tổng lượt thích: {statistic?.totalLikes ?? 0}</li>
                                <li>Bookmark bài viết: {statistic?.poemBookmarks ?? 0}</li>
                                <li>Bookmark bộ sưu tập: {statistic?.collectionBookmarks ?? 0}</li>
                            </ul>
                            <a href="#" style={{ color: "#007bff", fontSize: "12px" }}>Xem thêm &gt;</a>
                        </div>
                    </div>
                </div>
            ) : selectedCollection === 1 ? (
                // ✅ Hiển thị giao diện tạo bộ sưu tập
                <div style={{ padding: "0px" }}>
                    <CreateCollection handleBack={handleBack} />
                </div>


            ) : (
                // ✅ Hiển thị chi tiết bộ sưu tập
                <div style={{ padding: "0px" }}>
                    <YourCollectionDetail collection={selectedCollection} handleBack={handleBack} avatar={avatar} />
                </div>
            )}
        </div>
    );

};

export default YourCollection;
