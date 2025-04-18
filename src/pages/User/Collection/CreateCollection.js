import { LoadingOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiBookOpen, FiCheck, FiCheckCircle, FiEdit2, FiEdit3, FiImage, FiRefreshCw, FiSliders, FiUpload, FiXCircle, FiZap } from "react-icons/fi";

const CreateCollection = ({ handleBack, handleBackDetail, collection, setIsEditingCollection, setIsCreatingCollection, isKnowledgePoet, poetId, onCollectionCreated }) => {
    const [collectionFile, setCollectionFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalAIRenderImageOpen, setIsModalAIRenderImageOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [previewSelectedIndex, setPreviewSelectedIndex] = useState(0);
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
            console.log("isKnowledgePoet", isKnowledgePoet)
            if (isKnowledgePoet) {
                const method = collection ? "put" : "post";
                let url = `${process.env.REACT_APP_API_BASE_URL}/collections/v1/poet-sample/${poetId}`;
                if (method === "post") {
                    url = `${process.env.REACT_APP_API_BASE_URL}/collections/v1/poet-sample/${poetId}`;
                } else {
                    url = `${process.env.REACT_APP_API_BASE_URL}/collections/v1/poet-sample?poetSampleId=${poetId}`;
                }
                const response = await axios[method](url, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            } else {
                const url = `${process.env.REACT_APP_API_BASE_URL}/collections/v1`;
                const method = collection ? "put" : "post";
                const response = await axios[method](url, data, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            message.success(collection ? "Cập nhật tập thơ thành công!" : "Tạo tập thơ thành công!");
            if (onCollectionCreated) {
                onCollectionCreated();
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Có lỗi xảy ra!");
        } finally {
            setIsLoading(false);
            if (setIsCreatingCollection !== null) {
                setIsCreatingCollection(false);
            }
            if (setIsEditingCollection !== null) {
                setIsEditingCollection(false);
            }
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
                console.log("cơ bản");
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
            setPreviewImages(prev => [...prev, generatedImageUrl]);
            // Automatically select the new image
            setPreviewSelectedIndex(previewImages.length);

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
        if (previewImages.length === 0 || previewSelectedIndex === null) {
            message.error("Vui lòng chọn hình ảnh để áp dụng!");
            return;
        }
        try {
            setIsLoading(true);
            const selectedImageUrl = previewImages[previewSelectedIndex];
            // Replace this placeholder with your actual API call for applying the image.
            const applyResponse = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/image/ai`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageUrl: selectedImageUrl }),
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

            setPreviewSelectedIndex(0);
            setIsPreviewModalOpen(false);
        } catch (error) {
            message.error("Lỗi khi áp dụng hình ảnh!");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: "relative",
            maxWidth: "800px",
            margin: "0 auto",
            padding: "40px 20px",
            fontFamily: "'Cormorant Garamond', serif",
            minHeight: "100vh"
        }}>
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
                        background: "rgba(255, 255, 255, 0.8)"
                    }}
                >
                    <div style={{ textAlign: "center" }}>
                        <Spin
                            indicator={<LoadingOutlined style={{ fontSize: 48, color: "#8b5a2b" }} spin />}
                        />
                        <p style={{
                            marginTop: "20px",
                            color: "#5a3921",
                            fontSize: "1.2em",
                            fontStyle: "italic"
                        }}>Đang chuẩn bị không gian thơ...</p>
                    </div>
                </div>
            )}

            {/* Back button */}
            <div
                style={{
                    cursor: "pointer",
                    color: "#8b5a2b",
                    fontSize: "1.1em",
                    marginBottom: "30px",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                    ':hover': {
                        color: "#5a3921",
                        transform: "translateX(-3px)"
                    }
                }}
                onClick={handleBack || handleBackDetail}
            >
                <FiArrowLeft size={22} style={{ marginRight: "10px" }} />
                <span style={{ borderBottom: "1px dashed #8b5a2b" }}>Trở về trang trước</span>
            </div>

            <div style={{
                display: "flex",
                gap: "40px",
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(139, 90, 43, 0.1)",
                border: "1px solid #e8d9c5"
            }}>
                {/* Image Frame */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                    minWidth: "300px"
                }}>
                    <div style={{
                        position: "relative",
                        width: "300px",
                        height: "200px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e8d9c5"
                    }}>
                        <img
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease"
                            }}
                            src={collectionFile || data.collectionImage || "/check.png"}
                            alt="Ảnh bìa tập thơ"
                            onError={(e) => e.target.src = "/check.png"}
                        />
                        <div style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            background: "rgba(255, 255, 255, 0.9)",
                            padding: "5px 10px",
                            borderRadius: "20px",
                            fontSize: "0.8em",
                            color: "#5a3921",
                            border: "1px solid #e8d9c5"
                        }}>
                            {collectionFile ? "Ảnh mới" : "Ảnh mặc định"}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <label
                            style={{
                                backgroundColor: "#8b5a2b",
                                color: "#fff",
                                padding: "12px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                textAlign: "center",
                                fontSize: "1em",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                ':hover': {
                                    backgroundColor: "#5a3921",
                                    transform: "translateY(-2px)"
                                }
                            }}
                        >
                            <FiUpload />
                            Tải ảnh lên
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadImage} />
                        </label>

                        <Button
                            onClick={showModalAIRenderImage}
                            style={{
                                padding: "12px",
                                background: "linear-gradient(135deg, #d4a373, #8b5a2b)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "1em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                ':hover': {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 5px 15px rgba(139, 90, 43, 0.3)"
                                }
                            }}
                        >
                            <FiImage />
                            AI tạo hình ảnh
                        </Button>
                    </div>
                </div>

                {/* Information Form */}
                <div style={{
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    gap: "25px"
                }}>
                    <div>
                        <h4 style={{
                            marginBottom: "10px",
                            color: "#5a3921",
                            fontSize: "1.3em",
                            fontWeight: "600",
                            borderBottom: "1px solid #e8d9c5",
                            paddingBottom: "5px"
                        }}>
                            <FiBookOpen style={{ marginRight: "10px" }} />
                            Tên tập thơ
                        </h4>
                        <Input
                            name="collectionName"
                            placeholder="Ví dụ: Mùa thu vàng, Gió mùa về..."
                            value={data.collectionName}
                            onChange={handleChange}
                            style={{
                                padding: "12px 15px",
                                borderRadius: "6px",
                                border: "1px solid #e8d9c5",
                                fontSize: "1.1em",
                                fontFamily: "'Cormorant Garamond', serif",
                                ':focus': {
                                    borderColor: "#8b5a2b",
                                    boxShadow: "0 0 0 2px rgba(139, 90, 43, 0.2)"
                                }
                            }}
                        />
                    </div>

                    <div>
                        <h4 style={{
                            marginBottom: "10px",
                            color: "#5a3921",
                            fontSize: "1.3em",
                            fontWeight: "600",
                            borderBottom: "1px solid #e8d9c5",
                            paddingBottom: "5px"
                        }}>
                            <FiEdit2 style={{ marginRight: "10px" }} />
                            Mô tả tập thơ
                        </h4>
                        <Input.TextArea
                            name="collectionDescription"
                            placeholder="Hãy miêu tả về tập thơ của bạn..."
                            value={data.collectionDescription}
                            onChange={handleChange}
                            rows={5}
                            style={{
                                padding: "12px 15px",
                                borderRadius: "6px",
                                border: "1px solid #e8d9c5",
                                fontSize: "1.1em",
                                fontFamily: "'Cormorant Garamond', serif",
                                resize: "none",
                                ':focus': {
                                    borderColor: "#8b5a2b",
                                    boxShadow: "0 0 0 2px rgba(139, 90, 43, 0.2)"
                                }
                            }}
                        />
                    </div>

                    {/* Confirm Button */}
                    <div style={{
                        alignSelf: "flex-end",
                        marginTop: "20px"
                    }}>
                        <Button
                            onClick={handleSubmit}
                            style={{
                                padding: "12px 30px",
                                background: "linear-gradient(135deg, #8b5a2b, #5a3921)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "30px",
                                fontSize: "1.1em",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                boxShadow: "0 4px 6px rgba(139, 90, 43, 0.2)",
                                ':hover': {
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 6px 12px rgba(139, 90, 43, 0.3)"
                                }
                            }}
                        >
                            <FiCheckCircle />
                            Lưu tập thơ
                        </Button>
                    </div>
                </div>
            </div>

            {/* AI Render Image Modal */}
            <Modal
                open={isModalAIRenderImageOpen}
                onCancel={handleCancelRenderAIImageModal}
                footer={null}
                centered
                style={{
                    fontFamily: "'Cormorant Garamond', serif"
                }}
                bodyStyle={{
                    padding: "30px"
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <h2 style={{
                        fontSize: "1.8rem",
                        color: "#5a3921",
                        marginBottom: "10px",
                        fontWeight: "600"
                    }}>
                        <FiImage style={{ marginRight: "10px" }} />
                        AI Tạo Hình Ảnh
                    </h2>

                    <p style={{
                        fontSize: "1.1em",
                        color: "#8b5a2b",
                        marginBottom: "25px",
                        fontStyle: "italic"
                    }}>
                        "Mỗi tập thơ là một thế giới riêng, hãy để AI giúp bạn thể hiện điều đó qua hình ảnh"
                    </p>

                    <div style={{
                        marginBottom: "25px",
                        textAlign: "left"
                    }}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#5a3921",
                                fontSize: "1.1em"
                            }}>
                                <FiSliders style={{ marginRight: "8px" }} />
                                Phong cách hình ảnh
                            </label>
                            <Select
                                defaultValue="cơ bản"
                                style={{ width: "100%" }}
                                onChange={handleOptionChange}
                                dropdownStyle={{
                                    fontFamily: "'Cormorant Garamond', serif"
                                }}
                            >
                                <Option value="cơ bản">Cơ bản</Option>
                                <Option value="nâng cao">Nâng cao</Option>
                            </Select>
                        </div>

                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: "600",
                                color: "#5a3921",
                                fontSize: "1.1em"
                            }}>
                                <FiEdit3 style={{ marginRight: "8px" }} />
                                Gợi ý cho AI
                            </label>
                            <Input.TextArea
                                placeholder="Ví dụ: 'Một bức tranh mùa thu với lá vàng rơi, phong cách thủy mặc cổ điển'"
                                value={imagePrompt}
                                onChange={handleImagePromptChange}
                                rows={3}
                                style={{
                                    padding: "12px 15px",
                                    borderRadius: "6px",
                                    border: "1px solid #e8d9c5",
                                    fontSize: "1.1em",
                                    fontFamily: "'Cormorant Garamond', serif",
                                    resize: "none"
                                }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "15px",
                        marginTop: "30px"
                    }}>
                        <Button
                            onClick={handleCancelRenderAIImageModal}
                            style={{
                                padding: "10px 25px",
                                background: "none",
                                color: "#8b5a2b",
                                border: "1px solid #e8d9c5",
                                borderRadius: "30px",
                                fontSize: "1em",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                ':hover': {
                                    backgroundColor: "#f8f4f0"
                                }
                            }}
                        >
                            <FiXCircle style={{ marginRight: "8px" }} />
                            Đóng
                        </Button>

                        <Button
                            onClick={handleAIRenderImage}
                            style={{
                                padding: "10px 25px",
                                background: "linear-gradient(135deg, #8b5a2b, #5a3921)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "30px",
                                fontSize: "1em",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                ':hover': {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 8px rgba(139, 90, 43, 0.3)"
                                }
                            }}
                        >
                            <FiZap style={{ marginRight: "8px" }} />
                            Tạo hình ảnh
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal for Generated Image */}
            <Modal
                open={isPreviewModalOpen}
                onCancel={handleCancelPreview}
                footer={null}
                centered
                width="800px"
                style={{
                    fontFamily: "'Cormorant Garamond', serif"
                }}
                bodyStyle={{
                    padding: "30px"
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <h2 style={{
                        fontSize: "1.8rem",
                        color: "#5a3921",
                        marginBottom: "5px",
                        fontWeight: "600"
                    }}>
                        <FiImage style={{ marginRight: "10px" }} />
                        Hình ảnh đã tạo
                    </h2>

                    <p style={{
                        fontSize: "1.1em",
                        color: "#8b5a2b",
                        marginBottom: "25px"
                    }}>
                        Chọn hình ảnh bạn muốn sử dụng cho tập thơ
                    </p>

                    {previewImages.length > 0 ? (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                gap: "20px",
                                maxHeight: "400px",
                                overflowY: "auto",
                                padding: "10px"
                            }}
                        >
                            {previewImages.map((imgUrl, index) => (
                                <div
                                    key={index}
                                    onClick={() => setPreviewSelectedIndex(index)}
                                    style={{
                                        position: "relative",
                                        border: previewSelectedIndex === index
                                            ? "3px solid #8b5a2b"
                                            : "2px solid #e8d9c5",
                                        borderRadius: "8px",
                                        padding: "5px",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        overflow: "hidden",
                                        ':hover': {
                                            transform: "translateY(-5px)",
                                            boxShadow: "0 10px 20px rgba(139, 90, 43, 0.1)"
                                        }
                                    }}
                                >
                                    <img
                                        src={imgUrl}
                                        alt={`Preview ${index + 1}`}
                                        style={{
                                            width: "100%",
                                            height: "160px",
                                            objectFit: "cover",
                                            borderRadius: "5px"
                                        }}
                                    />
                                    {previewSelectedIndex === index && (
                                        <div style={{
                                            position: "absolute",
                                            top: "10px",
                                            right: "10px",
                                            background: "rgba(139, 90, 43, 0.9)",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            width: "28px",
                                            height: "28px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <FiCheck />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: "40px",
                            border: "2px dashed #e8d9c5",
                            borderRadius: "8px",
                            margin: "20px 0"
                        }}>
                            <FiImage style={{
                                fontSize: "3em",
                                color: "#e8d9c5",
                                marginBottom: "15px"
                            }} />
                            <p style={{
                                color: "#8b5a2b",
                                fontSize: "1.1em"
                            }}>
                                Chưa có hình ảnh nào được tạo
                            </p>
                        </div>
                    )}

                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "15px",
                        marginTop: "30px"
                    }}>
                        <Button
                            onClick={handleCancelPreview}
                            style={{
                                padding: "10px 25px",
                                background: "none",
                                color: "#8b5a2b",
                                border: "1px solid #e8d9c5",
                                borderRadius: "30px",
                                fontSize: "1em",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                ':hover': {
                                    backgroundColor: "#f8f4f0"
                                }
                            }}
                        >
                            <FiXCircle style={{ marginRight: "8px" }} />
                            Hủy bỏ
                        </Button>

                        <Button
                            onClick={handleAIRenderImage}
                            style={{
                                padding: "10px 25px",
                                background: "linear-gradient(135deg, #d4a373, #8b5a2b)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "30px",
                                fontSize: "1em",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                ':hover': {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 8px rgba(139, 90, 43, 0.3)"
                                }
                            }}
                        >
                            <FiRefreshCw style={{ marginRight: "8px" }} />
                            Tạo mới
                        </Button>

                        <Button
                            onClick={handleApplyPreviewImage}
                            style={{
                                padding: "10px 25px",
                                background: "linear-gradient(135deg, #8b5a2b, #5a3921)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "30px",
                                fontSize: "1em",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                ':hover': {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 8px rgba(139, 90, 43, 0.3)"
                                }
                            }}
                        >
                            <FiCheck style={{ marginRight: "8px" }} />
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CreateCollection;


