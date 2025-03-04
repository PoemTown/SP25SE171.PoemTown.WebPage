import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; 

const CreatePoemForm = ({ onBack, initialData }) => {
  const [poemData, setPoemData] = useState({
    title: "",
    description: "",
    chapterNumber: "",
    collection: "",
    content: "",
  });

  useEffect(() => {
    if (initialData) {
      setPoemData({
        title: initialData.title || "",
        description: initialData.description || "",
        chapterNumber: initialData.chapterNumber || "",
        collection: initialData.collection || "",
        content: initialData.content || "",
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoemData({ ...poemData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await handleSubmit(0);
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
    }
  };

  const handleSubmit = async (status) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Vui lòng đăng nhập để đăng bài.");
      return;
    }

    const requestData = {
      title: poemData.title,
      content: poemData.content,
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapter) ? 0 : Number(poemData.chapter),
      chapterName: poemData.chapter || null,
      status: status,
      collectionId: poemData.collection ? poemData.collection : null,
      sourceCopyRightId: null,
      poemImageUrl: null,
      recordFiles: [],
      type: 0,
      isPublic: true,
    };

    try {
      const response = await axios.post(
        "https://api-poemtown-staging.nodfeather.win/api/poems/v1",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert(status === 1 ? "Bài thơ đã được đăng thành công!" : "Bài thơ đã được lưu nháp!");
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      alert("Không thể đăng bài. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
    }
  };

  const handleContentChange = (value) => {
    setPoemData({ ...poemData, content: value });
  };

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ← Quay Lại Danh Sách
      </button>

      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Sáng Tác Bài Thơ</h2>

      <form style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Tiêu đề</label>
          <input
            type="text"
            name="title"
            value={poemData.title}
            onChange={handleInputChange}
            placeholder="Enter Poem's Title"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Mô tả</label>
          <input
            type="text"
            name="description"
            value={poemData.description}
            onChange={handleInputChange}
            placeholder="Enter Poem's Description"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Chương số</label>
          <input
            type="text"
            name="chapter"
            value={poemData.chapterNumber}
            onChange={handleInputChange}
            placeholder="Ex: 1, 2, 3 or I, II, III"
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Tập thơ</label>
          <select
            name="collection"
            value={poemData.collection}
            onChange={handleInputChange}
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          >
            <option value="">Choose existing collection</option>
            <option value="collection1">Tập thơ mùa thu</option>
            <option value="collection2">Tập thơ tình yêu</option>
          </select>
        </div>

        <div style={{ marginBottom: "50px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Nội dung</label>
          <ReactQuill
            value={poemData.content}
            onChange={handleContentChange}
            style={{ height: "100px" }} 
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button
            type="button"
            onClick={handleSave}
            style={{ backgroundColor: "#ffc107", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            LƯU VÀO NHÁP
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(1)}
            style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            ĐĂNG BÀI
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoemForm;