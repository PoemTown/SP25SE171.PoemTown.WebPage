import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Snackbar,
  TextField,
  Grid,
  InputAdornment,
  colors
} from '@mui/material';
import { Add, Delete, Edit, ColorLens } from '@mui/icons-material';

const PoemTypeManagement = () => {
  // State management
  const [poemTypes, setPoemTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [newPoemType, setNewPoemType] = useState({
    name: '',
    description: '',
    color: '#3f51b5'
  });
  const [editingType, setEditingType] = useState({
    id: '',
    name: '',
    guideLine:'',
    description: '',
    color: '#3f51b5'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Color suggestions from Material-UI palette
  const colorSuggestions = [
    colors.red[500],
    colors.pink[500],
    colors.purple[500],
    colors.deepPurple[500],
    colors.indigo[500],
    colors.blue[500],
    colors.lightBlue[500],
    colors.cyan[500],
    colors.teal[500],
    colors.green[500],
    colors.lightGreen[500],
    colors.lime[500],
    colors.yellow[500],
    colors.amber[500],
    colors.orange[500],
    colors.deepOrange[500],
    colors.brown[500],
    colors.grey[500],
    colors.blueGrey[500],
  ];

  // Fetch poem types from API
  const fetchPoemTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poem-types/v1`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      if (data.statusCode === 200) {
        setPoemTypes(Array.isArray(data.data) ? data.data.filter(item => item !== null) : []);
      } else {
        setError(data.message || 'Failed to fetch poem types');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoemTypes();
  }, []);

  // Dialog handlers
  const handleOpenViewDialog = (poemType) => {
    if (!poemType) return;
    setSelectedType(poemType);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedType(null);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewPoemType({
      name: '',
      description: '',
      color: '#3f51b5'
    });
  };

  const handleOpenEditDialog = () => {
    if (!selectedType) return;
    setEditingType({
      id: selectedType.id,
      name: selectedType.name,
      guideLine: selectedType.guideLine,
      description: selectedType.description,
      color: selectedType.color
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingType({
      id: '',
      name: '',
      guideLine:'',
      description: '',
      color: '#3f51b5'
    });
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPoemType(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingType(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (color) => {
    setNewPoemType(prev => ({
      ...prev,
      color
    }));
  };

  const handleEditColorChange = (color) => {
    setEditingType(prev => ({
      ...prev,
      color
    }));
  };

  // API operations
  const handleCreate = async () => {
    try {
      // Validate form
      if (!newPoemType.name || !newPoemType.description || !newPoemType.color) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin',
          severity: 'error'
        });
        return;
      }

      setIsCreating(true);
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy access token. Vui lòng đăng nhập lại.');
      }

      // Create new poem type
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poem-types/v1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(newPoemType)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Tạo thể loại thất bại');
      }

      setSnackbar({
        open: true,
        message: 'Tạo thể loại thơ mới thành công',
        severity: 'success'
      });
      
      handleCloseCreateDialog();
      await fetchPoemTypes(); // Fetch lại dữ liệu sau khi tạo mới
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async () => {
    try {
      // Validate form
      if (!editingType.name || !editingType.description || !editingType.color || !editingType.guideLine) {
        setSnackbar({
          open: true,
          message: 'Vui lòng điền đầy đủ thông tin',
          severity: 'error'
        });
        return;
      }

      setIsEditing(true);
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy access token. Vui lòng đăng nhập lại.');
      }

      // Update poem type
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/poem-types/v1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: editingType.id,
          name: editingType.name,
          guideLine: editingType.guideLine,
          description: editingType.description,
          color: editingType.color
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Cập nhật thất bại');
      }

      setSnackbar({
        open: true,
        message: 'Cập nhật thể loại thành công',
        severity: 'success'
      });
      
      handleCloseEditDialog();
      handleCloseViewDialog();
      await fetchPoemTypes(); // Fetch lại dữ liệu sau khi chỉnh sửa
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType || !selectedType.id) {
      setSnackbar({
        open: true,
        message: 'Không tìm thấy ID thể loại để xóa',
        severity: 'error'
      });
      return;
    }

    try {
      setIsDeleting(true);
      
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy access token. Vui lòng đăng nhập lại.');
      }

      // Delete poem type
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/poem-types/v1/${selectedType.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Xóa thể loại thất bại');
      }

      setSnackbar({
        open: true,
        message: `Đã xóa thành công thể loại "${selectedType.name}"`,
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      handleCloseViewDialog();
      await fetchPoemTypes(); // Fetch lại dữ liệu sau khi xóa
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Render loading state
  if (loading && poemTypes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý thể loại thơ
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
        >
          Thêm thể loại
        </Button>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main table */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên thể loại</TableCell>
                <TableCell>Cách làm thơ</TableCell>
                <TableCell>Màu sắc</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {poemTypes.length > 0 ? (
                poemTypes.map((type, index) => (
                  <TableRow key={type?.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">{type?.name || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {type?.guideLine || 'Không có mô tả'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {type?.color ? (
                        <Chip 
                          label={type.color} 
                          sx={{ 
                            backgroundColor: type.color, 
                            color: 'white',
                            width: 100
                          }} 
                        />
                      ) : (
                        <Chip label="N/A" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleOpenViewDialog(type)}
                        disabled={!type}
                      >
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Typography color="textSecondary">
                        {error ? 'Đã xảy ra lỗi khi tải dữ liệu' : 'Không có dữ liệu thể loại thơ'}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Details Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        {selectedType && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Box 
                    width={16} 
                    height={16} 
                    bgcolor={selectedType.color} 
                    mr={2} 
                    borderRadius="50%" 
                  />
                  {selectedType.name}
                </Box>
                <Box>
                  <IconButton
                    color="primary"
                    onClick={handleOpenEditDialog}
                    aria-label="edit"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={handleOpenDeleteDialog}
                    aria-label="delete"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <DialogContentText paragraph>
                <strong>ID:</strong> {selectedType.id}
              </DialogContentText>
              <DialogContentText paragraph>
                <strong>Màu sắc:</strong> 
                <Chip 
                  label={selectedType.color} 
                  sx={{ 
                    backgroundColor: selectedType.color, 
                    color: 'white',
                    ml: 1
                  }} 
                />
              </DialogContentText>
              <DialogContentText>
                <strong>Cách làm:</strong>
              </DialogContentText>
              <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'grey.100' }}>
                <Typography>{selectedType.guideLine || "Chưa có"}</Typography>
              </Paper>
              <DialogContentText sx={{ mt: 2}}>
                <strong>Mô tả:</strong>
              </DialogContentText>
              <Paper elevation={0} sx={{ p: 2, mt: 1, bgcolor: 'grey.100' }}>
                <Typography>{selectedType.description}</Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thể loại <strong>"{selectedType?.name}"</strong>?
          </DialogContentText>
          <Box mt={2} display="flex" alignItems="center">
            <Box 
              width={16} 
              height={16} 
              bgcolor={selectedType?.color} 
              mr={1} 
              borderRadius="50%" 
            />
            <Chip 
              label={selectedType?.color} 
              size="small"
              sx={{ 
                backgroundColor: selectedType?.color, 
                color: 'white',
              }} 
            />
          </Box>
          <Typography variant="body2" color="textSecondary" mt={2}>
            {selectedType?.description}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            startIcon={isDeleting ? <CircularProgress size={24} color="inherit" /> : <Delete />}
            disabled={isDeleting}
          >
            {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create New Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo thể loại thơ mới</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên thể loại"
                name="name"
                value={newPoemType.name}
                onChange={handleInputChange}
                required
                disabled={isCreating}
                error={!newPoemType.name}
                helperText={!newPoemType.name ? 'Vui lòng nhập tên thể loại' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cách làm thơ"
                name="guideLine"
                value={newPoemType.guideLine}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                disabled={isCreating}
                error={!newPoemType.guideLine}
                helperText={!newPoemType.guideLine ? 'Vui lòng nhập cách làm thơ' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={newPoemType.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
                disabled={isCreating}
                error={!newPoemType.description}
                helperText={!newPoemType.description ? 'Vui lòng nhập mô tả' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Màu sắc"
                name="color"
                value={newPoemType.color}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        width={20}
                        height={20}
                        bgcolor={newPoemType.color}
                        borderRadius="4px"
                        border="1px solid #ccc"
                        mr={1}
                      />
                    </InputAdornment>
                  ),
                }}
                required
                disabled={isCreating}
                error={!newPoemType.color}
                helperText={!newPoemType.color ? 'Vui lòng chọn màu sắc' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Gợi ý màu sắc:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {colorSuggestions.map((color) => (
                  <Box
                    key={color}
                    width={30}
                    height={30}
                    bgcolor={color}
                    borderRadius="50%"
                    sx={{ 
                      cursor: isCreating ? 'not-allowed' : 'pointer',
                      opacity: isCreating ? 0.5 : 1
                    }}
                    onClick={() => !isCreating && handleColorChange(color)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleCreate} 
            color="primary"
            variant="contained"
            startIcon={isCreating ? <CircularProgress size={24} color="inherit" /> : <Add />}
            disabled={isCreating || !newPoemType.name || !newPoemType.description || !newPoemType.color}
          >
            {isCreating ? 'Đang tạo...' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thể loại</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên thể loại"
                name="name"
                value={editingType.name}
                onChange={handleEditInputChange}
                required
                disabled={isEditing}
                error={!editingType.name}
                helperText={!editingType.name ? 'Vui lòng nhập tên thể loại' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cách làm thơ"
                name="guideLine"
                value={editingType.guideLine}
                onChange={handleEditInputChange}
                multiline
                rows={4}
                required
                disabled={isEditing}
                error={!editingType.guideLine}
                helperText={!editingType.guideLine ? 'Vui lòng nhập cách làm thơ' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={editingType.description}
                onChange={handleEditInputChange}
                multiline
                rows={4}
                required
                disabled={isEditing}
                error={!editingType.description}
                helperText={!editingType.description ? 'Vui lòng nhập mô tả' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Màu sắc"
                name="color"
                value={editingType.color}
                onChange={handleEditInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        width={20}
                        height={20}
                        bgcolor={editingType.color}
                        borderRadius="4px"
                        border="1px solid #ccc"
                        mr={1}
                      />
                    </InputAdornment>
                  ),
                }}
                required
                disabled={isEditing}
                error={!editingType.color}
                helperText={!editingType.color ? 'Vui lòng chọn màu sắc' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Gợi ý màu sắc:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {colorSuggestions.map((color) => (
                  <Box
                    key={color}
                    width={30}
                    height={30}
                    bgcolor={color}
                    borderRadius="50%"
                    sx={{ 
                      cursor: isEditing ? 'not-allowed' : 'pointer',
                      opacity: isEditing ? 0.5 : 1
                    }}
                    onClick={() => !isEditing && handleEditColorChange(color)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={isEditing}>
            Hủy bỏ
          </Button>
          <Button 
            onClick={handleEdit} 
            color="primary"
            variant="contained"
            startIcon={isEditing ? <CircularProgress size={24} color="inherit" /> : <Edit />}
            disabled={isEditing || !editingType.name || !editingType.description || !editingType.color}
          >
            {isEditing ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PoemTypeManagement;