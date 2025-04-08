import { Button, message } from "antd";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the Quill styles
import "./ReactQuillNoMargin.css"; // Adjust the path as needed
import { FaEdit, FaUserCircle } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";

const YourBio = (props) => {
    const { userData, displayName, isMine } = props;

    // Manage edit mode
    const [isEditing, setIsEditing] = useState(false);
    // Local state for the bio content; initialize it with userData.bio
    const [bio, setBio] = useState(userData.bio || "");

    // Function to handle saving bio changes
    const handleSave = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            message.error("Bạn cần đăng nhập để sử dụng chức năng này!");
            return;
        }

        try {
            // Build the request body; we use current userData for fields that remain unchanged.
            const requestBody = {
                fullName: userData.fullName,
                gender: userData.gender,
                address: userData.address,
                dateOfBirth: userData.dateOfBirth,
                userName: userData.userName,
                phoneNumber: userData.phoneNumber,
                avatar: userData.avatar,
                displayName: displayName,
                bio: bio,
            };

            const response = await fetch(
                "https://api-poemtown-staging.nodfeather.win/api/users/v1/mine/profile",
                {
                    method: "PUT", // Use PUT or PATCH as required by your API
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await response.json();
            console.log("Update response:", data);
            if (!response.ok) {
                throw new Error("Failed to update the bio");
            }

            if (data.statusCode === 202) {
                message.success("Cập nhật thành công");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            message.error("Có lỗi xảy ra khi cập nhật profile!");
        }
    };

    return (
        <div>
            <h2 style={{ margin: "0 0 15px", display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                <span>Thông tin cơ bản</span>
                <FaUserCircle size={20} />
            </h2>
            <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>

                    <img src={userData.avatar} alt="avatar" style={{ width: "200px", height: "200px", border: "2px solid #000" }} />
                </div>
                <div style={{ marginLeft: "1em" }}>
                    <div style={{ display: "flex", flexDirection: "row", gap: "5px", alignItems: "center", margin: "0 0 10px" }}>
                        <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>{displayName}</p>
                        <p style={{ margin: 0, fontWeight: "normal", }}>
                            (@{userData.userName})
                        </p>
                    </div>
                    <p style={{ margin: "0 0 10px", }}><span style={{ color: "#333", fontWeight: "bold" }}>Ngày sinh: </span>{userData.dateOfBirth}</p>
                    <p style={{ margin: "0" }}><span style={{ color: "#333", fontWeight: "bold" }}>Giới tính: </span>{userData.gender.toLowerCase() === "male" ? "nam" : userData.gender.toLowerCase() === "female" ? "nữ" : userData.gender}</p>
                </div>

            </div>
            <hr style={{ border: "1px solid #ddd" }} />
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                <h2 style={{ margin: 0 }}>Tiểu sử</h2>
                <IoIosInformationCircleOutline size={20} />
            </div>
            {isEditing && isMine ? (
                <>
                    {/* Editable Bio using ReactQuill */}
                    <ReactQuill value={bio} onChange={setBio} />
                    <div style={{ marginTop: "1rem" }}>
                        <Button color="success" variant="solid" onClick={handleSave}>Save Bio</Button>
                        <Button
                            color="danger" variant="solid"
                            onClick={() => setIsEditing(false)}
                            style={{ marginLeft: "0.5rem" }}
                        >
                            Cancel
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    {/* View mode: render the bio as HTML with the custom CSS class */}
                    {userData.bio !== null ?
                        <div style={{ boxSizing: "border-box", padding: "0 3em 0 1em", display: "flex", width: "100%", flexDirection: "row", alignItems: "space-between", justifyContent: "space-between" }}>
                            <div style={{}}
                                className="bio-content"
                                dangerouslySetInnerHTML={{ __html: bio }}
                            ></div>
                            {isMine ? <FaEdit size={20} style={{ cursor: "pointer" }} onClick={() => setIsEditing(true)} /> : <></>}
                        </div>
                        :
                        <p style={{ textAlign: "center" }}>
                            Hiện chưa có tiểu sử
                        </p>
                    }
                </>
            )}
        </div>
    );
};

export default YourBio;
