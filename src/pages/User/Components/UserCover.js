import { Avatar, Button, List, message, Modal } from "antd";
import React, { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaUserPlus, FaCheck } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { RiMessengerLine } from "react-icons/ri";
import CreateNewChat from "../Chat/CreateNewChat";
import { useNavigate } from "react-router-dom";

const UserCover = ({ isMine, coverImage, coverColorCode, userData, onFollowSuccess }) => {
    const [showChat, setShowChat] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [isFollowersVisible, setIsFollowersVisible] = useState(false);
    const [isFollowingsVisible, setIsFollowingsVisible] = useState(false);

    // Donate modal
    const [isDonateVisible, setIsDonateVisible] = useState(false);
    const [donateAmount, setDonateAmount] = useState("");

    const accessToken = localStorage.getItem("accessToken");
    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };

    const navigate = useNavigate();

    const openFollowersModal = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/followers/user/${userData.userName}`,
                { headers: requestHeaders }
            );
            const data = await response.json();
            setFollowers(data.data);
        } catch (error) {
            console.error("Error fetching followers", error);
        } finally {
            setIsFollowersVisible(true);
        }
    };

    const openFollowingsModal = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/followers/user/${userData.userName}/follow-list`,
                { headers: requestHeaders }
            );
            const data = await response.json();
            setFollowings(data.data);
        } catch (error) {
            console.error("Error fetching followings", error);
        } finally {
            setIsFollowingsVisible(true);
        }
    };

    const closeFollowersModal = () => setIsFollowersVisible(false);
    const closeFollowingsModal = () => setIsFollowingsVisible(false);

    const handleFollow = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Bạn cần đăng nhập để theo dõi người dùng!");
            return;
        }

        try {
            const method = userData.isFollowed ? "DELETE" : "POST";
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/followers/${userData.userId}`,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                onFollowSuccess();
                message.success(userData.isFollowed
                    ? "Đã hủy theo dõi!"
                    : "Theo dõi thành công!"
                );
            } else {
                message.error("Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Error following/unfollowing:", error);
            message.error("Đã xảy ra lỗi!");
        }
    };

    const handleChat = () => {
        setShowChat(prev => !prev);
    };

    const handleDonateSubmit = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            message.error("Bạn cần đăng nhập để donate.");
            return;
        }
    
        const amountNumber = Number(donateAmount);
        if (!donateAmount || isNaN(amountNumber) || amountNumber <= 0) {
            message.error("Vui lòng nhập số tiền hợp lệ.");
            return;
        }
    
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/user-ewallets/v1/donate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount: amountNumber,
                        receiveUserId: userData.userId
                    })
                }
            );
    
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || "Donate thất bại.");
            }
    
            message.success(`Đã ủng hộ ${amountNumber.toLocaleString()} VNĐ thành công!`);
            setIsDonateVisible(false);
            setDonateAmount("");
    
        } catch (error) {
            console.error("Donate error:", error);
            message.error(error.message || "Đã xảy ra lỗi khi donate.");
        }
    };
    

    return (
        <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
            {coverImage && (
                <img
                    src={coverImage}
                    alt="Cover"
                    style={{
                        width: "100%",
                        display: "block"
                    }}
                />
            )}

            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                padding: "1em 6em",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center"
            }}>
                <img
                    src={userData.avatar || "./default-avatar.png"}
                    alt="Avatar"
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        border: "2px solid white"
                    }}
                />
                <div style={{ marginLeft: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div style={{ display: "flex", flexDirection: "row", gap: "40px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                            <h2 style={{ fontSize: "20px", fontWeight: "bold", margin: "0", color: coverColorCode }}>{userData.displayName}</h2>
                            <p style={{ color: coverColorCode, margin: "0", fontSize: "0.9em" }}>@{userData.userName || "Annoymous"}</p>
                        </div>
                        {!isMine && (
                            <div style={{ display: "flex", gap: "10px" }}>
                                <Button onClick={handleChat} type="primary" icon={<RiMessengerLine />}>Nhắn tin</Button>

                                {userData.isFollowed ? (
                                    <Button onClick={handleFollow} type="primary" icon={<FaCheck />}>Đã theo dõi</Button>
                                ) : (
                                    <Button onClick={handleFollow} type="default" icon={<CiCirclePlus />}>Theo dõi</Button>
                                )}

                                <Button
                                    type="default"
                                    onClick={() => setIsDonateVisible(true)}
                                    style={{
                                        backgroundColor: "#d4edda",
                                        color: "#155724",
                                        border: "1px solid #c3e6cb"
                                    }}
                                >
                                    Donate
                                </Button>
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: "14px", color: coverColorCode, display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }} onClick={openFollowersModal}>
                            <HiUsers color={coverColorCode} /> <span>{userData.totalFollowers} Người theo dõi</span>
                        </div>
                        <div style={{ color: coverColorCode }}>•</div>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }} onClick={openFollowingsModal}>
                            <FaUserPlus color={coverColorCode} /> <span>{userData.totalFollowings} Đang theo dõi</span>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title="Danh sách người theo dõi"
                visible={isFollowersVisible}
                onCancel={closeFollowersModal}
                footer={null}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={followers}
                    renderItem={(follower) => (
                        <List.Item onClick={() => {
                            setIsFollowersVisible(false);
                            navigate(`/user/${follower.user.userName}`);
                            window.location.reload();
                        }}>
                            <List.Item.Meta
                                avatar={<Avatar src={follower.user.avatar || "./default_avatar.png"} />}
                                title={follower.user.displayName}
                                description={`@${follower.user.userName}`}
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            <Modal
                title="Danh sách đang theo dõi"
                visible={isFollowingsVisible}
                onCancel={closeFollowingsModal}
                footer={null}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={followings}
                    renderItem={(following) => (
                        <List.Item onClick={() => {
                            setIsFollowingsVisible(false);
                            navigate(`/user/${following.user.userName}`);
                            window.location.reload();
                        }}>
                            <List.Item.Meta
                                avatar={<Avatar src={following.user.avatar || "./default_avatar.png"} />}
                                title={following.user.displayName}
                                description={`@${following.user.userName}`}
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            {/* Donate Modal */}
            <Modal
                title="Ủng hộ người dùng"
                visible={isDonateVisible}
                onCancel={() => setIsDonateVisible(false)}
                onOk={handleDonateSubmit}
                okText="Gửi ủng hộ"
                cancelText="Hủy"
            >
                <p>Nhập số tiền bạn muốn ủng hộ:</p>
                <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                    placeholder="VD: 10000"
                    style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
            </Modal>

            {/* Chat Component */}
            {showChat && (
                <div style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "0",
                    width: "300px",
                    zIndex: 1000
                }}>
                    <CreateNewChat userData={userData} onClose={() => setShowChat(false)} />
                </div>
            )}
        </div>
    );
};

export default UserCover;
