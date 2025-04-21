import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, IconButton, 
    Button, TextField, Dialog, DialogActions, 
    DialogContent, DialogTitle, Typography, Snackbar, Alert,
    Avatar, CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, CloudUpload } from '@mui/icons-material';

const API_URL = 'https://api-poemtown-staging.nodfeather.win/api/system-contacts/v1';
const ICON_UPLOAD_URL = `${API_URL}/icon`;

const ContactsManagement = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentContact, setCurrentContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: ''
    });
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const fileInputRef = useRef(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };
    };

    const getAuthHeadersWithContentType = () => {
        return {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
        };
    };

    const fetchContacts = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const data = await response.json();
            setContacts(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            showSnackbar('Failed to load contacts', 'error');
            setLoading(false);
        }
    };

    const handleOpenDialog = (contact = null) => {
        if (contact) {
            setCurrentContact(contact);
            setFormData({
                name: contact.name,
                description: contact.description,
                icon: contact.icon
            });
            setPreviewImage(contact.icon);
        } else {
            setCurrentContact(null);
            setFormData({
                name: '',
                description: '',
                icon: ''
            });
            setPreviewImage(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setPreviewImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            showSnackbar('Please select an image file (JPEG, PNG, etc.)', 'error');
            return;
        }

        // Validate file size (e.g., 2MB max)
        if (file.size > 2 * 1024 * 1024) {
            showSnackbar('File size should be less than 2MB', 'error');
            return;
        }

        try {
            setUploading(true);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);

            // Prepare form data for binary upload
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const response = await fetch(ICON_UPLOAD_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: uploadFormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();
            if (result.statusCode === 201) {
                setFormData(prev => ({ ...prev, icon: result.data }));
                showSnackbar('Icon uploaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error uploading icon:', error);
            showSnackbar(error.message || 'Failed to upload icon', 'error');
            setPreviewImage(null);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.description || !formData.icon) {
            showSnackbar('Please fill all fields and upload an icon', 'error');
            return;
        }

        try {
            let response;
            if (currentContact) {
                const putData = {
                    id: currentContact.id, 
                    name: formData.name,
                    icon: formData.icon,
                    description: formData.description
                };

                // Update existing contact
                response = await fetch(`${API_URL}`, {
                    method: 'PUT',
                    headers: getAuthHeadersWithContentType(),
                    body: JSON.stringify(putData)
                });
            } else {
                // Add new contact (POST request remains the same)
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: getAuthHeadersWithContentType(),
                    body: JSON.stringify({
                        name: formData.name,
                        icon: formData.icon,
                        description: formData.description
                    })
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Request failed');
            }

            showSnackbar(
                currentContact ? 'Contact updated successfully' : 'Contact added successfully',
                'success'
            );
            fetchContacts(); // Refresh the list
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving contact:', error);
            showSnackbar(error.message || 'Failed to save contact', 'error');
        }
    };

    const handleDeleteClick = (id) => {
        setContactToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`${API_URL}/${contactToDelete}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Delete failed');
            }

            showSnackbar('Contact deleted successfully', 'success');
            fetchContacts(); // Refresh the list
        } catch (error) {
            console.error('Error deleting contact:', error);
            showSnackbar(error.message || 'Failed to delete contact', 'error');
        } finally {
            setDeleteConfirmOpen(false);
            setContactToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setContactToDelete(null);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
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

    return (
        <Box>
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Delete"}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Are you sure you want to delete this contact? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Contact
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description/Link</TableCell>
                            <TableCell>Icon</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contacts.map((contact) => (
                            <TableRow key={contact.id}>
                                <TableCell>{contact.name}</TableCell>
                                <TableCell>
                                    <a href={contact.description} target="_blank" rel="noopener noreferrer">
                                        {contact.description}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <Avatar src={contact.icon} alt={contact.name} />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenDialog(contact)}>
                                        <Edit color="primary" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(contact.id)}>
                                        <Delete color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentContact ? 'Edit Contact' : 'Add New Contact'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description/Link"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Icon
                            </Typography>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <Button
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                onClick={triggerFileInput}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload Icon'}
                            </Button>
                            {uploading && (
                                <CircularProgress size={24} sx={{ ml: 2 }} />
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Maximum file size: 2MB. Accepted formats: JPEG, PNG
                            </Typography>
                        </Box>

                        {previewImage && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="caption">Preview:</Typography>
                                <Avatar 
                                    src={previewImage} 
                                    alt="Icon preview" 
                                    sx={{ width: 100, height: 100, mt: 1 }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!formData.name || !formData.description || !formData.icon}
                    >
                        {currentContact ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
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

export default ContactsManagement;