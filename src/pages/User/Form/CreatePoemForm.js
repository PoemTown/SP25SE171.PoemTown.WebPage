import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Carousel, Input, message, Modal, Select, Spin } from "antd";
import { FcIdea } from "react-icons/fc";
import { FaSpellCheck } from "react-icons/fa6";

const CreatePoemForm = ({ onBack, initialData, setDrafting }) => {
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
    type: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [collections, setCollections] = useState([]);
  const [poemFile, setPoemFile] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalContentCompleteOpen, setIsModalContentCompleteOpen] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const [plagiarismResult, setPlagiarismResult] = useState(null);
  const [plagiarismPoems, setPlagiarismPoems] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewSelectedIndex, setPreviewSelectedIndex] = useState(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [popupContentPlagiarism, setPopupContentPlagiarism] = useState(false);
  const [contentPlagiarism, setContentPlagiarism] = useState(null);

  const [imagePrompt, setImagePrompt] = useState("");
  const [previewImage, setPreviewImage] = useState(null);


  const { Option } = Select;
  const [imageType, setImageType] = useState("cơ bản");

  const handleOptionChange = (value) => {
    setImageType(value);
  };

  const handleImagePromptChange = (e) => {
    setImagePrompt(e.target.value);
  };

  const [poemTypes, setPoemTypes] = useState([]);
  useEffect(() => {
    const fetchPoemTypes = async () => {
      try {
        const response = await axios.get('https://api-poemtown-staging.nodfeather.win/api/poem-types/v1');
        if (response.data && response.data.data) {
          setPoemTypes(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching poem types:", error);
        message.error("Không thể tải danh sách thể loại thơ");
      }
    };

    fetchPoemTypes();
  }, []);

  useEffect(() => {
    console.log("initial", initialData);
    if (initialData) {
      // Convert newline characters to <br> for ReactQuill content if needed
      const htmlContent = initialData.content.replace(/\n/g, "<br>");
      setPoemData({
        id: initialData.id || "",
        title: initialData.title || "",
        description: initialData.description || "",
        poemImage: initialData.poemImage || "",
        // Use initialData.collection.id so the select's value matches an option's value
        chapterNumber: initialData.chapterNumber || 0,
        chapterName: initialData.chapterName || "",
        status: initialData.status || 0,
        collectionId: initialData.collection ? initialData.collection.id : "",
        sourceCopyRightId: initialData.sourceCopyRightId || null,
        content: htmlContent,
        type: initialData.type || "1",
        recordFiles: initialData.recordFiles,

      });
      setSelectedType(initialData.type ? initialData.type.toString() : "1");
    }
  }, [initialData]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setPoemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await handleSubmit(0);
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
    }
  };

  const handleSubmit = async (status) => {
    setIsLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      message.error("Vui lòng đăng nhập để đăng bài.");
      setIsLoading(false);
      return;
    }

    if (status === 1) {
      if (poemData.title === null || poemData.title.trim() === "") {
        message.error("Vui lòng nhập tiêu đề");
        setIsLoading(false);
        return;
      }
      if (poemData.description === null || poemData.description.trim() === "") {
        message.error("Vui lòng nhập mô tả");
        setIsLoading(false);
        return;
      }
    }

    const validatePoemStructure = () => {
      const lines = formatContent(poemData.content, selectedType)
        .split('\n')
        .filter(line => line.trim() !== '');

      if (lines.length === 0) {
        message.error("Thơ chưa được soạn");
        return false;
      };

      switch (selectedType) {
        case '1': // Thơ tự do - không có ràng buộc về số chữ
          return true;
        case '2':
          const lastLineWords = lines[lines.length - 1].trim().split(/\s+/).length;
          if (lastLineWords !== 8) {
            message.error("Lục bát phải kết thúc bằng câu 8 chữ!");
            return false;
          }

          const isValid = lines.every((line, index) => {
            const wordCount = line.trim().split(/\s+/).length;
            return index % 2 === 0 ? wordCount === 6 : wordCount === 8;
          });

          if (!isValid) {
            message.error("Lục bát phải theo đúng luật: câu 6 chữ - câu 8 chữ luân phiên!");
            return false;
          }
          return true;

        case '3': // Song thất lục bát
          if (lines.length % 4 !== 0) {
            message.error("Song thất lục bát phải có kết thúc bằng câu số 4, 8, 12, 16...!");
            return false;
          }

          // Check 7-7-6-8 pattern for each stanza
          const pattern = [7, 7, 6, 8];
          const isValidSongThat = lines.every((line, index) => {
            const stanzaIndex = index % 4;
            const expectedWords = pattern[stanzaIndex];
            return line.trim().split(/\s+/).length === expectedWords;
          });

          if (!isValidSongThat) {
            message.error("Song thất lục bát phải theo đúng luật: 7-7-6-8 cho mỗi khổ!");
            return false;
          }
          return true;


        case '4': // Thất ngôn tứ tuyệt
          if (lines.length !== 4) {
            message.error("Thất ngôn tứ tuyệt phải có đúng 4 câu 7 chữữ!");
            return false;
          }
          if (lines.some(line => line.trim().split(/\s+/).length !== 7)) {
            message.error("Mỗi câu Thất ngôn tứ tuyệt phải có đúng 7 chữ!");
            return false;
          }
          return true;

        case '5': // Ngũ ngôn tứ tuyệt
          if (lines.length !== 4) {
            message.error("Ngũ ngôn tứ tuyệt phải có đúng 4 câu 5 chữ!");
            return false;
          }
          if (lines.some(line => line.trim().split(/\s+/).length !== 5)) {
            message.error("Mỗi câu Ngũ ngôn tứ tuyệt phải có đúng 5 chữ!");
            return false;
          }
          return true;

        case '6': // Thất ngôn bát cú
          if (lines.length !== 8) {
            message.error("Thất ngôn bát cú phải có đúng 8 câu 7 chữ!");
            return false;
          }
          if (lines.some(line => line.trim().split(/\s+/).length !== 7)) {
            message.error("Mỗi câu Thất ngôn bát cú phải có đúng 7 chữ!");
            return false;
          }
          return true;
        case '7': // Thơ bốn chữ (4 words/line)
          return lines.every(line =>
            line.trim().split(/\s+/).length === 4
          );

        case '8': // Thơ năm chữ (5 words/line)
          return lines.every(line =>
            line.trim().split(/\s+/).length === 5
          );

        case '9': // Thơ sáu chữ (6 words/line)
          return lines.every(line =>
            line.trim().split(/\s+/).length === 6
          );

        case '10': // Thơ bảy chữ (7 words/line)
          return lines.every(line =>
            line.trim().split(/\s+/).length === 7
          );

        case '11': // Thơ tám chữ (8 words/line)
          return lines.every(line =>
            line.trim().split(/\s+/).length === 8
          );

        default:
          return true;
      }
    };

    if (!validatePoemStructure()) {
      if (selectedType >= 7 && selectedType <= 11) {
        const requiredWords = [4, 5, 6, 7, 8][selectedType - 7];
        const poemTypeName = poemTypes.find(pt => pt.id.toString() === selectedType)?.name || "Thể thơ này";
        message.error(`${poemTypeName} yêu cầu mỗi câu đủ ${requiredWords} chữ!`);
      }
      setIsLoading(false);
      return;
    }



    // Get formatted content from textarea preview
    const formattedContent = formatContent(poemData.content, selectedType);

    const requestData = {
      title: poemData.title,
      content: formattedContent,  // Use formatted textarea content
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapter) ? 0 : Number(poemData.chapter),
      chapterName: poemData.chapter || null,
      status: status,
      collectionId: poemData.collectionId ? poemData.collectionId : null,
      sourceCopyRightId: null,
      poemImage: poemData.poemImage || null,
      recordFiles: [],
      type: parseInt(selectedType),
      isPublic: true,
    };
    console.log(requestData)
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success(status === 1 ? "Bài thơ đã được đăng thành công. Vui lòng chờ kết quả kiểm duyệt đạo văn! " : "Bài thơ đã được lưu nháp!");
        window.location.reload();
      } else {
        message.error("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      message.error("Không thể đăng bài. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputContent = (value) => {
    setPoemData(prev => ({
      ...prev,
      content: value,
    }));
  };

  const formatContent = (content, typeId) => {
    // Tìm thể loại thơ tương ứng trong danh sách từ API
    const poemType = poemTypes.find(type => type.id === typeId);

    // Nếu không tìm thấy hoặc là thơ tự do (type = 1)
    if (!poemType || typeId === '1') {
      // Xử lý thơ tự do (giữ nguyên format)
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

    // Chuyển đổi content HTML sang plain text
    const plainText = content.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n');
    const allWords = plainText.split(/\s+/).filter(word => word.trim() !== '');

    // Hàm phụ trợ định dạng thơ có số chữ cố định mỗi dòng
    const formatFixedWordPoem = (words, wordsPerLine) => {
      const lines = [];
      for (let i = 0; i < words.length; i += wordsPerLine) {
        const line = words.slice(i, i + wordsPerLine).join(' ');
        lines.push(line);
      }
      return lines.join('\n');
    };

    // Xác định cách định dạng dựa trên tên thể loại thơ
    switch (poemType.name) {
      case 'Thơ Lục Bát':
        let lucBatLines = [];
        let currentLine = [];
        let currentLineType = 6; // Bắt đầu với câu lục (6 chữ)

        allWords.forEach((word) => {
          currentLine.push(word);
          if (currentLine.length === currentLineType) {
            const isBatLine = currentLineType === 8;
            lucBatLines.push({
              text: currentLine.join(' '),
              type: isBatLine ? 'bat' : 'luc'
            });
            currentLine = [];
            currentLineType = isBatLine ? 6 : 8; // Luân phiên 6-8
          }
        });

        // Thêm dòng cuối nếu còn
        if (currentLine.length > 0) {
          lucBatLines.push({
            text: currentLine.join(' '),
            type: currentLineType === 8 ? 'bat' : 'luc'
          });
        }

        // Định dạng với thụt đầu dòng
        return lucBatLines.map((line, index) => {
          const indent = line.type === 'luc' ? '       ' : '';
          return indent + line.text;
        }).join('\n');

      case 'Thơ Song Thất Lục Bát':
        const songThatLines = [];
        const linePattern = [7, 7, 6, 8]; // 2 câu 7, 1 câu 6, 1 câu 8
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
            patternIndex = (patternIndex + 1) % 4; // Lặp lại pattern
          }
        });

        // Thêm dòng cuối nếu còn
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

      case 'Thơ 4 Chữ':
        return formatFixedWordPoem(allWords, 4);

      case 'Thơ 5 Chữ':
        return formatFixedWordPoem(allWords, 5);

      case 'Thơ 6 Chữ':
        return formatFixedWordPoem(allWords, 6);

      case 'Thơ 7 Chữ':
        return formatFixedWordPoem(allWords, 7);

      case 'Thơ 8 Chữ':
        return formatFixedWordPoem(allWords, 8);

      default:
        // Mặc định trả về nội dung gốc nếu không xác định được thể loại
        return allWords.join(' ');
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true); // Start loading
      const imageUrl = URL.createObjectURL(file);
      setPoemFile(imageUrl);

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

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        const uploadedImageUrl = data.data;

        message.success("Poem Image updated successfully!");
        sessionStorage.setItem("poemImage", uploadedImageUrl);
        setPoemData((prev) => ({ ...prev, poemImage: uploadedImageUrl }));
        setPoemFile(uploadedImageUrl);
      } catch (error) {
        message.error("Error uploading image!");
        console.error(error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  };


  const handleAISuggest = async () => {
    const content = formatContent(poemData.content, selectedType);

    let question = null;

    if (selectedType === 4 || selectedType === 5 || selectedType === 6) {
      question = "Hãy hoàn thiện đoạn thơ trên cho tôi theo đúng thể thơ tôi đã đề cập. Chỉ trả về cả bài thơ hoàn chỉnh"
    } else if (selectedType === 3) {
      question = "Hãy sáng tác tiếp đoạn thơ trên hoàn chỉnh cho tôi theo đúng thể thơ tôi đã đề cập. Chỉ trả về cả bài thơ hoàn chỉnh"
    } else {
      question = "Hãy sáng tác thêm 4 câu tiếp nối cho đoạn thơ trên theo đúng thể thơ tôi đã đề cập. Chỉ trả về cả bài thơ hoàn chỉnh"
    }

    const requestBody = {
      type: parseInt(selectedType),
      poemContent: content,
      chatContent: question,
      maxToken: 1000
    }
    setIsLoading(true);
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/ai-chat-completion`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${await response.text()}`);
    }
    const data = await response.json();

    setSuggestion(data.data);
    showModal();
    setIsLoading(false);
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  }

  const handleCopyToContent = () => {
    const formattedContent = suggestion
      .split('\n')
      .map(line => `<p>${line}</p>`)
      .join('');
    setPoemData(prev => ({
      ...prev,
      content: formattedContent,
    }));
    setIsModalOpen(false);
  }

  const handleCancelPreview = () => {
    // setPreviewImage(null);
    setIsPreviewModalOpen(false);
    // setIsModalContentCompleteOpen(true);
  };

  const handleApplyPreviewImage = async () => {
    if (previewSelectedIndex === null || !previewImages[previewSelectedIndex]) {
      message.error("Vui lòng chọn hình ảnh để áp dụng!");
      return;
    }
    try {
      setIsLoading(true);
      // Use the selected image from the preview images list.
      const selectedImageUrl = previewImages[previewSelectedIndex];

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
      message.success("Poem Image updated successfully!");
      setPoemData((prev) => ({ ...prev, poemImage: imageData.data }));
      setPoemFile(imageData.data);
      setPreviewSelectedIndex(null);
      setIsPreviewModalOpen(false);
    } catch (error) {
      message.error("Lỗi khi áp dụng hình ảnh!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };



  const showModalContentComplete = () => {
    setIsModalContentCompleteOpen(true);
  }

  const handleCancelModalContentComplete = () => {
    setIsModalContentCompleteOpen(false);
  }

  const handleAIRenderImage = async () => {
    let content = formatContent(poemData.content, selectedType);
    // Limit to the first 600 characters
    content = content.substring(0, 600);
    // Optional: Clear any previous preview image selection if desired.
    // setPreviewSelectedIndex(null);
    // We'll update previewImages instead of previewImage
    try {
      setIsLoading(true);
      let responseImage = null;

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
      } else if (imageType === "cơ bản") {
        if (data.data.output && data.data.output.length > 0) {
          generatedImageUrl = data.data.output[0].url;
        } else {
          generatedImageUrl = data.data;
        }
      }

      // Append the newly generated image to our temporary list.
      setPreviewImages((prevImages) => [...prevImages, generatedImageUrl]);
      // Select the newly added image automatically.
      setPreviewSelectedIndex(previewImages.length); // new image index is at the end

      // Close the content complete modal and open the preview modal.
      setIsModalContentCompleteOpen(false);
      setIsPreviewModalOpen(true);
    } catch (error) {
      message.error("Lỗi khi tạo hình ảnh!");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAICheckPlagiarism = async () => {
    const content = formatContent(poemData.content, selectedType);
    const requestBody = {
      poemContent: content
    }
    setIsLoading(true);
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poems/v1/plagiarism`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json();
    console.log("plagiarism", data)
    setPlagiarismResult(data.data.score);
    setPlagiarismPoems(data.data.plagiarismFrom);
    setIsLoading(false);
  }

  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const Delta = Quill.import("delta");
      quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
        // Process each op in the pasted delta:
        const newOps = delta.ops.map((op) => {
          if (typeof op.insert === "string") {
            // If the inserted text is exactly a space or newline, leave it as is.
            if (op.insert === " " || op.insert === "\n") {
              return op;
            }
            // Otherwise, insert the text without any formatting attributes.
            return { insert: op.insert };
          }
          // For non-string inserts (e.g. images) you might decide to keep them or remove them.
          return op;
        });
        return new Delta(newOps);
      });
    }
  }, []);

  const handleSaveDraft = async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      message.error("Vui lòng đăng nhập để lưu nháp.");
      setIsLoading(false);
      return;
    }

    // Build the request body using the current poemData.
    // Ensure that poemData.id exists when editing an existing draft.
    const requestBody = {
      id: poemData.id, // must be present in initialData for updates
      title: poemData.title,
      content: formatContent(poemData.content, selectedType), // Use your formatting function
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapterNumber) ? 0 : Number(poemData.chapterNumber),
      chapterName: poemData.chapterName || null,
      status: 0, // assuming 0 means draft
      collectionId: poemData.collectionId,
      sourceCopyRightId: poemData.sourceCopyRightId,
      poemImage: poemData.poemImage || null,
      recordFiles: poemData.recordFiles,
      type: parseInt(selectedType),
    };

    console.log("Draft request:", requestBody);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Bài thơ nháp đã được lưu thành công!");
        window.location.reload();
      } else {
        message.error("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
      message.error("Không thể lưu nháp. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitDraft = async () => {
    setIsLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      message.error("Vui lòng đăng nhập để lưu nháp.");
      setIsLoading(false);
      return;
    }

    // Build the request body using the current poemData.
    // Ensure that poemData.id exists when editing an existing draft.
    const requestBody = {
      id: poemData.id, // must be present in initialData for updates
      title: poemData.title,
      content: formatContent(poemData.content, selectedType), // Use your formatting function
      description: poemData.description,
      chapterNumber: isNaN(poemData.chapterNumber) ? 0 : Number(poemData.chapterNumber),
      chapterName: poemData.chapterName || null,
      status: 1, // assuming 1 means posts
      collectionId: poemData.collectionId,
      sourceCopyRightId: poemData.sourceCopyRightId,
      poemImage: poemData.poemImage || null,
      recordFiles: poemData.recordFiles,
      type: parseInt(selectedType),
    };

    console.log("Draft request:", requestBody);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/poems/v1`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        message.success("Bài thơ nháp đã được đăng tải thành công. Vui lòng chờ kết quả kiểm duyệt đạo văn!");
        window.location.reload();
        // Optionally, update UI or navigate as needed.
      } else {
        message.error("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi lưu nháp:", error);
      message.error("Không thể lưu nháp. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePopupContentPlagiarism = (content) => {
    setPopupContentPlagiarism(true);
    setContentPlagiarism(content)
  }

  const handleCancelPopupContentPlagiarism = () => {
    setPopupContentPlagiarism(false);
  }

  return (
    <div>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
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
      <Modal open={isModalOpen} onCancel={handleCancel} footer={() => (
        <>
          <Button color="danger" variant="solid" onClick={handleCancel}>
            Đóng
          </Button>
          <Button color="primary" variant="solid" onClick={handleCopyToContent}>
            Dán
          </Button>

        </>
      )}>
        <div>
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "0px" }}>Gợi ý nội dung từ AI</h2>
          <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "5px", fontWeight: "bold" }}>Đây là nội dung chúng tôi sử dụng AI để gợi ý cho bạn. Hãy bấm <span style={{ color: "#3A86ff", fontWeight: "bold" }}>"Dán"</span> để áp dụng vào bài thơ của bạn nhé.</p>
          <textarea
            style={{ width: "100%", height: "300px" }}
            value={suggestion} x
          >
          </textarea>
        </div>

      </Modal>

      <Modal
        open={isModalContentCompleteOpen}
        onCancel={handleCancelModalContentComplete}
        footer={[
          <Button key="cancel" color="danger" variant="solid" onClick={handleCancelModalContentComplete}>
            Đóng
          </Button>,
          <Button color="green" variant="solid" onClick={() => setIsPreviewModalOpen(true)}>
            Xem lại ảnh đã tạo
          </Button>,
          <Button key="confirm" color="primary" variant="solid" onClick={handleAIRenderImage}>
            Xác nhận
          </Button>,
        ]}
      >
        <div>
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "0px" }}>
            AI tạo hình ảnh 🏞
          </h2>
          <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "5px", fontWeight: "bold" }}>
            Hãy đảm bảo rằng bạn muốn AI tạo hình ảnh dựa trên{" "}
            <span style={{ color: "#3A86ff", fontWeight: "bold" }}>nội dung hiện tại</span> hoặc{" "}
            <span style={{ color: "#3A86ff", fontWeight: "bold" }}>yêu cầu của bạn</span> dưới đây.
            Bấm <span style={{ color: "#3A86ff", fontWeight: "bold" }}>Xác nhận</span> để bắt đầu.
          </p>
          <div style={{ marginBottom: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
                Loại hình ảnh
              </label>
              <Select defaultValue="cơ bản" style={{ width: "100%" }} onChange={handleOptionChange}>
                <Option value="cơ bản">Cơ bản</Option>
                <Option value="nâng cao">Nâng cao</Option>
              </Select>
            </div>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
              Yêu cầu của bạn{" "}
              <span style={{ fontWeight: "normal", color: "#666" }}>
                (Nếu không nhập, chúng tôi sẽ tạo dựa trên nội dung)
              </span>
            </label>
            <Input
              placeholder="Hãy miêu tả hình ảnh bạn muốn"
              value={imagePrompt}
              onChange={handleImagePromptChange}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Nội dung thơ</label>
            <textarea
              style={{ width: "100%", height: "300px" }}
              value={formatContent(poemData.content, selectedType)}
              readOnly
            />
          </div>
        </div>
      </Modal>

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

      <form style={{ borderRadius: "10px" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 7, display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "15px", flex: 1 }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={poemData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề bài thơ"
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", outline: "none", }}
                onFocus={(e) =>
                  (e.target.style.border = "1px solid #000") // Custom focus border
                }
                onBlur={(e) =>
                  (e.target.style.border = "1px solid #ccc") // Reset on blur
                }
                required
              />
            </div>

            <div style={{ marginBottom: "15px", flex: 2, display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontWeight: "bold", flex: 1 }}>Mô tả</label>
              <textarea
                type="text"
                name="description"
                value={poemData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả bài thơ"
                style={{
                  width: "100%",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                  flex: 2,
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  outline: "none",
                  resize: "none", // if you want to disable resizing
                  textAlign: "left", // ensures the text is left-aligned
                  verticalAlign: "top" // although this might be redundant for a textarea
                }}
                onFocus={(e) =>
                  (e.target.style.border = "1px solid #000") // Custom focus border
                }
                onBlur={(e) =>
                  (e.target.style.border = "1px solid #ccc") // Reset on blur
                }
                required
              />
            </div>


            {/* <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Chương số</label>
              <input
                type="text"
                name="chapter"
                value={poemData.chapterNumber}
                onChange={handleInputChange}
                placeholder="Ex: 1, 2, 3 or I, II, III"
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", }}
              />
            </div> */}

            <div style={{ marginBottom: "15px", flex: 1 }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Tập thơ</label>
              <select
                name="collectionId"
                value={poemData.collectionId}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.border = "1px solid #000") // Custom focus border
                }
                onBlur={(e) =>
                  (e.target.style.border = "1px solid #ccc") // Reset on blur
                }
                required
              >
                {collections.map((collection) => (
                  <option key={collection?.id} value={collection?.id}>
                    {collection.collectionName}
                  </option>
                ))}
              </select>

            </div>
          </div>
          <div style={{
            flex: 3,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}>
            <div
              size={80}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundImage: `url(${poemFile ? poemFile : poemData.poemImage ? poemData.poemImage : '/check.png'})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "268px",
                width: "168px",
                objectFit: "cover",
                border: "1px solid #000",

              }}
            ></div>
            {/* Nút tải ảnh */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label
                style={{
                  backgroundColor: '#3A86FF',
                  color: '#FBFBFB',
                  padding: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  textAlign: "center",
                  fontSize: "0.9rem"
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
              <Button onClick={showModalContentComplete} color="default" variant="solid" style={{ padding: "20px" }}>AI tạo hình 🏞</Button>
            </div>
          </div>
        </div>
        <label style={{ display: "block", fontWeight: "bold" }}>Nội dung</label>
        <div style={{ marginBottom: "60px", display: "flex", gap: "20px", height: "300px" }}>
          <div style={{ flex: 7, display: "flex", height: "100%", flexDirection: "column", gap: "5px" }}>
            <ReactQuill
              ref={quillRef}
              formats={"none"}
              modules={{ toolbar: false }}
              value={poemData.content}
              onChange={handleInputContent}
              style={{ height: "100%", backgroundColor: "#fff" }}

            />
            {plagiarismResult != null ? plagiarismResult > 0.75 ?
              <div>
                <p style={{ color: "#f00", fontWeight: "bold", alignSelf: "flex-end" }}>
                  Nội dung của bạn đang dính đạo văn ở mức {plagiarismResult * 100}%. Vui lòng chỉnh sửa nội dung!
                </p>
                <div>
                  <p style={{ color: "#000", fontWeight: "bold", marginBottom: "5px", fontSize: "0.95rem" }}>Những bài thơ tương tự:</p>
                  <ul style={{ margin: 0 }}>
                    {plagiarismPoems !== null && plagiarismPoems?.map((item) =>
                      <li onClick={() => handlePopupContentPlagiarism(item.content)} style={{ margin: "2px", color: "#005CC5", textDecoration: "underline", cursor: "pointer", fontSize: "0.9rem" }}>
                        {item.title} - {item.user?.displayName}
                      </li>
                    )}


                  </ul>
                </div>
              </div> : <p style={{ color: "#0f0", fontWeight: "bold", alignSelf: "flex-end" }}>
                Chúc mừng! Nội dung của bạn hiện tại không dính đạo văn.
              </p> : <></>}
            <div style={{ display: "flex", flexDirection: "row", alignSelf: "flex-end", gap: "10px" }}>
              <Button onClick={handleAICheckPlagiarism} color="default" variant="solid" style={{ alignSelf: "flex-end", padding: "10px" }}>Kiểm tra đạo văn<FaSpellCheck /></Button>
              <Button onClick={handleAISuggest} color="default" variant="solid" style={{ padding: "10px" }}>Gợi ý nội dung từ AI<FcIdea /></Button>
            </div>
            {/* <div style={{flex: 1}}>
            </div> */}
          </div>
          <div style={{ flex: 3, display: "flex", flexDirection: "column", gap: "5px", height: "100%" }}>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontWeight: "bold", fontSize: "16px" }}>Thể loại thơ</label>
            </div>
            <Select
              value={selectedType}
              onChange={(value) => setSelectedType(value)}
              style={{
                padding: "5px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              {poemTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>

            <div style={{ width: "100%", flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "bold" }}>
                Cách thơ bạn hiển thị
              </label>
              <textarea
                style={{
                  width: "100%",
                  flexGrow: 1,
                  padding: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  backgroundColor: "#fff",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: "1.5",
                  resize: "none", // optional: prevent manual resizing
                  boxSizing: "border-box",
                  outline: "none",
                }}
                onFocus={(e) =>
                  (e.target.style.border = "1px solid #000") // Custom focus border
                }
                onBlur={(e) =>
                  (e.target.style.border = "1px solid #ccc") // Reset on blur
                }
                value={formatContent(poemData.content, selectedType)}
                readOnly
              />
            </div>
          </div>
        </div>


        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginBottom: "100px" }}>
          <button
            type="button"
            onClick={setDrafting ? handleSaveDraft : handleSave}
            style={{ backgroundColor: "#ffc107", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            {setDrafting ? "LƯU NHÁP" : "LƯU VÀO NHÁP"}
          </button>
          <button
            type="button"
            onClick={setDrafting ? handleSubmitDraft : () => handleSubmit(1)}
            style={{ backgroundColor: "#28a745", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            ĐĂNG BÀI
          </button>
        </div>
      </form>
      <Modal
        open={isPreviewModalOpen}
        onCancel={handleCancelPreview}
        footer={[
          <Button key="cancel" color="danger" variant="solid" onClick={handleCancelPreview}>
            Hủy
          </Button>,
          <Button key="renew" color="green" variant="solid" onClick={handleAIRenderImage}>
            Tạo mới
          </Button>,
          <Button key="apply" color="primary" variant="solid" onClick={handleApplyPreviewImage}>
            Áp dụng
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Bạn có muốn sử dụng hình này?</h2>
          <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "10px", fontWeight: "bold" }}>
            Hãy chọn hình bạn muốn sử dụng. Nếu không hài lòng, bấm “Tạo mới” để tạo thêm.
          </p>
          {previewImages.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
                gap: "10px",
                height: "400px",
                overflow: "scroll"
              }}
            >
              {previewImages.map((imgUrl, index) => (
                <div
                  key={index}
                  onClick={() => setPreviewSelectedIndex(index)}
                  style={{
                    border:
                      previewSelectedIndex === index ? "2px solid #1890ff" : "2px solid transparent",
                    padding: "4px",
                    cursor: "pointer",
                    height: "268px",
                    width: "168px",
                    objectFit: "cover",
                    margin: "0 auto"
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Preview ${index + 1}`}
                    style={{
                      height: "268px",
                      width: "168px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No image to preview</p>
          )}
        </div>
      </Modal>

      <Modal
        open={popupContentPlagiarism}
        onCancel={handleCancelPopupContentPlagiarism}
        footer={
          <>
            <Button color="danger" variant="solid" onClick={handleCancelPopupContentPlagiarism}>
              Đóng
            </Button>
          </>
        }
      >
        <div style={{ textAlign: "center" }}>
          <h2>Nội dung bài thơ</h2>
          <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "5px", fontWeight: "bold" }}>
            Đây là nội dung của bài thơ nghi vấn bạn đạo văn. Hãy kiểm tra kĩ và chỉnh sửa nhé{" "}
            <span style={{ color: "#3A86ff", fontWeight: "bold" }}>kiểm tra</span> và{" "}
            <span style={{ color: "#3A86ff", fontWeight: "bold" }}>chỉnh sửa</span> nhé
          </p>
          {contentPlagiarism && (
            <textarea
              style={{ width: "100%", height: "300px", boxSizing: "border-box" }}
              value={contentPlagiarism} x
            >

            </textarea>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreatePoemForm;