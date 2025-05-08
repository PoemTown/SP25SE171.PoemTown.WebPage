import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    IconButton,
    Chip,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Delete, Edit } from "@mui/icons-material";
import axios from "axios";
import AccountDetail from "../Form/AccountDetail";
import { message } from "antd";

const getAccountType = (type) => {
    switch (type) {
        case 1: return "Đã kích hoạt";
        case 2: return "Chưa kích hoạt";
        case 3: return "Đã bị khóa";
        default: return "Không xác định";
    }
};

const getTypeColor = (status) => {
    switch (status) {
        case 2: return "warning";
        case 1: return "success";
        case 3: return "error";
        default: return "default";
    }
};

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 7,
        totalPages: 1,
        totalRecords: 0
    });
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Confirm delete dialog states
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);

    useEffect(() => {
        fetchAccounts();
    }, [pagination.pageNumber, pagination.pageSize]);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts`,
                {
                    params: {
                        'filterOptions.roleId': '89fca251-f021-425b-de62-08dcdfcdb851',
                        pageNumber: pagination.pageNumber,
                        pageSize: pagination.pageSize
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            setAccounts(response.data.data);
            setPagination({
                pageNumber: response.data.pageNumber,
                pageSize: response.data.pageSize,
                totalPages: response.data.totalPages,
                totalRecords: response.data.totalRecords
            });
        } catch (err) {
            console.error("Không thể tải danh sách tài khoản:", err);
        }
    };

    const fetchAccountDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts/detail/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedAccount(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết tài khoản:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async (accountId) => {
        setDeleting(true);
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts/${accountId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            message.success("Xóa tài khoản thành công");
            fetchAccounts();
        } catch (err) {
            console.error("Lỗi khi xóa tài khoản:", err);
            message.error("Xóa tài khoản thất bại");
        } finally {
            setDeleting(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            pageNumber: newPage
        }));
    };

    const handlePageSizeChange = (event) => {
        setPagination(prev => ({
            ...prev,
            pageSize: event.target.value,
            pageNumber: 1
        }));
    };

    // Open confirm dialog
    const openDeleteDialog = (account) => {
        setAccountToDelete(account);
        setConfirmDeleteOpen(true);
    };

    // Close confirm dialog
    const closeDeleteDialog = () => {
        setAccountToDelete(null);
        setConfirmDeleteOpen(false);
    };

    // Confirm deletion
    const confirmDeleteAccount = () => {
        if (accountToDelete) {
            handleDeleteAccount(accountToDelete.id);
            closeDeleteDialog();
        }
    };

    // Open edit dialog
    const handleEditClick = (account) => {
        fetchAccountDetail(account.id);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Tổng số: {pagination.totalRecords} người dùng
                </Typography>

                <FormControl sx={{ minWidth: 120 }} size="small">
                    <InputLabel>Hiển thị</InputLabel>
                    <Select
                        value={pagination.pageSize}
                        onChange={handlePageSizeChange}
                        label="Hiển thị"
                    >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={7}>7</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell><strong>#</strong></TableCell>
                            <TableCell><strong>Tên người dùng</strong></TableCell>
                            <TableCell><strong>Họ và tên</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell><strong>Vai trò</strong></TableCell>
                            <TableCell><strong>Thời gian tạo</strong></TableCell>
                            <TableCell><strong>Avatar</strong></TableCell>
                            <TableCell><strong>Thao tác</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accounts.map((account, index) => (
                            <TableRow key={account.id} hover>
                                <TableCell>{(pagination.pageNumber - 1) * pagination.pageSize + index + 1}</TableCell>
                                <TableCell>
                                    {account.userName || "Không có tên đăng nhập"}
                                </TableCell>
                                <TableCell>{account.fullName || "Không có họ và tên"}</TableCell>
                                <TableCell>{account.email || "Không có email"}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getAccountType(account.status)}
                                        color={getTypeColor(account.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{account.roles.map(role => role.name).join(", ")}</TableCell>
                                <TableCell>{account.createdTime ? new Date(account.createdTime).toLocaleString() : "Không xác định"}</TableCell>
                                <TableCell>
                                    <Avatar
                                        src={account.avatar || ""}
                                        alt={account.fullName || "Avatar"}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEditClick(account)}
                                        disabled={loading}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => openDeleteDialog(account)}
                                        disabled={deleting}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                <IconButton
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber === 1}
                >
                    <ArrowBackIos />
                </IconButton>

                <Typography variant="h6" sx={{ mx: 2 }}>
                    Trang {pagination.pageNumber} / {pagination.totalPages}
                </Typography>

                <IconButton
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={pagination.pageNumber === pagination.totalPages}
                >
                    <ArrowForwardIos />
                </IconButton>
            </Box>

            <AccountDetail
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                account={selectedAccount}
                loading={loading}
                status={selectedAccount?.status}
            />

            {/* Xác nhận xóa tài khoản */}
            <Dialog open={confirmDeleteOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xóa tài khoản <strong>{accountToDelete?.userName}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="inherit">Hủy</Button>
                    <Button onClick={confirmDeleteAccount} color="error" disabled={deleting}>Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AccountManagement;