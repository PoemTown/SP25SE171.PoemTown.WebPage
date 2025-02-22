import { Button, Input, message, Radio } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
const CreateCollection = () => {
    const [collectionName, setCollectionName] = useState("");
    const [collectionDescription, setCollectionDescription] = useState("");
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySWQiOiIxN2I4ZjQ1NC0xZjkwLTQyODAtZGNjNy0wOGRkNGI3MWViNTIiLCJUb2tlbkhhc2giOiI2NmNhN2RlZjFiZjE5NjU2Y2ZjYmI5ZjAyM2ZkNDQ1YjIzYWVmMmNlOTI2ODI2ODJkMDg1NDczZWY1MmNhMGI2Iiwicm9sZSI6IlVTRVIiLCJuYmYiOjE3NDAyMTc5NjgsImV4cCI6MTc0MDIyMTU2OCwiaWF0IjoxNzQwMjE3OTY4LCJpc3MiOiJZb3VyQXBwSXNzdWVyIiwiYXVkIjoiWW91ckFwcEF1ZGllbmNlIn0.HlcCm5fcuEe6xao1VmfnFOkG9OLSoKXq6tqf4KdVq14";
    const handleSubmit = async () => {
        if (!collectionName || !collectionDescription) {
            message.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }

        const data = {
            collectionName: collectionName,
            collectionDescription: collectionDescription,
            collectionImage: ""
        };

        try {
            const response = await axios.post("https://localhost:7108/api/collections/v1", data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("Response:", response.data);
            message.success("Tạo tập thơ thành công!");
        } catch (error) {
            console.error("Error:", error);
            message.error("Có lỗi xảy ra khi tạo tập thơ!");
        }
    };
    return (
        <>
            <div style={{ display: 'flex', gap: '5%' }}>
                {/* Ảnh */}
                <div style={{
                    flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
                    backgroundImage: `url('/check.png')`, backgroundSize: "cover", height: "200px"
                }}>
                    <Radio.Button value="large" style={{ backgroundColor: '#3A86FF', color: '#FBFBFB' }}>
                        Tải ảnh lên
                    </Radio.Button>
                </div>

                {/* Nhập thông tin */}
                <div style={{ flex: 2 }}>
                    <div>
                        <h4 style={{ marginBottom: '1%' }}>Tên tập thơ</h4>
                        <Input
                            placeholder="Nhập tên tập thơ"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                        />
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1%' }}>Mô tả</h4>
                        <Input
                            placeholder="Nhập mô tả tập thơ"
                            value={collectionDescription}
                            onChange={(e) => setCollectionDescription(e.target.value)}
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
