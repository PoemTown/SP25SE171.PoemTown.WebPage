import { Button, Input, message } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

const CreateCollection = ({ handleBack, handleBackDetail, collection }) => {
    const [collectionFile, setCollectionFile] = useState(null);
    const [data, setData] = useState({
        id: null,
        collectionName: "",
        collectionDescription: "",
        collectionImage: "",
        rowVersion: "",
    });

    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        if (collection) {
            setData({
                id: collection.id,
                collectionName: collection.collectionName,
                collectionDescription: collection.collectionDescription,
                collectionImage: collection.collectionImage,
                rowVersion: collection.rowVersion,
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
            const url = `https://api-poemtown-staging.nodfeather.win/api/collections/v1`;
            const method = collection ? "put" : "post";
            const response = await axios[method](url, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            message.success(collection ? "Cập nhật tập thơ thành công!" : "Tạo tập thơ thành công!");
            console.log("Response:", response.data);
        } catch (error) {
            console.error("Error:", error);
            message.error("Có lỗi xảy ra!");
        }
    };

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
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

                if (!response.ok) throw new Error("Failed to upload image");

                const data = await response.json();
                const uploadedImageUrl = data.data;

                message.success("Ảnh tải lên thành công!");
                sessionStorage.setItem("collectionImage", uploadedImageUrl);
                setData((prev) => ({ ...prev, collectionImage: uploadedImageUrl }));
                setCollectionFile(uploadedImageUrl);
            } catch (error) {
                message.error("Lỗi khi tải ảnh lên!");
                console.error(error);
            }
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
            {/* Nút quay về */}
            <div
                style={{
                    cursor: "pointer",
                    color: "#007bff",
                    fontSize: "18px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                }}
                onClick={handleBack || handleBackDetail}
            >
                <FiArrowLeft size={20} style={{ marginRight: "8px" }} /> Quay về
            </div>

            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                {/* Khung ảnh */}
                <div
    style={{
        flex: "1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "10px",
        height: "205px",
        width: "280px",
        backgroundImage: `url(${collectionFile || data.collectionImage || "/check.png"})`,
        backgroundSize: "100% 100%", // Đảm bảo ảnh full div
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat", // Tránh lặp ảnh
        position: "relative",
    }}
>
    {/* Nút tải ảnh */}
    <label
        style={{
            backgroundColor: "#3A86FF",
            color: "#FBFBFB",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
            position: "absolute",
            bottom: "100px",
            fontSize: "14px",
        }}
    >
        Tải ảnh lên
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadImage} />
    </label>
</div>


                {/* Nhập thông tin */}
                <div style={{ flex: "2" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <h4 style={{ marginBottom: "5px" }}>Tên tập thơ</h4>
                        <Input
                            name="collectionName"
                            placeholder="Nhập tên tập thơ"
                            value={data.collectionName}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <h4 style={{ marginBottom: "5px" }}>Mô tả</h4>
                        <Input.TextArea
                            name="collectionDescription"
                            placeholder="Nhập mô tả tập thơ"
                            value={data.collectionDescription}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Nút xác nhận */}
                <div style={{ flex: "0.8", display: "flex", alignItems: "center", justifyContent: "center", margin: "auto 0" }}>
                    <Button type="primary" size="large" onClick={handleSubmit} style={{ padding: "10px 20px" }}>
                        Xác nhận
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateCollection;
