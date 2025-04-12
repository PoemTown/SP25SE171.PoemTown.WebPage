import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";

const PoetKnowledge = () => {
    const { id } = useParams();
    const [poet, setPoet] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState("Tiểu sử");

    const tabs = [
        "Tiểu sử",
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
    ]

    useEffect(() => {
        const fetchPoetSample = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poet-samples/v1/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                }
            })
            if (!response.ok) {
                message.error("Đã có lỗi xảy ra. Vui lòng thử lại sau!");

            }
            const data = await response.json();
            setPoet(data.data);
            console.log("result: ", data);
        }

        fetchPoetSample();
    }, [id])

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    const handleChangeTab = (tab) => {
        setActiveTab(tab);
    }
    return (
        <>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div>
                <img
                    src={`${process.env.PUBLIC_URL}/poet_knowledge_cover.png`}
                    alt="Cover"
                    style={{
                        width: "100%",
                        display: "block",
                        height: "300px",
                        objectFit: "cover"
                    }}
                />
            </div>
            <nav
                style={{
                    marginTop: "0px",
                    backgroundColor: "white",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    padding: "10px",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    border: `3px solid #ccc`,
                    position: "relative",
                }}
            >
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        onClick={() => { handleChangeTab(tab) }}
                        style={{
                            padding: "10px 15px",
                            fontSize: "14px",
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            fontWeight: activeTab === tab ? "bold" : "normal",
                            color: activeTab === tab ? "#007bff" : "#000000",
                            borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
            <div style={{
                width: "100%",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}>
                <h1 style={{margin: 0}}>Hello {poet?.name}</h1>
            </div>
        </>
    )
}

export default PoetKnowledge;