import React, { useEffect, useState } from "react";
import { Button, Dropdown, Menu, message, Modal, Spin, Pagination } from "antd";
import { FiArrowLeft } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa6";
import { LuBook } from "react-icons/lu";
import { MdEdit } from "react-icons/md";
import { IoIosLink, IoIosMore } from "react-icons/io";
import { MdOutlineKeyboardVoice } from "react-icons/md";
import CreateCollection from "./CreateCollection";
import axios from "axios";
import { IoBookmark } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";
import { ArrowRightOutlined, DeleteOutlined, LoadingOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import YourCollectionDetail from "./YourCollectionDetail";
import { useNavigate } from "react-router-dom";

const YourCollection = ({ isCreatingCollection, setIsCreatingCollection, avatar, isMine, displayName, username }) => {
  const [collections, setCollection] = useState([]);
  const [statistic, setStatistic] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const [bookmarkedCollections, setBookmarkedCollections] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
  const navigate = useNavigate();
  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const [totalRecords, setTotalRecords] = useState(0);

  const requestHeaders = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
  };

  const keys = [
    "achievementBackgroundId",
    "achievementBorderId",
    "achievementTitleBackgroundId",
    "coverImageId",
    "mainBackgroundId",
    "navBackgroundId",
    "navBorderId",
    "selectedTemplate",
    "selectedTemplateId",
    "statisticBackgroundId",
    "statisticBorderId",
    "statisticTitleBackgroundId",
  ];
  const getSessionData = (keys) => {
    return keys.reduce((acc, key) => {
      acc[key] = sessionStorage.getItem(key);
      return acc;
    }, {});
  };

  const handleCopyLink = (id) => {
    const url = `${window.location.origin}/collection/${id}`;
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
    console.log("isMine", isMine);
    const fetchCollections = async () => {
      if (isMine != null) {
        try {
          const sessionValues = getSessionData(keys);
          setSessionData(sessionValues);

          setIsLoading(true);
          // Gọi API với phân trang
          if (isMine === true) {
            const [collectionsResponse, statisticResponse] = await Promise.all([
              fetch(
                `${process.env.REACT_APP_API_BASE_URL}/collections/v1?pageNumber=${currentPage}&pageSize=${pageSize}`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              ),
              fetch(`${process.env.REACT_APP_API_BASE_URL}/statistics/v1`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              }),
            ]);
            const [collectionsData, statisticData] = await Promise.all([
              collectionsResponse.json(),
              statisticResponse.json(),
            ]);
            if (collectionsData.statusCode === 200) {
              const bookmarkedIds = new Set();
              const formattedData = collectionsData.data.map((collection) => {
                if (collection.targetMark) bookmarkedIds.add(collection.id);
                return {
                  id: collection.id,
                  name: collection.collectionName,
                  description: collection.collectionDescription,
                  image: collection.collectionImage,
                  totalPoem: collection.totalChapter,
                  totalRecord: collection.totalRecord,
                  displayName: collection.user.displayName,
                  rowVersion: collection.rowVersion,
                };
              });
              setCollection(formattedData);
              setBookmarkedCollections(bookmarkedIds);
              if (collectionsData.totalPages) {
                setTotalRecords(collectionsData.totalPages * pageSize);
              }
            }
            if (statisticData.statusCode === 200) {
              setStatistic(statisticData.data);
            }
          } else if (isMine === false) {
            const collectionsResponse = await fetch(
              `${process.env.REACT_APP_API_BASE_URL}/collections/v1/user/${username}?pageNumber=${currentPage}&pageSize=${pageSize}`,
              {
                headers: requestHeaders,
              }
            );
            const collectionsData = await collectionsResponse.json();
            if (collectionsData.statusCode === 200) {
              console.log(collectionsData);
              const bookmarkedIds = new Set();
              const formattedData = collectionsData.data.map((collection) => {
                if (collection.targetMark) bookmarkedIds.add(collection.id);
                return {
                  id: collection.id,
                  name: collection.collectionName,
                  description: collection.collectionDescription,
                  image: collection.collectionImage,
                  totalPoem: collection.totalChapter,
                  totalRecord: collection.totalRecord,
                  displayName: collection.user.displayName,
                  rowVersion: collection.rowVersion,
                };
              });
              setCollection(formattedData);
              setBookmarkedCollections(bookmarkedIds);
              if (collectionsData.totalPages) {
                setTotalRecords(collectionsData.totalPages * pageSize);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching collections:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCollections();
  }, [reloadTrigger, currentPage, pageSize, isMine]);

  const handleBookmark = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

    const isBookmarked = bookmarkedCollections.has(id);
    const method = isBookmarked ? "DELETE" : "POST";

    try {
      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/collection/${id}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBookmarkedCollections((prev) => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const handleCreate = () => {
    setIsCreatingCollection(true);
  };

  const handleDelete = async (id, rowVersion) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/collections/v1/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            rowVersion: rowVersion,
          },
        }
      );

      console.log("Response:", response.data);
      setReloadTrigger((prev) => !prev);
      message.success("Xóa tập thơ thành công!");
    } catch (error) {
      console.error("Error:", error);
      message.error("Lỗi khi xóa!");
    }
  };

  const handleMoveToDetail = (id) => {
    navigate(`/collection/${id}`)
  };

  // Hàm handleBack dành cho cả Create và Detail.
  const handleBack = () => {
    // Khi quay lại từ màn hình chi tiết tuyển tập, reset selectedCollection về null.
    setSelectedCollection(null);
    setIsCreatingCollection(false);
    setReloadTrigger((prev) => !prev);
  };

  const showDeleteConfirm = (id, rowVersion) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa?",
      content: "Hành động này không thể hoàn tác!",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk() {
        handleDelete(id, rowVersion);
      },
    });
  };

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto",
      fontFamily: "'Merriweather', serif",
      '@media (max-width: 1440px)': {
        padding: "15px"
      },
      '@media (max-width: 768px)': {
        padding: "10px"
      }
    }}>
      {isLoading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 0",
          background: "linear-gradient(45deg, #f8f9fa, #f1f3f5)",
          '@media (max-width: 768px)': {
            padding: "40px 0"
          }
        }}>
          <Spin 
            size="large" 
            tip="Đang tải dữ liệu..." 
            indicator={<LoadingOutlined style={{ 
              fontSize: "48px",
              '@media (max-width: 768px)': {
                fontSize: "36px"
              }
            }} spin />}
          />
        </div>
      ) : (
        <>
          {selectedCollection ? (
            <YourCollectionDetail
              collection={selectedCollection}
              handleBack={handleBack}
              avatar={avatar}
            />
          ) : isCreatingCollection ? (
            <CreateCollection
              handleBack={handleBack}
              setIsCreatingCollection={setIsCreatingCollection}
              setIsEditingCollection={setIsEditingCollection}
              onCollectionCreated={() => {
                setCurrentPage(1);
                setReloadTrigger(prev => !prev);
              }}
            />
          ) : (
            <>
              {isMine && (
                <button
                  onClick={handleCreate}
                  style={{
                    backgroundColor: "#b0a499",
                    color: "#ecf0f1",
                    padding: "12px 24px",
                    borderRadius: "30px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "25px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.9em",
                    '@media (max-width: 768px)': {
                      padding: "10px 20px",
                      fontSize: "0.8em",
                      marginBottom: "20px"
                    },
                    ':hover': {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                      backgroundColor: "#34495e"
                    }
                  }}
                >
                  <PlusOutlined />
                  BỘ SƯU TẬP MỚI
                </button>
              )}
  
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "25px",
                padding: "15px 0",
                '@media (max-width: 1024px)': {
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px"
                },
                '@media (max-width: 768px)': {
                  gridTemplateColumns: "1fr",
                  gap: "15px"
                }
              }}>
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
                      backgroundColor: "#ffffff",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      position: "relative",
                      '@media (max-width: 768px)': {
                        borderRadius: "10px"
                      },
                      ':hover': {
                        transform: "translateY(-3px)",
                        boxShadow: "0 12px 25px rgba(0, 0, 0, 0.1)"
                      }
                    }}
                  >
                    <div style={{ 
                      position: "relative",
                      height: "180px",
                      overflow: "hidden",
                      '@media (max-width: 768px)': {
                        height: "160px"
                      }
                    }}>
                      <img
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease"
                        }}
                        src={collection.image || "/default_collection.jpg"} 
                        alt="Ảnh bộ sưu tập"
                      />
                      <div style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        display: "flex",
                        gap: "8px",
                        '@media (max-width: 768px)': {
                          top: "10px",
                          right: "10px"
                        }
                      }}>
                        <button
                          style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            '@media (max-width: 768px)': {
                              width: "30px",
                              height: "30px"
                            }
                          }}
                          onClick={() => handleBookmark(collection.id)}
                        >
                          {bookmarkedCollections.has(collection.id) ? (
                            <IoBookmark color="#f1c40f" size={18} />
                          ) : (
                            <CiBookmark size={18} color="#2c3e50" />
                          )}
                        </button>
                      </div>
                    </div>
  
                    <div style={{ 
                      padding: "16px",
                      '@media (max-width: 768px)': {
                        padding: "14px"
                      }
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "12px"
                      }}>
                        <h3 style={{
                          margin: 0,
                          color: "#2c3e50",
                          fontSize: "1.2em",
                          fontWeight: "700",
                          fontFamily: "'Playfair Display', serif",
                          '@media (max-width: 768px)': {
                            fontSize: "1.1em"
                          }
                        }}>
                          {collection.name}
                        </h3>
                        <Dropdown
                          overlay={
                            <Menu style={{
                              borderRadius: "6px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                            }}>
                              <Menu.Item 
                                key="copylink" 
                                style={{
                                  padding: "10px 16px",
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                  fontSize: "0.9em"
                                }}
                                onClick={() => handleCopyLink(collection.id)}
                              >
                                <IoIosLink color="#7f8c8d" size={16} />
                                Sao chép liên kết
                              </Menu.Item>
                              {isMine && (
                                <Menu.Item 
                                  key="delete"
                                  style={{
                                    padding: "10px 16px",
                                    color: "#e74c3c",
                                    fontSize: "0.9em"
                                  }}
                                  onClick={() => showDeleteConfirm(collection.id, collection.rowVersion)}
                                >
                                  <DeleteOutlined /> Xóa
                                </Menu.Item>
                              )}
                            </Menu>
                          }
                        >
                          <MoreOutlined 
                            style={{ 
                              fontSize: "18px",
                              color: "#7f8c8d",
                              cursor: "pointer",
                              padding: "4px",
                              borderRadius: "50%",
                              transition: "all 0.2s ease",
                              ':hover': {
                                backgroundColor: "rgba(0, 0, 0, 0.05)"
                              }
                            }}
                          />
                        </Dropdown>
                      </div>
  
                      <div style={{
                        marginBottom: "12px",
                        color: "#34495e",
                        fontSize: "0.9em",
                        lineHeight: "1.5",
                        minHeight: "54px",
                        '@media (max-width: 768px)': {
                          fontSize: "0.85em"
                        }
                      }}>
                        {collection.description || "Không có mô tả"}
                      </div>
  
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #eee",
                        paddingTop: "12px",
                        '@media (max-width: 768px)': {
                          paddingTop: "10px"
                        }
                      }}>
                        <div style={{ 
                          display: "flex", 
                          gap: "12px",
                          '@media (max-width: 768px)': {
                            gap: "10px"
                          }
                        }}>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "4px",
                            fontSize: "0.9em"
                          }}>
                            <LuBook color="#3498db" size={16} />
                            <span style={{ color: "#7f8c8d" }}>{collection.totalPoem}</span>
                          </div>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "4px",
                            fontSize: "0.9em"
                          }}>
                            <MdOutlineKeyboardVoice color="#e74c3c" size={16} />
                            <span style={{ color: "#7f8c8d" }}>{collection.totalRecord}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleMoveToDetail(collection.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#2c3e50",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                            padding: "6px 12px",
                            borderRadius: "18px",
                            fontSize: "0.9em",
                            backgroundColor: "rgba(52, 152, 219, 0.1)",
                            ':hover': {
                              backgroundColor: "rgba(52, 152, 219, 0.2)"
                            },
                            '@media (max-width: 768px)': {
                              padding: "5px 10px",
                              fontSize: "0.85em"
                            }
                          }}
                        >
                          <span>Khám phá</span>
                          <ArrowRightOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
  
              <div style={{ 
                marginTop: "30px",
                display: "flex",
                justifyContent: "center",
                padding: "15px 0",
                '@media (max-width: 768px)': {
                  marginTop: "25px",
                  padding: "10px 0"
                }
              }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={["6", "9", "12"]}
                  itemRender={(current, type, originalElement) => (
                    <div style={{
                      color: type === 'page' ? '#2c3e50' : '#3498db',
                      fontWeight: type === 'page' ? 'normal' : 'bold',
                      fontSize: "0.95em",
                      '@media (max-width: 768px)': {
                        fontSize: "0.85em"
                      }
                    }}>
                      {originalElement}
                    </div>
                  )}
                  style={{
                    fontFamily: "'Merriweather', serif"
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
export default YourCollection;
