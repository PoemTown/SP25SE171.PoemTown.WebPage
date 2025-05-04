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

// TransactionDetailModal component
const TransactionDetailModal = ({ transaction, open, onClose, loading }) => {
  if (!transaction) return null;

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
      case 1:
        return { label: "Đang chờ", color: "warning" };
      case 2:
        return { label: "Đã thanh toán", color: "success" };
      case 3:
        return { label: "Đã hủy", color: "error" };
      case 4:
        return { label: "Hoàn tiền", color: "info" };
      case 5:
        return { label: "Đã chuyển khoản", color: "success" }; 
      default:
        return { label: "Không xác định", color: "default" };
    }
  };
  

  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderOrderDetails = (order) => {
    if (!order) return null;

    return (
      <Card sx={{ mb: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Thông tin đơn hàng</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
            <Box>
              <Typography variant="body1"><strong>Mã đơn hàng:</strong> {order.orderCode || 'N/A'}</Typography>
              <Typography variant="body1"><strong>Loại đơn hàng:</strong> {order.type === 1 ? 'Mua thơ' : 
                order.type === 2 ? 'Mua template' : 
                order.type === 3 ? 'Mua file ghi âm' : 'Khác'}</Typography>
              <Typography variant="body1"><strong>Mô tả:</strong> {order.orderDescription || 'Không có mô tả'}</Typography>
            </Box>
            <Box>
              <Typography variant="body1"><strong>Tổng tiền:</strong> {order.amount?.toLocaleString() || '0'} VNĐ</Typography>
              <Typography variant="body1"><strong>Trạng thái:</strong> 
                <Chip 
                  label={getStatusLabel(order.status).label}
                  color={getStatusLabel(order.status).color}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Box>
          </Box>

          {/* Order Details */}
          {order.orderDetails?.map((detail, index) => (
            <Box key={index} sx={{ mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>Chi tiết sản phẩm {index + 1}</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <Box>
                  <Typography variant="body1"><strong>Giá đơn vị:</strong> {detail.itemPrice?.toLocaleString() || '0'} VNĐ</Typography>
                  <Typography variant="body1"><strong>Số lượng:</strong> {detail.itemQuantity || '1'}</Typography>
                  <Typography variant="body1"><strong>Thành tiền:</strong> {(detail.itemPrice * (detail.itemQuantity || 1))?.toLocaleString() || '0'} VNĐ</Typography>
                </Box>

                {/* Template Details */}
                {detail.masterTemplate && (
                  <Box>
                    <Typography variant="body1"><strong>Tên template:</strong> {detail.masterTemplate.templateName || 'N/A'}</Typography>
                  </Box>
                )}

                {/* Sale Version Details */}
                {detail.saleVersion && (
                  <Box>
                    <Typography variant="body1"><strong>Tên thơ:</strong> {detail.saleVersion.poem?.title || 'N/A'}</Typography>
                    <Typography variant="body1"><strong>Giá:</strong> {detail.saleVersion.price?.toLocaleString() || '0'} VNĐ</Typography>
                    <Typography variant="body1"><strong>Thời lượng:</strong> {detail.saleVersion.durationTime || '0'} năm</Typography>
                    <Typography variant="body1"><strong>Hoa hồng:</strong> {detail.saleVersion.commissionPercentage || '0'}%</Typography>
                  </Box>
                )}

                {/* Record File Details */}
                {detail.recordFile && (
                  <Box>
                    <Typography variant="body1"><strong>Tên file:</strong> {detail.recordFile.fileName || 'N/A'}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Chi tiết giao dịch</DialogTitle>
      <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Card sx={{ mb: 2, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    Thông tin giao dịch
                  </Typography>
                  <Chip 
                    label={getStatusLabel(transaction.status).label}
                    color={getStatusLabel(transaction.status).color}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                  <Box>
                    <Typography variant="body1"><strong>Mã giao dịch:</strong> {transaction.transactionCode || "Không có"}</Typography>
                    <Typography variant="body1"><strong>Loại giao dịch:</strong> {getTransactionType(transaction.type)}</Typography>
                    <Typography variant="body1"><strong>Mô tả:</strong> {transaction.description || "Không có mô tả"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body1"><strong>Số tiền:</strong> 
                      <span style={{ 
                        color: transaction.isAddToWallet ? "#2e7d32" : "#d32f2f", 
                        fontWeight: "bold",
                        marginLeft: "4px"
                      }}>
                        {transaction.amount?.toLocaleString() || "0"} VNĐ
                      </span>
                    </Typography>
                    <Typography variant="body1"><strong>Giảm giá:</strong> {transaction.discountAmount?.toLocaleString() || "0"} VNĐ</Typography>
                    <Typography variant="body1"><strong>Số dư sau giao dịch:</strong> {transaction.balance?.toLocaleString() || "0"} VNĐ</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1"><strong>Thời gian tạo:</strong> {formatDate(transaction.createdTime)}</Typography>
                  <Typography variant="body1"><strong>Thời gian thanh toán:</strong> {formatDate(transaction.paidDate)}</Typography>
                  {transaction.cancelledDate && (
                    <Typography variant="body1"><strong>Thời gian hủy:</strong> {formatDate(transaction.cancelledDate)}</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card sx={{ mb: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Thông tin người dùng</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Avatar
                    src={transaction.user?.avatar || ""}
                    alt={transaction.user?.fullName || "Avatar"}
                    sx={{ width: 80, height: 80, border: "2px solid #795548" }}
                  />
                  <Box>
                    <Typography variant="body1"><strong>Tên đầy đủ:</strong> {transaction.user?.fullName || "Không có"}</Typography>
                    <Typography variant="body1"><strong>Tên hiển thị:</strong> {transaction.user?.displayName || "Không có"}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Order Information */}
            {renderOrderDetails(transaction.order)}

            {/* Withdrawal Information */}
            {transaction.type === 5 && transaction.withdrawalForm && (
              <Card sx={{ boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>Thông tin rút tiền</Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                    <Box>
                      <Typography variant="body1"><strong>Số tiền rút:</strong> {transaction.withdrawalForm.amount?.toLocaleString() || "0"} VNĐ</Typography>
                      <Typography variant="body1"><strong>Trạng thái:</strong> 
                        <Chip 
                          label={getStatusLabel(transaction.withdrawalForm.status).label}
                          color={getStatusLabel(transaction.withdrawalForm.status).color}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </Box>
                    <Box>
                      {transaction.withdrawalForm.bankType && (
                        <>
                          <Typography variant="body1"><strong>Ngân hàng:</strong> {transaction.withdrawalForm.bankType.name || "Không có"}</Typography>
                          <Typography variant="body1"><strong>Số tài khoản:</strong> {transaction.withdrawalForm.accountNumber || "Không có"}</Typography>
                          <Typography variant="body1"><strong>Tên chủ tài khoản:</strong> {transaction.withdrawalForm.accountName || "Không có"}</Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

// Main TransactionsManagement component
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

  const pageSizeOptions = [
    { value: 10, label: '10 bản ghi' },
    { value: 25, label: '25 bản ghi' },
    { value: 50, label: '50 bản ghi' },
    { value: 100, label: '100 bản ghi' },
    { value: 250, label: '250 bản ghi' }
  ];

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
      case 1: return { label: "Pending", color: "warning" };
      case 2: return { label: "Paid", color: "success" };
      case 3: return { label: "Cancelled", color: "error" };
      default: return { label: "Không xác định", color: "default" };
    }
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
                <TableCell><strong>Avatar</strong></TableCell>
                <TableCell><strong>Trạng thái</strong></TableCell>
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
                  <TableCell>
                    <Avatar src={transaction.user?.avatar || ""} alt={transaction.user?.fullName || "Avatar"} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(transaction.status).label}
                      color={getStatusLabel(transaction.status).color}
                      size="small"
                    />
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

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        loading={detailLoading}
      />
    </Box>
  );
};

export default TransactionsManagement;