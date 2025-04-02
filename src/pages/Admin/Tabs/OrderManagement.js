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
        case 1:
            return "Nạp tiền vào ví (EWalletDeposit)";
        case 2:
            return "Mua mẫu chính (MasterTemplates)";
        case 3:
            return "Mua bản ghi âm (RecordFiles)";
        case 4:
            return "Mua bài thơ (Poems)";
        case 5:
            return "Rút tiền";
        case 6:
            return "Quyên góp";
        default:
            return "Không xác định";
    }
};

const getOrderStatus = (status) => {
    switch (status) {
        case 1:
            return "Đang chờ xử lý (Pending)";
        case 2:
            return "Đã thanh toán (Paid)";
        case 3:
            return "Đã hủy (Cancelled)";
        default:
            return "Không xác định";
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
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [totalOrders, setTotalOrders] = useState(0);

    useEffect(() => {
        fetchOrders();
    }, [pageSize]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/orders/v1/admin?pageSize=${pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            const sortedOrders = response.data.data.sort(
                (a, b) => new Date(b.user?.createdTime) - new Date(a.user?.createdTime)
            );
            setOrders(sortedOrders);
            setTotalOrders(sortedOrders.length);
        } catch (err) {
            console.error("Không thể tải danh sách đơn hàng.");
        }
    };

    const fetchOrderDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/orders/v1/detail/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedOrder(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi pageSize
    };

    const chunkOrders = (orders, size) => {
        const chunked = [];
        for (let i = 0; i < orders.length; i += size) {
            chunked.push(orders.slice(i, i + size));
        }
        return chunked;
    };

    const orderGroups = chunkOrders(orders, 7);
    const totalPages = orderGroups.length;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Danh sách đơn hàng
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                    Tổng số đơn hàng: {totalOrders}
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

            {orderGroups.length > 0 ? (
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
                                <TableCell><strong>Thời gian tạo</strong></TableCell>
                                <TableCell><strong>Trạng thái</strong></TableCell>
                                <TableCell><strong>Họ và tên</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Số điện thoại</strong></TableCell>
                                <TableCell><strong>Avatar</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderGroups[currentPage].map((order, index) => (
                                <TableRow
                                    key={order.id}
                                    hover
                                    onClick={() => fetchOrderDetail(order.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{index + 1 + currentPage * 7}</TableCell>
                                    <TableCell>{order.orderDescription || "Không có mô tả"}</TableCell>
                                    <TableCell>{getOrderType(order.type)}</TableCell>
                                    <TableCell>{order.amount ? order.amount.toLocaleString() : "0"} VNĐ</TableCell>
                                    <TableCell>{order.user?.createdTime ? new Date(order.user.createdTime).toLocaleString() : "Không xác định"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getOrderStatus(order.status)}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{order.user?.fullName || "Không có tên"}</TableCell>
                                    <TableCell>{order.user?.email || "Không có email"}</TableCell>
                                    <TableCell>{order.user?.phoneNumber || "Không có số điện thoại"}</TableCell>
                                    <TableCell>
                                        <Avatar src={order.user?.avatar || ""} alt={order.user?.fullName || "Avatar"} />
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
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
                                    <Typography variant="h6" sx={{ mb: 1, color: "#795548" }}>Thông tin đơn hàng</Typography>
                                    <Typography variant="body1"><strong>Mã đơn hàng:</strong> {selectedOrder.orderCode || "Không xác định"}</Typography>
                                    <Typography variant="body1"><strong>Mô tả:</strong> {selectedOrder.orderDescription || "Không có mô tả"}</Typography>
                                    <Typography variant="body1"><strong>Loại:</strong> {getOrderType(selectedOrder.type)}</Typography>
                                    <Typography variant="body1">
                                        <strong>Số tiền:</strong>
                                        <span style={{ color: "#d32f2f", fontWeight: "bold" }}> {selectedOrder.amount ? selectedOrder.amount.toLocaleString() : "Không xác định"} VNĐ</span>
                                    </Typography>
                                    <Typography variant="body1"><strong>Trạng thái:</strong> {getOrderStatus(selectedOrder.status)}</Typography>
                                    <Typography variant="body1"><strong>Thời gian đặt hàng:</strong> {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleString() : "Không xác định"}</Typography>
                                    <Typography variant="body1"><strong>Thời gian thanh toán:</strong> {selectedOrder.paidDate ? new Date(selectedOrder.paidDate).toLocaleString() : "Chưa thanh toán"}</Typography>
                                    <Typography variant="body1"><strong>Thời gian hủy:</strong> {selectedOrder.cancelledDate ? new Date(selectedOrder.cancelledDate).toLocaleString() : "Không có"}</Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{ boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1, color: "#795548" }}>Chi tiết đơn hàng</Typography>
                                    {selectedOrder.orderDetails && selectedOrder.orderDetails.length > 0 ? (
                                        selectedOrder.orderDetails.map((detail, index) => (
                                            <Box key={detail.id} sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                                                <Typography variant="body1"><strong>Giá sản phẩm:</strong> {detail.itemPrice.toLocaleString()} VNĐ</Typography>
                                                <Typography variant="body1"><strong>Số lượng:</strong> {detail.itemQuantity}</Typography>
                                            </Box>
                                        ))
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