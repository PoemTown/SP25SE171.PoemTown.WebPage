import { Avatar, Button, List, message, Modal } from "antd";
import React, { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaUserPlus, FaCheck } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { RiMessengerLine } from "react-icons/ri";
import CreateNewChat from "../Chat/CreateNewChat"; // Assuming this is your custom chat component
import { useNavigate } from "react-router-dom";

const UserCover = ({ isMine, coverImage, coverColorCode, userData, onFollowSuccess }) => {
    const [showChat, setShowChat] = useState(false);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [isFollowersVisible, setIsFollowersVisible] = useState(false);
    const [isFollowingsVisible, setIsFollowingsVisible] = useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const requestHeaders = {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    };
    const navigate = useNavigate();

    const openFollowersModal = async () => {
        try {
            // Replace the endpoint below with the actual endpoint for fetching followers
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/followers/user/${userData.userName}`,
                {
                    headers: requestHeaders
                }
            );
            const data = await response.json();
            setFollowers(data.data);
        } catch (error) {
            console.error("Error fetching followers", error);
        } finally {
            setIsFollowersVisible(true);
        }
    };

    // Function to call API and open followings modal
    const openFollowingsModal = async () => {
        try {
            // Replace the endpoint below with the actual endpoint for fetching followings
            const response = await fetch(
                `https://api-poemtown-staging.nodfeather.win/api/followers/user/${userData.userName}/follow-list`, {
                headers: requestHeaders
            }
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
                `https://api-poemtown-staging.nodfeather.win/api/followers/${userData.userId}`,
                {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                // Trigger parent component refresh
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
        setShowChat(prevState => !prevState); // Toggle showChat
    };

    return (
        <div style={{ width: "100%", position: "relative", boxSizing: "border-box" }}>
            {coverImage && (
                <img
                    src={coverImage}
                    alt="Cover"
                    style={{
                        width: "100%",
                        display: "block" // removes extra bottom spacing
                    }}
                />
            )}
            {/* Overlay content */}
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
                        {isMine ? <></> :
                            <>
                                <div>
                                    <Button
                                        onClick={handleChat}
                                        variant="solid"
                                        color="primary"
                                        icon={<RiMessengerLine />}
                                        iconPosition="end"
                                    >
                                        Nhắn tin
                                    </Button>
                                </div>
                                <div>
                                    {userData.isFollowed ?
                                        <Button onClick={handleFollow} variant="solid" color="primary" icon={<FaCheck />} iconPosition="end">Đã Theo dõi </Button>
                                        :
                                        <Button onClick={handleFollow} variant="outlined" color="primary" icon={<CiCirclePlus />} iconPosition='end'>Theo dõi</Button>
                                    }
                                </div>
                            </>}
                    </div>
                    <div style={{ fontSize: "14px", color: coverColorCode, display: "flex", flexDirection: "row", gap: "16px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }} onClick={openFollowersModal}>
                            <HiUsers color={coverColorCode} /> <span style={{ color: coverColorCode }}>{userData.totalFollowers} Người theo dõi</span>
                        </div>
                        <div style={{ color: coverColorCode }}>•</div>
                        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px", cursor: "pointer" }} onClick={openFollowingsModal}>
                            <FaUserPlus color={coverColorCode} /> <span style={{ color: coverColorCode }}>{userData.totalFollowings} Đang theo dõi</span>
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
                                avatar={
                                    <Avatar src={follower.user.avatar || "./default_avatar.png"} />
                                }
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
                                avatar={
                                    <Avatar src={following.user.avatar || "./default_avatar.png"} />
                                }
                                title={following.user.displayName}
                                description={`@${following.user.userName}`}
                            />
                        </List.Item>
                    )}
                />
            </Modal>
            {/* Chat window - Rendered outside the main div with fixed position */}
            {showChat && (
                <div style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "0",
                    width: "300px", // Adjust the width as needed
                    zIndex: 1000 // Ensure it stays on top of other elements
                }}>
                    <CreateNewChat userData={userData} onClose={() => setShowChat(false)} />
                </div>
            )}
        </div>
    );
};

export default UserCover;
