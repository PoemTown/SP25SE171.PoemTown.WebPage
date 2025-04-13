import { Dropdown, Menu } from "antd";
import { useEffect, useState } from "react";
import { CiBookmark } from "react-icons/ci";
import { IoIosLink, IoIosMore } from "react-icons/io";
import { IoBookmark } from "react-icons/io5";
import { LuBook } from "react-icons/lu";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const CollectionCard = ({ item, onBookmark, isBookmarked, isCommunity, isKnowledgePoet, poetName, handleDeleteCollection }) => {
    const navigate = useNavigate();
    const [hasPermission, setHasPermission] = useState(false);
    const storedRole = localStorage.getItem("role");

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

    return (
        <div
            key={item.id}
            style={{
                borderRadius: "2px",
                border: "1px solid #ccc",
                display: 'flex',
                marginBottom: "2%",
                boxShadow: "0px 3px 6px 0px #0000004D",
                backgroundColor: "#fff",
                borderRadius: "5px"
            }}
        >
            <div style={{ flex: 1, width: "260px", height: "146px" }}>
                <img
                    style={{ width: "260px", height: "146px", objectFit: "cover", borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px" }}
                    src={item.collectionImage ? item.collectionImage : "/collection1.png"}
                    alt="Ảnh bộ sưu tập"
                />
            </div>
            <div style={{ flex: 4, display: "flex", flexDirection: "column", padding: "16px" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <p style={{ marginBottom: '1%', fontWeight: 'bold', marginTop: 0 }}>
                        {item.collectionName} {isCommunity ? "" : "-"} <span style={{ color: "#007bff", fontWeight: "600", fontStyle: "italic", textDecoration: "underline", cursor: "pointer" }}>
                            {isCommunity ? "" : isKnowledgePoet ? item.poetSample?.name : item.user?.displayName || "Anonymous"}
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
                            onClick={() => onBookmark(item.id, true)} // Note the true flag for collections
                        >
                            {isBookmarked ? <IoBookmark color="#FFCE1B" /> : <CiBookmark />}
                        </button>
                        <Dropdown
                            overlay={
                                <Menu>
                                    <Menu.Item key="edit">
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <IoIosLink color="#666" size={16} />
                                            <div>Sao chép liên kết</div>
                                        </div>
                                    </Menu.Item>
                                    {hasPermission === true && (
                                        <Menu.Item
                                            key="delete"
                                            onClick={handleDeleteCollection}
                                        >
                                            ❌ Xóa
                                        </Menu.Item>
                                    )}
                                </Menu>
                            }
                            trigger={["click"]}
                        >
                            <IoIosMore
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
                                onClick={(e) => e.preventDefault()}
                            />
                        </Dropdown>
                    </div>
                </div>
                <p style={{
                    marginRight: "20%",
                    marginBottom: 'auto',
                    marginTop: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    maxWidth: "100%",

                }}>
                    <span style={{ fontWeight: 500 }}>Mô tả:</span> <span style={{ color: "#444" }}> {item.collectionDescription} </span>
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
                            <span>{item.totalChapter || 0}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <MdOutlineKeyboardVoice />
                            <span>{item.totalRecord || 0}</span>
                        </div>
                    </div>
                    {/* Xem chi tiết bộ sưu tập */}
                    <div
                        style={{ color: "#007bff", fontWeight: "600", cursor: "pointer" }}
                        onClick={() => navigate(`/collection/${item.id}`)}
                    >
                        <span>Xem tuyển tập &gt;</span>
                    </div>
                </div>
            </div>
        </div>

    );
}
export default CollectionCard;