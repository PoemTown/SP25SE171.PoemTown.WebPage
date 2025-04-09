import { Button, Input, message, Modal, Select, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";

const CreateCollection = ({ handleBack, handleBackDetail, collection, setIsCreatingCollection }) => {
    const [collectionFile, setCollectionFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalAIRenderImageOpen, setIsModalAIRenderImageOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [imagePrompt, setImagePrompt] = useState("");
    const { Option } = Select;
    const [imageType, setImageType] = useState("cơ bản");
    const accessToken = localStorage.getItem("accessToken");
    const token = localStorage.getItem("accessToken");
    const [data, setData] = useState({
        id: null,
        collectionName: "",
        collectionDescription: "",
        collectionImage: "",
        rowVersion: "",
    });

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

    const handleOptionChange = (value) => {
        setImageType(value);
    };

    const handleSubmit = async () => {
        if (!data.collectionName || !data.collectionDescription) {
            message.error("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        try {
            setIsLoading(true);
            const url = `${process.env.REACT_APP_API_BASE_URL}/collections/v1`;
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
        } finally {
            setIsLoading(false);
            setIsCreatingCollection(false);
        }
    };

    const handleUploadImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            try {
                setIsLoading(true);
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/collections/v1/image`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    }
                );

                if (!response.ok) throw new Error("Failed to upload image");

                const dataRes = await response.json();
                const uploadedImageUrl = dataRes.data;

                message.success("Ảnh tải lên thành công!");
                sessionStorage.setItem("collectionImage", uploadedImageUrl);
                setData((prev) => ({ ...prev, collectionImage: uploadedImageUrl }));
                setCollectionFile(uploadedImageUrl);
            } catch (error) {
                message.error("Lỗi khi tải ảnh lên!");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Show AI modal to enter image prompt
    const showModalAIRenderImage = () => {
        setIsModalAIRenderImageOpen(true);
    };

    const handleCancelRenderAIImageModal = () => {
        setIsModalAIRenderImageOpen(false);
    };

    const handleImagePromptChange = (e) => {
        setImagePrompt(e.target.value);
    };

    // Fetch the AI-generated image and show it in a preview modal
    const handleAIRenderImage = async () => {
        if (imagePrompt.trim() === "") {
            message.error("Hãy nhập yêu cầu về hình ảnh của bạn!");
            return;
        }
        setPreviewImage(null);
        try {
            setIsLoading(true);
            let responseImage = null;
            if (imageType === "nâng cao") {
                responseImage = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/poems/v1/text-to-image/open-ai?imageSize=1&imageStyle=2&poemText=${encodeURIComponent(imagePrompt)}&prompt="Render an image base on my requirement, return an image width: 780px height: 438px "`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } else {
                const requestBodyImage = {
                    imageSize: 1,
                    poemText: imagePrompt,
                    prompt: `Render an image base on my requirement for me.`,
                    negativePrompt: "Image response must not contain any text",
                    numberInferenceSteps: 5,
                    guidanceScale: 3,
                    numberOfImages: 1,
                    outPutFormat: 2,
                    outPutQuality: 100,
                };

                responseImage = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/poems/v1/text-to-image/the-hive-ai/sdxl-enhanced`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBodyImage),
                    }
                );
            }

            const dataRes = await responseImage.json();
            let generatedImageUrl;
            if (imageType === "nâng cao") {
                generatedImageUrl = dataRes.data;
            } else if (imageType === "cơ bản") {
                if (dataRes.data.output && dataRes.data.output.length > 0) {
                    generatedImageUrl = dataRes.data.output[0].url;
                } else {
                    generatedImageUrl = dataRes.data;
                }
            }
            // Set the preview image and open the preview modal
            setPreviewImage(generatedImageUrl);
            setIsModalAIRenderImageOpen(false);
            setIsPreviewModalOpen(true);
        } catch (error) {
            message.error("Lỗi khi tạo hình ảnh!");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Cancel preview: close preview modal and reopen AI modal for adjustments.
    const handleCancelPreview = () => {
        setPreviewImage(null);
        setIsPreviewModalOpen(false);
        setIsModalAIRenderImageOpen(true);
    };

    // Apply the preview image: call another API and update the collection data.
    const handleApplyPreviewImage = async () => {
        try {
            setIsLoading(true);
            // Replace this placeholder with your actual API call for applying the image.
            const applyResponse = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/image/ai`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageUrl: previewImage }),
                }
            );
            if (!applyResponse.ok) {
                throw new Error("Failed to apply the image");
            }
            const imageData = await applyResponse.json();
            console.log("Image data", imageData);
            // On success, update the collection data and file.
            message.success("Poem Image updated successfully!");
            setData((prev) => ({ ...prev, collectionImage: imageData.data }));
            setCollectionFile(imageData.data);
            setPreviewImage(null);
            setIsPreviewModalOpen(false);
        } catch (error) {
            message.error("Lỗi khi áp dụng hình ảnh!");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
            {/* Overlay when loading */}
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <Spin size="large" />
                </div>
            )}

            {/* Back button */}
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

            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", backgroundColor: "#fff" }}>
                {/* Image Frame */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ flex: 1, width: "260px", height: "146px" }}>
                        <img
                            style={{
                                width: "260px",
                                height: "146px",
                                objectFit: "cover",
                                borderTopLeftRadius: "5px",
                                borderBottomLeftRadius: "5px",
                            }}
                            src={collectionFile || data.collectionImage || "/check.png"}
                            alt="Ảnh bộ sưu tập"
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <label
                            style={{
                                backgroundColor: "#3A86FF",
                                color: "#FBFBFB",
                                padding: "10px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                boxSizing: "border-box",
                                textAlign: "center",
                                fontSize: "0.9rem",
                            }}
                        >
                            Tải ảnh lên
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadImage} />
                        </label>
                        <Button onClick={showModalAIRenderImage} color="default" variant="solid" style={{ padding: "20px" }}>
                            AI tạo hình 🏞
                        </Button>
                    </div>
                </div>

                {/* Information Form */}
                <div style={{ flex: "2", display: "flex", flexDirection: "column" }}>
                    <div style={{ marginBottom: "15px" }}>
                        <h4 style={{ marginBottom: "5px", marginTop: "0px" }}>Tên tập thơ</h4>
                        <Input name="collectionName" placeholder="Nhập tên tập thơ" value={data.collectionName} onChange={handleChange} />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <h4 style={{ marginBottom: "5px", marginTop: "0px" }}>Mô tả</h4>
                        <Input.TextArea
                            name="collectionDescription"
                            placeholder="Nhập mô tả tập thơ"
                            value={data.collectionDescription}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                    {/* Confirm Button */}
                    <div style={{ alignSelf: "flex-end" }}>
                        <Button color="green" variant="solid" size="large" onClick={handleSubmit} style={{ padding: "10px 20px" }}>
                            Xác nhận
                        </Button>
                    </div>
                </div>
            </div>

            {/* AI Render Image Modal */}
            <Modal
                open={isModalAIRenderImageOpen}
                onCancel={handleCancelRenderAIImageModal}
                footer={
                    <>
                        <Button color="danger" variant="solid" onClick={handleCancelRenderAIImageModal}>
                            Đóng
                        </Button>
                        <Button color="primary" variant="solid" onClick={handleAIRenderImage}>
                            Xác nhận
                        </Button>
                    </>
                }
            >
                <div>
                    <h2 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "0px" }}>AI tạo hình ảnh 🏞</h2>
                    <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "5px", fontWeight: "bold" }}>
                        Hãy đảm bảo rằng bạn muốn AI tạo hình ảnh dựa trên{" "}
                        <span style={{ color: "#3A86ff", fontWeight: "bold" }}>yêu cầu của bạn</span> dưới đây. Hãy bấm{" "}
                        <span style={{ color: "#3A86ff", fontWeight: "bold" }}>"Xác nhận"</span> để AI bắt đầu tạo hình ảnh cho tập thơ của bạn.
                    </p>
                    <div style={{ marginBottom: "10px" }}>
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Loại hình ảnh</label>
                            <Select defaultValue="cơ bản" style={{ width: "100%" }} onChange={handleOptionChange}>
                                <Option value="cơ bản">Cơ bản</Option>
                                <Option value="nâng cao">Nâng cao</Option>
                            </Select>
                        </div>
                        <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Yêu cầu của bạn</label>
                        <Input placeholder="Hãy miêu tả hình ảnh bạn muốn" value={imagePrompt} onChange={handleImagePromptChange} />
                    </div>
                </div>
            </Modal>

            {/* Preview Modal for Generated Image */}
            <Modal
                open={isPreviewModalOpen}
                onCancel={handleCancelPreview}
                footer={
                    <>
                        <Button color="danger" variant="solid" onClick={handleCancelPreview}>
                            Hủy
                        </Button>
                        <Button color="primary" variant="solid" onClick={handleApplyPreviewImage}>
                            Áp dụng
                        </Button>
                    </>
                }
            >
                <div style={{ textAlign: "center" }}>
                    <h2>Bạn có muốn sử dụng hình này?</h2>
                    <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "5px", fontWeight: "bold" }}>
                        Hãy bấm{" "}
                        <span style={{ color: "#3A86ff", fontWeight: "bold" }}>"Xác nhận"</span> để áp dụng hình bên dưới vào tập thơ của bạn. Nếu không hài lòng, Vui lòng bấm {" "}
                        <span style={{ color: "#d14249", fontWeight: "bold" }}>"Hủy"</span> và tạo hình mới.
                    </p>
                    {previewImage ? (
                        <img loading={isLoading} src={previewImage} alt="Preview" style={{ width: "260px", height: "160px",  objectFit: "cover", marginTop: "10px" }} />
                    ) : (
                        <p>No image to preview</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default CreateCollection;
