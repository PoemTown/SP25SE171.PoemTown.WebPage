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
      message.error(error.response.data?.errorMessage);
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
      padding: "20px",
      fontFamily: "'Merriweather', serif" // Sử dụng font phù hợp với thơ ca
    }}>
      {isLoading ? (
        <div style={{ 
          textAlign: "center", 
          padding: "100px 0",
          background: "linear-gradient(45deg, #f8f9fa, #f1f3f5)"
        }}>
          <Spin 
            size="large" 
            tip="Đang tải dữ liệu..." 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: "#2c3e50" }} spin />}
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
                    backgroundColor: "#2c3e50",
                    color: "#ecf0f1",
                    padding: "15px 30px",
                    borderRadius: "30px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "30px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.8em",
                    ':hover': {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                      backgroundColor: "#34495e"
                    }
                  }}
                >
                  <PlusOutlined />
                  TẠO BỘ SƯU TẬP MỚI
                </button>
              )}
  
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "30px",
                position: "relative",
                padding: "20px 0"
              }}>
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    style={{
                      borderRadius: "15px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                      backgroundColor: "#ffffff",
                      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      overflow: "hidden",
                      position: "relative",
                      ':hover': {
                        transform: "translateY(-5px)",
                        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.12)"
                      }
                    }}
                  >
                    <div style={{ 
                      position: "relative",
                      height: "200px",
                      overflow: "hidden",
                      borderTopLeftRadius: "15px",
                      borderTopRightRadius: "15px"
                    }}>
                      <img
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter: "brightness(0.95)",
                          transition: "transform 0.3s ease"
                        }}
                        src={collection.image || "/poetry-placeholder.jpg"}
                        alt="Ảnh bộ sưu tập"
                      />
                      <div style={{
                        position: "absolute",
                        top: "15px",
                        right: "15px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "center"
                      }}>
                        <button
                          style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "none",
                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                          onClick={() => handleBookmark(collection.id)}
                        >
                          {bookmarkedCollections.has(collection.id) ? (
                            <IoBookmark color="#f1c40f" size={20} />
                          ) : (
                            <CiBookmark size={20} color="#2c3e50" />
                          )}
                        </button>
                      </div>
                    </div>
  
                    <div style={{ 
                      padding: "20px",
                      background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "15px"
                      }}>
                        <h3 style={{
                          margin: 0,
                          color: "#2c3e50",
                          fontSize: "1.4em",
                          fontWeight: "700",
                          fontFamily: "'Playfair Display', serif"
                        }}>
                          {collection.name}
                        </h3>
                        <Dropdown
                          overlay={
                            <Menu style={{
                              borderRadius: "8px",
                              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
                            }}>
                              <Menu.Item 
                                key="copylink" 
                                style={{
                                  padding: "12px 20px",
                                  display: "flex",
                                  gap: "10px",
                                  alignItems: "center",
                                  fontSize: "0.95em"
                                }}
                                onClick={() => handleCopyLink(collection.id)}
                              >
                                <IoIosLink color="#7f8c8d" />
                                Sao chép liên kết
                              </Menu.Item>
                              {isMine && (
                                <Menu.Item 
                                  key="delete"
                                  style={{
                                    padding: "12px 20px",
                                    color: "#e74c3c",
                                    fontSize: "0.95em"
                                  }}
                                  onClick={() => showDeleteConfirm(collection.id, collection.rowVersion)}
                                >
                                  <DeleteOutlined /> Xóa bộ sưu tập
                                </Menu.Item>
                              )}
                            </Menu>
                          }
                        >
                          <MoreOutlined 
                            style={{ 
                              fontSize: "20px",
                              color: "#7f8c8d",
                              cursor: "pointer",
                              padding: "5px",
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
                        marginBottom: "15px",
                        color: "#34495e",
                        fontSize: "0.95em",
                        lineHeight: "1.6",
                        minHeight: "60px"
                      }}>
                        {collection.description || "Không có mô tả"}
                      </div>
  
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #eee",
                        paddingTop: "15px"
                      }}>
                        <div style={{ display: "flex", gap: "15px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <LuBook color="#3498db" />
                            <span style={{ color: "#7f8c8d" }}>{collection.totalPoem}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <MdOutlineKeyboardVoice color="#e74c3c" />
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
                            gap: "8px",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                            padding: "8px 15px",
                            borderRadius: "20px",
                            backgroundColor: "rgba(52, 152, 219, 0.1)",
                            ':hover': {
                              backgroundColor: "rgba(52, 152, 219, 0.2)"
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
                marginTop: "40px",
                display: "flex",
                justifyContent: "center",
                padding: "20px 0"
              }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={["8", "12", "16"]}
                  itemRender={(current, type, originalElement) => (
                    <div style={{
                      color: type === 'page' ? '#2c3e50' : '#3498db',
                      fontWeight: type === 'page' ? 'normal' : 'bold'
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
