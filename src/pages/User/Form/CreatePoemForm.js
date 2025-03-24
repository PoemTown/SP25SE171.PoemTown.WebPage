import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, message, Modal } from "antd";
import { FcIdea } from "react-icons/fc";
import { FaSpellCheck } from "react-icons/fa6";

const CreatePoemForm = ({ onBack, initialData }) => {
  const [poemData, setPoemData] = useState({
    title: "",
    description: "",
    chapterNumber: "",
    poemImage: "",
    collection: "",
    content: "",
  });
  const [selectedType, setSelectedType] = useState("1");
  const [collections, setCollections] = useState([]);
  const [poemFile, setPoemFile] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalContentCompleteOpen, setIsModalContentCompleteOpen] = useState(false);
  const accessToken = localStorage.getItem("accessToken");
  const [plagiarismResult, setPlagiarismResult] = useState(null);

  const poemType = {
    1: "Thơ tự do",
    2: "Thơ Lục bát",
    3: "Thơ Song thất lục bát",
    4: "Thơ Thất ngôn tứ tuyệt",
    5: "Thơ Ngũ ngôn tứ tuyệt",
    6: "Thơ Thất ngôn bát cú",
    7: "Thơ bốn chữ",
    8: "Thơ năm chữ",
    9: "Thơ sáu chữ",
    10: "Thơ bảy chữ",
    11: "Thơ tám chữ",
  }

  useEffect(() => {
    const fetchCollections = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await axios.get(
          "https://api-poemtown-staging.nodfeather.win/api/collections/v1",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setCollections(response.data.data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    if (initialData) {
      setPoemData({
        title: initialData.title || "",
        description: initialData.description || "",
        poemImage: initialData.poemImage || "",
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
      message.error("Vui lòng đăng nhập để đăng bài.");
      return;
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
        case '2': // Lục bát
          // Must end with 8-word line
          const lastLineWords = lines[lines.length - 1].trim().split(/\s+/).length;
          if (lastLineWords !== 8) {
            message.error("Lục bát phải kết thúc bằng câu 8 chữ!");
            return false;
          }

          // Check alternating 6-8 pattern
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
      // Add specific error messages for fixed-word types
      if (selectedType >= 7 && selectedType <= 11) {
        const requiredWords = [4, 5, 6, 7, 8][selectedType - 7];
        message.error(`${poemType[selectedType]} yêu cầu mỗi câu đủ ${requiredWords} chữ!`);
      }
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
      collectionId: poemData.collection ? poemData.collection : null,
      sourceCopyRightId: null,
      poemImage: poemData.poemImage || null,
      recordFiles: [],
      type: 0,
      isPublic: true,
    };
    console.log()
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
        message.success(status === 1 ? "Bài thơ đã được đăng thành công!" : "Bài thơ đã được lưu nháp!");
        window.location.reload();
      } else {
        message.error("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      message.error("Không thể đăng bài. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.");
    }
  };

  const handleInputContent = (value) => {
    setPoemData(prev => ({
      ...prev,
      content: value,
    }));
  };

  const formatContent = (content, type) => {

    if (type === '1') {
      // Parse content while preserving structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const lines = [];

      // Process each node in the content
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

      // Process lines with preserved formatting
      return lines
        .map((line) => {
          const leadingWhitespace = line.match(/^\s*/)[0];
          const content = line.slice(leadingWhitespace.length);
          return leadingWhitespace + content.replace(/\s+/g, ' ').replace(/\s*$/, '');
        })
        .join('\n');
    }
    // Convert HTML to plain text
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

    switch (type) {
      case '2':
        let lucBatLines = [];
        let currentLine = [];
        let currentLineType = 6; // Start with 6-word line (Lục)

        allWords.forEach((word, index) => {
          currentLine.push(word);

          // Check if reached word limit for current line type
          if (currentLine.length === currentLineType) {
            const isBatLine = currentLineType === 8;
            lucBatLines.push({
              text: currentLine.join(' '),
              type: isBatLine ? 'bat' : 'luc'
            });

            // Switch line type for next line
            currentLine = [];
            currentLineType = isBatLine ? 6 : 8;
          }
        });

        // Add remaining words
        if (currentLine.length > 0) {
          lucBatLines.push({
            text: currentLine.join(' '),
            type: currentLineType === 8 ? 'bat' : 'luc'
          });
        }

        // Format with indentation
        return lucBatLines.map((line, index) => {
          const indent = line.type === 'luc' ? '       ' : '';
          // Add line break after every 2 lines (1 couplet)
          return indent + line.text;
        }).join('\n');

      case '3':
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
            patternIndex = (patternIndex + 1) % 4; // Cycle through 7-7-6-8
          }
        });

        // Add remaining words
        if (currentLine2.length > 0) {
          songThatLines.push({
            text: currentLine2.join(' '),
            type: linePattern[patternIndex]
          });
        }

        // Format with indentation for 6 and 8-word lines
        return songThatLines.map(line => {
          const indent = [6, 8].includes(line.type) ? '' : '';
          return indent + line.text;
        }).join('\n');

      case '4': // Thất ngôn tứ tuyệt
        const maxLines = 4;
        const wordsPerLine = 7;
        const limitedWords = allWords.slice(0, maxLines * wordsPerLine);

        const thatNgonLines = [];
        for (let i = 0; i < limitedWords.length; i += wordsPerLine) {
          const line = limitedWords.slice(i, i + wordsPerLine).join(' ');
          thatNgonLines.push(line);
        }

        // Fill remaining lines if needed
        while (thatNgonLines.length < maxLines) {
          thatNgonLines.push('');
        }

        return thatNgonLines.slice(0, maxLines).join('\n');

      case '5': // Ngũ ngôn tứ tuyệt (5 words per line, 4 lines)
        const ngonTuTuyetLines = 4;
        const ngonWordsPerLine = 5;
        const ngonWords = allWords.slice(0, ngonTuTuyetLines * ngonWordsPerLine);

        const ngonLines = [];
        for (let i = 0; i < ngonWords.length; i += ngonWordsPerLine) {
          const line = ngonWords.slice(i, i + ngonWordsPerLine).join(' ');
          ngonLines.push(line);
        }
        while (ngonLines.length < ngonTuTuyetLines) {
          ngonLines.push('');
        }
        return ngonLines.slice(0, ngonTuTuyetLines).join('\n');

      case '6': // Thất ngôn bát cú (7 words per line, 8 lines)
        const batCuLines = 8;
        const batCuWordsPerLine = 7;
        const batCuWords = allWords.slice(0, batCuLines * batCuWordsPerLine);

        const batCuResults = [];
        for (let i = 0; i < batCuWords.length; i += batCuWordsPerLine) {
          const line = batCuWords.slice(i, i + batCuWordsPerLine).join(' ');
          batCuResults.push(line);
        }
        while (batCuResults.length < batCuLines) {
          batCuResults.push('');
        }
        return batCuResults.slice(0, batCuLines).join('\n');

      case '7': // Thơ bốn chữ (4 words per line)
        return formatFixedWordPoem(allWords, 4);

      case '8': // Thơ năm chữ (5 words per line)
        return formatFixedWordPoem(allWords, 5);

      case '9': // Thơ sáu chữ (6 words per line)
        return formatFixedWordPoem(allWords, 6);

      case '10': // Thơ bảy chữ (7 words per line)
        return formatFixedWordPoem(allWords, 7);

      case '11': // Thơ tám chữ (8 words per line)
        return formatFixedWordPoem(allWords, 8);
      default:
        return allWords.join(' ');
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPoemFile(imageUrl);

      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await fetch(
          "https://api-poemtown-staging.nodfeather.win/api/poems/v1/image",
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
      }
    }
  }

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

    const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/poems/v1/ai-chat-completion`, {
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

  const showModalContentComplete = () => {
    setIsModalContentCompleteOpen(true);
  }

  const handleCancelModalContentComplete = () => {
    setIsModalContentCompleteOpen(false);
  }

  const handleAIRenderImage = async () => {
    let content = formatContent(poemData.content, selectedType);
    // Limit to the first 900 characters
    content = content.substring(0, 600);
    console.log(content);

    const requestBodyImage = {
      imageSize: 4,
      poemText: content,
      prompt: "Render an image base on the poem content for me",
      negativePrompt: "Image response must not contain any text",
      numberInferenceSteps: 5,
      guidanceScale: 5,
      numberOfImages: 1,
      outPutFormat: 2,
      outPutQuality: 100
    }

    const responseImage = await fetch(`https://api-poemtown-staging.nodfeather.win/api/poems/v1/text-to-image/the-hive-ai/sdxl-enhanced`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBodyImage),
    })

    const data = await responseImage.json();
    const uploadedImageUrl = data.data.output[0].url;
    console.log(data.data.output[0].url);
    message.success("Poem Image updated successfully!");
    setPoemData((prev) => ({ ...prev, poemImage: uploadedImageUrl }));
    setPoemFile(uploadedImageUrl);
    setIsModalContentCompleteOpen(false);
  }

  const handleAICheckPlagiarism = async () => {
    const content = formatContent(poemData.content, selectedType);
    const requestBody = {
      poemContent: content
    }
    const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/poems/v1/plagiarism`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json();
    setPlagiarismResult(data.data.score);
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


  return (
    <div>
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

      <Modal open={isModalContentCompleteOpen} onCancel={handleCancelModalContentComplete} footer={() => (
        <>
          <Button color="danger" variant="solid" onClick={handleCancelModalContentComplete}>
            Đóng
          </Button>
          <Button color="primary" variant="solid" onClick={handleAIRenderImage}>
            Xác nhận
          </Button>

        </>
      )}>
        <div>
          <h2 style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "0px" }}>AI tạo hình ảnh 🏞</h2>
          <p style={{ fontSize: "0.95em", color: "#999", marginBottom: "5px", fontWeight: "bold" }}>Hãy đảm bảo rằng bạn muốn AI tạo hình ảnh dựa trên <span style={{ color: "#3A86ff", fontWeight: "bold" }}>nội dung hiện tại</span> dưới đây . Hãy bấm <span style={{ color: "#3A86ff", fontWeight: "bold" }}>"Xác nhận"</span> để AI bắt đầu tạo hình ảnh cho bài thơ của bạn nhé.</p>
          <textarea
            style={{ width: "100%", height: "300px" }}
            value={formatContent(poemData.content, selectedType)}
          >
          </textarea>
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

      <form style={{ backgroundColor: "#f9f9f9", borderRadius: "10px" }}>
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 7 }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={poemData.title}
                onChange={handleInputChange}
                placeholder="Enter Poem's Title"
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", }}
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
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", }}
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
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontWeight: "bold" }}>Tập thơ</label>
              <select
                name="collection"
                value={poemData.collection}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box", }}
              >
                <option value="">Choose existing collection</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
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
              style={{ height: "100%" }}

            />
            {plagiarismResult != null ? plagiarismResult > 0.5 ?
              <p style={{ color: "#f00", fontWeight: "bold", alignSelf: "flex-end" }}>
                Nội dung của bạn đang dính đạo văn ở mức {plagiarismResult * 100}%. Vui lòng chỉnh sửa nội dung!
              </p> : <p style={{ color: "#0f0", fontWeight: "bold", alignSelf: "flex-end" }}>
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
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: "5px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            >
              {Object.entries(poemType).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
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
                }}
                value={formatContent(poemData.content, selectedType)}
                readOnly
              />
            </div>
          </div>
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