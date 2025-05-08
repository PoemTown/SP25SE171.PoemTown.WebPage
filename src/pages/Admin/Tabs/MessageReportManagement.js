import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    CircularProgress,
    Box,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Snackbar,
    Alert,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const getTypeLabel = (type) => {
    switch (type) {
        case 1: return 'Bài thơ';
        case 2: return 'Người dùng';
        case 3: return 'Đạo văn';
        default: return 'Không xác định';
    }
};

const MessageReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [reportForm, setReportForm] = useState({
        description: '',
        type: 1
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [deleteConfirm, setDeleteConfirm] = useState({
        open: false,
        reportId: null
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = () => {
        setLoading(true);
        axios.get('https://api-poemtown-staging.nodfeather.win/api/reports/v1/messages')
            .then((response) => {
                if (response.data.statusCode === 200) {
                    setReports(response.data.data);
                } else {
                    console.error('Unexpected response:', response.data);
                }
            })
            .catch((error) => {
                console.error('Error fetching reports:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleOpenDialog = (report = null) => {
        if (report) {
            setCurrentReport(report);
            setReportForm({
                description: report.description,
                type: report.type
            });
        } else {
            setCurrentReport(null);
            setReportForm({
                description: '',
                type: 1
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentReport(null);
        setReportForm({
            description: '',
            type: 1
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportForm(prev => ({
            ...prev,
            [name]: name === 'type' ? parseInt(value) : value
        }));
    };

    const handleSubmit = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setSnackbar({
                open: true,
                message: 'Bạn cần đăng nhập để thực hiện thao tác này',
                severity: 'error'
            });
            return;
        }
    
        const apiUrl = 'https://api-poemtown-staging.nodfeather.win/api/reports/v1/message';
        const method = currentReport ? 'put' : 'post';
    
        const requestData = currentReport
            ? {
                id: currentReport.id,
                description: reportForm.description,
                type: reportForm.type
            }
            : {
                description: reportForm.description,
                type: reportForm.type
            };
    
        axios[method](apiUrl, requestData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (response.status === 200 || response.status === 201 || response.data.statusCode === 200) {
                setSnackbar({
                    open: true,
                    message: currentReport ? 'Cập nhật thành công' : 'Thêm báo cáo thành công',
                    severity: 'success'
                });
                fetchReports();
                handleCloseDialog();
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || (currentReport ? 'Cập nhật thất bại' : 'Thêm báo cáo thất bại'),
                severity: 'error'
            });
        });
    };
    

    const handleDeleteClick = (reportId) => {
        setDeleteConfirm({
            open: true,
            reportId
        });
    };

    const handleDeleteConfirm = () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            setSnackbar({
                open: true,
                message: 'Bạn cần đăng nhập để thực hiện thao tác này',
                severity: 'error'
            });
            return;
        }

        axios.delete(`https://api-poemtown-staging.nodfeather.win/api/reports/v1/message/${deleteConfirm.reportId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (response.data.statusCode === 200) {
                setSnackbar({
                    open: true,
                    message: 'Xóa báo cáo thành công',
                    severity: 'success'
                });
                fetchReports(); 
            } else {
                throw new Error(response.data.message || 'Có lỗi xảy ra');
            }
        })
        .catch(error => {
            console.error('Error deleting report:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Xóa báo cáo thất bại',
                severity: 'error'
            });
        })
        .finally(() => {
            setDeleteConfirm({
                open: false,
                reportId: null
            });
        });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({
            open: false,
            reportId: null
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({...prev, open: false}));
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" mt={5}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box m={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
               
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm mới
                </Button>
            </Box>

            {/* Dialog thêm/sửa */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{currentReport ? 'Chỉnh sửa báo cáo' : 'Thêm báo cáo mới'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="description"
                        label="Mô tả"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={reportForm.description}
                        onChange={handleInputChange}
                    />
                    <TextField
                        select
                        margin="dense"
                        name="type"
                        label="Loại báo cáo"
                        fullWidth
                        variant="standard"
                        value={reportForm.type}
                        onChange={handleInputChange}
                    >
                        <MenuItem value={1}>Bài thơ</MenuItem>
                        <MenuItem value={2}>Người dùng</MenuItem>
                        <MenuItem value={3}>Đạo văn</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit}>{currentReport ? 'Cập nhật' : 'Thêm'}</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteConfirm.open}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa báo cáo này?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Hủy</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Xóa</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar thông báo */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <TableContainer component={Paper}>
                <Table aria-label="message report table">
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>STT</strong></TableCell>
                            <TableCell><strong>Nội dung</strong></TableCell>
                            <TableCell><strong>Phân loại</strong></TableCell>
                            <TableCell><strong>Thao tác</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report, index) => (
                            <TableRow key={report.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{report.description}</TableCell>
                                <TableCell>{getTypeLabel(report.type)}</TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => handleOpenDialog(report)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error" 
                                        onClick={() => handleDeleteClick(report.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MessageReportManagement;