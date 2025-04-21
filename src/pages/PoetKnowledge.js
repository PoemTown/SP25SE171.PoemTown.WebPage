import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";
import {
    CheckCircleFilled,
    StarFilled,
    FireFilled,
    CrownFilled
} from "@ant-design/icons";
import { Tooltip, Tag } from "antd";
import BiographyTab from "../components/componentPoetKnowledge/BiographyTab";
import PoemsTab from "../components/componentPoetKnowledge/PoemsTab";
import CollectionTab from "../components/componentPoetKnowledge/CollectionTab";
import Footer from "../components/Footer";

const PoetKnowledge = () => {
    const { id } = useParams();
    const [poet, setPoet] = useState(null);
    const [collections, setCollections] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("Tiểu sử");

    const tabs = [
        "Tiểu sử",
        `Thơ của ${poet?.name}`,
        `Tập thơ của ${poet?.name}`,
    ];

    const accessToken = localStorage.getItem("accessToken");

    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    useEffect(() => {
        const fetchPoetSample = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });
                if (!response.ok) {
                    message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");
                    return;
                }
                const data = await response.json();
                setPoet(data.data);
            } catch (error) {
                console.error("Error fetching poet:", error);
                message.error("Đã có lỗi xảy ra khi tải thông tin nhà thơ");
            }
        };

        const fetchCollections = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/collections/v1/poet-sample/${id}`,
                    {
                        headers: requestHeaders
                    }
                );
                if (!response.ok) {
                    message.error("Đã có lỗi xảy ra khi tải danh sách tập thơ");
                    return;
                }
                const data = await response.json();
                setCollections(data.data);
            } catch (error) {
                console.error("Error fetching collections:", error);
                message.error("Đã có lỗi xảy ra khi tải danh sách tập thơ");
            }
        };

        fetchPoetSample();
        fetchCollections();
    }, [id]);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const handleChangeTab = (tab) => {
        setActiveTab(tab);
    };

    const renderAdditionalBadges = () => {
        const badgeConfigs = {
            'Chuyên gia thơ 8 chữ': { icon: <StarFilled />, color: 'gold' },
            'Chuyên gia thể thơ 9 chữ': { icon: <StarFilled />, color: 'volcano' },
            'Lục bát': { icon: <FireFilled />, color: 'red' },
            'Trữ tình': { icon: <CrownFilled />, color: 'purple' },
            'Tự do': { icon: <FireFilled />, color: 'green' },
            'Tình yêu': { icon: <CrownFilled />, color: 'pink' },
            'Sứ giả hòa bình': { icon: <StarFilled />, color: 'blue' },
            'Cảm xúc': { icon: <FireFilled />, color: 'orange' },
            'Chuyên gia tâm lý': { icon: <CrownFilled />, color: 'cyan' }
        };

        if (!poet || !poet.titleSamples || poet.titleSamples.length === 0) {
            return null;
        }

        const poetBadges = poet.titleSamples
            .map(title => {
                const config = badgeConfigs[title.name];
                return config ? { ...config, name: title.name } : null;
            })
            .filter(Boolean);

        if (poetBadges.length === 0) {
            return null;
        }

        return (
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '12px'
            }}>
                {poetBadges.map((badge, index) => (
                    <Tooltip key={index} title={badge.name}>
                        <Tag
                            icon={badge.icon}
                            color={badge.color}
                            style={{
                                margin: 0,
                                padding: '4px 12px',
                                fontSize: '14px',
                                lineHeight: '24px',
                                border: 'none',
                                height: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            {badge.name}
                        </Tag>
                    </Tooltip>
                ))}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "Tiểu sử":
                return <BiographyTab poet={poet} />;
            case `Thơ của ${poet?.name}`:
                return <PoemsTab collections={collections} poetId={id}></PoemsTab>;
            case `Tập thơ của ${poet?.name}`:
                return <CollectionTab poet={poet} />;
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
                        paddingBottom: "20px",
                        color: "black",
                        // Bỏ dòng textShadow đi
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
                            <Tooltip title="Tài khoản xác minh">
                                <CheckCircleFilled style={{ color: "#1890ff", fontSize: "18px" }} />
                            </Tooltip>
                        </h1>

                        <p style={{
                            margin: "5px 0 0",
                            fontSize: "16px",
                            opacity: 0.9
                            // Bỏ textShadow ở đây nếu có
                        }}>
                            @{poet?.name?.toLowerCase().replace(/\s+/g, '')}
                        </p>

                        {/* Hiển thị các badge khác bên dưới tên */}
                        {renderAdditionalBadges()}
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
            }}>
                {renderTabContent()}
            </div>
            <Footer />
        </>
    );
};

export default PoetKnowledge;