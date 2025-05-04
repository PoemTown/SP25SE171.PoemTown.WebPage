import { message, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { LuBook } from "react-icons/lu";
import { MdEdit, MdOutlineKeyboardVoice } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import PoemCard from "../components/componentHomepage/PoemCard";
import Headeruser from "../components/Headeruser";
import Headerdefault from "../components/Headerdefault";
import CreateCollection from "./User/Collection/CreateCollection";

const CollectionDetail = () => {
  const [data, setData] = useState({
    id: null,
    collectionName: "",
    collectionDescription: "",
    collectionImage: "",
    rowVersion: "",
  });
  const { id } = useParams();
  const accessToken = localStorage.getItem("accessToken");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);

  const requestHeaders = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` })
  };
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };
  const [poems, setPoem] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionDetails, setCollectionDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [isHovered, setIsHovered] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(false);
  const [isEditingCollection, setIsEditingCollection] = useState(false);
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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);


  const fetchData = async () => {

    try {
      //  Gọi API lấy chi tiết bộ sưu tập
      const response1 = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/collections/v1/${id}/detail`,
        { headers: requestHeaders }
      );
      const data1 = await response1.json();
      if (data1.statusCode === 200) {
        setCollectionDetails(data1.data);
        console.log("Collection Details:", data1.data);
      }

      // Gọi API lấy danh sách bài thơ trong bộ sưu tập
      const response2 = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1/${id}`,
        { headers: requestHeaders }
      );
      const data2 = await response2.json();
      if (data2.statusCode === 200) {
        const initialBookmarkedState = {};
        const initialLikedState = {};

        data2.data.forEach(item => {
          initialLikedState[item.id] = !!item.like;
          initialBookmarkedState[item.id] = !!item.targetMark;
        });

        const collectionInfo = {
          id: data1.data.id,
          collectionName: data1.data.collectionName,
        };

        const updatedPoems = data2.data.map(item => ({
          ...item,
          collection: collectionInfo,
        }));

        setPoem(updatedPoems);
        setBookmarkedPosts(initialBookmarkedState);
        setLikedPosts(initialLikedState);

        console.log("Poems:", updatedPoems);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false); // <-- Tắt loading sau khi fetch xong
    }
  };

  const onCollectionCreated = async () => {
    // Re-fetch both the collection detail data and the list of all collections.
    await Promise.all([fetchData(), fetchCollections()]);
  };


  useEffect(() => {
    // Initial fetches – note: include dependency on id and reloadTrigger if needed.
    if (id) {
      fetchCollections();
      fetchData();
    }
  }, [id, reloadTrigger]);

  const fetchCollections = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/collections/v1`,
        {
          headers: requestHeaders,
        }
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        console.log("Response:", data.data);
        setCollections(data.data.map((collection) => ({
          id: collection.id,
          name: collection.collectionName,
        })));
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleMove = async (collectionId, poemId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/collections/v1/${collectionId}/${poemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update Response:", response.data);
      setReloadTrigger((prev) => !prev);

      message.success("Cập nhật tập thơ thành công!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.errorMessage);
      message.error(error.response?.data.errorMessage);
    }

    console.log("Chuyển bài thơ:", collectionId, poemId);
  };



  const handleUpdate = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/collections/v1`,
        data,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update Response:", response.data);
      setReloadTrigger((prev) => !prev);

      message.success("Cập nhật tập thơ thành công!");
    } catch (error) {
      console.error("Error:", error.response?.data || error.errorMessage);
      message.error(error.response?.data.errorMessage);
    }
  };

  const handleMoveToUpdate = () => {
    setIsEditingCollection(true);
  };

  const handleLike = async (postId) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

    const isCurrentlyLiked = likedPosts[postId];
    const method = isCurrentlyLiked ? "DELETE" : "POST";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/likes/v1/${postId}`,
        { method, headers }
      );

      if (response.ok) {
        setLikedPosts(prev => ({
          ...prev,
          [postId]: !isCurrentlyLiked
        }));


        setPoem(prevData => prevData.map(item =>
          item.id === postId ? {
            ...item,
            likeCount: isCurrentlyLiked ? item.likeCount - 1 : item.likeCount + 1
          } : item
        ));
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  }

  const handleBack = () => {
    setIsEditingCollection(false);
  }

  const handleBookmark = async (id) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) { message.error("Bạn cần đăng nhập để sử dụng chức năng này!"); return; };

    const endpoint = `${process.env.REACT_APP_API_BASE_URL}/target-marks/v1/poem/${id}`;

    const currentState = bookmarkedPosts[id];

    try {
      const response = await fetch(endpoint, {
        method: currentState ? "DELETE" : "POST",
        headers
      });

      if (response.ok) {
        setBookmarkedPosts(prev => ({
          ...prev,
          [id]: !currentState
        }));
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Noto Serif', serif", backgroundColor: "#f9f7f5" }}>
      {isLoggedIn ? <Headeruser /> : <Headerdefault />}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", minHeight:"850px" }}>
        {/* Nút quay lại */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#5d4037",
            fontSize: "16px",
            marginBottom: "24px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            ":hover": {
              color: "#3e2723",
              transform: "translateX(-2px)"
            }
          }}
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft size={20} />
          <span>Quay về</span>
        </div>

        {isEditingCollection ? (
          <CreateCollection
            collection={collectionDetails}
            setIsEditingCollection={setIsEditingCollection}
            setIsCreatingCollection={setIsCreatingCollection}
            handleBack={handleBack}
            onCollectionCreated={onCollectionCreated}
            isKnowledgePoet={collectionDetails.isFamousPoet}
            poetId={collectionDetails.poetSample?.id}
          />
        ) : (
          <>
            {/* Phần thông tin bộ sưu tập */}
            <div
              style={{
                display: 'flex',
                padding: "24px",
                marginBottom: "32px",
                gap: '24px',
                border: '1px solid #e0d6cc',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
                backgroundColor: '#fff',
                backgroundImage: 'linear-gradient(to bottom right, #fff, #f5f0e9)',
                position: 'relative',
                overflow: 'hidden',
                "::before": {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: '#8d6e63'
                }
              }}
            >
              {/* Hình ảnh bộ sưu tập */}
              <div
                style={{
                  width: "240px",
                  minWidth: "240px",
                  height: "180px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}
              >
                <img
                  src={collectionDetails.collectionImage || "/default_collection.jpg"}
                  alt="Ảnh bộ sưu tập"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: 'transform 0.3s ease',
                    ":hover": {
                      transform: 'scale(1.02)'
                    }
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  color: 'white',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  {collectionDetails.totalChapter} bài thơ • {collectionDetails.totalRecord} bản ghi
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h1 style={{
                    margin: 0,
                    marginBottom: '8px',
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#3e2723',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    {collectionDetails.collectionName}
                  </h1>

                  <p style={{
                    margin: 0,
                    color: "#5d4037",
                    fontStyle: 'italic',
                    fontSize: '14px'
                  }}>
                    {collectionDetails.isFamousPoet
                      ? `Tác giả: ${collectionDetails.poetSample?.name}`
                      : `Người tạo: ${collectionDetails.user?.displayName || "Ẩn danh"}`}
                  </p>
                </div>

                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f5f0e9',
                  borderRadius: '6px',
                  borderLeft: '3px solid #8d6e63'
                }}>
                  <p style={{
                    margin: 0,
                    color: "#4e342e",
                    fontSize: '15px',
                    lineHeight: '1.6',
                    textAlign: "justify",

                  }}>
                    {collectionDetails.collectionDescription || "Chưa có mô tả"}
                  </p>
                </div>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: 'absolute',
                  bottom: 0,
                  width: '100%'
                }}>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#5d4037",
                      fontSize: '14px'
                    }}>
                      <LuBook size={16} />
                      <span>{collectionDetails.totalChapter || 0} bài thơ</span>
                    </div>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#5d4037",
                      fontSize: '14px'
                    }}>
                      <MdOutlineKeyboardVoice size={16} />
                      <span>{collectionDetails.totalRecord || 0} bản ghi</span>
                    </div>
                  </div>

                  {(collectionDetails.isMine || (hasPermission && collectionDetails.isFamousPoet)) && (
                    <button
                      onClick={handleMoveToUpdate}
                      style={{
                        background: "none",
                        border: "1px solid #8d6e63",
                        color: "#5d4037",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "14px",
                        transition: "all 0.3s ease",
                        ":hover": {
                          backgroundColor: "#8d6e63",
                          color: "white"
                        }
                      }}
                    >
                      <MdEdit size={16} />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Phần nội dung chính */}
            <div style={{ display: "flex", gap: "32px" }}>
              {/* Danh sách bài thơ */}
              <div style={{ flex: 7 }}>
                <h2 style={{
                  color: "#3e2723",
                  borderBottom: "2px solid #d7ccc8",
                  paddingBottom: "8px",
                  marginBottom: "20px",
                  fontSize: "20px"
                }}>
                  Danh sách bài thơ
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {poems.length > 0 ? (
                    poems.map((poem) => (
                      <PoemCard
                        key={poem.id}
                        item={poem}
                        liked={likedPosts[poem.id]}
                        bookmarked={bookmarkedPosts[poem.id]}
                        onBookmark={handleBookmark}
                        onLike={handleLike}
                        onHover={setIsHovered}
                        collections={collections}
                        handleMove={handleMove}
                        onPoemCreated={fetchData}
                      />
                    ))
                  ) : (
                    <div style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px dashed #d7ccc8",
                      color: "#5d4037"
                    }}>
                      <LuBook size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>Chưa có bài thơ nào trong bộ sưu tập</h3>
                      <p style={{ margin: 0, fontSize: "14px" }}>Hãy thêm bài thơ đầu tiên vào bộ sưu tập này</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thống kê */}
              <div style={{ flex: 3, minWidth: "300px" }}>
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  border: "1px solid #e0d6cc",
                  padding: "20px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  marginBottom: "20px"
                }}>
                  <h3 style={{
                    fontWeight: "600",
                    textAlign: 'center',
                    margin: "0 0 16px 0",
                    color: "#5d4037",
                    fontSize: "18px",
                    borderBottom: "1px solid #e0d6cc",
                    paddingBottom: "8px"
                  }}>
                    Thống kê tập thơ
                  </h3>

                  <ul style={{
                    fontSize: "15px",
                    color: "#4e342e",
                    listStyle: "none",
                    padding: 0,
                    "& li": {
                      padding: "8px 0",
                      borderBottom: "1px dashed #e0d6cc",
                      display: "flex",
                      justifyContent: "space-between"
                    },
                    "& li:last-child": {
                      borderBottom: "none"
                    }
                  }}>
                    <li>
                      <span style={{ fontWeight: "500" }}>Tổng số bài thơ: </span>
                      <span style={{ color: "#5d4037" }}>{collectionDetails.totalChapter}</span>
                    </li>
                    <li>
                      <span style={{ fontWeight: "500" }}>Tổng số audio: </span>
                      <span style={{ color: "#5d4037" }}>{collectionDetails.totalRecord}</span>
                    </li>
                    <li>
                      <span style={{ fontWeight: "500" }}>Ngày phát hành: </span>
                      <span style={{ color: "#5d4037" }}>{formatDate(collectionDetails.createdTime)}</span>
                    </li>
                    <li>
                      <span style={{ fontWeight: "500" }}>Cập nhật gần nhất: </span>
                      <span style={{ color: "#5d4037" }}>{formatDate(collectionDetails.lastUpdatedTime)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CollectionDetail;