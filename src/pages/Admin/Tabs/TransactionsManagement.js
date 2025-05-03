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
    MenuItem,
    Chip
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Visibility } from "@mui/icons-material";
import axios from "axios";

const getTransactionType = (type) => {
    switch (type) {
        case 1: return "Nạp tiền vào ví";
        case 2: return "Mua mẫu chính";
        case 3: return "Mua bản ghi âm";
        case 4: return "Mua bài thơ";
        case 5: return "Rút tiền";
        case 6: return "Quyên góp";
        case 7: return "Phí hoa hồng";
        case 8: return "Hoàn tiền";
        case 9: return "Phí dịch vụ nạp tiền";
        default: return "Không xác định";
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 1: return { label: "Thành công", color: "success" };
        case 2: return { label: "Thất bại", color: "error" };
        case 3: return { label: "Đang xử lý", color: "warning" };
        default: return { label: "Không xác định", color: "default" };
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
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [pageSize, currentPage]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/transactions/v1/admin`,
                {
                    params: {
                        pageNumber: currentPage,
                        pageSize: pageSize
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setTransactions(response.data.data);
            setTotalRecords(response.data.totalRecords || 0);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error("Không thể tải danh sách giao dịch:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionDetail = async (transactionId) => {
        setDetailLoading(true);
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/transactions/v1/admin/${transactionId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedTransaction(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết giao dịch:", err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewClick = (transactionId) => {
        fetchTransactionDetail(transactionId);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Không xác định";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Danh sách giao dịch
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                    Tổng số giao dịch: {totalRecords}
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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : transactions.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Trang {currentPage} / {totalPages}
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
                                <TableCell><strong>Thao tác</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((transaction, index) => (
                                <TableRow key={transaction.id} hover>
                                    <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell>{transaction.description || "Không có mô tả"}</TableCell>
                                    <TableCell>{getTransactionType(transaction.type)}</TableCell>
                                    <TableCell>{transaction.amount ? transaction.amount.toLocaleString() : "0"} VNĐ</TableCell>
                                    <TableCell>{transaction.discountAmount ? transaction.discountAmount.toLocaleString() : "0"} VNĐ</TableCell>
                                    <TableCell>{formatDate(transaction.createdTime)}</TableCell>
                                    <TableCell>{transaction.user?.fullName || "Không có tên"}</TableCell>
                                    <TableCell>{transaction.user?.email || "Không có email"}</TableCell>
                                    <TableCell>{transaction.user?.phoneNumber || "Không có số điện thoại"}</TableCell>
                                    <TableCell>
                                        <Avatar src={transaction.user?.avatar || ""} alt={transaction.user?.fullName || "Avatar"} />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            onClick={() => handleViewClick(transaction.id)}
                                            color="primary"
                                            title="Xem chi tiết"
                                            disabled={detailLoading}
                                        >
                                            {detailLoading && selectedTransaction?.id === transaction.id ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" sx={{ mt: 2 }}>Không có giao dịch nào</Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                <IconButton 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1 || loading}
                >
                    <ArrowBackIos />
                </IconButton>

                <Typography variant="h6" sx={{ mx: 2 }}>
                    {currentPage} / {totalPages}
                </Typography>

                <IconButton 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages || loading}
                >
                    <ArrowForwardIos />
                </IconButton>
            </Box>

            {/* Dialog chi tiết giao dịch */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Chi tiết giao dịch</DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                    {detailLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedTransaction ? (
                        <Box>
                            <Card sx={{ mb: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                                            Thông tin giao dịch
                                        </Typography>
                                        <Chip 
                                            label={getStatusLabel(selectedTransaction.status).label}
                                            color={getStatusLabel(selectedTransaction.status).color}
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                                        <Box>
                                            <Typography variant="body1"><strong>Mã giao dịch:</strong> {selectedTransaction.transactionCode || "Không có"}</Typography>
                                            <Typography variant="body1"><strong>Loại giao dịch:</strong> {getTransactionType(selectedTransaction.type)}</Typography>
                                            <Typography variant="body1"><strong>Mô tả:</strong> {selectedTransaction.description || "Không có mô tả"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body1"><strong>Số tiền:</strong> <span style={{ color: "#d32f2f", fontWeight: "bold" }}>{selectedTransaction.amount?.toLocaleString() || "0"} VNĐ</span></Typography>
                                            <Typography variant="body1"><strong>Giảm giá:</strong> {selectedTransaction.discountAmount?.toLocaleString() || "0"} VNĐ</Typography>
                                            <Typography variant="body1"><strong>Số dư sau giao dịch:</strong> {selectedTransaction.balance?.toLocaleString() || "0"} VNĐ</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body1"><strong>Thời gian tạo:</strong> {formatDate(selectedTransaction.createdTime)}</Typography>
                                        <Typography variant="body1"><strong>Thời gian thanh toán:</strong> {formatDate(selectedTransaction.paidDate)}</Typography>
                                        {selectedTransaction.cancelledDate && (
                                            <Typography variant="body1"><strong>Thời gian hủy:</strong> {formatDate(selectedTransaction.cancelledDate)}</Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Thông tin người dùng */}
                            <Card sx={{ mb: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Thông tin người dùng</Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                        <Avatar
                                            src={selectedTransaction.user?.avatar || ""}
                                            alt={selectedTransaction.user?.fullName || "Avatar"}
                                            sx={{ width: 80, height: 80, border: "2px solid #795548" }}
                                        />
                                        <Box>
                                            <Typography variant="body1"><strong>Tên đầy đủ:</strong> {selectedTransaction.user?.fullName || "Không có"}</Typography>
                                            <Typography variant="body1"><strong>Tên hiển thị:</strong> {selectedTransaction.user?.displayName || "Không có"}</Typography>
                                            <Typography variant="body1"><strong>Email:</strong> {selectedTransaction.user?.email || "Không có"}</Typography>
                                            <Typography variant="body1"><strong>Số điện thoại:</strong> {selectedTransaction.user?.phoneNumber || "Không có"}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Thông tin rút tiền (nếu có) */}
                            {selectedTransaction.type === 5 && selectedTransaction.withdrawalForm && (
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Thông tin rút tiền</Typography>
                                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                                            <Box>
                                                <Typography variant="body1"><strong>Số tiền rút:</strong> {selectedTransaction.withdrawalForm.amount?.toLocaleString() || "0"} VNĐ</Typography>
                                                <Typography variant="body1"><strong>Trạng thái:</strong> 
                                                    <Chip 
                                                        label={getStatusLabel(selectedTransaction.withdrawalForm.status).label}
                                                        color={getStatusLabel(selectedTransaction.withdrawalForm.status).color}
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                    />
                                                </Typography>
                                            </Box>
                                            <Box>
                                                {selectedTransaction.withdrawalForm.bankType && (
                                                    <>
                                                        <Typography variant="body1"><strong>Ngân hàng:</strong> {selectedTransaction.withdrawalForm.bankType.name || "Không có"}</Typography>
                                                        <Typography variant="body1"><strong>Số tài khoản:</strong> {selectedTransaction.withdrawalForm.accountNumber || "Không có"}</Typography>
                                                        <Typography variant="body1"><strong>Tên chủ tài khoản:</strong> {selectedTransaction.withdrawalForm.accountName || "Không có"}</Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}
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