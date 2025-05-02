import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, message, Spin, Switch, Input, Dropdown, Menu, Pagination } from "antd";
import { FcFolder, FcVideoFile } from "react-icons/fc";
import { DownOutlined, PlusOutlined } from "@ant-design/icons"; // Icon mũi tên chỉ xuống
import CreateRecord from "./CreateRecord";
import RecordCard from "../../../components/componentHomepage/RecordCard";
import axios from "axios";
import RecordListGroupedByPoem from "../../../components/componentHomepage/RecordListGroupedByPoem";

export default function YourRecordFile({ statisticBorder, achievementBorder, isMine, username }) {
  const [isCreatingRecord, setIsCreatingRecord] = useState(false);
  const [activeButton, setActiveButton] = useState("mine");
  const [recordFiles, setRecordFiles] = useState([]);
  const accessToken = localStorage.getItem("accessToken");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState("");
  const priceRef = useRef(null);
  const [reloadTrigger, setReloadTrigger] = useState(false);

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (isMine) {
      fetchRecords(activeButton, currentPage, pageSize);
    } else {
      fetchUserRecords(currentPage, pageSize)
      console.log(isMine);
    }
  }, [isCreatingRecord, reloadTrigger, activeButton, currentPage, pageSize]);

  async function fetchRecords(type, pageNumber, pageSize) {
    const baseUrl = `${process.env.REACT_APP_API_BASE_URL}/record-files/v1`;
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

    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }
  async function fetchUserRecords(pageNumber, pageSize) {
    console.log(username)
    const url = `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/user/${username}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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
    });
  };

  // Hàm xử lý chuyển đổi trạng thái của bản ghi (ví dụ: chuyển từ công khai sang riêng tư)



  async function handlePurchaseRecord(recordId) {
    console.log(recordId);
    const url = `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/purchase`;

    try {
      const response = await axios.put(url, null, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          recordId: recordId, // Truyền recordId vào query params
        },
      });

      message.success("Thanh toán thành công");
      setReloadTrigger((prev) => !prev);

    } catch (error) {
      message.error(error.response?.data?.errorMessage || "Đã xảy ra lỗi!");
    }
  }







  // Menu cho Dropdown.Button
  const menu = (
    <Menu>
      <Menu.Item key="mine" onClick={() => handleClick("mine")}>
        Của tôi
      </Menu.Item>
      <Menu.Item key="bought" onClick={() => handleClick("bought")}>
        Đã mua
      </Menu.Item>
      {/* <Menu.Item key="sold" onClick={() => handleClick("sold")}>
        Đã bán
      </Menu.Item> */}
    </Menu>
  );



  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchRecords(activeButton, page, size);
  };
  const showPurchaseConfirm = (id, price) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn mua với số tiền " + price.toLocaleString('vi-VN') + " VND ?",
      content: "Hành động này không thể hoàn tác!",
      okText: "Mua",
      cancelText: "Hủy",
      okType: "primary",
      onOk() {
        handlePurchaseRecord(id);
      },
    });
  };
  const showDeleteConfirm = (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa?",
      content: "Hành động này không thể hoàn tác!",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk() {
        handleDelete(id);
      },
    });
  };
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/record-files/v1/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        }
      );

      setReloadTrigger((prev) => !prev);
      message.success("Xóa thành công!");
    } catch (error) {
      console.error("Error:", error);
      message.error(error.response.data?.errorMessage);
    }
  };

  return (
    <>
      <div style={{ maxWidth: "1200px", minHeight: "650px", margin: "0 auto" }}>
        {!isCreatingRecord ? (
          <>
            {/* Nút tạo bản ghi mới */}
            {isMine && (
              <div style={{ position: "relative", marginBottom: "10px" }}>
                <button
                  onClick={() => setIsCreatingRecord(true)}
                  style={{
                    backgroundColor: "#b0a499",
                    color: "#ecf0f1",
                    padding: "12px 24px",
                    borderRadius: "30px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    marginBottom: "25px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.9em",
                    '@media (max-width: 768px)': {
                      padding: "10px 20px",
                      fontSize: "0.8em",
                      marginBottom: "20px"
                    },
                    ':hover': {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                      backgroundColor: "#34495e"
                    }
                  }}
                >
                  <PlusOutlined />
                  BẢN GHI MỚI
                </button>
              </div>
            )}

            {/* Bố cục chính */}

            <div style={{}}>
              {isMine && (
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginBottom: "20px",
                      minHeight: "50px",
                    }}
                  >
                    <Dropdown.Button
                      overlay={menu}
                      trigger={["click"]}
                      icon={<DownOutlined />}
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      {activeButton === "mine"
                        ? "Của tôi"
                        : activeButton === "bought"
                          ? "Đã mua"
                          : "Đã bán"}
                    </Dropdown.Button>
                  </div>
                </div>
              )}

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
                  {recordFiles.length > 0 ? (
                    <RecordListGroupedByPoem
                      records={recordFiles}
                      showDeleteConfirm={showDeleteConfirm}
                      isMine={isMine}
                      showPurchaseConfirm={showPurchaseConfirm}
                    />
                  ) : (
                    <div style={{
                      width: "100%",
                      textAlign: "center",
                      padding: "40px 20px",
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px dashed #d7ccc8",
                      color: "#5d4037"
                    }}>
                      <FcVideoFile size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
                        {isMine ? "Bạn chưa có bản ghi nào" : "Người dùng chưa có bản ghi nào"}
                      </h3>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        {isMine ? "Hãy khắc dấu âm thanh đầu tiên vào không gian tĩnh lặng." : "Hãy quay lại sau khi người dùng tạo bản ghi"}
                      </p>
                    </div>
                  )}
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
                pageSizeOptions={["9", "18", "27"]}
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
