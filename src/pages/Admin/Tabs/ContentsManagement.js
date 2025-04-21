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
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';

const ContentsManagement = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    content: ''
  });

  const accessToken = localStorage.getItem('accessToken');

  const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/content-pages/v1`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/');
      setContents(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
      showSnackbar('Error fetching contents', 'error');
    }
  };

  const handleView = (content) => {
    setCurrentContent(content);
    setOpenDialog(true);
  };

  const handleCreate = () => {
    setCurrentContent(null);
    setFormData({ id: '', title: '', content: '' });
    setOpenForm(true);
  };

  const handleEdit = (content) => {
    setCurrentContent(content);
    setFormData({
      id: content.id,
      title: content.title,
      content: content.content
    });
    setOpenForm(true);
  };

  const handleDeleteClick = (content) => {
    setContentToDelete(content);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/${contentToDelete.id}`);
      fetchContents();
      showSnackbar('Content deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error deleting content', 'error');
    } finally {
      setOpenDeleteDialog(false);
      setContentToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        // Update existing content
        await api.put('/', formData);
        showSnackbar('Content updated successfully', 'success');
      } else {
        // Create new content
        await api.post('/', { title: formData.title, content: formData.content });
        showSnackbar('Content created successfully', 'success');
      }
      fetchContents();
      setOpenForm(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error saving content', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Contents Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add New Content
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contents.map((content, index) => (
              <TableRow key={content.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{content.title}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleView(content)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleEdit(content)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(content)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentContent?.title}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ whiteSpace: 'pre-line', p: 2 }}>
            {currentContent?.content}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Form */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formData.id ? 'Edit Content' : 'Add New Content'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              name="content"
              label="Content"
              value={formData.content}
              onChange={handleChange}
              fullWidth
              multiline
              rows={10}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<CancelIcon />}
            onClick={() => setOpenForm(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{contentToDelete?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default ContentsManagement;