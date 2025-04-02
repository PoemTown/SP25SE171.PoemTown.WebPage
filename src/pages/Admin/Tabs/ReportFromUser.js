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

const ReportFromUser = () => {
    const [reports, setReports] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [sortOption, setSortOption] = useState(2);
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        totalPages: 0,
        totalRecords: 0
    });

    useEffect(() => {
        fetchReports();
    }, [pageSize, sortOption]);

    const fetchReports = async () => {
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/reports/v1/reports?pageSize=${pageSize}&sortOption=${sortOption}`,
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

    const fetchReportDetail = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api-poemtown-staging.nodfeather.win/api/reports/v1/reports/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );
            setSelectedReport(response.data.data);
            setOpenDialog(true);
        } catch (err) {
            console.error("Không thể tải chi tiết báo cáo.");
        } finally {
            setLoading(false);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(event.target.value);
        setCurrentPage(0);
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
        setCurrentPage(0);
    };

    const chunkReports = (reports, size) => {
        const chunked = [];
        for (let i = 0; i < reports.length; i += size) {
            chunked.push(reports.slice(i, i + size));
        }
        return chunked;
    };

    const reportGroups = chunkReports(reports, 7);
    const totalPages = reportGroups.length;

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

            {reportGroups.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ p: 2 }}>
                        Trang {currentPage + 1} / {totalPages}
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
                            {reportGroups[currentPage].map((report, index) => (
                                <TableRow
                                    key={report.id}
                                    hover
                                    onClick={() => fetchReportDetail(report.id)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{index + 1 + currentPage * 7}</TableCell>
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

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
                <DialogTitle>Chi tiết báo cáo</DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                            <CircularProgress />
                        </Box>
                    ) : selectedReport ? (
                        <Box>
                            <Card sx={{ mb: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Thông tin báo cáo</Typography>
                                    
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                        <Box sx={{ flex: 1, minWidth: 200 }}>
                                            <Typography variant="body1"><strong>ID:</strong> {selectedReport.id}</Typography>
                                            <Typography variant="body1"><strong>Loại báo cáo:</strong> {getReportType(selectedReport.type)}</Typography>
                                            <Typography variant="body1">
                                                <strong>Trạng thái:</strong> 
                                                <Chip 
                                                    label={getReportStatus(selectedReport.status)} 
                                                    color={getStatusColor(selectedReport.status)} 
                                                    size="small" 
                                                    sx={{ ml: 1 }}
                                                />
                                            </Typography>
                                            <Typography variant="body1"><strong>Điểm đạo văn:</strong> {selectedReport.plagiarismScore || "Không có"}</Typography>
                                        </Box>
                                        
                                        <Box sx={{ flex: 1, minWidth: 200 }}>
                                            <Typography variant="body1"><strong>Thời gian tạo:</strong> {selectedReport.createdTime ? new Date(selectedReport.createdTime).toLocaleString() : "Không xác định"}</Typography>
                                            <Typography variant="body1"><strong>Là hệ thống:</strong> {selectedReport.isSystem ? "Có" : "Không"}</Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body1"><strong>Lý do báo cáo:</strong></Typography>
                                        <Typography variant="body2" sx={{ p: 2, bgcolor: '#fff', borderRadius: 1, mt: 1 }}>
                                            {selectedReport.reportReason || "Không có lý do"}
                                        </Typography>
                                    </Box>
                                    
                                    {selectedReport.resolveResponse && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body1"><strong>Phản hồi xử lý:</strong></Typography>
                                            <Typography variant="body2" sx={{ p: 2, bgcolor: '#fff', borderRadius: 1, mt: 1 }}>
                                                {selectedReport.resolveResponse}
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            <Card sx={{ mb: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Người báo cáo</Typography>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar 
                                            src={selectedReport.reportReportUser?.avatar} 
                                            alt={selectedReport.reportReportUser?.fullName} 
                                            sx={{ width: 60, height: 60 }}
                                        />
                                        <Box>
                                            <Typography variant="body1"><strong>Tên:</strong> {selectedReport.reportReportUser?.fullName || "Không có tên"}</Typography>
                                            <Typography variant="body1"><strong>Email:</strong> {selectedReport.reportReportUser?.email || "Không có email"}</Typography>
                                            <Typography variant="body1"><strong>Số điện thoại:</strong> {selectedReport.reportReportUser?.phoneNumber || "Không có số điện thoại"}</Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {selectedReport.poem && (
                                <Card sx={{ mb: 2, boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Bài thơ được báo cáo</Typography>
                                        
                                        <Typography variant="body1"><strong>ID:</strong> {selectedReport.poem.id}</Typography>
                                        <Typography variant="body1"><strong>Tiêu đề:</strong> {selectedReport.poem.title}</Typography>
                                        <Typography variant="body1"><strong>Điểm:</strong> {selectedReport.poem.score}</Typography>
                                        
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body1"><strong>Mô tả:</strong></Typography>
                                            <Typography variant="body2" sx={{ p: 2, bgcolor: '#fff', borderRadius: 1, mt: 1 }}>
                                                {selectedReport.poem.description || "Không có mô tả"}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            {selectedReport.plagiarismFromPoems && selectedReport.plagiarismFromPoems.length > 0 && (
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, color: "#795548" }}>Bài thơ đạo văn</Typography>
                                        
                                        {selectedReport.plagiarismFromPoems.map((poem, index) => (
                                            <Box key={poem.id} sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                                                <Typography variant="body1"><strong>ID:</strong> {poem.id}</Typography>
                                                <Typography variant="body1"><strong>Tiêu đề:</strong> {poem.title}</Typography>
                                                <Typography variant="body1"><strong>Điểm đạo văn:</strong> {poem.score}</Typography>
                                                
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body1"><strong>Mô tả:</strong></Typography>
                                                    <Typography variant="body2" sx={{ p: 1, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                                                        {poem.description || "Không có mô tả"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
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

export default ReportFromUser;