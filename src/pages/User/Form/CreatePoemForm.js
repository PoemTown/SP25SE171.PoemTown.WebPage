import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Input, message, Modal, Select, Spin, Card, Upload, Tooltip } from "antd";
import { FcIdea } from "react-icons/fc";
import { FaSpellCheck } from "react-icons/fa6";
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined, SendOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const CreatePoemForm = ({ onBack, initialData, setDrafting, fetchPoems }) => {
  // State quản lý dữ liệu bài thơ
  const [poemData, setPoemData] = useState({
    title: "",
    description: "",
    chapterNumber: "",
    chapterName: "",
    poemImage: "",
    collectionId: "",
    content: "",
    recordFiles: [],
    status: 0,
    sourceCopyRightId: null,
    poemTypeId: "1"
  });

  // Các state khác
  const [imageLoading, setImageLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("1");
  const [collections, setCollections] = useState([]);
  const [poemFile, setPoemFile] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalContentCompleteOpen, setIsModalContentCompleteOpen] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [plagiarismPoems, setPlagiarismPoems] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewSelectedIndex, setPreviewSelectedIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [popupContentPlagiarism, setPopupContentPlagiarism] = useState(false);
  const [contentPlagiarism, setContentPlagiarism] = useState(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [imageType, setImageType] = useState("cơ bản");
  const [poemTypes, setPoemTypes] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const quillRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [duplicatePoem, setDuplicatePoem] = useState(null);

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

  const imagePreviewStyle = {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #e8e8e8'
  };

  const validationErrorStyle = {
    color: '#f5222d',
    margin: '10px 0',
    padding: '10px',
    backgroundColor: '#fff1f0',
    borderRadius: '4px',
    border: '1px solid #ffa39e'
  };

  const plagiarismWarningStyle = {
    color: '#f5222d',
    fontWeight: 'bold',
    marginTop: '10px'
  };

  const plagiarismListStyle = {
    margin: '10px 0',
    paddingLeft: '20px'
  };

  const plagiarismItemStyle = {
    color: '#005CC5',
    textDecoration: 'underline',
    cursor: 'pointer',
    margin: '5px 0'
  };

  // Effect hooks
  useEffect(() => {
    const fetchPoemTypes = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/poem-types/v1`);
        if (response.data && response.data.data) {
          const types = response.data.data;
          setPoemTypes(types);

          // Chỉ set default type nếu không có initialData
          if (!initialData) {
            setSelectedType(types[0]?.id.toString() || "1");
          }
        }
      } catch (error) {
        console.error("Error fetching poem types:", error);
        message.error("Không thể tải danh sách thể loại thơ");
      }
    };

    fetchPoemTypes();
  }, []);

  useEffect(() => {
    const poemType = poemTypes.find(type => type.id.toString() === selectedType);
    if (!poemType) return;

    const formattedContent = formatContent(poemData.content, selectedType);
    const lines = formattedContent.split('\n').filter(line => line.trim() !== '');
    const error = validateStructure(lines, poemType);
    setValidationError(error);
  }, [poemData.content, selectedType, poemTypes]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/collections/v1`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.data && response.data.data) {
          setCollections(response.data.data);
          setPoemData(prev => ({ ...prev, collectionId: response.data.data[0]?.id || "" }))
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        message.error("Không thể tải danh sách tập thơ");
      }
    };

    if (accessToken) {
      fetchCollections();
    }
  }, [accessToken]);

  useEffect(() => {
    if (initialData) {
      const htmlContent = initialData.content.replace(/\n/g, "<br>");
      const initialType = poemTypes.find(
        type => type.id === initialData.type?.id
      )?.id.toString() || "1";
      console.log(poemTypes)
      console.log(initialData.type?.id)
      setSelectedType(initialType);

      setPoemData({
        id: initialData.id || "",
        title: initialData.title || "",
        description: initialData.description || "",
        poemImage: initialData.poemImage || "",
        chapterNumber: initialData.chapterNumber || 0,
        chapterName: initialData.chapterName || "",
        status: initialData.status || 0,
        collectionId: initialData.collection ? initialData.collection.id : "",
        sourceCopyRightId: initialData.sourceCopyRightId || null,
        content: htmlContent,
        poemTypeId: initialType,
        recordFiles: initialData.recordFiles || [],
      });

    }
  }, [initialData, poemTypes]);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const Delta = Quill.import("delta");
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        const newOps = delta.ops.map((op) => {
          if (typeof op.insert === "string") {
            if (op.insert === " " || op.insert === "\n") {
              return op;
            }
            return { insert: op.insert };
          }
          return op;
        });
        return new Delta(newOps);
      });
    }
  }, []);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPoemData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý lưu nháp
  const handleSave = async () => {
    try {
      await handleSubmit(0);
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
    }
  };

  const validateStructure = (lines, poemType) => {
    if (!poemType) return null;

    const poemTypeName = poemType.name || 'Unknown';

    if (lines.length === 0) {
      return "Thơ chưa được soạn";
    };

    switch (poemTypeName) {
      case 'Thơ Tự Do': {
        if (lines.length < 4) {
          return ("Thơ phải có ít nhất 4 câu");
        }
        break;
      }

      case 'Thơ Lục Bát': {
        if (lines.length % 2 !== 0) {
          return "Thơ Lục Bát phải có số câu chẵn (mỗi cặp 6-8 chữ)";
        }

        // Kiểm tra câu cuối
        const lastLineWordCount = lines[lines.length - 1].trim().split(/\s+/).length;
        if (lastLineWordCount !== 8) {
          return "Vui lòng hoàn thiện đủ 8 chữ ở câu cuối";
        }

        if (lines.length < 4) {
          return "Thơ phải có ít nhất 4 câu";
        }

        // Kiểm tra cấu trúc 6-8
        const isValid = lines.every((line, index) => {
          const words = line.trim().split(/\s+/).length;
          return (index % 2 === 0) ? words === 6 : words === 8;
        });
        return isValid ? null : "Cấu trúc 6-8 không đúng";
      }

      case 'Thơ Song Thất Lục Bát': {
        if (lines.length % 4 !== 0) {
          return "Song Thất Lục Bát theo cấu trúc 7-7-6-8 và phải kết thúc ở câu 8 chữ"
        };

        const hasInvalidEightWordLine = lines.some((line, index) => {
          const stanzaIndex = index % 4;
          return stanzaIndex === 3 && line.trim().split(/\s+/).length !== 8;
        });

        if (hasInvalidEightWordLine) {
          return "Vui lòng hoàn thiện đủ 8 chữ ở câu cuối";
        }

        const pattern = [7, 7, 6, 8];
        const isValid = lines.every((line, index) => {
          const stanzaIndex = index % 4;
          return line.trim().split(/\s+/).length === pattern[stanzaIndex];
        });
        return isValid ? null : "Cấu trúc 7-7-6-8 không đúng";
      }

      case 'Thơ Thất Ngôn Tứ Tuyệt': {
        if (lines.length !== 4) {
          return "Thất Ngôn Tứ Tuyệt phải có đúng 4 câu"
        }
        const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
        if (hasInvalidLine) {
          return "Thất Ngôn Tứ Tuyệt mỗi câu phải có 7 chữ";
        }
        break;
      }

      case 'Thơ Ngũ Ngôn Tứ Tuyệt': {
        if (lines.length !== 4) {
          return "Ngũ Ngôn Tứ Tuyệt phải có đúng 4 câu";
        }
        const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 5);
        if (hasInvalidLine) {
          return "Ngũ Ngôn Tứ Tuyệt mỗi câu phải có 5 chữ";
        }
        break;
      }

      case 'Thơ Thất Ngôn Bát Cú': {
        if (lines.length !== 8) {
          return "Thất Ngôn Bát Cú phải có đúng 8 câu";
        }

        const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
        if (hasInvalidLine) {
          return "Mỗi câu trong Thất Ngôn Bát Cú phải có 7 chữ";
        }
        break;
      }

      case 'Thơ 4 Chữ': {
        if (lines.length < 4) {
          return "Thơ 4 chữ phải có ít nhất 4 câu";
        }
        const hasError = lines.some(line => line.trim().split(/\s+/).length !== 4);
        if (hasError) {
          return "Mỗi câu thơ 4 chữ phải có đúng 4 chữ";
        }
        break;
      }

      case 'Thơ 5 Chữ': {
        if (lines.length < 4) {
          return "Thơ 5 chữ phải có ít nhất 4 câu";
        }
        const hasError = lines.some(line => line.trim().split(/\s+/).length !== 5);
        if (hasError) {
          return "Mỗi câu thơ 5 chữ phải có đúng 5 chữ";
        }
        break;
      }

      case 'Thơ 6 Chữ': {
        if (lines.length < 4) {
          return "Thơ 6 chữ phải có ít nhất 4 câu";
        }
        const hasError = lines.some(line => line.trim().split(/\s+/).length !== 6);
        if (hasError) {
          return "Mỗi câu thơ 6 chữ phải có đúng 6 chữ";
        }
        break;
      }

      case 'Thơ 7 Chữ': {
        if (lines.length < 4) {
          return "Thơ 7 chữ phải có ít nhất 4 câu";
        }
        const hasError = lines.some(line => line.trim().split(/\s+/).length !== 7);
        if (hasError) {
          return "Mỗi câu thơ 7 chữ phải có đúng 7 chữ";
        }
        break;
      }

      case 'Thơ 8 Chữ': {
        if (lines.length < 4) {
          return "Thơ 8 chữ phải có ít nhất 4 câu";
        }
        const hasError = lines.some(line => line.trim().split(/\s+/).length !== 8);
        if (hasError) {
          return "Mỗi câu thơ 8 chữ phải có đúng 8 chữ";
        }
        break;
      }

      default: {
        return null;
      }
    }
  };

  // Xử lý submit bài thơ
  const handleSubmit = async (status) => {
    setIsLoading(true);
    if (status === 1) {
      if (validationError) {
        message.error(validationError);
        setIsLoading(false)
        return;
      }
    }

    // Kiểm tra đăng nhập
    if (!accessToken) {
      message.error("Vui lòng đăng nhập để đăng bài.");
      setIsLoading(false);
      return;
    }

    // Kiểm tra hình ảnh khi đăng bài (status = 1)
    if (status === 1 && !poemData.poemImage) {
      message.error("Vui lòng thêm hình ảnh minh họa trước khi đăng bài!");
      setImageError(true);
      setIsLoading(false);
      return;
    }

    // Kiểm tra các trường bắt buộc khi đăng bài
    if (status === 1) {
      if (!poemData.title.trim()) {
        message.error("Vui lòng nhập tiêu đề");
        setIsLoading(false);
        return;
      }
      if (!poemData.description.trim()) {
        message.error("Vui lòng nhập mô tả");
        setIsLoading(false);
        return;
      }
    }

    if (status === 1) {
      // Validate cấu trúc bài thơ theo thể loại
      const poemType = poemTypes.find(type => type.id.toString() === selectedType) || {};
      const poemTypeName = poemType.name || 'Unknown';
      const validatePoemStructure = () => {
        const lines = formatContent(poemData.content, selectedType)
          .split('\n')
          .filter(line => line.trim() !== '');

        if (lines.length === 0) {
          setValidationError("Thơ chưa được soạn");
          return false;
        };

        switch (poemTypeName) {
          case 'Thơ Tự Do': {
            if (lines.length < 4) {
              setValidationError("Thơ phải có ít nhất 4 câu");
              return false;
            }
            return true;
          }

          case 'Thơ Lục Bát': {
            if (lines.length % 2 !== 0) {
              setValidationError("Thơ Lục Bát phải có số câu chẵn (mỗi cặp 6-8 chữ)");
              return false;
            }

            // Kiểm tra câu cuối
            const lastLineWordCount = lines[lines.length - 1].trim().split(/\s+/).length;
            if (lastLineWordCount !== 8) {
              setValidationError("Vui lòng hoàn thiện đủ 8 chữ ở câu cuối");
              return false;
            }

            if (lines.length < 4) {
              setValidationError("Thơ phải có ít nhất 4 câu");
              return false;
            }

            // Kiểm tra cấu trúc 6-8
            const isValidStructure = lines.every((line, index) => {
              const wordCount = line.trim().split(/\s+/).length;
              return (index % 2 === 0) ? wordCount === 6 : wordCount === 8;
            });

            if (!isValidStructure) {
              setValidationError("Thơ Lục Bát phải theo cấu trúc: câu 6 chữ luân phiên với câu 8 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ Song Thất Lục Bát': {
            if (lines.length % 4 !== 0) {
              setValidationError("Song Thất Lục Bát theo cấu trúc 7-7-6-8 và phải kết thúc ở câu 8 chữ");
              return false;
            };

            const hasInvalidEightWordLine = lines.some((line, index) => {
              const stanzaIndex = index % 4;
              return stanzaIndex === 3 && line.trim().split(/\s+/).length !== 8;
            });

            if (hasInvalidEightWordLine) {
              setValidationError("Vui lòng hoàn thiện đủ 8 chữ ở câu cuối");
              return false;
            }

            const pattern = [7, 7, 6, 8];
            return lines.every((line, index) => {
              const stanzaIndex = index % 4;
              return line.trim().split(/\s+/).length === pattern[stanzaIndex];
            });
          }

          case 'Thơ Thất Ngôn Tứ Tuyệt': {
            if (lines.length !== 4) {
              setValidationError("Thất Ngôn Tứ Tuyệt phải có đúng 4 câu");
              return false;
            }
            const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
            if (hasInvalidLine) {
              setValidationError("Thất Ngôn Tứ Tuyệt mỗi câu phải có 7 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ Ngũ Ngôn Tứ Tuyệt': {
            if (lines.length !== 4) {
              setValidationError("Ngũ Ngôn Tứ Tuyệt phải có đúng 4 câu");
              return false;
            }
            const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 5);
            if (hasInvalidLine) {
              setValidationError("Ngũ Ngôn Tứ Tuyệt mỗi câu phải có 5 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ Thất Ngôn Bát Cú': {
            if (lines.length !== 8) {
              setValidationError("Thất Ngôn Bát Cú phải có đúng 8 câu");
              return false;
            }

            const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
            if (hasInvalidLine) {
              setValidationError("Mỗi câu trong Thất Ngôn Bát Cú phải có 7 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 4 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 4 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 4);
            if (hasError) {
              setValidationError("Mỗi câu thơ 4 chữ phải có đúng 4 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 5 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 5 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 5);
            if (hasError) {
              setValidationError("Mỗi câu thơ 5 chữ phải có đúng 5 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 6 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 6 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 6);
            if (hasError) {
              setValidationError("Mỗi câu thơ 6 chữ phải có đúng 6 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 7 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 7 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 7);
            if (hasError) {
              setValidationError("Mỗi câu thơ 7 chữ phải có đúng 7 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 8 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 8 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 8);
            if (hasError) {
              setValidationError("Mỗi câu thơ 8 chữ phải có đúng 8 chữ");
              return false;
            }
            return true;
          }

          default: {
            setValidationError(`Thể thơ "${poemTypeName}" không được hỗ trợ`);
            return false;
          }
        }
      };

      const isValid = validatePoemStructure();
      if (!isValid) {
        setIsLoading(false);
        return;
      }
    }

    // Chuẩn bị dữ liệu gửi lên server
    const formattedContent = formatContent(poemData.content, selectedType);
    const requestData = {
      title: poemData.title,
      content: formattedContent,
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapterNumber) ? 0 : Number(poemData.chapterNumber),
      chapterName: poemData.chapterName || null,
      status: status,
      collectionId: poemData.collectionId ? poemData.collectionId : null,
      sourceCopyRightId: null,
      poemImage: poemData.poemImage || null,
      recordFiles: [],
      poemTypeId: selectedType,
      isPublic: true,
    };

    try {
      const method = poemData.id ? 'PUT' : 'POST';
      const url = `${process.env.REACT_APP_API_BASE_URL}/poems/v1`;

      const response = await axios({
        method,
        url,
        data: requestData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        message.success(status === 1
          ? "Bài thơ đã được đăng thành công. Vui lòng chờ kết quả kiểm duyệt đạo văn!"
          : "Bài thơ đã được lưu nháp!");
        if (status === 1 && onBack) {
          onBack();
          await fetchPoems();
        } else if (!poemData.id) {
          setPoemData(prev => ({ ...prev, id: response.data.id }));
        }
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      message.error(error.response?.data?.message || "Không thể đăng bài. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý thay đổi nội dung bài thơ
  const handleInputContent = (value) => {
    setPoemData(prev => ({ ...prev, content: value }));
  };

  // Định dạng nội dung theo thể loại thơ
  const formatContent = (content, typeId) => {
    const poemType = poemTypes.find(type => type.id.toString() === typeId);
    if (!poemType || typeId === '1') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const lines = [];
      doc.body.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          let lineContent = '';
          node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              lineContent += child.textContent;
            } else if (child.nodeName === 'BR') {
              lineContent += '\n';
            }
          });
          lineContent.split('\n').forEach((subLine) => {
            lines.push(subLine);
          });
        }
      });
      return lines
        .map((line) => {
          const leadingWhitespace = line.match(/^\s*/)[0];
          const content = line.slice(leadingWhitespace.length);
          return leadingWhitespace + content.replace(/\s+/g, ' ').replace(/\s*$/, '');
        })
        .join('\n');
    }

    const plainText = content.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n');
    const allWords = plainText.split(/\s+/).filter(word => word.trim() !== '');

    const formatFixedWordPoem = (words, wordsPerLine) => {
      const lines = [];
      for (let i = 0; i < words.length; i += wordsPerLine) {
        const line = words.slice(i, i + wordsPerLine).join(' ');
        lines.push(line);
      }
      return lines.join('\n');
    };

    switch (poemType.name) {
      case 'Thơ Tự Do':
        const plainText = content.replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/\n+/g, '\n');
        return plainText.trim();

      case 'Thơ Lục Bát':
        let lucBatLines = [];
        let currentLine = [];
        let currentLineType = 6;
        allWords.forEach((word) => {
          currentLine.push(word);
          if (currentLine.length === currentLineType) {
            lucBatLines.push({
              text: currentLine.join(' '),
              type: currentLineType === 8 ? 'bat' : 'luc'
            });
            currentLine = [];
            currentLineType = currentLineType === 8 ? 6 : 8;
          }
        });
        if (currentLine.length > 0) {
          lucBatLines.push({
            text: currentLine.join(' '),
            type: currentLineType === 8 ? 'bat' : 'luc'
          });
        }
        return lucBatLines.map((line, index) => {
          const indent = line.type === 'luc' ? '       ' : '';
          return indent + line.text;
        }).join('\n');

      case 'Thơ Song Thất Lục Bát':
        const songThatLines = [];
        const linePattern = [7, 7, 6, 8];
        let patternIndex = 0;
        let currentLine2 = [];
        allWords.forEach(word => {
          currentLine2.push(word);
          const targetLength = linePattern[patternIndex];
          if (currentLine2.length === targetLength) {
            songThatLines.push({
              text: currentLine2.join(' '),
              type: targetLength
            });
            currentLine2 = [];
            patternIndex = (patternIndex + 1) % 4;
          }
        });
        if (currentLine2.length > 0) {
          songThatLines.push({
            text: currentLine2.join(' '),
            type: linePattern[patternIndex]
          });
        }
        return songThatLines.map(line => line.text).join('\n');

      case 'Thơ Thất Ngôn Tứ Tuyệt':
        return formatFixedWordPoem(allWords, 7).split('\n').slice(0, 4).join('\n');
      case 'Thơ Ngũ Ngôn Tứ Tuyệt':
        return formatFixedWordPoem(allWords, 5).split('\n').slice(0, 4).join('\n');
      case 'Thơ Thất Ngôn Bát Cú':
        return formatFixedWordPoem(allWords, 7).split('\n').slice(0, 8).join('\n');
      case 'Thơ 4 Chữ': return formatFixedWordPoem(allWords, 4);
      case 'Thơ 5 Chữ': return formatFixedWordPoem(allWords, 5);
      case 'Thơ 6 Chữ': return formatFixedWordPoem(allWords, 6);
      case 'Thơ 7 Chữ': return formatFixedWordPoem(allWords, 7);
      case 'Thơ 8 Chữ': return formatFixedWordPoem(allWords, 8);
      default: return allWords.join(' ');
    }
  };

  // Xử lý upload hình ảnh
  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const imageUrl = URL.createObjectURL(file);
      setPoemFile(imageUrl);
      setImageError(false);

      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/poems/v1/image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Failed to upload image");
        const data = await response.json();
        message.success("Cập nhật hình ảnh thành công!");
        setPoemData((prev) => ({ ...prev, poemImage: data.data }));
      } catch (error) {
        message.error("Lỗi khi tải lên hình ảnh!");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePublishClick = async () => {
    try {
      setIsLoading(true);
      if (!accessToken) {
        message.error("Vui lòng đăng nhập để đăng bài.");
        setIsLoading(false);
        return;
      }

      if (validationError) {
        message.error(validationError);
        setIsLoading(false)
        return;
      }

      // Kiểm tra hình ảnh
      if (!poemData.poemImage) {
        message.error("Vui lòng thêm hình ảnh minh họa trước khi đăng bài!");
        setImageError(true);
        setIsLoading(false);
        return;
      }

      // Kiểm tra các trường bắt buộc
      if (!poemData.title.trim()) {
        message.error("Vui lòng nhập tiêu đề");
        setIsLoading(false);
        return;
      }
      if (!poemData.description.trim()) {
        message.error("Vui lòng nhập mô tả");
        setIsLoading(false);
        return;
      }

      const poemType = poemTypes.find(type => type.id.toString() === selectedType) || {};
      const poemTypeName = poemType.name || 'Unknown';
      const validatePoemStructure = () => {
        const lines = formatContent(poemData.content, selectedType)
          .split('\n')
          .filter(line => line.trim() !== '');

        if (lines.length === 0) {
          setValidationError("Thơ chưa được soạn");
          return false;
        };

        switch (poemTypeName) {
          case 'Thơ Tự Do': {
            if (lines.length < 4) {
              setValidationError("Thơ phải có ít nhất 4 câu");
              return false;
            }
            return true;
          }

          case 'Thơ Lục Bát': {
            if (lines.length % 2 !== 0) {
              setValidationError("Thơ Lục Bát phải có số câu chẵn (mỗi cặp 6-8 chữ)");
              return false;
            }

            // Kiểm tra câu cuối
            const lastLineWordCount = lines[lines.length - 1].trim().split(/\s+/).length;
            if (lastLineWordCount !== 8) {
              setValidationError("Vui lòng hoàn thiện đủ 8 chữ ở câu cuối");
              return false;
            }

            if (lines.length < 4) {
              setValidationError("Thơ phải có ít nhất 4 câu");
              return false;
            }

            // Kiểm tra cấu trúc 6-8
            const isValidStructure = lines.every((line, index) => {
              const wordCount = line.trim().split(/\s+/).length;
              return (index % 2 === 0) ? wordCount === 6 : wordCount === 8;
            });

            if (!isValidStructure) {
              setValidationError("Thơ Lục Bát phải theo cấu trúc: câu 6 chữ luân phiên với câu 8 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ Song Thất Lục Bát': {
            if (lines.length % 4 !== 0) {
              setValidationError("Song Thất Lục Bát theo cấu trúc 7-7-6-8 và phải kết thúc ở câu 8 chữ");
              return false;
            };

            const hasInvalidEightWordLine = lines.some((line, index) => {
              const stanzaIndex = index % 4;
              return stanzaIndex === 3 && line.trim().split(/\s+/).length !== 8;
            });

            if (hasInvalidEightWordLine) {
              setValidationError("Vui lòng hoàn thiện đủ 8 chữ ở câu cuối");
              return false;
            }

            const pattern = [7, 7, 6, 8];
            return lines.every((line, index) => {
              const stanzaIndex = index % 4;
              return line.trim().split(/\s+/).length === pattern[stanzaIndex];
            });
          }

          case 'Thơ Thất Ngôn Tứ Tuyệt': {
            if (lines.length !== 4) {
              setValidationError("Thất Ngôn Tứ Tuyệt phải có đúng 4 câu");
              return false;
            }
            const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
            if (hasInvalidLine) {
              setValidationError("Thất Ngôn Tứ Tuyệt mỗi câu phải có 7 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ Ngũ Ngôn Tứ Tuyệt': {
            if (lines.length !== 4) {
              setValidationError("Ngũ Ngôn Tứ Tuyệt phải có đúng 4 câu");
              return false;
            }
            const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 5);
            if (hasInvalidLine) {
              setValidationError("Ngũ Ngôn Tứ Tuyệt mỗi câu phải có 5 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ Thất Ngôn Bát Cú': {
            if (lines.length !== 8) {
              setValidationError("Thất Ngôn Bát Cú phải có đúng 8 câu");
              return false;
            }

            const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
            if (hasInvalidLine) {
              setValidationError("Mỗi câu trong Thất Ngôn Bát Cú phải có 7 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 4 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 4 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 4);
            if (hasError) {
              setValidationError("Mỗi câu thơ 4 chữ phải có đúng 4 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 5 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 5 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 5);
            if (hasError) {
              setValidationError("Mỗi câu thơ 5 chữ phải có đúng 5 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 6 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 6 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 6);
            if (hasError) {
              setValidationError("Mỗi câu thơ 6 chữ phải có đúng 6 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 7 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 7 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 7);
            if (hasError) {
              setValidationError("Mỗi câu thơ 7 chữ phải có đúng 7 chữ");
              return false;
            }
            return true;
          }

          case 'Thơ 8 Chữ': {
            if (lines.length < 4) {
              setValidationError("Thơ 8 chữ phải có ít nhất 4 câu");
              return false;
            }
            const hasError = lines.some(line => line.trim().split(/\s+/).length !== 8);
            if (hasError) {
              setValidationError("Mỗi câu thơ 8 chữ phải có đúng 8 chữ");
              return false;
            }
            return true;
          }

          default: {
            setValidationError(`Thể thơ "${poemTypeName}" không được hỗ trợ`);
            return false;
          }
        }
      };

      const isValid = validatePoemStructure();
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      const content = formatContent(poemData.content, selectedType);

      // Check for duplicates
      const duplicateResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1/duplicate`,
        { poemContent: content },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("dup",duplicateResponse.data.data?.duplicatedFrom)
      if (duplicateResponse.data.data.duplicatedFrom[0]) {
        setDuplicatePoem(duplicateResponse.data.data?.duplicatedFrom[0]);
      } else {
        setDuplicatePoem(null);
      }

      setIsConfirmModalOpen(true);
    } catch (error) {
      console.error("Error checking duplicates:", error);
      // Fallback to normal confirmation if check fails
      setDuplicatePoem(null);
      setIsConfirmModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const ConfirmPublishModal = () => (
    <Modal
      title="Xác nhận đăng bài"
      open={isConfirmModalOpen}
      onCancel={() => setIsConfirmModalOpen(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsConfirmModalOpen(false)}>
          Hủy
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={() => {
            setIsConfirmModalOpen(false);
            setDrafting ? handleSubmitDraft() : handleSubmit(1);
          }}
        >
          Xác nhận
        </Button>,
      ]}
      width={700}
    >
      {duplicatePoem ? (
        <>
          <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            Bài thơ bạn đăng có vẻ giống một bài thơ trước đó của bạn. Bạn có chắc chắn muốn đăng bài?
          </p>
          <div style={{ margin: '16px 0' }}>
            <p><strong>Tiêu đề bài thơ trùng:</strong> {duplicatePoem.title}</p>
            <p><strong>Mô tả:</strong> {duplicatePoem.description}</p>
            <p><strong>Thể loại:</strong> {duplicatePoem.type?.name}</p>
            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                <strong>Nội dung:</strong>
              </label>
              <TextArea
                value={duplicatePoem.content}
                readOnly
                autoSize={{ minRows: 4, maxRows: 8 }}
                style={{ background: '#f5f5f5' }}
              />
            </div>
          </div>
        </>
      ) : (
        <p>Bạn có chắc chắn muốn đăng bài?</p>
      )}
    </Modal>
  );

  // Xử lý gợi ý từ AI
  const handleAISuggest = async () => {
    const content = formatContent(poemData.content, selectedType);
    const poemType = poemTypes.find(type => type.id.toString() === selectedType);

    if (!poemType) {
      message.error("Vui lòng chọn thể loại thơ trước khi yêu cầu gợi ý");
      return;
    }

    // Validate số câu tối thiểu
    const lines = formatContent(poemData.content, selectedType)
      .split('\n')
      .filter(line => line.trim() !== '');

    // Kiểm tra các thể thơ đặc biệt
    const specialPoemTypes = [
      'Thơ Thất Ngôn Tứ Tuyệt',
      'Thơ Ngũ Ngôn Tứ Tuyệt',
      'Thơ Thất Ngôn Bát Cú'
    ];

    if (specialPoemTypes.includes(poemType.name)) {
      // Kiểm tra ít nhất 1 câu đúng chuẩn
      const requiredWords = poemType.name === 'Thơ Ngũ Ngôn Tứ Tuyệt' ? 5 : 7;
      const validLines = lines.filter(line => {
        return line.trim().split(/\s+/).length === requiredWords;
      });

      if (validLines.length < 1) {
        message.error(`Vui lòng nhập ít nhất 1 câu đủ ${requiredWords} chữ để sử dụng tính năng này`);
        return;
      }
    } else {
      // Kiểm tra ít nhất 4 câu cho các thể loại khác
      if (lines.length < 4) {
        message.error('Vui lòng nhập ít nhất 4 câu để sử dụng tính năng này');
        return;
      }
    }

    let question = '';
    switch (poemType.name) {
      case "Thơ Tự Do":
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ Tự Do. Chỉ trả về cả bài thơ hoàn chỉnh"
        break;
      case "Thơ Lục Bát":
        question = `Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ Lục Bát, ${poemType.description}. Chỉ trả về cả bài thơ hoàn chỉnh`;
        break;
      case "Thơ Thất Ngôn Tứ Tuyệt":
        question = `Hãy hoàn thiện đoạn thơ trên cho tôi theo đúng thể thơ Thất Ngôn Tứ Tuyệt, ${poemType.description}. Chỉ trả về cả bài thơ hoàn chỉnh`;
        break;
      case "Thơ Ngũ Ngôn Tứ Tuyệt":
        question = `Hãy hoàn thiện đoạn thơ trên cho tôi theo đúng thể thơ Ngũ Ngôn Tứ Tuyệt, ${poemType.description}. Chỉ trả về cả bài thơ hoàn chỉnh`;
        break;
      case "Thơ Thất Ngôn Bát Cú":
        question = `Hãy hoàn thiện đoạn thơ trên cho tôi theo đúng thể thơ Thất Ngôn Bát Cú, ${poemType.description}. Chỉ trả về cả bài thơ hoàn chỉnh`;
        break;
      case "Thơ Song Thất Lục Bát":
        question = `Hãy sáng tác tiếp đoạn thơ trên hoàn chỉnh cho tôi theo đúng thể thơ Song Thất Lục Bát, ${poemType.description}. Chỉ trả về cả bài thơ hoàn chỉnh`;
        break;
      case "Thơ 4 Chữ":
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ 4 chữ, mỗi câu có 4 chữ. Chỉ trả về cả bài thơ hoàn chỉnh"
        break;
      case "Thơ 5 Chữ":
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ 5 chữ, mỗi câu có 5 chữ. Chỉ trả về cả bài thơ hoàn chỉnh"
        break;
      case "Thơ 6 Chữ":
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ 6 chữ, mỗi câu có 6 chữ. Chỉ trả về cả bài thơ hoàn chỉnh"
        break;
      case "Thơ 7 Chữ":
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ 7 chữ, mỗi câu có 7 chữ. Chỉ trả về cả bài thơ hoàn chỉnh"
        break;
      case "Thơ 8 Chữ":
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ 8 chữ, mỗi câu có 8 chữ. Chỉ trả về cả bài thơ hoàn chỉnh"
        break;
      default:
        question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ tôi đã đề cập. Chỉ trả về cả bài thơ hoàn chỉnh";
    }

    const requestBody = {
      poemTypeId: poemType.id,
      poemContent: content,
      chatContent: question,
      maxToken: 1000
    };

    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/ai-chat-completion`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setSuggestion(data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      message.error("Không thể lấy gợi ý từ AI");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý kiểm tra đạo văn
  const handleAICheckPlagiarism = async () => {
    const content = formatContent(poemData.content, selectedType);
    const requestBody = { poemContent: content };
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/plagiarism`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      setPlagiarismResult(data.data.score);
      setPlagiarismPoems(data.data.plagiarismFrom);
      console.log("plagia", data.data.plagiarismFrom)
    } catch (error) {
      console.error("Error checking plagiarism:", error);
      message.error("Không thể kiểm tra đạo văn");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tạo hình ảnh bằng AI
  const handleAIRenderImage = async () => {
    let content = formatContent(poemData.content, selectedType).substring(0, 600);
    setIsLoading(true);
    try {
      let responseImage;
      if (imageType === "nâng cao") {
        responseImage = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/poems/v1/text-to-image/open-ai?imageSize=2&imageStyle=2&poemText=${encodeURIComponent(
            imagePrompt.trim() === "" ? content : imagePrompt
          )}&prompt=${encodeURIComponent(
            "Render an image base on my requirement poem content, return an image without words in it"
          )}`,
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
          imageSize: 4,
          poemText: imagePrompt.trim() === "" ? content : imagePrompt,
          prompt: `Render an image base on my requirement poem content for me.`,
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

      const data = await responseImage.json();
      let generatedImageUrl;
      if (imageType === "nâng cao") {
        generatedImageUrl = data.data;
      } else {
        generatedImageUrl = data.data.output?.[0]?.url || data.data;
      }

      setPreviewImages(prev => [...prev, generatedImageUrl]);
      setPreviewSelectedIndex(previewImages.length);
      setIsModalContentCompleteOpen(false);
      setIsPreviewModalOpen(true);
      setImageError(false);
    } catch (error) {
      message.error("Lỗi khi tạo hình ảnh!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý lưu nháp
  const handleSaveDraft = async () => {
    setIsLoading(true);
    if (!accessToken) {
      message.error("Vui lòng đăng nhập để lưu nháp.");
      setIsLoading(false);
      return;
    }

    const payload = {
      id: poemData.id,
      title: poemData.title,
      content: formatContent(poemData.content, selectedType),
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapterNumber) ? 0 : Number(poemData.chapterNumber),
      chapterName: poemData.chapterName || null,
      status: 0,
      collectionId: poemData.collectionId || null,
      sourceCopyRightId: poemData.sourceCopyRightId || null,
      poemImage: poemData.poemImage || null,
      recordFiles: poemData.recordFiles || [],
      poemTypeId: selectedType
    };

    console.log("Payload", payload)
    try {
      const method = poemData.id ? 'PUT' : 'POST';
      const response = await axios({
        method,
        url: `${process.env.REACT_APP_API_BASE_URL}/poems/v1`,
        data: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        message.success("Bài thơ nháp đã được lưu thành công!");
        if (!poemData.id) {
          setPoemData(prev => ({ ...prev, id: response.data.id }));
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
      message.error(error.response?.data?.message || "Không thể lưu nháp. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit bài thơ từ nháp
  const handleSubmitDraft = async () => {
    setIsLoading(true);
    if (!accessToken) {
      message.error("Vui lòng đăng nhập để đăng bài.");
      setIsLoading(false);
      return;
    }

    if (validationError) {
      message.error(validationError);
      setIsLoading(false)
      return;
    }

    // Kiểm tra hình ảnh
    if (!poemData.poemImage) {
      message.error("Vui lòng thêm hình ảnh minh họa trước khi đăng bài!");
      setImageError(true);
      setIsLoading(false);
      return;
    }

    // Kiểm tra các trường bắt buộc
    if (!poemData.title.trim()) {
      message.error("Vui lòng nhập tiêu đề");
      setIsLoading(false);
      return;
    }
    if (!poemData.description.trim()) {
      message.error("Vui lòng nhập mô tả");
      setIsLoading(false);
      return;
    }

    const poemType = poemTypes.find(type => type.id.toString() === selectedType) || {};
    const poemTypeName = poemType.name || 'Unknown';
    const validatePoemStructure = () => {
      const lines = formatContent(poemData.content, selectedType)
        .split('\n')
        .filter(line => line.trim() !== '');

      if (lines.length === 0) {
        setValidationError("Thơ chưa được soạn");
        return false;
      };

      switch (poemTypeName) {
        case 'Thơ Tự Do': {
          if (lines.length < 4) {
            setValidationError("Thơ phải có ít nhất 4 câu");
            return false;
          }
          return true;
        }

        case 'Thơ Lục Bát': {
          if (lines.length % 2 !== 0) {
            setValidationError("Thơ Lục Bát phải có số câu chẵn (mỗi cặp 6-8 chữ)");
            return false;
          }

          // Kiểm tra câu cuối
          const lastLineWordCount = lines[lines.length - 1].trim().split(/\s+/).length;
          if (lastLineWordCount !== 8) {
            setValidationError("Vui lòng hoàn thiện đủ 8 chữ ở câu cuối");
            return false;
          }

          if (lines.length < 4) {
            setValidationError("Thơ phải có ít nhất 4 câu");
            return false;
          }

          // Kiểm tra cấu trúc 6-8
          const isValidStructure = lines.every((line, index) => {
            const wordCount = line.trim().split(/\s+/).length;
            return (index % 2 === 0) ? wordCount === 6 : wordCount === 8;
          });

          if (!isValidStructure) {
            setValidationError("Thơ Lục Bát phải theo cấu trúc: câu 6 chữ luân phiên với câu 8 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ Song Thất Lục Bát': {
          if (lines.length % 4 !== 0) {
            setValidationError("Song Thất Lục Bát theo cấu trúc 7-7-6-8 và phải kết thúc ở câu 8 chữ");
            return false;
          };

          const hasInvalidEightWordLine = lines.some((line, index) => {
            const stanzaIndex = index % 4;
            return stanzaIndex === 3 && line.trim().split(/\s+/).length !== 8;
          });

          if (hasInvalidEightWordLine) {
            setValidationError("Vui lòng hoàn thiện đủ 8 chữ ở câu cuối");
            return false;
          }

          const pattern = [7, 7, 6, 8];
          return lines.every((line, index) => {
            const stanzaIndex = index % 4;
            return line.trim().split(/\s+/).length === pattern[stanzaIndex];
          });
        }

        case 'Thơ Thất Ngôn Tứ Tuyệt': {
          if (lines.length !== 4) {
            setValidationError("Thất Ngôn Tứ Tuyệt phải có đúng 4 câu");
            return false;
          }
          const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
          if (hasInvalidLine) {
            setValidationError("Thất Ngôn Tứ Tuyệt mỗi câu phải có 7 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ Ngũ Ngôn Tứ Tuyệt': {
          if (lines.length !== 4) {
            setValidationError("Ngũ Ngôn Tứ Tuyệt phải có đúng 4 câu");
            return false;
          }
          const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 5);
          if (hasInvalidLine) {
            setValidationError("Ngũ Ngôn Tứ Tuyệt mỗi câu phải có 5 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ Thất Ngôn Bát Cú': {
          if (lines.length !== 8) {
            setValidationError("Thất Ngôn Bát Cú phải có đúng 8 câu");
            return false;
          }

          const hasInvalidLine = lines.some(line => line.trim().split(/\s+/).length !== 7);
          if (hasInvalidLine) {
            setValidationError("Mỗi câu trong Thất Ngôn Bát Cú phải có 7 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ 4 Chữ': {
          if (lines.length < 4) {
            setValidationError("Thơ 4 chữ phải có ít nhất 4 câu");
            return false;
          }
          const hasError = lines.some(line => line.trim().split(/\s+/).length !== 4);
          if (hasError) {
            setValidationError("Mỗi câu thơ 4 chữ phải có đúng 4 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ 5 Chữ': {
          if (lines.length < 4) {
            setValidationError("Thơ 5 chữ phải có ít nhất 4 câu");
            return false;
          }
          const hasError = lines.some(line => line.trim().split(/\s+/).length !== 5);
          if (hasError) {
            setValidationError("Mỗi câu thơ 5 chữ phải có đúng 5 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ 6 Chữ': {
          if (lines.length < 4) {
            setValidationError("Thơ 6 chữ phải có ít nhất 4 câu");
            return false;
          }
          const hasError = lines.some(line => line.trim().split(/\s+/).length !== 6);
          if (hasError) {
            setValidationError("Mỗi câu thơ 6 chữ phải có đúng 6 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ 7 Chữ': {
          if (lines.length < 4) {
            setValidationError("Thơ 7 chữ phải có ít nhất 4 câu");
            return false;
          }
          const hasError = lines.some(line => line.trim().split(/\s+/).length !== 7);
          if (hasError) {
            setValidationError("Mỗi câu thơ 7 chữ phải có đúng 7 chữ");
            return false;
          }
          return true;
        }

        case 'Thơ 8 Chữ': {
          if (lines.length < 4) {
            setValidationError("Thơ 8 chữ phải có ít nhất 4 câu");
            return false;
          }
          const hasError = lines.some(line => line.trim().split(/\s+/).length !== 8);
          if (hasError) {
            setValidationError("Mỗi câu thơ 8 chữ phải có đúng 8 chữ");
            return false;
          }
          return true;
        }

        default: {
          setValidationError(`Thể thơ "${poemTypeName}" không được hỗ trợ`);
          return false;
        }
      }
    };

    const isValid = validatePoemStructure();
    if (!isValid) {
      setIsLoading(false);
      return;
    }


    const payload = {
      id: poemData.id,
      title: poemData.title,
      content: formatContent(poemData.content, selectedType),
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapterNumber) ? 0 : Number(poemData.chapterNumber),
      chapterName: poemData.chapterName || null,
      status: 1,
      collectionId: poemData.collectionId || null,
      sourceCopyRightId: poemData.sourceCopyRightId || null,
      poemImage: poemData.poemImage || null,
      recordFiles: poemData.recordFiles || [],
      poemTypeId: selectedType
    };

    try {
      const method = poemData.id ? 'PUT' : 'POST';
      const response = await axios({
        method,
        url: `${process.env.REACT_APP_API_BASE_URL}/poems/v1`,
        data: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        message.success("Bài thơ đã được đăng tải thành công. Vui lòng chờ kết quả kiểm duyệt đạo văn!");
        if (onBack) {
          onBack();
        }
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      message.error(error.response?.data?.message || "Không thể đăng bài. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal handlers
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);
  const handleCopyToContent = () => {
    const formattedContent = suggestion.split('\n').map(line => `<p>${line}</p>`).join('');
    setPoemData(prev => ({ ...prev, content: formattedContent }));
    setIsModalOpen(false);
  };

  const showModalContentComplete = () => setIsModalContentCompleteOpen(true);
  const handleCancelModalContentComplete = () => setIsModalContentCompleteOpen(false);

  const handleCancelPreview = () => setIsPreviewModalOpen(false);
  const handleApplyPreviewImage = async () => {
    if (previewSelectedIndex === null || !previewImages[previewSelectedIndex]) {
      message.error("Vui lòng chọn hình ảnh để áp dụng!");
      return;
    }
    try {
      setIsLoading(true);
      const selectedImageUrl = previewImages[previewSelectedIndex];
      const response = await fetch(
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
      if (!response.ok) throw new Error("Failed to apply the image");
      const imageData = await response.json();
      message.success("Cập nhật hình ảnh thành công!");
      setPoemData(prev => ({ ...prev, poemImage: imageData.data }));
      setPoemFile(imageData.data);
      setIsPreviewModalOpen(false);
      setImageError(false);
    } catch (error) {
      message.error("Lỗi khi áp dụng hình ảnh!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePopupContentPlagiarism = (content) => {
    setPopupContentPlagiarism(true);
    setContentPlagiarism(content);
  };
  const handleCancelPopupContentPlagiarism = () => setPopupContentPlagiarism(false);

  const handleOptionChange = (value) => setImageType(value);
  const handleImagePromptChange = (e) => setImagePrompt(e.target.value);

  // Hiển thị mô tả thể loại thơ
  const renderPoemTypeDescription = () => {
    if (!selectedType) return null;

    const poemType = poemTypes.find(type => type.id.toString() === selectedType);
    if (!poemType) return null;

    return (
      <div style={{
        margin: '10px 0',
        padding: '10px',
        backgroundColor: '#f6ffed',
        borderRadius: '4px',
        border: `1px solid ${poemType.color || '#b7eb8f'}`,
        color: poemType.color || 'inherit'
      }}>
        <strong>Thể loại: {poemType.name}</strong>
        <p>{poemType.guideLine}</p>
        {poemType.poem && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
            <strong>Ví dụ:</strong>
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              margin: '8px 0 0 0',
              padding: '8px',
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: '4px'
            }}>
              {poemType.poem.content}
            </pre>
          </div>
        )}
      </div>
    );
  };

  const renderValidationStatus = () => {
    const formattedContent = formatContent(poemData.content, selectedType);
    const hasContent = formattedContent.trim() !== '';

    return (
      <div style={{ marginTop: 16 }}>
        {validationError ? (
          <div style={validationErrorStyle}>
            <ExclamationCircleOutlined /> {validationError}
          </div>
        ) : hasContent ? (
          <div style={{
            color: '#52c41a',
            padding: '10px',
            backgroundColor: '#f6ffed',
            borderRadius: '4px',
            border: '1px solid #b7eb8f'
          }}>
            <CheckCircleOutlined /> Cấu trúc hợp lệ
          </div>
        ) : null}
      </div>
    );
  };


  return (
    <div style={containerStyle}>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,

          }}
        >
          <Spin size="large" tip="Đang tải..." />
        </div>
      )}

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
                <label style={formLabelStyle}>Tiêu đề bài thơ <span style={{ color: 'red' }}>*</span></label>
                <Input
                  placeholder="Nhập tiêu đề..."
                  name="title"
                  value={poemData.title}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Mô tả ngắn <span style={{ color: 'red' }}>*</span></label>
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả về bài thơ..."
                  name="description"
                  value={poemData.description}
                  onChange={handleInputChange}
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={formLabelStyle}>Tập thơ</label>
                <Select
                  name="collectionId"
                  value={poemData.collectionId}
                  onChange={(value) => handleInputChange({ target: { name: 'collectionId', value } })}
                  style={inputStyle}
                  placeholder="Chọn tập thơ"
                  loading={collections.length === 0}
                >
                  {collections.map((collection) => (
                    <Option key={collection.id} value={collection.id}>
                      {collection.collectionName}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={formLabelStyle}>
                Ảnh minh họa <span style={{ color: 'red' }}>*</span>
                {imageError && (
                  <span style={{ color: 'red', marginLeft: '8px' }}>
                    <ExclamationCircleOutlined /> Vui lòng thêm ảnh minh họa
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleUploadImage({ target: { files: [file] } });
                      return false;
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={imageLoading}
                      block
                    >
                      Tải ảnh lên
                    </Button>
                  </Upload>
                  <Button
                    onClick={showModalContentComplete}
                    style={{ marginTop: '16px' }}
                    block
                  >
                    AI tạo hình 🏞
                  </Button>
                </div>

                <div style={{ flex: 1 }}>
                  <img
                    src={poemFile || poemData.poemImage || '/check.png'}
                    alt="Ảnh minh họa bài thơ"
                    style={{
                      ...imagePreviewStyle,
                      border: imageError ? '1px dashed #f5222d' :
                        (!poemFile && !poemData.poemImage ? '1px dashed #d9d9d9' : 'none')
                    }}
                  />
                  {!poemFile && !poemData.poemImage && (
                    <div style={{
                      textAlign: 'center',
                      color: imageError ? '#f5222d' : '#999',
                      marginTop: '8px',
                      fontSize: '12px'
                    }}>
                      {imageError ? 'Vui lòng thêm ảnh minh họa' : 'Ảnh mặc định'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Nội dung bài thơ"
          style={cardStyle}
          headStyle={cardHeadStyle}
        >
          <div style={{ display: 'flex', gap: '24px', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
            <div style={{ flex: 2 }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={formLabelStyle}>Thể loại thơ</label>
                <Select
                  value={selectedType}
                  onChange={(value) => setSelectedType(value)}
                  style={inputStyle}
                >
                  {poemTypes.map((type) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
                {renderPoemTypeDescription()}
              </div>
              <label style={formLabelStyle}>Nội dung</label>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={poemData.content}
                onChange={handleInputContent}
                modules={{
                  toolbar: false
                }}
                style={editorStyle}
                placeholder="Viết nội dung bài thơ tại đây..."
              />
              {renderValidationStatus()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <Button
                  onClick={handleAICheckPlagiarism}
                  icon={<FaSpellCheck />}
                >
                  Kiểm tra đạo văn
                </Button>
                <Button
                  onClick={handleAISuggest}
                  icon={<FcIdea />}
                >
                  Gợi ý từ AI
                </Button>
              </div>
              {plagiarismResult != null && (
                <div style={{ marginTop: '16px' }}>
                  {plagiarismResult > 0.75 ? (
                    <div>
                      <div style={validationErrorStyle}>
                        Nội dung của bạn đang dính đạo văn ở mức {(plagiarismResult * 100).toFixed(2)}%. Vui lòng chỉnh sửa nội dung!
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <p style={{ fontWeight: 'bold' }}>Những bài thơ tương tự:</p>
                        <ul style={plagiarismListStyle}>
                          {plagiarismPoems?.map((item, index) => (
                            <li
                              key={index}
                              onClick={() => handlePopupContentPlagiarism(item.content)}
                              style={plagiarismItemStyle}
                            >
                              {item.title} - {item.isFamousPoet ? item.poetSample?.name : item.user?.displayName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                      Chúc mừng! Nội dung của bạn hiện tại không dính đạo văn.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", }}>
              <label style={formLabelStyle}>Xem trước</label>
              <Input.TextArea
                style={{
                  flex: 1,
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: 1.5,
                }}
                value={formatContent(poemData.content, selectedType)}
                readOnly
              />
            </div>
          </div>
        </Card>
      </div>

      <div style={footerStyle}>
        <Button
          type="default"
          icon={<SaveOutlined />}
          onClick={setDrafting ? handleSaveDraft : handleSave}
          loading={isLoading}
        >
          {setDrafting ? "Lưu nháp" : "Lưu vào nháp"}
        </Button>
        <Tooltip
          title={!poemData.poemImage ? "Vui lòng thêm ảnh minh họa trước khi đăng bài" : ""}
        >
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handlePublishClick}
            loading={isLoading}
            disabled={!poemData.poemImage}
          >
            Đăng bài
          </Button>
        </Tooltip>
      </div>
      <ConfirmPublishModal />
      {/* Modal gợi ý từ AI */}
      <Modal
        title="Gợi ý nội dung từ AI"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>Đóng</Button>,
          <Button key="copy" type="primary" onClick={handleCopyToContent}>Dán vào nội dung</Button>
        ]}
        width={700}
      >
        <div style={{ marginBottom: '16px', color: '#666' }}>
          Đây là nội dung chúng tôi sử dụng AI để gợi ý cho bạn. Hãy bấm "Dán vào nội dung" để áp dụng vào bài thơ của bạn.
        </div>
        <TextArea
          value={suggestion}
          readOnly
          autoSize={{ minRows: 6, maxRows: 10 }}
        />
      </Modal>

      {/* Modal tạo hình ảnh AI */}
      <Modal
        title="AI tạo hình ảnh 🏞"
        open={isModalContentCompleteOpen}
        onCancel={handleCancelModalContentComplete}
        footer={[
          <Button key="cancel" onClick={handleCancelModalContentComplete}>Đóng</Button>,
          <Button key="preview" onClick={() => setIsPreviewModalOpen(true)} disabled={previewImages.length === 0}>
            Xem lại ảnh đã tạo
          </Button>,
          <Button key="confirm" type="primary" onClick={handleAIRenderImage}>Xác nhận tạo ảnh</Button>
        ]}
        width={700}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={formLabelStyle}>Loại hình ảnh</label>
            <Select
              value={imageType}
              onChange={handleOptionChange}
              style={inputStyle}
            >
              <Option value="cơ bản">Cơ bản</Option>
              <Option value="nâng cao">Nâng cao</Option>
            </Select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={formLabelStyle}>Yêu cầu của bạn</label>
            <Input
              placeholder="Hãy miêu tả hình ảnh bạn muốn"
              value={imagePrompt}
              onChange={handleImagePromptChange}
            />
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Nếu không nhập, hệ thống sẽ tạo dựa trên nội dung bài thơ
            </div>
          </div>

          <div>
            <label style={formLabelStyle}>Nội dung tham khảo</label>
            <TextArea
              value={formatContent(poemData.content, selectedType)}
              readOnly
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
          </div>
        </div>
      </Modal>

      {/* Modal preview ảnh */}
      <Modal
        title="Chọn hình ảnh bạn muốn sử dụng"
        open={isPreviewModalOpen}
        onCancel={handleCancelPreview}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleCancelPreview}>Hủy</Button>,
          <Button key="renew" onClick={handleAIRenderImage}>Tạo mới</Button>,
          <Button key="apply" type="primary" onClick={handleApplyPreviewImage}>Áp dụng hình này</Button>
        ]}
      >
        <div style={{ textAlign: 'center' }}>
          {previewImages.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '8px'
              }}
            >
              {previewImages.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setPreviewSelectedIndex(index)}
                  style={{
                    border: previewSelectedIndex === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    borderRadius: '8px',
                    padding: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ marginTop: '8px' }}>
                    {previewSelectedIndex === index ? 'Đã chọn' : 'Nhấn để chọn'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 0', color: '#999' }}>
              Chưa có hình ảnh nào được tạo
            </div>
          )}
        </div>
      </Modal>

      {/* Modal kiểm tra đạo văn */}
      <Modal
        title="Nội dung bài thơ tương tự"
        open={popupContentPlagiarism}
        onCancel={handleCancelPopupContentPlagiarism}
        footer={<Button onClick={handleCancelPopupContentPlagiarism}>Đóng</Button>}
        width={700}
      >
        <div style={{ marginBottom: '16px', color: '#666' }}>
          Đây là nội dung của bài thơ nghi vấn bạn đã tham khảo. Hãy kiểm tra kỹ và chỉnh sửa nếu cần thiết.
        </div>
        <TextArea
          value={contentPlagiarism}
          readOnly
          autoSize={{ minRows: 10, maxRows: 15 }}
        />
      </Modal>
    </div>
  );
};

export default CreatePoemForm;