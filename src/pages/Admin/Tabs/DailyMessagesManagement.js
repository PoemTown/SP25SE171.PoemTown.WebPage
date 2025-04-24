import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const DailyMessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    id: '',
    message: '',
    isInUse: false
  });

  const accessToken = localStorage.getItem('accessToken');

  const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/daily-messages/v1`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/');
      setMessages(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      showSnackbar('Lỗi khi tải danh sách tin nhắn', 'error');
    }
  };

  const handleCreate = () => {
    setCurrentMessage(null);
    setFormData({ id: '', message: '', isInUse: false });
    setOpenForm(true);
  };

  const handleEdit = (message) => {
    setCurrentMessage(message);
    setFormData({
      id: message.id,
      message: message.message,
      isInUse: message.isInUse
    });
    setOpenForm(true);
  };

  const handleDeleteClick = (message) => {
    setMessageToDelete(message);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/${messageToDelete.id}`);
      fetchMessages();
      showSnackbar('Xóa tin nhắn thành công', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Lỗi khi xóa tin nhắn', 'error');
    } finally {
      setOpenDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await api.put('/', formData);
        showSnackbar('Cập nhật tin nhắn thành công', 'success');
      } else {
        await api.post('/', { message: formData.message, isInUse: formData.isInUse });
        showSnackbar('Thêm tin nhắn mới thành công', 'success');
      }
      fetchMessages();
      setOpenForm(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Lỗi khi lưu tin nhắn', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e) => {
    setFormData(prev => ({ ...prev, isInUse: e.target.checked }));
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography color="error">Lỗi: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Quản lý tin nhắn hàng ngày</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Thêm tin nhắn
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>STT</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nội dung</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message, index) => (
              <TableRow key={message.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{message.message}</TableCell>
                <TableCell>
                  <Typography color={message.isInUse ? "primary" : "textSecondary"}>
                    {message.isInUse ? "Đang hoạt động" : "Không hoạt động"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton color="secondary" onClick={() => handleEdit(message)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(message)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Form thêm/sửa tin nhắn */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formData.id ? 'Chỉnh sửa tin nhắn' : 'Thêm tin nhắn mới'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <TextField
              name="message"
              label="Nội dung tin nhắn"
              value={formData.message}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isInUse}
                  onChange={handleSwitchChange}
                  name="isInUse"
                  color="primary"
                />
              }
              label="Tin nhắn đang hoạt động"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CancelIcon />}
            onClick={() => setOpenForm(false)}
            color="secondary"
          >
            Hủy
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            color="primary"
            variant="contained"
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hộp thoại xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa tin nhắn này không?
          </Typography>
          <Box sx={{ fontStyle: 'italic', mt: 2, p: 1, backgroundColor: '#f5f5f5' }}>
            "{messageToDelete?.message}"
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thông báo snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DailyMessagesManagement;
