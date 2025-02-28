import { Button, Input, message, Radio } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
const CreateCollection = ({ handleBack, handleBackDetail, collection }) => {
    const [collectionFile, setCollectionFile] = useState(null);

    const [data, setData] = useState({
        id: null,  
        collectionName: "",
        collectionDescription: "",
        collectionImage: ""
    });


    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (collection) {
            console.log(collection)
            setData({
                id: collection.id,
                collectionName: collection.collectionName,
                collectionDescription: collection.collectionDescription,
                collectionImage: collection.collectionImage
            });
        }
    }, [collection]);
    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!data.collectionName || !data.collectionDescription) {
            message.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        try {
            if (collection) {
                // 🛠 Nếu có selectedCollection → cập nhật tập thơ
                const response = await axios.put(
                    `https://api-poemtown-staging.nodfeather.win/api/collections/v1`,
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log("Update Response:", response.data);
                message.success("Cập nhật tập thơ thành công!");
            } else {
                // 🆕 Nếu không có selectedCollection → tạo tập thơ mới
                const response = await axios.post(
                    "https://api-poemtown-staging.nodfeather.win/api/collections/v1",
                    data,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log("Create Response:", response.data);
                message.success("Tạo tập thơ thành công!");
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Có lỗi xảy ra!");
        }
    };


    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setCollectionFile(imageUrl);

            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await fetch(
                    "https://api-poemtown-staging.nodfeather.win/api/collections/v1/image",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to upload image");
                }

                const data = await response.json();
                const uploadedImageUrl = data.data;

                message.success("Avatar updated successfully!");
                sessionStorage.setItem("collectionImage", uploadedImageUrl);
                setData((prev) => ({ ...prev, collectionImage: uploadedImageUrl }));
                setCollectionFile(uploadedImageUrl);
            } catch (error) {
                message.error("Error uploading image!");
                console.error(error);
            }
        }
    }
    return (
        <>
            <div
                style={{ cursor: "pointer", color: "#007bff", fontSize: "18px", marginBottom: "10px" }}
                onClick={handleBack || handleBackDetail}
            >
                <FiArrowLeft /> Quay về
            </div>


            <div style={{ display: 'flex', gap: '5%' }}>
            {/* Khung ảnh */}
            <div 
                size={80}
                style={{
                    flex: 1, 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center",
                    backgroundImage: `url(${collectionFile ? collectionFile : data.collectionImage ? data.collectionImage : '/check.png'})`,
                    backgroundSize: "cover", 
                    backgroundPosition: "center",
                    height: "200px",
                    borderRadius: "10px",
                    position: "relative"
                }}
            >
                {/* Nút tải ảnh */}
                <label 
                    style={{
                        backgroundColor: '#3A86FF',
                        color: '#FBFBFB',
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        position: "absolute",
                        bottom: "70px"
                    }}
                >
                    Tải ảnh lên
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleUploadImage}
                    />
                </label>
            </div>
        

                {/* Nhập thông tin */}
                <div style={{ flex: 2 }}>
                    <div>
                        <h4 style={{ marginBottom: '1%' }}>Tên tập thơ</h4>
                        <Input
                            name="collectionName"
                            placeholder="Nhập tên tập thơ"
                            value={data.collectionName}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1%' }}>Mô tả</h4>
                        <Input
                            name="collectionDescription"
                            placeholder="Nhập mô tả tập thơ"
                            value={data.collectionDescription}
                            onChange={handleChange}
                        />
                    </div>
                </div>


                {/* Xác nhận */}
                <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button type="primary" onClick={handleSubmit}>
                        Xác nhận
                    </Button>
                </div>
            </div>
        </>
    );
};

export default CreateCollection;
