import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Refresh, Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const TitleSamplesManagement = () => {
  const [titleSamples, setTitleSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState({ id: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const accessToken = localStorage.getItem('accessToken');

  const fetchTitleSamples = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/title-samples/v1`);
      setTitleSamples(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải dữ liệu mẫu tiêu đề');
      console.error('Error fetching title samples:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTitleSamples();
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    fetchTitleSamples();
  };

  const handleEditClick = (id) => {
    const titleToEdit = titleSamples.find(item => item.id === id);
    if (titleToEdit) {
      setEditingTitle({ id: titleToEdit.id, name: titleToEdit.name });
      setOpenEditDialog(true);
    }
  };

  const handleEditSubmit = async () => {
    if (!editingTitle.name.trim()) {
      setError('Vui lòng nhập tên mẫu tiêu đề');
      return;
    }
  
    try {
      setIsSubmitting(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/title-samples/v1`,
        {
          id: editingTitle.id,
          name: editingTitle.name
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 202) {
        fetchTitleSamples(); 
        setOpenEditDialog(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật mẫu tiêu đề');
      console.error('Error updating title sample:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingTitle({ id: '', name: '' });
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/title-samples/v1/${itemToDelete}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Refresh the list after successful deletion
      await fetchTitleSamples();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa mẫu tiêu đề');
      console.error('Error deleting title sample:', err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleAddNew = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewTitle('');
  };

  const handleSubmitNewTitle = async () => {
    if (!newTitle.trim()) {
      setError('Vui lòng nhập tên mẫu tiêu đề');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/title-samples/v1`,
        { name: newTitle },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 200 || response.status === 201) {
        fetchTitleSamples(); // Refresh the list
        handleCloseAddDialog();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm mẫu tiêu đề mới');
      console.error('Error adding new title sample:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = titleSamples.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = filteredData.sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, filteredData.length - page * rowsPerPage);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Quản lý Mẫu Danh hiệu
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{ mr: 1 }}
          >
            Thêm mới
          </Button>
          <Tooltip title="Làm mới dữ liệu">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TextField
        label="Tìm kiếm theo tên"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', mb: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>STT</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Tên mẫu tiêu đề
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Sửa">
                          <IconButton onClick={() => handleEditClick(row.id)}>
                            <Edit color="primary" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton onClick={() => handleDeleteClick(row.id)}>
                            <Delete color="error" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={3} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} trong ${count}`}
          />
        </Paper>
      )}

      {/* Add New Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Thêm mẫu tiêu đề mới</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên mẫu tiêu đề"
            type="text"
            fullWidth
            variant="standard"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Hủy</Button>
          <Button 
            onClick={handleSubmitNewTitle}
            disabled={isSubmitting || !newTitle.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Chỉnh sửa mẫu tiêu đề</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên mẫu tiêu đề"
            type="text"
            fullWidth
            variant="standard"
            value={editingTitle.name}
            onChange={(e) => setEditingTitle({...editingTitle, name: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Hủy</Button>
          <Button 
            onClick={handleEditSubmit}
            disabled={isSubmitting || !editingTitle.name.trim()}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa mẫu tiêu đề này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TitleSamplesManagement;