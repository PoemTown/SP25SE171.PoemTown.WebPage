import React, { useState, useEffect, useRef } from "react";
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
  const [selectedType, setSelectedType] = useState("");
  const [collections, setCollections] = useState([]);


  const poemType = {
    1: "Thơ tự do",
    2: "Lục bát",
    3: "Song thất lục bát",
    4: "Thất ngôn tứ tuyệt",
    5: "Ngũ ngôn tứ tuyệt",
    6: "Thất ngôn bát cú",
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
  
    // Get formatted content from textarea preview
    const formattedContent = formatContent(poemData.content, selectedType);
    console.log(formattedContent)
    
    const requestData = {
      title: poemData.title,
      content: formattedContent,  // Use formatted textarea content
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

  const handleInputContent = (value) => {
    setPoemData(prev => ({
      ...prev,
      content: value,
    }));
  };

  // const formatContent = (content, type) => {
  //   // Convert HTML to formatted plain text
  //   const getFormattedText = (html) => {
  //     const tempDiv = document.createElement('div');
  //     tempDiv.innerHTML = html;

  //     const processNode = (node) => {
  //       if (node.nodeType === Node.TEXT_NODE) {
  //         return node.textContent;
  //       }

  //       const tag = node.tagName.toLowerCase();
  //       const children = Array.from(node.childNodes)
  //         .map(processNode)
  //         .join('');

  //       switch(tag) {
  //         case 'strong': return `**${children}**`;
  //         case 'em': return `*${children}*`;
  //         case 'u': return `_${children}_`;
  //         case 'p': return `${children}\n`;
  //         case 'br': return '\n';
  //         default: return children;
  //       }
  //     };

  //     return Array.from(tempDiv.childNodes)
  //       .map(processNode)
  //       .join(' ')
  //       .replace(/\n\s+/g, '\n'); // Clean up extra spaces after newlines
  //   };

  //   // Get plain text with markdown-style formatting
  //   const plainText = getFormattedText(content)
  //     .replace(/\n+/g, '\n')
  //     .trim();

  //   // Split into words considering formatting markers
  //   const wordGroups = plainText.split(/(\*\*.*?\*\*|\*.*?\*|_.*?_|\S+)/g)
  //     .filter(g => g && g.trim() !== '');

  //   switch (type) {
  //     case '1': // Lục bát
  //       let lucBatLines = [];
  //       let currentLine = [];
  //       let currentLineType = 6;

  //       wordGroups.forEach(word => {
  //         currentLine.push(word);
  //         if (currentLine.length === currentLineType) {
  //           lucBatLines.push({
  //             text: currentLine.join(' '),
  //             type: currentLineType === 6 ? 'luc' : 'bat'
  //           });
  //           currentLine = [];
  //           currentLineType = currentLineType === 6 ? 8 : 6;
  //         }
  //       });

  //       if (currentLine.length > 0) {
  //         lucBatLines.push({
  //           text: currentLine.join(' '),
  //           type: currentLineType === 6 ? 'luc' : 'bat'
  //         });
  //       }

  //       return lucBatLines.map(line => 
  //         (line.type === 'bat' ? '       ' : '') + line.text
  //       ).join('\n');

  //     case '3': // Thất ngôn tứ tuyệt
  //       const thatNgonLines = [];
  //       for (let i = 0; i < wordGroups.length; i += 7) {
  //         const line = wordGroups.slice(i, i + 7).join(' ');
  //         thatNgonLines.push(line);
  //         if ((i / 7 + 1) % 4 === 0) thatNgonLines.push('');
  //       }
  //       return thatNgonLines.join('\n').trim();

  //     default:
  //       return plainText;
  //   }
  // };

  const formatContent = (content, type) => {
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
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.collectionName}
              </option>
            ))}
          </select>
        </div>

        <label style={{ display: "block", fontWeight: "bold" }}>Nội dung</label>
        <div style={{ marginBottom: "60px", display: "flex", gap: "20px", height: "300px" }}>
          <div style={{ flex: 7, height: "100%" }}>
            <ReactQuill
              modules={{ toolbar: false }}
              value={poemData.content}
              onChange={handleInputContent}
              style={{ height: "100%" }}
            />
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
              <option value="">Tất cả loại</option>
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