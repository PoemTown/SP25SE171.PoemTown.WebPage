import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, IconButton, 
    Button, TextField, Dialog, DialogActions, 
    DialogContent, DialogTitle, Typography, Snackbar, Alert,
    Avatar, CircularProgress
} from '@mui/material';
import { Edit, Delete, Add, CloudUpload } from '@mui/icons-material';

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/system-contacts/v1`;
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
            if (!response.ok) throw new Error('Không thể tải danh sách liên hệ');
            const data = await response.json();
            setContacts(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Lỗi khi tải liên hệ:', error);
            showSnackbar('Tải danh sách liên hệ thất bại', 'error');
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

        // Kiểm tra loại file
        if (!file.type.match('image.*')) {
            showSnackbar('Vui lòng chọn file ảnh (JPEG, PNG, v.v.)', 'error');
            return;
        }

        // Kiểm tra kích thước file (tối đa 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showSnackbar('Kích thước file phải nhỏ hơn 2MB', 'error');
            return;
        }

        try {
            setUploading(true);
            
            // Tạo preview
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target.result);
            };
            reader.readAsDataURL(file);

            // Chuẩn bị form data để upload
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);

            const response = await fetch(ICON_UPLOAD_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: uploadFormData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload thất bại');
            }

            const result = await response.json();
            if (result.statusCode === 201) {
                setFormData(prev => ({ ...prev, icon: result.data }));
                showSnackbar('Tải lên biểu tượng thành công', 'success');
            }
        } catch (error) {
            console.error('Lỗi khi tải lên biểu tượng:', error);
            showSnackbar(error.message || 'Tải lên biểu tượng thất bại', 'error');
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
            showSnackbar('Vui lòng điền đầy đủ thông tin và tải lên biểu tượng', 'error');
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

                // Cập nhật liên hệ hiện tại
                response = await fetch(`${API_URL}`, {
                    method: 'PUT',
                    headers: getAuthHeadersWithContentType(),
                    body: JSON.stringify(putData)
                });
            } else {
                // Thêm liên hệ mới
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
                throw new Error(errorData.message || 'Yêu cầu thất bại');
            }

            showSnackbar(
                currentContact ? 'Cập nhật liên hệ thành công' : 'Thêm liên hệ thành công',
                'success'
            );
            fetchContacts(); // Làm mới danh sách
            handleCloseDialog();
        } catch (error) {
            console.error('Lỗi khi lưu liên hệ:', error);
            showSnackbar(error.message || 'Lưu liên hệ thất bại', 'error');
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
                throw new Error(errorData.message || 'Xóa thất bại');
            }

            showSnackbar('Xóa liên hệ thành công', 'success');
            fetchContacts(); // Làm mới danh sách
        } catch (error) {
            console.error('Lỗi khi xóa liên hệ:', error);
            showSnackbar(error.message || 'Xóa liên hệ thất bại', 'error');
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
            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Xác nhận xóa"}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        Bạn có chắc chắn muốn xóa liên hệ này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>Hủy</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Thêm liên hệ
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên</TableCell>
                            <TableCell>Mô tả/Liên kết</TableCell>
                            <TableCell>Biểu tượng</TableCell>
                            <TableCell>Hành động</TableCell>
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
                    {currentContact ? 'Chỉnh sửa liên hệ' : 'Thêm liên hệ mới'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Tên"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Mô tả/Liên kết"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            margin="normal"
                            required
                        />
                        
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Biểu tượng
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
                                {uploading ? 'Đang tải lên...' : 'Tải lên biểu tượng'}
                            </Button>
                            {uploading && (
                                <CircularProgress size={24} sx={{ ml: 2 }} />
                            )}
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Kích thước tối đa: 2MB. Định dạng hỗ trợ: JPEG, PNG
                            </Typography>
                        </Box>

                        {previewImage && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="caption">Xem trước:</Typography>
                                <Avatar 
                                    src={previewImage} 
                                    alt="Xem trước biểu tượng" 
                                    sx={{ width: 100, height: 100, mt: 1 }}
                                />
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained"
                        disabled={!formData.name || !formData.description || !formData.icon}
                    >
                        {currentContact ? 'Cập nhật' : 'Thêm'}
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