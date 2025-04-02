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
import { MoreOutlined } from "@ant-design/icons";
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
                `https://api-poemtown-staging.nodfeather.win/api/collections/v1?pageNumber=${currentPage}&pageSize=${pageSize}`,
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              ),
              fetch("https://api-poemtown-staging.nodfeather.win/api/statistics/v1", {
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
              `https://api-poemtown-staging.nodfeather.win/api/collections/v1/user/${username}?pageNumber=${currentPage}&pageSize=${pageSize}`,
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
        `https://api-poemtown-staging.nodfeather.win/api/target-marks/v1/collection/${id}`,
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
        `https://api-poemtown-staging.nodfeather.win/api/collections/v1/${id}`,
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
      message.error("Có lỗi xảy ra khi xóa tập thơ!");
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
    <div style={{ maxWidth: "1200px", minHeight: "650px", margin: "0 auto" }}>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {/* Ưu tiên hiển thị chi tiết tuyển tập nếu có selectedCollection */}
          {selectedCollection ? (
            <YourCollectionDetail
              collection={selectedCollection}
              handleBack={handleBack}
              avatar={avatar}
            />
          ) : isCreatingCollection ? (
            <div style={{ padding: "0px" }}>
              <CreateCollection
                handleBack={handleBack}
                setIsCreatingCollection={setIsCreatingCollection}
              />
            </div>
          ) : (
            <>
              {isMine === true && (
                <button
                  onClick={handleCreate}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: "5px",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "block",
                    marginBottom: "20px",
                  }}
                >
                  BỘ SƯU TẬP MỚI
                </button>
              )}

              <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
                <div style={{ flex: 7 }}>
                  {collections.map((collection) => (
                    <div
                      key={collection.id}
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
                          style={{
                            width: "260px",
                            height: "146px",
                            objectFit: "cover",
                            borderTopLeftRadius: "5px",
                            borderBottomLeftRadius: "5px",
                          }}
                          src={collection.image ? collection.image : "/anhminhhoa.png"}
                          alt="Ảnh bộ sưu tập"
                        />
                      </div>
                      <div style={{
                        flex: 4, display: "flex", flexDirection: "column", padding: "16px"
                      }}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                          <p style={{ marginBottom: '1%', fontWeight: 'bold', marginTop: 0 }}>
                            {collection.name} -{" "}
                            <span style={{ color: "#007bff", fontWeight: "600", fontStyle: "italic", textDecoration: "underline", cursor: "pointer" }}>
                              {collection?.displayName || "Anonymous"}
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
                              onClick={() => handleBookmark(collection.id)}
                            >
                              {bookmarkedCollections.has(collection.id) ? (
                                <IoBookmark color="#FFCE1B" />
                              ) : (
                                <CiBookmark />
                              )}
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
                                  {isMine === true && (
                                    <Menu.Item
                                      key="delete"
                                      onClick={() => showDeleteConfirm(collection.id, collection.rowVersion)}
                                    >
                                      ❌ Xóa
                                    </Menu.Item>
                                  )}
                                </Menu>
                              }
                              trigger={["click"]}
                            >
                              <MoreOutlined
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
                        <p
                          style={{
                            marginRight: "20%",
                            marginBottom: 'auto',
                            marginTop: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal",  //  Cho phép xuống dòng
                            wordBreak: "break-word",  //  Bắt buộc nếu có từ dài
                          }}
                        >

                          <span style={{ fontWeight: 500 }}>Mô tả:</span> <span style={{ color: "#444" }}> {collection.description} </span>
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <LuBook />
                              <span>{collection.totalPoem}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <MdOutlineKeyboardVoice />
                              <span>{collection.totalRecord}</span>
                            </div>
                          </div>
                          <div style={{ color: "#007bff", fontWeight: "600", cursor: "pointer" }} onClick={() => handleMoveToDetail(collection.id)}>
                            <span>Xem tuyển tập &gt;</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phân trang */}
              <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={handlePageChange}
                  showSizeChanger
                  pageSizeOptions={["8", "16", "24"]}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default YourCollection;
