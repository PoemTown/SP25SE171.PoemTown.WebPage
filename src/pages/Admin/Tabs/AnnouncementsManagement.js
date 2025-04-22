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

  const announcementTypes = {
    1: 'Like',
    2: 'Comment',
    3: 'User',
    4: 'Report',
    5: 'Collection',
    6: 'Poem',
    7: 'Transaction',
    8: 'Achievement',
    9: 'Poem Leaderboard',
    10: 'User Leaderboard',
    11: 'Record File',
    12: 'Follower',
    13: 'Withdrawal Form',
    14: 'Chat',
    15: 'System'
  };

  const typeColors = {
    1: 'primary',
    2: 'secondary',
    3: 'info',
    4: 'warning',
    5: 'success',
    6: 'error',
    7: 'primary',
    8: 'secondary',
    9: 'info',
    10: 'warning',
    11: 'success',
    12: 'error',
    13: 'primary',
    14: 'secondary',
    15: 'info'
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page, rowsPerPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const response = await fetch(`https://api-poemtown-staging.nodfeather.win/api/announcements/v1/system?page=${page + 1}&limit=${rowsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        throw new Error('No access token found');
      }

      const response = await fetch('https://api-poemtown-staging.nodfeather.win/api/announcements/v1/system', {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSnackbarMessage('Announcement created successfully!');
      setSnackbarOpen(true);
      setOpenCreateDialog(false);
      setNewAnnouncement({ title: '', content: '' });
      
      // Refresh the announcements list
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
    return date.toLocaleString();
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
        Error: {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" gutterBottom>
          System Announcements Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create New
        </Button>
      </Box>
      
      {announcements.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No announcements found.
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Content</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell>{announcement.title}</TableCell>
                    <TableCell sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {announcement.content}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={announcementTypes[announcement.type] || `Type ${announcement.type}`} 
                        color={typeColors[announcement.type] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      {announcement.isRead ? (
                        <Chip 
                          icon={<CheckCircle />} 
                          label="Read" 
                          color="success" 
                          size="small" 
                        />
                      ) : (
                        <Chip 
                          icon={<Cancel />} 
                          label="Unread" 
                          color="error" 
                          size="small" 
                        />
                      )}
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
          />
        </>
      )}

      {/* Create Announcement Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '400px', pt: 2 }}>
            <TextField
              label="Title"
              name="title"
              value={newAnnouncement.title}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Content"
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
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateAnnouncement} 
            color="primary" 
            variant="contained"
            disabled={!newAnnouncement.title || !newAnnouncement.content}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
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