import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Spin, Select, Input, message, Card, Upload } from "antd";
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined, SendOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;


const poemTypeHandlers = {
    "Thơ Tự Do": {
        validate: (lines) => ({ isValid: true, message: "" }),
        format: (content) => {
            const plainText = content
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/p>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/\n+/g, '\n');
            return plainText.trim();
        }
    },
    "Thơ Lục Bát": {
        validate: (lines) => {
            if (lines.length === 0) return { isValid: false, message: "Chưa có nội dung" };
            const lastLineWords = lines[lines.length - 1].trim().split(/\s+/).length;
            if (lastLineWords !== 8) {
                return { isValid: false, message: "Câu cuối phải có 8 chữ" };
            }
            const isValid = lines.every((line, index) => {
                const wordCount = line.trim().split(/\s+/).length;
                return index % 2 === 0 ? wordCount === 6 : wordCount === 8;
            });
            return {
                isValid,
                message: isValid ? "" : "Thơ Lục bát phải theo luật: 6-8 luân phiên"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];
            let currentLineType = 6;

            for (let i = 0; i < words.length;) {
                const line = words.slice(i, i + currentLineType).join(' ');
                result.push(currentLineType === 6 ? `      ${line}` : line);
                i += currentLineType;
                currentLineType = currentLineType === 6 ? 8 : 6;
            }

            return result.join('\n');
        }
    },
    "Thơ Song Thất Lục Bát": {
        validate: (lines) => {
            if (lines.length % 4 !== 0) {
                return { isValid: false, message: "Phải có số câu chia hết cho 4 (7-7-6-8)" };
            }
            const pattern = [7, 7, 6, 8];
            const isValid = lines.every((line, index) => {
                const stanzaIndex = index % 4;
                return line.trim().split(/\s+/).length === pattern[stanzaIndex];
            });
            return {
                isValid,
                message: isValid ? "" : "Phải theo đúng luật: 7-7-6-8 cho mỗi khổ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];
            const pattern = [7, 7, 6, 8];
            let patternIndex = 0;

            for (let i = 0; i < words.length;) {
                const wordCount = pattern[patternIndex];
                const line = words.slice(i, i + wordCount).join(' ');
                result.push(line);
                i += wordCount;
                patternIndex = (patternIndex + 1) % 4;
            }

            return result.join('\n');
        }
    },
    "Thơ Thất Ngôn Tứ Tuyệt": {
        validate: (lines) => {
            if (lines.length !== 4) {
                return { isValid: false, message: "Phải có đúng 4 câu" };
            }
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 7);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 7 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < 28 && i < words.length; i += 7) {
                result.push(words.slice(i, i + 7).join(' '));
            }

            while (result.length < 4) {
                result.push("");
            }

            return result.slice(0, 4).join('\n');
        }
    },
    "Thơ Ngũ Ngôn Tứ Tuyệt": {
        validate: (lines) => {
            if (lines.length !== 4) {
                return { isValid: false, message: "Phải có đúng 4 câu" };
            }
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 5);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 5 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < 20 && i < words.length; i += 5) {
                result.push(words.slice(i, i + 5).join(' '));
            }

            while (result.length < 4) {
                result.push("");
            }

            return result.slice(0, 4).join('\n');
        }
    },
    "Thơ Thất Ngôn Bát Cú": {
        validate: (lines) => {
            if (lines.length !== 8) {
                return { isValid: false, message: "Phải có đúng 8 câu" };
            }
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 7);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 7 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < 56 && i < words.length; i += 7) {
                result.push(words.slice(i, i + 7).join(' '));
            }

            while (result.length < 8) {
                result.push("");
            }

            return result.slice(0, 8).join('\n');
        }
    },
    "Thơ 4 Chữ": {
        validate: (lines) => {
            if (lines.length === 0) return { isValid: false, message: "Chưa có nội dung" };
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 4);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 4 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < words.length; i += 4) {
                const line = words.slice(i, i + 4).join(' ');
                result.push(line);
            }

            return result.join('\n');
        }
    },
    "Thơ 5 Chữ": {
        validate: (lines) => {
            if (lines.length === 0) return { isValid: false, message: "Chưa có nội dung" };
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 5);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 5 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < words.length; i += 5) {
                const line = words.slice(i, i + 5).join(' ');
                result.push(line);
            }

            return result.join('\n');
        }
    },
    "Thơ 6 Chữ": {
        validate: (lines) => {
            if (lines.length === 0) return { isValid: false, message: "Chưa có nội dung" };
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 6);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 6 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < words.length; i += 6) {
                const line = words.slice(i, i + 6).join(' ');
                result.push(line);
            }

            return result.join('\n');
        }
    },
    "Thơ 7 Chữ": {
        validate: (lines) => {
            if (lines.length === 0) return { isValid: false, message: "Chưa có nội dung" };
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 7);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 7 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < words.length; i += 7) {
                const line = words.slice(i, i + 7).join(' ');
                result.push(line);
            }

            return result.join('\n');
        }
    },
    "Thơ 8 Chữ": {
        validate: (lines) => {
            if (lines.length === 0) return { isValid: false, message: "Chưa có nội dung" };
            const isValid = lines.every(line => line.trim().split(/\s+/).length === 8);
            return {
                isValid,
                message: isValid ? "" : "Mỗi câu phải có đúng 8 chữ"
            };
        },
        format: (content) => {
            const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(w => w.trim());
            let result = [];

            for (let i = 0; i < words.length; i += 8) {
                const line = words.slice(i, i + 8).join(' ');
                result.push(line);
            }

            return result.join('\n');
        }
    }
};

const CreatePoemForm = ({ initialData, onBack, collections, poetId, onPoemCreated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        description: "",
        status: 0,
        poemImage: "",
        type: "",
        collectionId: collections.length > 0 ? collections[0].id : ""
    });

    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [poemTypes, setPoemTypes] = useState([]);
    const [currentPoemType, setCurrentPoemType] = useState(null);
    const [fetchingTypes, setFetchingTypes] = useState(true);

    // Styles
    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px'
    };

    const titleStyle = {
        fontSize: '28px',
        color: '#333',
        margin: 0,
        fontWeight: 600
    };

    const formContentStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    };

    const cardStyle = {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: 'none'
    };

    const cardHeadStyle = {
        backgroundColor: '#fafafa',
        borderBottom: '1px solid #e8e8e8'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
        }
    };

    const formGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    };

    const formLabelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: 500,
        color: '#333'
    };

    const inputStyle = {
        width: '100%'
    };

    const editorStyle = {
        height: '300px',
        marginBottom: '20px'
    };

    const footerStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #f0f0f0'
    };

    // Fetch poem types from API
    useEffect(() => {
        const fetchPoemTypes = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/poem-types/v1`);
                if (response.data && response.data.data) {
                    const apiTypes = response.data.data.map(type => ({
                        id: type.id,
                        value: type.id,
                        label: type.name,
                        description: type.description,
                        color: type.color,
                        ...(poemTypeHandlers[type.name] || {
                            validate: (lines) => ({ isValid: true, message: "" }),
                            format: (content) => content
                        })
                    }));
                    setPoemTypes(apiTypes);

                    if (apiTypes.length > 0) {
                        setCurrentPoemType(apiTypes[0]);
                        setFormData(prev => ({
                            ...prev,
                            type: initialData?.type || apiTypes[0].value
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching poem types:", error);
                message.error("Không thể tải danh sách thể loại thơ");
            } finally {
                setFetchingTypes(false);
            }
        };

        fetchPoemTypes();
    }, []);

    // Initialize form with initialData if provided
    useEffect(() => {
        if (initialData && poemTypes.length > 0) {
            const type = poemTypes.find(t => t.value === initialData.type) || poemTypes[0];
            setFormData({
                title: initialData.title || "",
                content: initialData.content || "",
                description: initialData.description || "",
                status: initialData.status || 0,
                poemImage: initialData.poemImage || "",
                type: initialData.type || poemTypes[0].value,
                collectionId: initialData.collection?.id || (collections.length > 0 ? collections[0].id : "")
            });
            setCurrentPoemType(type);
        }
    }, [initialData, collections, poemTypes]);

    const uploadPoemImage = async (file) => {
        try {
            setImageLoading(true);

            if (!file) {
                message.error('Vui lòng chọn file ảnh');
                return null;
            }

            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('Chỉ được upload file ảnh (JPEG, PNG, etc.)');
                return null;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('Ảnh phải nhỏ hơn 5MB');
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/image`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data && response.data.data) {
                message.success('Upload ảnh thành công');
                return response.data.data;
            } else {
                message.error('Upload ảnh thất bại');
                return null;
            }
        } catch (error) {
            console.error('Lỗi khi upload ảnh:', error);
            message.error(error.response?.data?.message || 'Lỗi khi upload ảnh');
            return null;
        } finally {
            setImageLoading(false);
        }
    };

    const uploadProps = {
        accept: 'image/*',
        multiple: false,
        showUploadList: false,
        beforeUpload: (file) => {
            uploadPoemImage(file).then(imageUrl => {
                if (imageUrl) {
                    setFormData(prev => ({
                        ...prev,
                        poemImage: imageUrl
                    }));
                }
            });
            return false;
        },
        onChange: (info) => {
            if (info.file.status === 'error') {
                message.error(`${info.file.name} upload thất bại`);
            }
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'type') {
            const type = poemTypes.find(t => t.value === value);
            if (type) setCurrentPoemType(type);
            validatePoemContent(formData.content, value);
        }

        if (name === 'content') {
            validatePoemContent(value, formData.type);
        }
    };

    const validatePoemContent = (content, type) => {
        const currentType = poemTypes.find(t => t.value === type) || currentPoemType;
        if (!currentType) return true;

        const lines = content
            .replace(/<[^>]+>/g, '\n')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line);

        const validation = currentType.validate(lines);
        setValidationError(validation.message);
        return validation.isValid;
    };

    const formatPoemContent = () => {
        if (!currentPoemType?.format) return formData.content;
        return currentPoemType.format(formData.content);
    };

    const handleSubmit = async (status) => {
        if (!formData.title.trim()) {
            message.warning("Vui lòng nhập tiêu đề bài thơ");
            return;
        }

        if (!formData.content.trim()) {
            message.warning("Vui lòng nhập nội dung bài thơ");
            return;
        }

        if (!formData.collectionId) {
            message.warning("Vui lòng chọn tập thơ");
            return;
        }

        if (!validatePoemContent(formData.content, formData.type)) {
            message.error("Nội dung thơ không đúng luật: " + validationError);
            return;
        }

        try {
            setLoading(true);
            const formattedContent = formatPoemContent();

            const payload = {
                title: formData.title,
                content: formattedContent,
                description: formData.description,
                status: status,
                poemImage: formData.poemImage,
                type: formData.type,
                collectionId: formData.collectionId
            };

            const url = `${process.env.REACT_APP_API_BASE_URL}/poems/v1/poet-sample/${poetId}`;

            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                message.success(
                    status === 1
                        ? "Bài thơ đã được đăng thành công!"
                        : "Bài thơ đã được lưu nháp!"
                );
                if (onPoemCreated) onPoemCreated();
                if (onBack) onBack();
                else navigate(-1);
            } else {
                message.error(response.data?.message || "Có lỗi xảy ra khi gửi bài thơ");
            }
        } catch (error) {
            console.error("Error submitting poem:", error);
            message.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi bài thơ");
        } finally {
            setLoading(false);
        }
    };
    const renderValidationError = () => {
        if (!validationError) return null;

        return (
            <div style={{
                color: '#f5222d',
                margin: '10px 0 20px 0', // Thêm margin bottom lớn hơn
                padding: '10px',
                backgroundColor: '#fff1f0',
                borderRadius: '4px',
                border: '1px solid #ffa39e'
            }}>
                <strong>Lỗi:</strong> {validationError}
            </div>
        );
    };

    const renderPoemTypeDescription = () => {
        if (!currentPoemType) return null;

        return (
            <div style={{
                margin: '10px 0',
                padding: '10px',
                backgroundColor: '#f6ffed',
                borderRadius: '4px',
                border: '1px solid #b7eb8f'
            }}>
                <strong>Thể loại: {currentPoemType.label}</strong>
                <p>{currentPoemType.description}</p>
            </div>
        );
    };

    return (
        <div style={containerStyle}>
            <Spin spinning={loading || fetchingTypes} tip={fetchingTypes ? "Đang tải thể loại thơ..." : "Đang xử lý..."} size="large">
                <div style={headerStyle}>
                    <Button
                        type="text"
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        style={{ fontSize: '16px', marginRight: '20px', color: '#1890ff' }}
                    >
                        Quay lại
                    </Button>
                    <h1 style={titleStyle}>{initialData ? "Chỉnh sửa bài thơ" : "Sáng tác mới"}</h1>
                </div>

                <div style={formContentStyle}>
                    <Card
                        title="Thông tin cơ bản"
                        style={cardStyle}
                        headStyle={cardHeadStyle}
                    >
                        <div style={gridStyle}>
                            <div style={formGroupStyle}>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Tiêu đề bài thơ</label>
                                    <Input
                                        placeholder="Nhập tiêu đề..."
                                        value={formData.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>

                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Mô tả ngắn</label>
                                    <TextArea
                                        rows={3}
                                        placeholder="Mô tả về bài thơ..."
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Tập thơ</label>
                                    <Select
                                        value={formData.collectionId}
                                        onChange={(value) => handleChange('collectionId', value)}
                                        style={inputStyle}
                                        loading={loading}
                                        placeholder="Chọn tập thơ"
                                    >
                                        {collections.map((collection) => (
                                            <Option key={collection.id} value={collection?.id}>
                                                {collection.collectionName}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Thể loại thơ</label>
                                    <Select
                                        value={formData.type}
                                        onChange={(value) => handleChange('type', value)}
                                        style={inputStyle}
                                        loading={fetchingTypes}
                                    >
                                        {poemTypes.map(type => (
                                            <Option key={type.value} value={type.value}>
                                                {type.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={formLabelStyle}>Ảnh minh họa</label>
                                    <Upload {...uploadProps}>
                                        <Button
                                            icon={<UploadOutlined />}
                                            loading={imageLoading}
                                            size="large"
                                            block
                                        >
                                            {imageLoading ? 'Đang tải lên...' : 'Chọn ảnh'}
                                        </Button>
                                    </Upload>
                                </div>

                                {formData.poemImage && (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '16px',
                                        border: '1px dashed #d9d9d9',
                                        borderRadius: '8px',
                                        backgroundColor: '#fafafa',
                                        maxWidth: '100%'
                                    }}>
                                        <img
                                            src={formData.poemImage}
                                            alt="Ảnh minh họa bài thơ"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '500px',
                                                height: 'auto',
                                                display: 'block',
                                                margin: '0 auto',
                                                borderRadius: '4px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <div style={{ marginTop: '8px', color: '#666' }}>
                                            Ảnh đã tải lên
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Nội dung bài thơ"
                        style={cardStyle}
                        headStyle={cardHeadStyle}
                    >
                        {renderPoemTypeDescription()}

                        <div style={{ marginBottom: validationError ? '50px' : '20px' }}>
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => handleChange('content', value)}
                                modules={{
                                    toolbar: [
                                        ['bold', 'italic', 'underline'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['clean']
                                    ]
                                }}
                                style={editorStyle}
                                placeholder="Viết nội dung bài thơ tại đây..."
                            />
                        </div>

                        {renderValidationError()}

                        <div style={{ marginTop: '50px' }}>
                            <h4>Xem trước:</h4>
                            <pre style={{
                                whiteSpace: 'pre-wrap',
                                padding: '10px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                border: '1px solid #d9d9d9'
                            }}>
                                {formatPoemContent()}
                            </pre>
                        </div>
                    </Card>
                </div>

                <div style={footerStyle}>
                    <Button
                        type="default"
                        icon={<SaveOutlined />}
                        onClick={() => handleSubmit(0)}
                        style={{ width: '120px' }}
                        loading={loading}
                    >
                        Lưu nháp
                    </Button>
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => handleSubmit(1)}
                        style={{ width: '120px' }}
                        loading={loading}
                    >
                        Đăng bài
                    </Button>
                </div>
            </Spin>
        </div>
    );
};

export default CreatePoemForm;