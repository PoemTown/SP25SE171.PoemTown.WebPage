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
    Chip
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import axios from "axios";
import AccountDetail from "../Form/AccountDetail";
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
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get(
                "https://api-poemtown-staging.nodfeather.win/api/accounts/v1/accounts?filterOptions.roleId=89fca251-f021-425b-de62-08dcdfcdb851",
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
                `https://api-poemtown-staging.nodfeather.win/api/accounts/v1/accounts/detail/${id}`,
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

    const chunkAccounts = (accounts, size) => {
        const chunked = [];
        for (let i = 0; i < accounts.length; i += size) {
            chunked.push(accounts.slice(i, i + size));
        }
        return chunked;
    };

    const accountGroups = chunkAccounts(accounts, 7);
    const totalPages = accountGroups.length;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Danh sách người dùng
            </Typography>

            {accountGroups.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Trang {currentPage + 1} / {totalPages}
                    </Typography>
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {accounts.map((account, index) => (
                                <TableRow
                                    key={account.id}
                                    hover
                                    onClick={() => fetchAccountDetail(account.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{account.userName || "Không có tên đăng nhập"}</TableCell>
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
                                        <Avatar src={account.avatar || ""} alt={account.fullName || "Avatar"} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </TableContainer>
            )}

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

            {/* Popup hiển thị chi tiết giao dịch */}
            <AccountDetail open={openDialog} onClose={() => setOpenDialog(false)} account={selectedAccount} loading={loading} status={selectedAccount?.status} />
        </Box>
    );
};

export default AccountManagement;
