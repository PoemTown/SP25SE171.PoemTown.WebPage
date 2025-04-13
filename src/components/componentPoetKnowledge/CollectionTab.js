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
    const accessToken = localStorage.getItem("accessToken");


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
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const data = await response.json();
            setCollections(data.data);
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
                    <div style={{}}>
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
