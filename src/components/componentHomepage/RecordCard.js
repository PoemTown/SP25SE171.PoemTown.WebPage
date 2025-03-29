import { Modal, Spin, Switch, Table } from "antd";
import React, { useState } from "react";
import { FcVideoFile } from "react-icons/fc";

const RecordCard = ({ record, handleToggleStatus }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);



    const showModal = (record) => {
        setSelectedRecord(record);
        console.log("test: " + record);
        setIsModalOpen(true);
    };

    return (
        <>
            <div
                key={record.key}
                style={{
                    position: "relative",
                    textAlign: "center",
                    display: "inline-block",
                    cursor: "pointer",
                    width: "180px",
                    height: "180px",
                }}
                onClick={() => showModal(record)}
            >
                <FcVideoFile
                    size={130}
                    style={{
                        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.2))",
                        position: "relative",
                    }}
                    title={
                        record.poem
                            ? record.poem.title
                            : "Không có tiêu đề"
                    }
                />

                <div style={{
                    position: "absolute",
                    top: "9%",
                    left: "30%",
                    width: "8px",
                    height: "8px",
                    backgroundColor: record.isPublic ? "#00C853" : "#9E9E9E",
                    borderRadius: "50%",
                    zIndex: 1,
                }}></div>
                <div style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#333",
                    position: "absolute",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    top: "75%",
                    textOverflow: "ellipsis",
                    width: "100%",
                }} title={record.fileName}>
                    {record.fileName}
                </div>
            </div>



            <Modal
                title={selectedRecord ? selectedRecord.fileName : "Chi tiết bản ghi"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                bodyStyle={{ padding: "20px" }}
            >
                {selectedRecord ? (
                    <div>
                        <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
                            <strong>Tiêu đề bài thơ:</strong>{" "}
                            {selectedRecord.poem
                                ? selectedRecord.poem.title
                                : "Không có tiêu đề"}
                        </h3>

                        <h4 style={{ textAlign: "center", marginBottom: "20px" }}>
                            Owner:{" "}
                            {selectedRecord.owner
                                ? selectedRecord.owner.displayName
                                : selectedRecord.poem.user.displayName}
                        </h4>

                        {selectedRecord.buyers && Array.isArray(selectedRecord.buyers) && (
                            <div style={{ marginBottom: "20px" }}>
                                <Table
                                    dataSource={selectedRecord.buyers}
                                    columns={[
                                        {
                                            title: "Buyer Name",
                                            dataIndex: "displayName",
                                            key: "displayName",
                                        },
                                        // Thêm cột khác nếu cần
                                    ]}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
                            <strong>Trạng thái:</strong>
                            <Switch
                                checked={selectedRecord.isPublic}
                                onChange={() => handleToggleStatus(selectedRecord)}
                            />
                            <span>{selectedRecord.isPublic ? "Công khai" : "Riêng tư"}</span>
                        </div>

                        {selectedRecord.fileUrl ? (
                            <div style={{ marginTop: "20px" }}>
                                <audio
                                    controls
                                    style={{ width: "100%" }}
                                    src={selectedRecord.fileUrl}
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <Spin size="large" />
                            </div>
                        )}
                    </div>
                ) : (
                    <p style={{ textAlign: "center" }}>Không có thông tin.</p>
                )}
            </Modal>

        </>
    );
};

export default RecordCard;
