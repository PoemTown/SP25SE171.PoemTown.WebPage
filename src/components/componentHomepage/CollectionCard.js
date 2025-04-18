import { ArrowRightOutlined, DeleteOutlined } from "@ant-design/icons";
import { Dropdown, Menu, message } from "antd";
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

    const handleCopyLink = () => {
        const url = `${window.location.origin}/collection/${item.id}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                message.success("Đã sao chép liên kết!");
            })
            .catch((err) => {
                console.error("Failed to copy: ", err);
                message.error("Không sao chép được liên kết!");
            });
    };

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
            display: "flex",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            marginBottom: "0.8em",
            transition: "all 0.2s ease",
            ":hover": {
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-2px)"
            }
          }}
        >
          {/* Phần hình ảnh bên trái */}
          <div style={{
            width: "160px",
            minWidth: "160px",
            height: "160px",
            position: "relative"
          }}>
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
              src={item.collectionImage || "/collection1.png"}
              alt="Ảnh bộ sưu tập"
            />
            <div style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(255, 255, 255, 0.9)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex"
                }}
                onClick={() => onBookmark(item.id, true)}
              >
                {isBookmarked ? (
                  <IoBookmark color="#f59e0b" size={18} />
                ) : (
                  <CiBookmark size={18} color="#4b5563" />
                )}
              </button>
            </div>
          </div>
      
          {/* Phần nội dung bên phải */}
          <div style={{
            flex: 1,
            padding: "16px",
            display: "flex",
            flexDirection: "column"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "8px"
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  marginBottom: "4px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#111827"
                }}>
                  {item.collectionName}
                </h3>
                {!isCommunity && (
                  <p style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#3b82f6",
                    fontStyle: "italic"
                  }}>
                    {item.isFamousPoet ? item.poetSample?.name : item.user?.displayName || "Anonymous"}
                  </p>
                )}
              </div>
              
              <Dropdown
                overlay={
                  <Menu style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    padding: "4px 0"
                  }}>
                    <Menu.Item 
                      key="copylink"
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                      onClick={handleCopyLink}
                    >
                      <IoIosLink size={16} color="#6b7280" />
                      Sao chép liên kết
                    </Menu.Item>
                    {hasPermission && (
                      <Menu.Item 
                        key="delete"
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          color: "#ef4444",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                        onClick={handleDeleteCollection}
                      >
                        <DeleteOutlined />
                        Xóa
                      </Menu.Item>
                    )}
                  </Menu>
                }
                trigger={["click"]}
              >
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    color: "#6b7280",
                    ":hover": {
                      backgroundColor: "#f3f4f6"
                    }
                  }}
                >
                  <IoIosMore size={20} />
                </button>
              </Dropdown>
            </div>
      
            <div style={{
              flex: 1,
              marginBottom: "12px",
              fontSize: "14px",
              color: "#4b5563",
              lineHeight: "1.5",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {item.collectionDescription || "Không có mô tả"}
            </div>
      
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "auto"
            }}>
              <div style={{
                display: "flex",
                gap: "16px",
                fontSize: "14px",
                color: "#6b7280"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <LuBook size={16} />
                  <span>{item.totalChapter || 0}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MdOutlineKeyboardVoice size={16} />
                  <span>{item.totalRecord || 0}</span>
                </div>
              </div>
      
              <button
                onClick={() => navigate(`/collection/${item.id}`)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#3b82f6",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  ":hover": {
                    textDecoration: "underline"
                  }
                }}
              >
                Xem chi tiết <ArrowRightOutlined size={14} />
              </button>
            </div>
          </div>
        </div>
      );
}
export default CollectionCard;