import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";
import { CheckCircleFilled } from "@ant-design/icons";
import BiographyTab from "../components/componentPoetKnowledge/BiographyTab";
import PoemsTab from "../components/componentPoetKnowledge/PoemsTab";
import CollectionTab from "../components/componentPoetKnowledge/CollectionTab";

const PoetKnowledge = () => {
    const { id } = useParams();
    const [poet, setPoet] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("Tiểu sử");

    const tabs = [
        "Tiểu sử",
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
    ];

    useEffect(() => {
        const fetchPoetSample = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                }
            });
            if (!response.ok) {
                message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
            }
            const data = await response.json();
            setPoet(data.data);
        };

        fetchPoetSample();
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const handleChangeTab = (tab) => {
        setActiveTab(tab);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "Tiểu sử":
                return <BiographyTab poet={poet} />;
            case "Thơ của bạn":
                return <PoemsTab />;
            case "Bộ sưu tập của bạn":
                return <CollectionTab />;
            default:
                return null;
        }
    };

    return (
        <>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}

            {/* Background Cover with Portrait Avatar */}
            <div style={{
                position: "relative",
                height: "300px",
                backgroundColor: "#f0f0f0"
            }}>
                {/* Background Image */}
                <img
                    src={`${process.env.PUBLIC_URL}/poet_knowledge_cover.png`}
                    alt="Cover"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                />

                {/* Portrait Rectangle Avatar Container */}
                <div style={{
                    position: "absolute",
                    left: "20px",
                    bottom: "20px",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "20px"
                }}>
                    <div style={{
                        width: "200px",
                        height: "240px",
                        border: "3px solid white",
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        borderRadius: "4px"
                    }}>
                        <img
                            src={poet?.avatar}
                            alt="Avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                            }}
                        />
                    </div>

                    <div style={{
                        paddingBottom: "150px",
                        color: "white",
                        textShadow: "1px 1px 3px rgba(0, 0, 0, 0.8)"
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: "24px",
                            fontWeight: "bold",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            {poet?.name}
                            <CheckCircleFilled style={{ color: "#1890ff", fontSize: "18px" }} />
                        </h1>

                        <p style={{
                            margin: "5px 0 0",
                            fontSize: "16px",
                            opacity: 0.9
                        }}>
                            @{poet?.name?.toLowerCase().replace(/\s+/g, '')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <nav
                style={{
                    backgroundColor: "white",
                    padding: "10px 20px",
                    display: "flex",
                    gap: "15px",
                    borderBottom: "1px solid #eee"
                }}
            >
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => { handleChangeTab(tab) }}
                        style={{
                            padding: "8px 0",
                            fontSize: "15px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontWeight: activeTab === tab ? "bold" : "normal",
                            color: activeTab === tab ? "#1890ff" : "#555",
                            borderBottom: activeTab === tab ? "2px solid #1890ff" : "none",
                            transition: "all 0.2s"
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </nav>

            {/* Tab Content */}
            <div style={{
                width: "100%",
                minHeight: "300px",
                backgroundColor: "white",
                padding: "20px"
            }}>
                {renderTabContent()}
            </div>
        </>
    );
};

export default PoetKnowledge;
