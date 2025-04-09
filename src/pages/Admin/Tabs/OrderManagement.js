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
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import axios from "axios";

const getOrderType = (type) => {
    switch (type) {
        case 1: return "Nạp tiền vào ví (EWalletDeposit)";
        case 2: return "Mua mẫu chính (MasterTemplates)";
        case 3: return "Mua bản ghi âm (RecordFiles)";
        case 4: return "Mua bài thơ (Poems)";
        case 5: return "Rút tiền";
        case 6: return "Quyên góp";
        default: return "Không xác định";
    }
};

const getOrderStatus = (status) => {
    switch (status) {
        case 1: return "Đang chờ xử lý (Pending)";
        case 2: return "Đã thanh toán (Paid)";
        case 3: return "Đã hủy (Cancelled)";
        default: return "Không xác định";
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 1: return "warning";
        case 2: return "success";
        case 3: return "error";
        default: return "default";
    }
};

const pageSizeOptions = [
    { value: 10, label: '10 bản ghi' },
    { value: 25, label: '25 bản ghi' },
    { value: 50, label: '50 bản ghi' },
    { value: 100, label: '100 bản ghi' },
    { value: 250, label: '250 bản ghi' }
];

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Using 1-based index for API
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [pageSize, currentPage]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/orders/v1/admin`,
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
            setOrders(response.data.data);
            setTotalRecords(response.data.totalRecords || 0);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error("Không thể tải danh sách đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrderDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/orders/v1/detail/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedOrder(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết đơn hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Danh sách đơn hàng
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                    Tổng số đơn hàng: {totalRecords}
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
            ) : orders.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Trang {currentPage} / {totalPages}
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell><strong>#</strong></TableCell>
                                <TableCell><strong>Mã đơn hàng</strong></TableCell>
                                <TableCell><strong>Loại</strong></TableCell>
                                <TableCell><strong>Số tiền (VNĐ)</strong></TableCell>
                                <TableCell><strong>Thời gian tạo</strong></TableCell>
                                <TableCell><strong>Trạng thái</strong></TableCell>
                                <TableCell><strong>Khách hàng</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order, index) => (
                                <TableRow
                                    key={order.id}
                                    hover
                                    onClick={() => fetchOrderDetail(order.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell>{order.orderCode || "Không có mã"}</TableCell>
                                    <TableCell>{getOrderType(order.type)}</TableCell>
                                    <TableCell>{order.amount ? order.amount.toLocaleString() : "0"} VNĐ</TableCell>
                                    <TableCell>{order.orderDate ? new Date(order.orderDate).toLocaleString() : "Không xác định"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getOrderStatus(order.status)}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar src={order.user?.avatar || ""} alt={order.user?.fullName || "Avatar"} />
                                        <Box>
                                            <Typography>{order.user?.fullName || "Không có tên"}</Typography>
                                            <Typography variant="body2" color="text.secondary">{order.user?.email || "Không có email"}</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Không có dữ liệu đơn hàng.
                </Typography>
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Chi tiết đơn hàng</DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedOrder ? (
                        <Box>
                            <Card sx={{ boxShadow: 3, mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Thông tin đơn hàng</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body1"><strong>Mã đơn hàng:</strong> {selectedOrder.orderCode || "Không xác định"}</Typography>
                                            <Typography variant="body1"><strong>Loại:</strong> {getOrderType(selectedOrder.type)}</Typography>
                                            <Typography variant="body1"><strong>Trạng thái:</strong> 
                                                <Chip
                                                    label={getOrderStatus(selectedOrder.status)}
                                                    color={getStatusColor(selectedOrder.status)}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body1">
                                                <strong>Số tiền:</strong>
                                                <span style={{ color: "#d32f2f", fontWeight: "bold", marginLeft: 4 }}>
                                                    {selectedOrder.amount ? selectedOrder.amount.toLocaleString() : "Không xác định"} VNĐ
                                                </span>
                                            </Typography>
                                            <Typography variant="body1"><strong>Thời gian đặt hàng:</strong> {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : "Không xác định"}</Typography>
                                            <Typography variant="body1"><strong>Thời gian thanh toán:</strong> {selectedOrder.paidDate ? new Date(selectedOrder.paidDate).toLocaleString() : "Chưa thanh toán"}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card sx={{ boxShadow: 3, mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Thông tin khách hàng</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar
                                            src={selectedOrder.user?.avatar || ""}
                                            alt={selectedOrder.user?.fullName || "Avatar"}
                                            sx={{ width: 60, height: 60, border: "2px solid #795548" }}
                                        />
                                        <Box>
                                            <Typography variant="body1"><strong>Tên:</strong> {selectedOrder.user?.fullName || "Không có tên"}</Typography>
                                            <Typography variant="body1"><strong>Email:</strong> {selectedOrder.user?.email || "Không có email"}</Typography>
                                            <Typography variant="body1"><strong>Số điện thoại:</strong> {selectedOrder.user?.phoneNumber || "Không có số điện thoại"}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card sx={{ boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Chi tiết đơn hàng</Typography>
                                    {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                                        <TableContainer component={Paper}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><strong>Sản phẩm</strong></TableCell>
                                                        <TableCell><strong>Đơn giá</strong></TableCell>
                                                        <TableCell><strong>Số lượng</strong></TableCell>
                                                        <TableCell><strong>Thành tiền</strong></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {selectedOrder.orderDetails.map((detail) => (
                                                        <TableRow key={detail.id}>
                                                            <TableCell>{detail.itemName || "Không xác định"}</TableCell>
                                                            <TableCell>{detail.itemPrice.toLocaleString()} VNĐ</TableCell>
                                                            <TableCell>{detail.itemQuantity}</TableCell>
                                                            <TableCell>{(detail.itemPrice * detail.itemQuantity).toLocaleString()} VNĐ</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body1">Không có chi tiết đơn hàng</Typography>
                                    )}
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

export default OrderManagement;