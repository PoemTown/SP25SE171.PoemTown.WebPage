import React, { useState, useEffect } from "react";
import CreatePoemForm from "./Form/CreatePoemForm";
import { Menu, Dropdown, Modal, Button, message } from "antd";
import { MoreOutlined, BookOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
const YourDraft = ({ isCreatingPoem, setIsCreatingPoem, displayName, avatar, statisticBorder, achievementBorder }) => {
    const [poems, setPoems] = useState([]);
    const [selectedPoemId, setSelectedPoemId] = useState(null);
    const [selectedPoemData, setSelectedPoemData] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const navigate = useNavigate();
    const [onHover, setOnHover] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const [reloadTrigger, setReloadTrigger] = useState(false);

    useEffect(() => {
        const fetchPoems = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_BASE_URL}/poems/v1/mine?filterOptions.status=0`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                const data = await response.json();
                console.log("ASdasd", data)
                if (data.statusCode === 200) {
                    const poemsWithId = data.data.map((poem) => ({
                        id: poem.id,
                        title: poem.title,
                        description: poem.description,
                        content: poem.content,
                        chapterNumber: poem.chapterNumber,
                        chapterName: poem.chapterName,
                        status: poem.status,
                        sourceCopyRightId: poem.sourceCopyRightId,
                        likeCount: poem.likeCount,
                        commentCount: poem.commentCount,
                        poemImage: poem.poemImage,
                        type: poem.type,
                        collection: poem.collection,
                        createdTime: poem.createdTime,
                        recordFiles: poem.recordFiles
                    }));
                    setPoems(poemsWithId);
                }
                console.log(data.data)
            } catch (error) {
                console.error("Error fetching poems:", error);
            }
        };

        fetchPoems();
    }, [reloadTrigger]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('vi-VN', options);
    };

    const handleEdit = (id) => {
        console.log("Edit poem:", id);
    };

    const showDeleteModal = (id) => {
        setSelectedPoemId(id);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteForever = async () => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/poems/v1/${selectedPoemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            )
            console.log("Xóa vĩnh viễn:", selectedPoemId);
            message.success("Xóa bản nháp thành công!");
            setIsDeleteModalVisible(false);
            setReloadTrigger((prev) => !prev);

        } catch (error) {
            message.error("Xóa bản nháp thất bại!");
        }
    };

    const handleMoveToTrash = async () => {
        console.log("Chuyển vào thùng rác:", selectedPoemId);
        setIsDeleteModalVisible(false);
    };

    const handleContinueEditing = (poem) => {
        setSelectedPoemData(poem);
        setIsCreatingPoem(true);
    };

    return (
        <div style={{ maxWidth: "1200px", width: "100%", }}>
            {!isCreatingPoem ? (
                <>
                    <div style={{ display: "flex", gap: "20px" }}>
                        <div style={{ flex: 2 }}>
                            {poems.map((item) => {
                                const lines = item.content?.split('\n') || [];
                                const displayedLines = lines.slice(0, 4);
                                const hasMoreLines = lines.length > 4;
                                const truncatedDescription = item.description?.length > 102
                                    ? `${item.description.substring(0, 102)}...`
                                    : item.description;
                                console.log(item);
                                return (
                                    <div style={styles.poemCard}>
                                        <div style={styles.poemImageContainer}>
                                            <img
                                                src={item.poemImage || "/anhminhhoa.png"}
                                                alt="anh minh hoa"
                                                style={styles.poemImage}
                                                onError={(e) => {
                                                    console.log("Image failed to load, switching to fallback");
                                                    e.target.onerror = null;
                                                    e.target.src = "/anhminhhoa.png";
                                                }}
                                            />
                                        </div>
                                        <div style={styles.avatarContainer}>
                                            <img
                                                src={avatar || "./default_avatar.png"}
                                                alt="avatar"
                                                style={styles.avatar}
                                                onError={(e) => { e.target.src = "./default_avatar.png"; }}
                                            />
                                        </div>
                                        <div style={styles.contentRight}>
                                            <div style={styles.cardHeader}>
                                                <div style={styles.headerLeft}>
                                                    <span style={styles.author} onClick={() => navigate(`/user/${item.user?.userName}`)}>{displayName || 'Anonymous'}</span>
                                                    <span style={styles.postDate}>– {formatDate(item.createdTime)}</span>
                                                </div>
                                                <div style={styles.headerRight}>
                                                    <Dropdown
                                                        overlay={
                                                            <Menu>
                                                                <Menu.Item key="copylink">
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }} onClick={() => showDeleteModal(item.id)}>
                                                                        <RiDeleteBinLine color="red" /> Xóa
                                                                    </div>
                                                                </Menu.Item>
                                                            </Menu>
                                                        }
                                                        trigger={["click"]}
                                                    >
                                                        <button style={styles.iconButton}>
                                                            <MoreOutlined />
                                                        </button>
                                                    </Dropdown>


                                                </div>
                                            </div>
                                            <h3 style={styles.poemTitle}>{item.title}</h3>
                                            <p style={styles.poemDescription}>Mô tả: {truncatedDescription}</p>
                                            <div style={styles.poemContent}>
                                                <div style={styles.poemTextContainer}>
                                                    <span style={styles.quote}>“</span>
                                                    {displayedLines.map((line, index) => (
                                                        <p key={index} style={styles.poemLine}>{line}</p>
                                                    ))}
                                                    <p style={styles.poemLine}>
                                                        {hasMoreLines && <span style={styles.ellipsis}>...</span>}
                                                        <span style={styles.quoteClose}>”</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={styles.footerContainer}>
                                                <button
                                                    style={{
                                                        ...styles.viewButton,
                                                        ...(styles.viewButtonHover)
                                                    }}
                                                    onMouseEnter={() => setOnHover(true)}
                                                    onMouseLeave={() => setOnHover(false)}
                                                    onClick={() => handleContinueEditing(item)}
                                                >
                                                    Tiếp tục sáng tác &gt;
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <CreatePoemForm setDrafting={true} onBack={() => setIsCreatingPoem(false)} initialData={selectedPoemData} />
            )}

            <Modal
                title="Xóa bài thơ"
                open={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
                        Hủy
                    </Button>,
                    // <Button key="trash" type="default" onClick={handleMoveToTrash}>
                    //     Chuyển vào thùng rác
                    // </Button>,
                    <Button key="delete" type="primary" danger onClick={handleDeleteForever}>
                        Xóa
                    </Button>
                ]}
            >
                <p>
                    <ExclamationCircleOutlined style={{ color: "red", marginRight: "10px" }} />
                    Bạn muốn xóa bản nháp này phải không?
                </p>
            </Modal>
        </div>
    );
};

const styles = {
    poemImageContainer: {
        width: "168x",
        height: "268px",
        border: "1px solid #000",
        marginLeft: "20px"
    },

    poemImage: {
        width: "168px",
        maxWidth: "168px",
        height: "100%",
        objectFit: "cover", // This will prevent stretching
        objectPosition: "center" // Center the image
    },

    avatarContainer: {
        flexGrow: "1",
    },

    avatar: {
        width: "52px",
        height: "52px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #eee",
        marginTop: "4px",
    },

    contentRight: {
        flexBasis: "100%",
        display: "flex",
        flexDirection: "column",
        marginRight: "20px"
    },

    poemCard: {
        display: "flex",
        gap: "10px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #ccc",
        boxShadow: "0px 3px 6px 0px #0000004D",
        alignItems: "stretch",
        width: "100%", // Ensure it takes available width
        marginBottom: "40px",
        padding: "20px 0"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.9rem",
        color: "#666",
    },

    author: {
        fontWeight: "600",
        color: "#2a7fbf",
        cursor: "pointer"
    },

    poemTitle: {
        color: "#222",
        margin: "0",
        fontSize: "1.4rem",
    },

    poemDescription: {
        color: "#444",
        fontSize: "0.95rem",
        marginTop: "1px",
        lineHeight: "1.4",
        marginBottom: "5px"
    },

    poemContent: {
        color: "#333",
        fontStyle: "italic",
        borderLeft: "3px solid #eee",
        paddingLeft: "15px",
        marginBottom: "auto",
        position: 'relative',
    },
    poemTextContainer: {
        display: '-webkit-box',
        WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        position: 'relative',
        paddingRight: '20px',
    },
    quote: {
        position: 'absolute',
        fontSize: '1.7rem',
        lineHeight: 1,
        color: '#666',
    },
    quoteClose: {

        fontSize: '1.7rem',
        lineHeight: 1,
        color: '#666',
    },
    poemLine: {
        whiteSpace: 'pre-wrap',
        margin: "0 0 0 0",
        lineHeight: "1.6",
        fontSize: "1rem",
        textIndent: '0.8rem',
    },
    ellipsis: {

        background: 'white',
        paddingLeft: '4px',
    },

    statItem: {
        display: "flex",
        alignItems: "center",
        fontSize: "1.4em"
    },

    viewButton: {
        background: "none",
        border: "1px solid #2a7fbf",
        color: "#2a7fbf",
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: "20px",
        transition: "all 0.2s",
        fontWeight: "500",
    },

    viewButtonHover: {
        background: "#2a7fbf",
        color: "white",
    },

    postDate: {
        color: "#888",
        fontSize: "0.85rem",
        textAlign: "right",
    },

    headerLeft: {
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        flexDirection: "row",
    },
    headerRight: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
    },

    iconButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        fontSize: "1.2rem",
        color: "#666",
        display: "flex",
        alignItems: "center",
    },

    footerContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "auto",
        marginRight: "20px"
    },

    statsContainer: {
        display: "flex",
        gap: "20px",
        alignItems: "center",
    },

    likeButton: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 8px",
        borderRadius: "4px",
        transition: "background 0.2s",

        "&:hover": {
            background: "#f0f0f0",
        }
    },

    commentStat: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },

    leftColumn: {
        display: "flex",
        flexDirection: "column",
        flex: "6",
    },
}

export default YourDraft;
