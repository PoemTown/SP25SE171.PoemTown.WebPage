import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Spin, Switch, Input } from "antd";
import { FcFolder } from "react-icons/fc";
import { FcVideoFile } from "react-icons/fc";
import CreateRecord from "./CreateRecord";
import AchievementAndStatistic from "../AchievementAndStatistic/AchievementAndStatistic";

export default function YourRecordFile({ statisticBorder, achievementBorder }) {
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [activeButton, setActiveButton] = useState("mine");
  const [recordFiles, setRecordFiles] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm state isLoading
  const [price, setPrice] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(false);
  useEffect(() => {
    fetchRecords("mine");
  }, [isCreatingRecord,reloadTrigger]);

  async function fetchRecords(type, pageNumber = 1, pageSize = 8) {
    const baseUrl = "https://api-poemtown-staging.nodfeather.win/api/record-files/v1";
    const url = `${baseUrl}/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    setIsLoading(true); // Bật loading trước khi fetch
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` // Đảm bảo accessToken có giá trị
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setRecordFiles(data.data);
      console.log(recordFiles);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      return null;
    } finally {
      setIsLoading(false); // Tắt loading sau khi fetch xong
    }
  }

  const handleClick = (type) => {
    setActiveButton(type);
    fetchRecords(type).then((data) => {
      console.log(`Dữ liệu từ API ${type}:`, data);
    });
  };

  const showModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };



  const handleToggleStatus = async (recordId) => {
    // Nếu bản ghi đang công khai, tức là người dùng muốn chuyển sang riêng tư.
    if (selectedRecord.isPublic) {
      Modal.confirm({
        title: "Nhập giá để chuyển sang Riêng tư",
        content: (
          <Input
            placeholder="Nhập giá"
            onChange={(e) => setPrice(e.target.value)}
          />
        ),
        onOk: async () => {
          if (!price) {
            message.error("Vui lòng nhập giá!");
            // Không chuyển trạng thái nếu không nhập giá.
            return;
          }
          try {
            const response = await fetch(
              "https://api-poemtown-staging.nodfeather.win/api/record-files/v1/enable-selling",
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ recordId, price }),
              }
            );
            if (!response.ok) {
              throw new Error("Lỗi khi cập nhật trạng thái bán");
            }
            await response.json();
            message.success("Trạng thái cập nhật thành công!");
            // Cập nhật trạng thái bản ghi: chuyển sang riêng tư
            setSelectedRecord((prev) => ({ ...prev, isPublic: false }));
            setReloadTrigger(prev => !prev);
          } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            message.error("Cập nhật trạng thái thất bại!");
          }
        },
      });
    } else {
      // Nếu bản ghi đang riêng tư, không cho chuyển sang công khai.
      message.info("Không cho chuyển từ riêng tư sang công khai");
    }
  };
  const getButtonStyle = (buttonName) => ({
    padding: "12px 20px",
    border: "1px solid #0d47a1",
    backgroundColor: activeButton === buttonName ? "#FDD835" : "white",
    color: "#0d47a1",
    borderRadius: "5px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s",
  });

  return (
    <>
      <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px", minHeight: "650px" }}>
        {!isCreatingRecord ? (
          <>
            {/* Nút tạo bản ghi mới */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <button
                onClick={() => setIsCreatingRecord(true)}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "5px",
                  marginLeft: "1em",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
              >
                BẢN GHI MỚI
              </button>
            </div>

            {/* Bố cục chính */}
            <div style={{ display: "flex", gap: "40px", flexGrow: 1 }}>
              {/* Khu vực danh sách thư mục + nút chọn */}
              <div style={{ flex: 7 }}>
                {/* Nhóm nút "Bài thơ" & "Tập thơ" */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  <button onClick={() => handleClick("mine")} style={getButtonStyle("mine")}>
                    Của tôi
                  </button>
                  <button onClick={() => handleClick("bought")} style={getButtonStyle("bought")}>
                    Đã mua
                  </button>
                  <button onClick={() => handleClick("sold")} style={getButtonStyle("sold")}>
                    Đã bán
                  </button>
                </div>

                {/* Danh sách folder */}
                {isLoading ? (
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Spin size="large" tip="Đang tải dữ liệu..." />
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "20px",
                      minHeight: "200px",
                    }}
                  >
                    {recordFiles.map((record) => (
                      <div
                        key={record.key}
                        style={{
                          position: "relative",
                          textAlign: "center",
                          width: "180px",
                          height: "180px",
                          cursor: "pointer",
                        }}
                        onClick={() => showModal(record)}
                      >
                        {/* Container icon */}
                        <div style={{ position: "relative" }}>
                          <FcVideoFile
                            size={130}
                            style={{ filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))" }}
                            title={record.poem.title}
                          />
                          {/* Dot indicator */}
                          <div
                            style={{
                              position: "absolute",
                              top: "9%",
                              left: "28%",
                              width: "8px",
                              height: "8px",
                              backgroundColor: record.isPublic ? "#00C853" : "#9E9E9E",
                              borderRadius: "50%",
                              zIndex: 1,
                            }}
                          ></div>
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#333",
                            position: "absolute",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            top: "75%",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                          title={record.fileName}
                        >
                          {record.fileName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thành tựu & Thống kê */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", flex: 3 }}>
                <AchievementAndStatistic statisticBorder={statisticBorder} achievementBorder={achievementBorder} />
              </div>
            </div>
          </>
        ) : (
          <CreateRecord onBack={() => setIsCreatingRecord(false)} />
        )}
      </div>

      {/* Modal hiển thị chi tiết record */}
      <Modal
        title={selectedRecord ? selectedRecord.fileName : "Chi tiết bản ghi"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null} // Bỏ footer (nút Cancel/OK)
      >
        {selectedRecord ? (
          <div>
            <h3 style={{ textAlign: "center" }}>
              <strong>Tiêu đề bài thơ:</strong> {selectedRecord.poem.title}
            </h3>
            <h4>
              Owner:{" "}
              {selectedRecord.Owner
                ? selectedRecord.Owner.displayName
                : selectedRecord.poem.user.displayName}
            </h4>
            {selectedRecord.buyer && (
              <h4>Buyer: {selectedRecord.Buyer.displayName}</h4>
            )}
            {/* Công tắc bật/tắt trạng thái */}
            <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
              <strong>Trạng thái:</strong>
              <Switch
                checked={selectedRecord.isPublic}
                onChange={() => handleToggleStatus(selectedRecord.id)}
              />
              <span>{selectedRecord.isPublic ? "Công khai" : "Riêng tư"}</span>
            </div>
            {/* Hiển thị file audio nếu có, nếu chưa có thì hiển thị spinner loading */}
            {selectedRecord.fileUrl ? (
              <audio
                controls
                style={{ width: "100%", marginTop: "1em" }}
                src={selectedRecord.fileUrl}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <div style={{ textAlign: "center", marginTop: "1em" }}>
                <Spin size="large" />
              </div>
            )}
          </div>
        ) : (
          <p>Không có thông tin.</p>
        )}
      </Modal>
    </>
  );
}
