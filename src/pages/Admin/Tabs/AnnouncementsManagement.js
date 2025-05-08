import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Chip,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import { CheckCircle, Cancel, Add } from '@mui/icons-material';

const AnnouncementsManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchAnnouncements();
  }, [page, rowsPerPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy access token');
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/announcements/v1/system?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
      }

      const data = await response.json();
      setAnnouncements(data.data);
      setTotalRecords(data.totalRecords || data.data.length);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy access token');
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/announcements/v1/system`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newAnnouncement.title,
          content: newAnnouncement.content
        })
      });

      if (!response.ok) {
        throw new Error(`Lỗi HTTP! Mã trạng thái: ${response.status}`);
      }

      const data = await response.json();
      setSnackbarMessage('Tạo thông báo thành công!');
      setSnackbarOpen(true);
      setOpenCreateDialog(false);
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" onClose={() => setError(null)}>
        Lỗi: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo mới
        </Button>
      </Box>

      {announcements.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Không có thông báo nào.
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Thời gian tạo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell style={{
                      textAlign: "justify",

                    }}>{announcement.title}</TableCell>
                    <TableCell sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {announcement.content}
                    </TableCell>
                    <TableCell>{formatDate(announcement.createdTime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalRecords}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số hàng mỗi trang"
          />
        </>
      )}

      {/* Dialog Tạo Thông Báo */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Tạo thông báo mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '400px', pt: 2 }}>
            <TextField
              label="Tiêu đề"
              name="title"
              value={newAnnouncement.title}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Nội dung"
              name="content"
              value={newAnnouncement.content}
              onChange={handleInputChange}
              fullWidth
              required
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button
            onClick={handleCreateAnnouncement}
            color="primary"
            variant="contained"
            disabled={!newAnnouncement.title || !newAnnouncement.content}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thành công */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnnouncementsManagement;
