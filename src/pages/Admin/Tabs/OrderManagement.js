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

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(
                "https://api-poemtown-staging.nodfeather.win/api/orders/v1/admin",
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
        } catch (err) {
            console.error("Không thể tải danh sách giao dịch.");
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
            console.error("Không thể tải chi tiết giao dịch.");
        } finally {
            setLoading(false);
        }
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
                Danh sách giao dịch
            </Typography>

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
                                    <TableCell>{getOrderStatus(order.status)}</TableCell>
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
                    Không có dữ liệu giao dịch.
                </Typography>
            )}

            {/* Phân trang */}
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
                    ) : selectedOrder ? (
                        <Box>
                            {/* Thông tin giao dịch */}
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

                            {/* Chi tiết đơn hàng */}
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