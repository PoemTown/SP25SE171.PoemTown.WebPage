import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Avatar,
    Box,
    Typography,
    Card,
    CardContent,
    Select,
    MenuItem
} from "@mui/material";
import axios from "axios";

const AccountDetail = ({ open, onClose, account, status: initialStatus, loading }) => {
    const [status, setStatus] = useState(initialStatus);
    const [saving, setSaving] = useState(false);
    const accessToken = localStorage.getItem("accessToken");

    useEffect(() => {
        if (account) {
            setStatus(account.status); 
        }
    }, [account]);

    const handleSave = async () => {
        if (!account?.id) return;
        setSaving(true);
        
        try {
            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts/status/${account.id}?status=${status}`,
                {},
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            onClose();
            window.location.reload();
        } catch (error) {
            console.error("Lỗi khi lưu thay đổi:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Chi tiết tài khoản</DialogTitle>
            <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : account ? (
                    <Box>
                        <Card sx={{ mb: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 1, color: "#795548" }}>Thông tin người dùng</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Avatar
                                        src={account.avatar || ""}
                                        alt={account.fullName || "Avatar"}
                                        sx={{ width: 60, height: 60, border: "2px solid #795548" }}
                                    />
                                    <Box>
                                        <Typography variant="body1"><strong>Tên:</strong> {account.fullName || "Không có tên"}</Typography>
                                        <Typography variant="body1"><strong>Email:</strong> {account.email || "Không có email"}</Typography>
                                        <Typography variant="body1"><strong>Số điện thoại:</strong> {account.phone || "Không có số điện thoại"}</Typography>
                                        <Typography variant="body1"><strong>Giới tính:</strong> {account.gender === "male" ? "Nam" : "Nữ"}</Typography>
                                        <Typography variant="body1"><strong>Địa chỉ:</strong> {account.address || "Không có địa chỉ"}</Typography>
                                        <Typography variant="body1"><strong>Ngày sinh:</strong> {account.dateOfBirth ? new Date(account.dateOfBirth).toLocaleDateString() : "Không xác định"}</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                            <CardContent>
                                <Typography variant="body1"><strong>ID:</strong> {account.id || "Không xác định"}</Typography>
                                <Typography variant="body1"><strong>Tên hiển thị:</strong> {account.displayName || "Không xác định"}</Typography>
                                <Typography variant="body1"><strong>Tên người dùng:</strong> {account.userName || "Không xác định"}</Typography>
                                <Typography variant="body1"><strong>Vai trò:</strong> {account.roles?.map(role => role.name).join(", ") || "Không có vai trò"}</Typography>
                                <Typography variant="body1" sx={{ mt: 2 }}><strong>Trạng thái:</strong></Typography>
                                <Select
                                    fullWidth
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <MenuItem value={1}>Đã kích hoạt</MenuItem>
                                    <MenuItem value={3}>Đã bị khóa</MenuItem>
                                </Select>
                                <Typography variant="body1"><strong>Thời gian tạo:</strong> {account.createdTime ? new Date(account.createdTime).toLocaleString() : "Không xác định"}</Typography>
                                <Typography variant="body1"><strong>Cập nhật lần cuối:</strong> {account.lastUpdatedTime ? new Date(account.lastUpdatedTime).toLocaleString() : "Không xác định"}</Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ) : (
                    <Typography>Không có dữ liệu</Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleSave} color="primary" variant="contained" disabled={saving}>
                    {saving ? <CircularProgress size={24} /> : "Lưu"}
                </Button>
                <Button onClick={onClose} color="primary">Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AccountDetail;

