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
      showSnackbar('Error fetching messages', 'error');
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
      showSnackbar('Message deleted successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error deleting message', 'error');
    } finally {
      setOpenDeleteDialog(false);
      setMessageToDelete(null);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        // Update existing message - ID is passed in the request body
        await api.put('/', formData); // Note: ID is in the body, not endpoint
        showSnackbar('Message updated successfully', 'success');
      } else {
        // Create new message
        await api.post('/', { message: formData.message, isInUse: formData.isInUse });
        showSnackbar('Message created successfully', 'success');
      }
      fetchMessages();
      setOpenForm(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error saving message', 'error');
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
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Daily Messages Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add New Message
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '150px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.map((message, index) => (
              <TableRow key={message.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{message.message}</TableCell>
                <TableCell>
                  <Typography color={message.isInUse ? "primary" : "textSecondary"}>
                    {message.isInUse ? "Active" : "Inactive"}
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

      {/* Add/Edit Form */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{formData.id ? 'Edit Message' : 'Add New Message'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <TextField
              name="message"
              label="Message Content"
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
              label="Active Message"
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
            Are you sure you want to delete this message?
          </Typography>
          <Box sx={{ fontStyle: 'italic', mt: 2, p: 1, backgroundColor: '#f5f5f5' }}>
            "{messageToDelete?.message}"
          </Box>
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

export default DailyMessagesManagement;