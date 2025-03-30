import React, { useEffect, useState } from "react";
import { Button, Modal, message, Spin, Switch, Input, Dropdown, Menu, Pagination } from "antd";
import { FcFolder, FcVideoFile } from "react-icons/fc";
import { DownOutlined } from "@ant-design/icons"; // Icon mũi tên chỉ xuống
import CreateRecord from "./CreateRecord";
import RecordCard from "../../../components/componentHomepage/RecordCard";

export default function YourRecordFile({ statisticBorder, achievementBorder }) {
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [activeButton, setActiveButton] = useState("mine");
  const [recordFiles, setRecordFiles] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(false);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchRecords(activeButton, currentPage, pageSize);
  }, [isCreatingRecord, reloadTrigger, activeButton, currentPage, pageSize]);

  async function fetchRecords(type, pageNumber, pageSize) {
    const baseUrl = "https://api-poemtown-staging.nodfeather.win/api/record-files/v1";
    const url = `${baseUrl}/${type}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      // Nếu API chỉ trả về totalPages, tính tổng số record:
      if (data.totalPages) {
        setTotalRecords(data.totalPages * pageSize);
      }
      setRecordFiles(data.data);
      console.log(data.data);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  const handleClick = (type) => {
    setActiveButton(type);
    setCurrentPage(1); // Reset trang khi đổi loại
    fetchRecords(type, 1, pageSize).then((data) => {
      console.log(`Dữ liệu từ API ${type}:`, data);
    });
  };

// Hàm xử lý chuyển đổi trạng thái của bản ghi (ví dụ: chuyển từ công khai sang riêng tư)
  const handleToggleStatus = async (record) => {
    const recordId = record.id;
    if (record.isPublic) {
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
            message.error("Vui lòng nhập giá!" + price);
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
                body: JSON.stringify({ recordId , price }),
              }
            );
            if (!response.ok) {
              throw new Error("Lỗi khi cập nhật trạng thái bán");
            }
            await response.json();
            message.success("Trạng thái cập nhật thành công!");
            setSelectedRecord((prev) => ({ ...prev, isPublic: false }));
            setReloadTrigger((prev) => !prev);
          } catch (err) {
            console.error("Lỗi khi cập nhật trạng thái:", err);
            message.error("Cập nhật trạng thái thất bại!");
          }
        },
      });
    } else {
      message.info("Không cho chuyển từ riêng tư sang công khai");
    }
  };

  // Menu cho Dropdown.Button
  const menu = (
    <Menu>
      <Menu.Item key="mine" onClick={() => handleClick("mine")}>
        Của tôi
      </Menu.Item>
      <Menu.Item key="bought" onClick={() => handleClick("bought")}>
        Đã mua
      </Menu.Item>
      <Menu.Item key="sold" onClick={() => handleClick("sold")}>
        Đã bán
      </Menu.Item>
    </Menu>
  );

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchRecords(activeButton, page, size);
  };

  return (
    <>
      <div style={{ maxWidth: "1200px", minHeight: "650px", margin: "0 auto" }}>
        {!isCreatingRecord ? (
          <>
            {/* Nút tạo bản ghi mới */}
            <div style={{ position: "relative", marginBottom: "10px" }}>
              <button
                onClick={() => setIsCreatingRecord(true)}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "12px 20px",
                  borderRadius: "5px",
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
            <div style={{}}>
              <div style={{
                display: "flex",
                width: "100%",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: "20px",
                minHeight: "50px",
                
              }}>
                <Dropdown.Button
                  overlay={menu}
                  trigger={["click"]}
                  icon={<DownOutlined />}
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  {activeButton === "mine"
                    ? "Của tôi"
                    : activeButton === "bought"
                      ? "Đã mua"
                      : "Đã bán"}
                </Dropdown.Button>
              </div>

              {/* Danh sách folder */}
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                  <Spin size="large" tip="Đang tải dữ liệu..." />
                </div>
              ) : (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "40px",
                  minHeight: "200px",
                }}>
                  {recordFiles.map((record) => (
                    
                    <RecordCard
                      key={record.id}
                      record={record}
                      handleToggleStatus={handleToggleStatus} />
                  ))}
                </div>
              )}
            </div>

            {/* Phân trang */}
            <div style={{ textAlign: "center", marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalRecords} // Tổng số record được tính từ totalPages * pageSize
                onChange={handlePageChange}
                showSizeChanger
                pageSizeOptions={["8", "16", "24"]}
              />
            </div>
          </>
        ) : (
          <CreateRecord onBack={() => setIsCreatingRecord(false)} />
        )}
      </div>

     
    </>
  );
}
