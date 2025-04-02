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
    TextField,
    MenuItem,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import axios from "axios";

const getReportType = (type) => {
    switch (type) {
        case 1: return "Báo cáo bài thơ";
        case 2: return "Báo cáo người dùng";
        case 3: return "Báo cáo đạo văn";
        default: return "Không xác định";
    }
};

const getReportStatus = (status) => {
    switch (status) {
        case 1: return "Đang chờ xử lý";
        case 2: return "Đã chấp nhận";
        case 3: return "Đã từ chối";
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
    { value: 100, label: '100 bản ghi' }
];

const sortOptions = [
    { value: 1, label: 'Cũ nhất' },
    { value: 2, label: 'Mới nhất' }
];

const statusOptions = [
    { value: 1, label: 'Đang chờ xử lý' },
    { value: 2, label: 'Đã chấp nhận' },
    { value: 3, label: 'Đã từ chối' }
];

const ReportFromUser = () => {
    const [reports, setReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [sortOption, setSortOption] = useState(2);
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        totalPages: 0,
        totalRecords: 0
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [status, setStatus] = useState(1);
    const [resolveResponse, setResolveResponse] = useState("");

    useEffect(() => {
        fetchReports();
    }, [currentPage, pageSize, sortOption]);

    const fetchReports = async () => {
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/reports/v1/reports?sortOptions=${sortOption}&pageNumber=${currentPage}&pageSize=${pageSize}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setReports(response.data.data);
            setPagination({
                pageNumber: response.data.pageNumber,
                totalPages: response.data.totalPages,
                totalRecords: response.data.totalRecords
            });
        } catch (err) {
            console.error("Không thể tải danh sách báo cáo.");
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
        setCurrentPage(1);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < pagination.totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleRowClick = (report) => {
        setSelectedReport(report);
        setStatus(report.status);
        setResolveResponse("");
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReport(null);
    };

    const handleStatusChange = (event) => {
        setStatus(event.target.value);
    };

    const handleResolveResponseChange = (event) => {
        setResolveResponse(event.target.value);
    };

    const handleSubmit = async () => {
        try {
            await axios.put(
                "https://api-poemtown-staging.nodfeather.win/api/reports/v1/resolve",
                {
                    id: selectedReport.id,
                    resolveResponse: resolveResponse,
                    status: status
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            fetchReports(); 
            handleCloseDialog();
        } catch (err) {
            console.error("Có lỗi khi cập nhật trạng thái báo cáo.");
        }
    };

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Báo cáo từ người dùng
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                    Tổng số báo cáo: {pagination.totalRecords}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        label="Sắp xếp theo"
                        value={sortOption}
                        onChange={handleSortChange}
                        size="small"
                        sx={{ minWidth: 150 }}
                    >
                        {sortOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    
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
            </Box>

            {reports.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Trang {currentPage} / {pagination.totalPages}
                    </Typography>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                                <TableCell><strong>#</strong></TableCell>
                                <TableCell><strong>Loại báo cáo</strong></TableCell>
                                <TableCell><strong>Lý do</strong></TableCell>
                                <TableCell><strong>Trạng thái</strong></TableCell>
                                <TableCell><strong>Người báo cáo</strong></TableCell>
                                <TableCell><strong>Bài thơ được báo cáo</strong></TableCell>
                                <TableCell><strong>Thời gian tạo</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reports.map((report, index) => (
                                <TableRow
                                    key={report.id}
                                    hover
                                    onClick={() => handleRowClick(report)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell>{getReportType(report.type)}</TableCell>
                                    <TableCell>{report.reportReason || "Không có lý do"}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={getReportStatus(report.status)} 
                                            color={getStatusColor(report.status)} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={report.reportReportUser?.avatar} alt={report.reportReportUser?.fullName} />
                                            {report.reportReportUser?.fullName || "Không có tên"}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{report.poem?.title || "Không có bài thơ"}</TableCell>
                                    <TableCell>{report.createdTime ? new Date(report.createdTime).toLocaleString() : "Không xác định"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Không có dữ liệu báo cáo.
                </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
                <IconButton onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ArrowBackIos />
                </IconButton>

                <Typography variant="h6" sx={{ mx: 2 }}>
                    {currentPage} / {pagination.totalPages}
                </Typography>

                <IconButton onClick={handleNextPage} disabled={currentPage === pagination.totalPages}>
                    <ArrowForwardIos />
                </IconButton>
            </Box>

            {/* Edit Status Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>Cập nhật trạng thái báo cáo</DialogTitle>
                <DialogContent>
                    {selectedReport && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Loại báo cáo:</strong> {getReportType(selectedReport.type)}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Lý do:</strong> {selectedReport.reportReason || "Không có lý do"}
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Người báo cáo:</strong> {selectedReport.reportReportUser?.fullName || "Không có tên"}
                            </Typography>
                            
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={status}
                                    label="Trạng thái"
                                    onChange={handleStatusChange}
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <TextField
                                label="Phản hồi giải quyết"
                                fullWidth
                                multiline
                                rows={4}
                                value={resolveResponse}
                                onChange={handleResolveResponseChange}
                                sx={{ mt: 2 }}
                                placeholder="Nhập phản hồi giải quyết (nếu có)"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Lưu thay đổi
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportFromUser;