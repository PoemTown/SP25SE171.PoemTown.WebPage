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
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Chip
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Delete } from "@mui/icons-material";
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

const ModeratorManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newAccount, setNewAccount] = useState({
        email: "",
        fullName: "",
        phoneNumber: "",
    });
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState(null);

    const itemsPerPage = 5;

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts?filterOptions.roleId=6dda6b38-5b7e-4d7d-433b-08dd629662fc`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            const sortedAccounts = response.data.data.sort(
                (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
            );
            setAccounts(sortedAccounts);
        } catch (err) {
            console.error("Không thể tải danh sách giao dịch.");
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
            console.error("Không thể tải chi tiết giao dịch.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts/moderator`,
                newAccount,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            fetchAccounts();
            setOpenCreateDialog(false);
            setNewAccount({ email: "", fullName: "", phoneNumber: "" });
            message.success("Tạo mới người quản lý thành công");
        } catch (err) {
            console.error("Không thể tạo mới người quản lý.");
            message.error("Tạo mới người quản lý thất bại");
        }
    };

    const handleDeleteAccount = async (accountId) => {
        setDeleting(true);
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/accounts/v1/accounts/moderator/${accountId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            message.success("Xóa người quản lý thành công");
            fetchAccounts();
        } catch (err) {
            console.error("Lỗi khi xóa người quản lý:", err);
            message.error("Xóa người quản lý thất bại");
        } finally {
            setDeleting(false);
            setConfirmDeleteOpen(false);
        }
    };

    const openDeleteDialog = (account) => {
        setAccountToDelete(account);
        setConfirmDeleteOpen(true);
    };

    const closeDeleteDialog = () => {
        setAccountToDelete(null);
        setConfirmDeleteOpen(false);
    };

    const confirmDeleteAccount = () => {
        if (accountToDelete) {
            handleDeleteAccount(accountToDelete.id);
        }
    };

    const totalPages = Math.ceil(accounts.length / itemsPerPage);
    const displayedAccounts = accounts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Danh sách quản trị viên
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenCreateDialog(true)}
                sx={{ mb: 2 }}
            >
                Thêm mới
            </Button>

            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableCell>#</TableCell>
                            <TableCell>Tên người dùng</TableCell>
                            <TableCell>Họ và tên</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Avatar</TableCell>
                            <TableCell>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displayedAccounts.map((account, index) => (
                            <TableRow
                                key={account.id}
                                hover
                            >
                                <TableCell>{currentPage * itemsPerPage + index + 1}</TableCell>
                                <TableCell 
                                    onClick={() => fetchAccountDetail(account.id)}
                                    sx={{ cursor: "pointer" }}
                                >
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
                                <TableCell>
                                    <Avatar 
                                        src={account.avatar || ""} 
                                        alt={account.fullName} 
                                        onClick={() => fetchAccountDetail(account.id)}
                                        sx={{ cursor: "pointer" }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteDialog(account);
                                        }}
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
                <IconButton onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
                    <ArrowBackIos />
                </IconButton>

                <Typography variant="h6" sx={{ mx: 2 }}>
                    {currentPage + 1} / {totalPages}
                </Typography>

                <IconButton onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                    <ArrowForwardIos />
                </IconButton>
            </Box>

            <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
                <DialogTitle>Thêm mới người quản lý</DialogTitle>
                <DialogContent>
                    <TextField margin="dense" label="Email" fullWidth value={newAccount.email} onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })} />
                    <TextField margin="dense" label="Họ và tên" fullWidth value={newAccount.fullName} onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })} />
                    <TextField margin="dense" label="Số điện thoại" fullWidth value={newAccount.phoneNumber} onChange={(e) => setNewAccount({ ...newAccount, phoneNumber: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
                    <Button onClick={handleCreateAccount} variant="contained" color="primary">Tạo mới</Button>
                </DialogActions>
            </Dialog>

            <AccountDetail open={openDialog} onClose={() => setOpenDialog(false)} account={selectedAccount} loading={loading} />

            {/* Dialog xác nhận xóa */}
            <Dialog open={confirmDeleteOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    Bạn có chắc chắn muốn xóa người quản lý <strong>{accountToDelete?.userName}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="inherit">Hủy</Button>
                    <Button 
                        onClick={confirmDeleteAccount} 
                        color="error" 
                        disabled={deleting}
                    >
                        {deleting ? "Đang xóa..." : "Xóa"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ModeratorManagement;