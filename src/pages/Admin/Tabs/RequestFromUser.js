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
    Chip,
    FormControl,
    InputLabel,
    Select,
    Stack,
    Snackbar,
    Alert
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, Edit, CloudUpload } from "@mui/icons-material";
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import axios from "axios";

// Utility functions
const getBankType = (bankType) => {
    if (!bankType || !bankType.bankName) return "Khác";
    return `${bankType.bankName} (${bankType.bankCode})`;
};

const getWithdrawalStatus = (status) => {
    switch (status) {
        case 3: return "Đang chờ xử lý";
        case 1: return "Đã xử lý";
        case 2: return "Đã hủy";
        default: return "Không xác định";
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 3: return "warning";
        case 1: return "success";
        case 2: return "error";
        default: return "default";
    }
};

const statusOptions = [
    { value: 3, label: 'Đang chờ xử lý' },
    { value: 1, label: 'Đã xử lý' },
    { value: 2, label: 'Đã hủy' }
];

const pageSizeOptions = [
    { value: 10, label: '10 bản ghi' },
    { value: 25, label: '25 bản ghi' },
    { value: 50, label: '50 bản ghi' },
    { value: 100, label: '100 bản ghi' },
    { value: 250, label: '250 bản ghi' }
];

const RequestFromUser = () => {
    // State management
    const [withdrawals, setWithdrawals] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showImage, setShowImage] = useState(true);
    const [editForm, setEditForm] = useState({
        status: 3,
        resolveDescription: "",
        resolveEvidence: null,
        previewEvidence: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // Fetch data
    useEffect(() => {
        fetchWithdrawals();
    }, [pageSize, currentPage]);

    const fetchWithdrawals = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/withdrawal-forms/v1`,
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
            setWithdrawals(response.data.data);
            setTotalRecords(response.data.totalRecords || 0);
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            console.error("Không thể tải danh sách yêu cầu rút tiền:", err);
            showNotification('Lỗi khi tải danh sách yêu cầu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchWithdrawalDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/withdrawal-forms/v1/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedWithdrawal(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết yêu cầu rút tiền:", err);
            showNotification('Lỗi khi tải chi tiết yêu cầu', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Upload evidence image
    const uploadEvidence = async (file) => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/withdrawal-forms/v1/upload-evidence`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.statusCode === 201) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Upload failed');
        } catch (error) {
            console.error("Lỗi khi upload bằng chứng:", error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    // Handle file change and upload
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            showNotification('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            showNotification('Kích thước file không được vượt quá 5MB', 'error');
            return;
        }

        try {
            showNotification('Đang tải lên ảnh bằng chứng...', 'info');
            const imageUrl = await uploadEvidence(file);

            setEditForm(prev => ({
                ...prev,
                resolveEvidence: imageUrl,
                previewEvidence: URL.createObjectURL(file)
            }));

            showNotification('Tải lên ảnh thành công!', 'success');
        } catch (error) {
            showNotification('Tải lên ảnh thất bại!', 'error');
        }
    };

    // Handle edit form submission
    const handleSubmitEdit = async () => {
        if (!selectedWithdrawal?.id) return;

        setIsSubmitting(true);
        try {
            showNotification('Đang cập nhật yêu cầu...', 'info');

            const payload = {
                id: selectedWithdrawal.id,
                status: editForm.status,
                resolveDescription: editForm.resolveDescription,
                resolveEvidence: editForm.resolveEvidence
            };

            await axios.put(
                `${process.env.REACT_APP_API_BASE_URL}/withdrawal-forms/v1/resolve`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            showNotification('Cập nhật yêu cầu thành công!', 'success');
            fetchWithdrawals();
            setOpenEditDialog(false);
        } catch (err) {
            console.error("Có lỗi khi cập nhật yêu cầu rút tiền:", err);
            showNotification(err.response?.data?.message || 'Cập nhật thất bại!', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper functions
    const handleOpenEditDialog = (withdrawal) => {
        setSelectedWithdrawal(withdrawal);
        setEditForm({
            status: withdrawal.status,
            resolveDescription: withdrawal.resolveDescription || "",
            resolveEvidence: withdrawal.resolveEvidence || null,
            previewEvidence: withdrawal.resolveEvidence || null
        });
        setOpenEditDialog(true);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
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

    const showNotification = (message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    severity={notification.severity}
                    onClose={handleCloseNotification}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Main Content */}
           

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                    Tổng số yêu cầu: {totalRecords}
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

            {loading && withdrawals.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : withdrawals.length > 0 ? (
                <>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Typography variant="h6" sx={{ p: 2 }}>
                            Trang {currentPage} / {totalPages}
                        </Typography>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                    <TableCell><strong>#</strong></TableCell>
                                    <TableCell><strong>Mã yêu cầu</strong></TableCell>
                                    <TableCell><strong>Số tiền (VNĐ)</strong></TableCell>
                                    <TableCell><strong>Ngân hàng</strong></TableCell>
                                    <TableCell><strong>Tên tài khoản</strong></TableCell>
                                    <TableCell><strong>Số tài khoản</strong></TableCell>
                                    <TableCell><strong>Thời gian tạo</strong></TableCell>
                                    <TableCell><strong>Trạng thái</strong></TableCell>
                                    <TableCell><strong>Thao tác</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {withdrawals.map((withdrawal, index) => (
                                    <TableRow key={withdrawal.id} hover>
                                        <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                        <TableCell>{withdrawal.id || "Không có mã"}</TableCell>
                                        <TableCell>{withdrawal.amount ? withdrawal.amount.toLocaleString() : "0"} VNĐ</TableCell>
                                        <TableCell>
                                            {withdrawal.bankType ? (
                                                getBankType(withdrawal.bankType)
                                            ) : "Không xác định"}
                                        </TableCell>
                                        <TableCell>{withdrawal.accountName || "Không xác định"}</TableCell>
                                        <TableCell>{withdrawal.accountNumber || "Không xác định"}</TableCell>
                                        <TableCell>{withdrawal.createdTime ? new Date(withdrawal.createdTime).toLocaleString() : "Không xác định"}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getWithdrawalStatus(withdrawal.status)}
                                                color={getStatusColor(withdrawal.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() => fetchWithdrawalDetail(withdrawal.id)}
                                                color="primary"
                                                size="small"
                                            >
                                                <Typography variant="body2">Xem</Typography>
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleOpenEditDialog(withdrawal)}
                                                color="secondary"
                                                size="small"
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

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
                </>
            ) : (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Không có dữ liệu yêu cầu rút tiền.
                </Typography>
            )}

            {/* View Details Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Chi tiết yêu cầu rút tiền</DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedWithdrawal ? (
                        <Box>
                            <Card sx={{ boxShadow: 3, mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Thông tin yêu cầu</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body1"><strong>Mã yêu cầu:</strong> {selectedWithdrawal.id || "Không xác định"}</Typography>
                                            <Typography variant="body1">
                                                <strong>Ngân hàng:</strong>
                                                {selectedWithdrawal.bankType ? (
                                                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                                                        {selectedWithdrawal.bankType.imageIcon && (
                                                            <img
                                                                src={selectedWithdrawal.bankType.imageIcon}
                                                                alt={selectedWithdrawal.bankType.bankCode}
                                                                style={{
                                                                    width: "20px",
                                                                    height: "20px",
                                                                    objectFit: "contain",
                                                                    marginRight: 5
                                                                }}
                                                            />
                                                        )}
                                                        {getBankType(selectedWithdrawal.bankType)}
                                                    </Box>
                                                ) : "Không xác định"}
                                            </Typography>
                                            <Typography variant="body1"><strong>Trạng thái:</strong>
                                                <Chip
                                                    label={getWithdrawalStatus(selectedWithdrawal.status)}
                                                    color={getStatusColor(selectedWithdrawal.status)}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body1">
                                                <strong>Số tiền:</strong>
                                                <span style={{ color: "#d32f2f", fontWeight: "bold", marginLeft: 4 }}>
                                                    {selectedWithdrawal.amount ? selectedWithdrawal.amount.toLocaleString() : "Không xác định"} VNĐ
                                                </span>
                                            </Typography>
                                            <Typography variant="body1"><strong>Thời gian tạo:</strong> {selectedWithdrawal.createdTime ? new Date(selectedWithdrawal.createdTime).toLocaleString() : "Không xác định"}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card sx={{ boxShadow: 3, mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Thông tin tài khoản</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body1"><strong>Tên tài khoản:</strong> {selectedWithdrawal.accountName || "Không xác định"}</Typography>
                                            <Typography variant="body1"><strong>Số tài khoản:</strong> {selectedWithdrawal.accountNumber || "Không xác định"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body1"><strong>Mô tả:</strong> {selectedWithdrawal.description || "Không có mô tả"}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {(selectedWithdrawal.resolveDescription || selectedWithdrawal.resolveEvidence) && (
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Thông tin xử lý</Typography>
                                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                                            {selectedWithdrawal.resolveDescription && (
                                                <Box>
                                                    <Typography variant="body1"><strong>Mô tả xử lý:</strong> {selectedWithdrawal.resolveDescription}</Typography>
                                                </Box>
                                            )}
                                            {selectedWithdrawal.resolveEvidence && (
                                                <Box>
                                                    <Typography variant="body1">
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <strong>Bằng chứng xử lý:</strong>

                                                            {selectedWithdrawal.resolveEvidence && (
                                                                <>
                                                                    <span
                                                                        style={{ cursor: 'pointer', marginLeft: 8 }}
                                                                        onClick={() => setShowImage(!showImage)}
                                                                    >
                                                                        {showImage ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {showImage && selectedWithdrawal.resolveEvidence && (
                                                            <div style={{ marginTop: 8 }}>
                                                                <img
                                                                    src={selectedWithdrawal.resolveEvidence}
                                                                    alt="Bằng chứng xử lý"
                                                                    style={{ maxWidth: "60%", height: "auto", borderRadius: 4 }}
                                                                />
                                                            </div>
                                                        )}
                                                    </Typography>
                                                </Box>
                                            )}
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

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Cập nhật yêu cầu rút tiền</DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {selectedWithdrawal && (
                        <Stack spacing={3}>
                            <Typography variant="subtitle1">
                                Mã yêu cầu: <strong>{selectedWithdrawal.id}</strong>
                            </Typography>

                            <FormControl fullWidth>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    name="status"
                                    value={editForm.status}
                                    onChange={handleEditFormChange}
                                    label="Trạng thái"
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                name="resolveDescription"
                                label="Mô tả xử lý"
                                value={editForm.resolveDescription}
                                onChange={handleEditFormChange}
                                multiline
                                rows={4}
                                fullWidth
                            />

                            <Box>
                                <Typography variant="body1" gutterBottom>
                                    Bằng chứng xử lý
                                </Typography>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="resolveEvidence"
                                    type="file"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                                <label htmlFor="resolveEvidence">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        startIcon={<CloudUpload />}
                                        sx={{ mr: 2 }}
                                        disabled={uploading}
                                    >
                                        {uploading ? 'Đang tải lên...' : 'Tải lên bằng chứng'}
                                    </Button>
                                </label>
                                {editForm.previewEvidence && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">Ảnh đã chọn:</Typography>
                                        <Box sx={{
                                            position: 'relative',
                                            display: 'inline-block',
                                            mt: 1
                                        }}>
                                            <img
                                                src={editForm.previewEvidence}
                                                alt="Bằng chứng xử lý"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: 200,
                                                    borderRadius: 1,
                                                    border: '1px solid #ddd'
                                                }}
                                            />
                                            {uploading && (
                                                <Box sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.1)'
                                                }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenEditDialog(false)}
                        color="primary"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmitEdit}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting || uploading}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : "Xác nhận"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RequestFromUser;