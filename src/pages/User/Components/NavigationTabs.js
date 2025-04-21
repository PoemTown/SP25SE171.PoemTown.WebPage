import React from "react";

const NavigationTabs = ({ isMine, activeTab, setActiveTab, setIsCreatingPoem, setIsCreatingCollection, NavBorder, navColorCode, navBackground }) => {
    const tabs = isMine ? [
        "Tiểu sử",
        "Thơ của bạn",
        "Bản ghi âm",
        "Bộ sưu tập của bạn",
        "Bookmark của bạn",
        "Bản nháp của bạn",
        // "Lịch sử chỉnh sửa",
        "Quản lý Bản Quyền",
        // "Trang trí",
        "Quản lý ví",
        "Đóng góp"
    ] : [
        "Tiểu sử",
        "Thơ của bạn",
        "Bộ sưu tập của bạn",
        "Bản ghi âm",
    ];

    const handleChangeTab = (tab) => {
        if (activeTab === "Thơ của bạn") {
            if (tab === "Bộ sưu tập của bạn" || tab === "Bookmark của bạn" || tab === "Bản nháp của bạn" || tab === "Lịch sử chỉnh sửa" || tab === "Quản lý Bản Quyền" || tab === "Quản lý ví" || tab === "Bản ghi âm" || tab === "Tiểu sử" ) {
                setIsCreatingPoem(false);
            }
        }
        if (activeTab === "Bộ sưu tập của bạn") {
            if (tab === "Thơ của bạn" || tab === "Bookmark của bạn" || tab === "Bản nháp của bạn" || tab === "Lịch sử chỉnh sửa" || tab === "Quản lý Bản Quyền" || tab === "Quản lý ví" || tab === "Bản ghi âm" || activeTab === "Tiểu sử" ) {
                setIsCreatingCollection(false);
            }
        }
        if (activeTab === "Bản nháp của bạn") {
            if (tab === "Thơ của bạn" || tab === "Bookmark của bạn" || tab === "Bộ sưu tập của bạn" || tab === "Lịch sử chỉnh sửa" || tab === "Quản lý Bản Quyền" || tab === "Quản lý ví" || tab === "Bản ghi âm" || activeTab === "Tiểu sử" ) {
                setIsCreatingPoem(false);
            }
        }
        setActiveTab(tab)
    }

    return (
        <nav
            style={{
                marginTop: "0px",
                backgroundImage: navBackground ? `url(${navBackground})` : "none",
                backgroundSize: "cover",  
                backgroundPosition: "center",  
                backgroundRepeat: "no-repeat",
                padding: "10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                border: `3px solid ${NavBorder}`,
                position: "relative",
            }}
        >
            {tabs.map((tab, index) => (
                <button
                    key={index}
                    onClick={() => {handleChangeTab(tab)}}
                    style={{
                        padding: "10px 15px",
                        fontSize: "14px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontWeight: activeTab === tab ? "bold" : "normal",
                        color: activeTab === tab ? "#007bff" : navColorCode,
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
