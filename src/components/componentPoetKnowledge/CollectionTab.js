import React, { useEffect, useState } from "react";
import CreateCollection from "../../pages/User/Collection/CreateCollection";
import CollectionCard from "../componentHomepage/CollectionCard";
import { message, Modal } from "antd";
import axios from "axios";

const CollectionTab = ({ poet }) => {
    const storedRole = localStorage.getItem("role");
    const [hasPermission, setHasPermission] = useState(false);
    const [collections, setCollections] = useState([]);
    const [isCreatingCollection, setIsCreatingCollection] = useState(false);
    const [isEditingCollection, setIsEditingCollection] = useState(false);
    const [bookmarkedCollections, setBookmarkedCollections] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        if (storedRole) {
            const roles = JSON.parse(storedRole);
            if (roles?.includes("ADMIN") || roles?.includes("MODERATOR")) {
                setHasPermission(true);
            } else {
                setHasPermission(false);
            }
        }
    }, [storedRole])

    const fetchCollections = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1/poet-sample/${poet.id}`,
                {
                    headers: requestHeaders
                }
            );
            const data = await response.json();
            setCollections(data.data);
            const initialCollectionBookmarks = {};
            data.data.forEach(item => {
                initialCollectionBookmarks[item.id] = !!item.targetMark;
            });
            setBookmarkedCollections(initialCollectionBookmarks);
            console.log("Fetched collections:", data.data);
        } catch (error) {
            console.error("Error fetching collections:", error);
            message.error("Có lỗi khi tải dữ liệu tập thơ!");
        }
    };

    useEffect(() => {
        if (poet && poet.id) {
            fetchCollections();
        }
    }, [poet]);

    const handleChangeToCreate = () => {
        setIsCreatingCollection(true);
    }

    const handleBack = () => {
        setIsCreatingCollection(false);
    };

    const handleDeleteCollection = (id) => {
        Modal.confirm({
            title: "Bạn có chắc chắn muốn xóa?",
            content: "Hành động này không thể hoàn tác!",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk() {
                handleDelete(id);
            },
        });
    }

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1/poet-sample/${id}?poetSampleId=${poet.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            message.success("Xóa tập thơ thành công!");
            fetchCollections();
        } catch (error) {
            console.error("Error:", error);
            message.error(error.response.data?.errorMessage);
        }
    };

    const handleBookmark = async (id) => {
        if (!isLoggedIn) {
            message.error("Vui lòng đăng nhâp để sử dụng chức năng này");
            return;
        }

        console.log(id);

        const endpoint = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection/${id}`;

        const currentState = bookmarkedCollections[id];

        try {
            const response = await fetch(endpoint, {
                method: currentState ? "DELETE" : "POST",
                headers: requestHeaders
            });

            if (response.ok) {
                setBookmarkedCollections(prev => ({
                    ...prev,
                    [id]: !currentState
                }));
            }
        } catch (error) {
            console.error("Error updating bookmark:", error);
        }
    };

    return (
        <>

            {
                isCreatingCollection ? (
                    <>
                        <div style={{ padding: "0px" }}>
                            <CreateCollection
                                handleBack={handleBack}
                                setIsCreatingCollection={setIsCreatingCollection}
                                setIsEditingCollection={setIsEditingCollection}
                                isKnowledgePoet={true}
                                poetId={poet.id}
                                onCollectionCreated={fetchCollections}
                            />
                        </div>
                    </>
                ) :
                    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                        {hasPermission === true && (
                            <button
                                onClick={handleChangeToCreate}
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
                                BỘ SƯU TẬP MỚI
                            </button>
                        )}
                        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                            {collections.map((item) => (
                                <CollectionCard
                                    key={item.id}
                                    item={item}
                                    isKnowledgePoet={true}
                                    poetName={poet.name}
                                    onBookmark={handleBookmark}
                                    isBookmarked={bookmarkedCollections[item.id] || false}
                                    handleDeleteCollection={() => handleDeleteCollection(item.id)}
                                />
                            ))}
                        </div>
                    </div>
            }

        </>
    );
};

export default CollectionTab;
