import React, { useState, useEffect } from "react";
import { Modal, Input, Button, List } from "antd";

const CommentModal = ({ visible, onClose, poemId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (poemId) {
      fetchComments();
    }
  }, [poemId]);

  const fetchComments = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `https://api-poemtown-staging.nodfeather.win/api/comments/v1/${poemId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        setComments(data.data.map(comment => ({ ...comment, key: comment.id }))); 
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
  
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `https://api-poemtown-staging.nodfeather.win/api/comments/v1`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ poemId, content: newComment }), 
        }
      );
      const data = await response.json();
      if (data.statusCode === 201) {
        setComments([...comments, { ...data.data, key: data.data.id }]); 
        setNewComment("");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };
  

  return (
    <Modal title="Bình luận" open={visible} onCancel={onClose} footer={null}>
      <List
        dataSource={comments}
        renderItem={(item) => (
          <List.Item>
            <strong>{item.userName}</strong>: {item.content}
          </List.Item>
        )}
        style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "10px" }}
      />
      <Input.TextArea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Nhập bình luận của bạn..."
        rows={3}
      />
      <Button type="primary" onClick={handleAddComment} style={{ marginTop: "10px", width: "100%" }}>
        Bình luận
      </Button>
    </Modal>
  );
};

export default CommentModal;
