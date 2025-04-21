import { useEffect, useState } from "react";
import Headerdefault from "../components/Headerdefault";
import Headeruser from "../components/Headeruser";
import { Button, Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import { FaCheck } from "react-icons/fa";

const Shop = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedType, setSelectedType] = useState("");
    const [selectedSort, setSelectedSort] = useState("2");
    const [pageNumber, setPageNumber] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 16;
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        fetchData();
    }, [selectedType, selectedSort, pageNumber])

    const fetchData = async () => {
        const requestHeaders = {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` })
        };
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/template/v1/master-templates?${selectedType ? `filterOptions.type=${selectedType}&` : ""}sortOptions=${selectedSort}`;

        const response = await fetch(apiUrl, { headers: requestHeaders });
        const data = await response.json();
        console.log(data);

        const filteredTemplates = (data.data || []).filter(item => item.tagName !== "DEFAULT");

        setTemplates(filteredTemplates);
        setTotalItems(filteredTemplates.length);
    }


    const handleViewDetail = (id, price) => {
        navigate(`/shop/${id}`, { state: { price } });
    };

    const templateType = {
        1: "Gói sản phẩm",
        2: "Bản thiết kế"
    }

    const templateStatus = {
        1: "Còn khả dụng",
        2: "Không còn khả dụng"
    }

    const sortOptions = {
        1: "Sắp xếp theo thời gian tạo tăng dần",
        2: "Sắp xếp theo thời gian tạo giảm dần (Mặc định)",
        3: "Sắp xếp theo giá tăng dần",
        4: "Sắp xếp theo giá giảm dần"
    };

    return (
        <>
            {isLoggedIn ? <Headeruser /> : <Headerdefault />}
            <div style={styles.shopBackground}>
                <h2 style={{ margin: 0 }}>Thiết kế ngôi nhà, góc làm thơ cho riêng mình</h2>
                <h4 style={{ margin: "15px 0 " }}>Thỏa sức sáng tạo cùng PoemTown</h4>
            </div>

            <div style={styles.filterContainer}>
                {/* Type Filter */}
                <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} style={styles.selectBox}>
                    <option value="">Tất cả loại</option>
                    {Object.entries(templateType).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>

                {/* Sort Options */}
                <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)} style={styles.selectBox}>
                    {Object.entries(sortOptions).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>

            <div style={styles.templateContainer}>
                {templates.map((item) => (
                    <div style={styles.templateCard} key={item.id}>
                        <div style={styles.templateCardHeader}>
                            <h3 style={{ margin: "0 0 20px 0" }}>{item.templateName}</h3>
                        </div>
                        <div style={styles.templateCardImage}>
                            <img style={styles.templateImage} alt="template default" src={item.coverImage ? item.coverImage : "./template_default.png"} />
                        </div>
                        <div style={styles.templateCardFooter}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <p style={styles.templateType}>{templateType[item.type] || "Không xác định"}</p>
                                {item.isBought ? (
                                    <p style={styles.isBought}>
                                        <span>Đã mua</span>
                                        <FaCheck />
                                    </p>
                                ) : <></>}
                            </div>
                            <p><span>Tag: </span><span style={{ color: "#666" }}>#{item.tagName}</span></p>
                            <p><span>Trạng thái: </span><span style={{ color: item.status === 1 ? "#00dd66" : "#ff0000", fontWeight: "bold" }}>{templateStatus[item.status]}</span></p>
                            <p>
                                <span>Giá: </span>
                                <span style={{ color: "#0066ff" }}>
                                    {item.price?.toLocaleString("vi-VN")}₫
                                </span>
                            </p>
                        </div>
                        {
                            item.status === 1 && (
                                <Button style={styles.buttonViewDetail} onClick={() => handleViewDetail(item.id, item.price)}>Xem chi tiết</Button>
                            )
                        }
                    </div>
                ))}
            </div>
            <div style={styles.paginationContainer}>
                <Pagination
                    current={pageNumber}
                    pageSize={pageSize}
                    total={totalItems}
                    onChange={(page) => setPageNumber(page)}
                    showSizeChanger={false}
                />
            </div>
        </>
    )
}

const styles = {
    shopBackground: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundImage: `url('./shop_background.png')`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        maxHeight: "295px",
        height: "24vh",
        padding: "20px",
        borderBottom: "2px solid #000"
    },

    filterContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        padding: "20px",
    },
    selectBox: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    isBought: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#5cb85c"
    },
    templateContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: "1fr", // ensures that rows have equal height
        gap: "40px",
        padding: "20px 100px",
        maxWidth: "1600px",
        margin: "0 auto",
    },
    templateCard: {
        boxSizing: "border-box",
        display: "flex",          // enable flex layout
        flexDirection: "column",  // arrange children vertically
        justifyContent: "space-between", // distribute space if needed
        padding: "20px",
        border: "1px solid #ccc",
        boxShadow: "0px 3px 6px 0px #0000004D",
        borderRadius: "10px",
        height: "100%",           // let card fill the grid row height
    },
    templateCardHeader: {
        textAlign: "center"
    },
    templateCardImage: {
        border: "1px solid #000",
        height: "120px",
        marginBottom: "15px"
    },
    templateImage: {
        width: "100%",
        height: "120px",
        objectFit: "cover",
        objectPosition: "center",
    },

    templateType: {
        display: "inline",
        padding: "5px 10px",
        border: "1px solid #00000050",
        borderRadius: "15px",
        color: "#fff",
        backgroundColor: "#000000B3",
        alignItems: "flex-end"
    },
    buttonViewDetail: {
        width: "100%"
    },
    paginationContainer: {
        display: "flex",
        justifyContent: "center",
        padding: "20px"
    }
}
export default Shop;