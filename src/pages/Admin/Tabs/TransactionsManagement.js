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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Card, 
    CardContent,
    TextField,
    MenuItem
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import axios from "axios";

const getTransactionType = (type) => {
    switch (type) {
        case 1: return "Nạp tiền vào ví";
        case 2: return "Mua mẫu chính";
        case 3: return "Mua bản ghi âm";
        case 4: return "Mua bài thơ";
        case 5: return "Rút tiền";
        case 6: return "Quyên góp";
        default: return "Không xác định";
    }
};

const pageSizeOptions = [
    { value: 10, label: '10 bản ghi' },
    { value: 25, label: '25 bản ghi' },
    { value: 50, label: '50 bản ghi' },
    { value: 100, label: '100 bản ghi' },
    { value: 250, label: '250 bản ghi' }
];

const TransactionsManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [totalTransactions, setTotalTransactions] = useState(0);

    useEffect(() => {
        fetchTransactions();
    }, [pageSize]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/transactions/v1/admin?pageSize=${pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            const sortedTransactions = response.data.data.sort(
                (a, b) => new Date(b.createdTime) - new Date(a.createdTime)
            );
            setTransactions(sortedTransactions);
            setTotalTransactions(sortedTransactions.length);
        } catch (err) {
            console.error("Không thể tải danh sách giao dịch.");
        }
    };

    const fetchTransactionDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/transactions/v1/admin/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedTransaction(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết giao dịch.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi pageSize
    };

    const chunkTransactions = (transactions, size) => {
        const chunked = [];
        for (let i = 0; i < transactions.length; i += size) {
            chunked.push(transactions.slice(i, i + size));
        }
        return chunked;
    };

    const transactionGroups = chunkTransactions(transactions, 7);
    const totalPages = transactionGroups.length;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Danh sách giao dịch
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                    Tổng số giao dịch: {totalTransactions}
                </Typography>
                
                <TextField
                    select
                    label="Số bản ghi mỗi trang"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    size="small"
                    sx={{ minWidth: 150 }}
                >
                    {pageSizeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {transactionGroups.length > 0 && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Trang {currentPage + 1} / {totalPages}
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell><strong>#</strong></TableCell>
                                <TableCell><strong>Mô tả</strong></TableCell>
                                <TableCell><strong>Loại</strong></TableCell>
                                <TableCell><strong>Số tiền (VNĐ)</strong></TableCell>
                                <TableCell><strong>Giảm giá (VNĐ)</strong></TableCell>
                                <TableCell><strong>Thời gian tạo</strong></TableCell>
                                <TableCell><strong>Họ và tên</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Số điện thoại</strong></TableCell>
                                <TableCell><strong>Avatar</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactionGroups[currentPage].map((transaction, index) => (
                                <TableRow
                                    key={transaction.id}
                                    hover
                                    onClick={() => fetchTransactionDetail(transaction.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{index + 1 + currentPage * 7}</TableCell>
                                    <TableCell>{transaction.description || "Không có mô tả"}</TableCell>
                                    <TableCell>{getTransactionType(transaction.type)}</TableCell>
                                    <TableCell>{transaction.amount ? transaction.amount.toLocaleString() : "0"} VNĐ</TableCell>
                                    <TableCell>{transaction.discountAmount ? transaction.discountAmount.toLocaleString() : "0"} VNĐ</TableCell>
                                    <TableCell>{transaction.createdTime ? new Date(transaction.createdTime).toLocaleString() : "Không xác định"}</TableCell>
                                    <TableCell>{transaction.user?.fullName || "Không có tên"}</TableCell>
                                    <TableCell>{transaction.user?.email || "Không có email"}</TableCell>
                                    <TableCell>{transaction.user?.phoneNumber || "Không có số điện thoại"}</TableCell>
                                    <TableCell>
                                        <Avatar src={transaction.user?.avatar || ""} alt={transaction.user?.fullName || "Avatar"} />
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
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Chi tiết giao dịch</DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedTransaction ? (
                        <Box>
                            {/* Thông tin giao dịch */}
                            <Card sx={{ mb: 2, boxShadow: 3 }}>
                                {/* Thông tin người dùng */}
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 1, color: "#795548" }}>Thông tin người dùng</Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar
                                                src={selectedTransaction.user?.avatar || ""}
                                                alt={selectedTransaction.user?.fullName || "Avatar"}
                                                sx={{ width: 60, height: 60, border: "2px solid #795548" }}
                                            />
                                            <Box>
                                                <Typography variant="body1"><strong>Tên:</strong> {selectedTransaction.user?.fullName || "Không có tên"}</Typography>
                                                <Typography variant="body1"><strong>Email:</strong> {selectedTransaction.user?.email || "Không có email"}</Typography>
                                                <Typography variant="body1"><strong>Số điện thoại:</strong> {selectedTransaction.user?.phoneNumber || "Không có số điện thoại"}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                                <CardContent>
                                    <Typography variant="body1"><strong>ID:</strong> {selectedTransaction.id || "Không xác định"}</Typography>
                                    <Typography variant="body1"><strong>Mô tả:</strong> {selectedTransaction.description || "Không có mô tả"}</Typography>
                                    <Typography variant="body1"><strong>Loại:</strong> {getTransactionType(selectedTransaction.type)}</Typography>
                                    <Typography variant="body1">
                                        <strong>Số tiền:</strong>
                                        <span style={{ color: "#d32f2f", fontWeight: "bold" }}> {selectedTransaction.amount ? selectedTransaction.amount.toLocaleString() : "Không xác định"} VNĐ</span>
                                    </Typography>
                                    <Typography variant="body1">
                                        <strong>Giảm giá:</strong>
                                        <span style={{ color: "#388e3c", fontWeight: "bold" }}> {selectedTransaction.discountAmount ? selectedTransaction.discountAmount.toLocaleString() : "Không có"}</span>
                                    </Typography>
                                    <Typography variant="body1"><strong>Số dư sau giao dịch:</strong> {selectedTransaction.balance ? selectedTransaction.balance.toLocaleString() : "Không xác định"} VNĐ</Typography>
                                    <Typography variant="body1"><strong>Thời gian tạo:</strong> {selectedTransaction.createdTime ? new Date(selectedTransaction.createdTime).toLocaleString() : "Không xác định"}</Typography>
                                    <Typography variant="body1"><strong>Mã ngân hàng:</strong> {selectedTransaction.bankCode || "Không xác định"}</Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ) : (
                        <Typography>Không có dữ liệu</Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransactionsManagement;