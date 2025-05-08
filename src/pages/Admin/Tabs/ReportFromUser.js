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
    InputLabel,
    Alert
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
    const [poemDetect, setPoemDetect] = useState(null);
    const [plagiarismFromPoems, setPlagiarismFromPoems] = useState([]);
    const [selectedPlagiarismIndex, setSelectedPlagiarismIndex] = useState(0);
    const [showViewOnlyAlert, setShowViewOnlyAlert] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [currentPage, pageSize, sortOption]);

    const fetchReports = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/reports/v1/reports?sortOptions=${sortOption}&pageNumber=${currentPage}&pageSize=${pageSize}`,
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
        setResolveResponse(report.resolveResponse || "");
        setOpenDialog(true);
        setShowViewOnlyAlert(report.status !== 1);

        if (report.isSystem === true) {
            setPoemDetect(report.poem);
            setPlagiarismFromPoems(report.plagiarismFromPoems);
            setSelectedPlagiarismIndex(0);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReport(null);
        setPoemDetect(null);
        setPlagiarismFromPoems([]);
        setSelectedPlagiarismIndex(0);
        setShowViewOnlyAlert(false);
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
                `${process.env.REACT_APP_API_BASE_URL}/reports/v1/resolve`,
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

    const isEditable = selectedReport?.status === 1;

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
          

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
                                <TableCell><strong>Mô tả</strong></TableCell>
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
                                    <TableCell style={{}}>{report?.reportReason || "Không có lý do"}</TableCell>
                                    <TableCell>{report?.reportMessage?.description || "Không có mô tả"}</TableCell>
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
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>
                    {isEditable ? "Cập nhật trạng thái báo cáo" : "Chi tiết báo cáo"}
                </DialogTitle>
                <DialogContent>
                    {showViewOnlyAlert && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Báo cáo này đã được xử lý và không thể chỉnh sửa.
                        </Alert>
                    )}

                    {selectedReport && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Loại báo cáo:</strong> {getReportType(selectedReport.type)}
                            </Typography>
                            
                            {/* Phần thông tin báo cáo được cải thiện */}
                            <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Thông tin báo cáo
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <div>
                                        <Typography component="span" sx={{ fontWeight: 'bold' }}>Lý do báo cáo: </Typography>
                                        <Typography component="span">
                                            {selectedReport.reportReason || "Không có lý do cụ thể"}
                                        </Typography>
                                    </div>
                                    
                                    <div>
                                        <Typography component="span" sx={{ fontWeight: 'bold' }}>Mô tả chi tiết: </Typography>
                                        <Typography component="span">
                                            {selectedReport?.reportMessage?.description || "Không có mô tả chi tiết"}
                                        </Typography>
                                    </div>
                                </Box>
                            </Box>

                            <Typography variant="subtitle1" gutterBottom>
                                <strong>Người báo cáo:</strong> {selectedReport.reportReportUser?.fullName || "Không có tên"}
                            </Typography>

                            {selectedReport.isSystem === true && plagiarismFromPoems.length > 0 ? (
                                <>
                                    <div style={{ display: "flex", flexDirection: "row", marginTop: "16px" }}>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <label style={{ fontWeight: "bold", textAlign: "center" }}>Bài thơ bị báo cáo</label>
                                        </div>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <label style={{ fontWeight: "bold", textAlign: "center" }}>Bài thơ bị đạo</label>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
                                            <p style={{ margin: 0, paddingTop: "10px" }}>Tựa đề: {poemDetect.title} </p>
                                        </div>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <FormControl fullWidth sx={{ mt: 2 }}>
                                                <InputLabel id="plagiarism-poem-select-label">Chọn bài thơ đạo văn</InputLabel>
                                                <Select
                                                    labelId="plagiarism-poem-select-label"
                                                    value={selectedPlagiarismIndex}
                                                    label="Chọn bài thơ bị đạo văn"
                                                    onChange={(e) => setSelectedPlagiarismIndex(e.target.value)}
                                                    disabled={!isEditable}
                                                >
                                                    {plagiarismFromPoems.map((poem, index) => (
                                                        <MenuItem key={index} value={index}>
                                                            {poem.title}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <p style={{ margin: 0 }}>Mô tả: {poemDetect.description}</p>
                                        </div>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <p style={{ margin: 0 }}>Mô tả: {plagiarismFromPoems[selectedPlagiarismIndex].description}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <p style={{ margin: 0 }}>Thể loại: {poemDetect?.type?.name}</p>
                                        </div>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                            <p style={{ margin: 0 }}>Thể loại: {plagiarismFromPoems[selectedPlagiarismIndex]?.type?.name}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: "16px" }}>
                                        <p style={{ margin: 0, textAlign: "center", fontWeight: "bold" }}>
                                            Giống: <span style={{ color: "red" }}>
                                                {(plagiarismFromPoems[selectedPlagiarismIndex].score * 100).toFixed(0)}%
                                            </span>
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", marginTop: "16px" }}>
                                        <div style={{ flex: 1, display: "flex", alignItems: "center", flexDirection: "column" }}>
                                            <textarea
                                                value={poemDetect?.content || ""}
                                                style={{ height: "300px", width: "100%", padding: "10px 20px", boxSizing: "border-box", resize: "none" }}
                                                readOnly
                                            ></textarea>
                                        </div>
                                        <div style={{ flex: 1, display: "flex", alignItems: "center", flexDirection: "column" }}>
                                            <textarea
                                                value={plagiarismFromPoems[selectedPlagiarismIndex].content}
                                                style={{ height: "300px", width: "100%", padding: "10px 20px", boxSizing: "border-box", resize: "none" }}
                                                readOnly
                                            ></textarea>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                            {selectedReport?.type === 1 && (
                                <div>
                                    <h3 style={{ textAlign: "center" }}>Bài thơ bị báo cáo</h3>
                                    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
                                        <div style={{
                                            width: "168px",
                                            height: "268px",
                                            border: "1px solid #000",
                                            marginLeft: "20px",
                                            alignSelf: "center"
                                        }}>
                                            <img src={selectedReport?.poem?.poemImage} alt="poem image" style={{
                                                width: "168px",
                                                maxWidth: "168px",
                                                height: "100%",
                                                objectFit: "cover",
                                                objectPosition: "center"
                                            }} />
                                        </div>
                                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
                                                <p style={{ margin: 0, paddingTop: "10px" }}><span style={{ fontWeight: "bold" }}>Tựa đề:</span> {selectedReport?.poem?.title} </p>
                                            </div>
                                            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                                <p style={{ margin: 0 }}><span style={{ fontWeight: "bold" }}>Mô tả:</span> {selectedReport?.poem?.description}</p>
                                            </div>
                                            <p style={{ fontWeight: "bold", margin: 0 }}>Nội dung:</p>
                                            <textarea
                                                value={selectedReport?.poem?.content || ""}
                                                style={{ height: "250px", width: "100%", padding: "10px 20px", boxSizing: "border-box", resize: "none" }}
                                                readOnly
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Trạng thái</InputLabel>
                                <Select
                                    value={status}
                                    label="Trạng thái"
                                    onChange={handleStatusChange}
                                    disabled={!isEditable}
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
                                disabled={!isEditable}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Đóng</Button>
                    {isEditable && (
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                        >
                            Lưu thay đổi
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReportFromUser;