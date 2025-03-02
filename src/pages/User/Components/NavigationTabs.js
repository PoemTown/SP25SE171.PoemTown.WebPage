import React from "react";

const NavigationTabs = ({ activeTab, setActiveTab, NavBorder, navBackground }) => {
    const tabs = [
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
        "Bookmark của bạn",
        "Bản nháp của bạn",
        "Lịch sử chỉnh sửa",
        "Quản lý Bản Quyền",
        "Trang trí",
        "Quản lý ví",
    ];

    return (
        <nav
            style={{
                marginTop: "0px",
                backgroundImage: navBackground ? `url(${navBackground})` : "none",
                backgroundSize: "cover",  
                backgroundPosition: "center",  
                backgroundRepeat: "no-repeat",
                padding: "10px",
                borderRadius: "10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                border: `3px solid ${NavBorder}`,
            }}
        >
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    onClick={() => setActiveTab(tab)}
                    style={{
                        padding: "10px 15px",
                        fontSize: "14px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontWeight: activeTab === tab ? "bold" : "normal",
                        color: activeTab === tab ? "#007bff" : "#555",
                        borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
                    }}
                >
                    {tab}
                </button>
            ))}
        </nav>
    );
};

export default NavigationTabs;
