import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    Typography,
    IconButton,
    CircularProgress,
    Alert
} from '@mui/material';
import { Edit, Delete, Add, CheckCircle, Cancel } from '@mui/icons-material';
import axios from 'axios';
import { message, Modal } from 'antd';

const DepositCommissionFeeManagement = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentSetting, setCurrentSetting] = useState(null);
    const [percentage, setPercentage] = useState('');
    const [isInUse, setIsInUse] = useState(false);

    const API_URL = `${process.env.REACT_APP_API_BASE_URL}/deposit-commission-settings/v1`;
    const accessToken = localStorage.getItem("accessToken")
    const headers = {
        "Authorization": `Bearer ${accessToken}`
    }

    const fetchSettings = async () => {
        try {
            const response = await axios.get(API_URL, {
                headers: headers
            });
            console.log(response.data)
            setSettings(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Lỗi tải danh sách phí nạp tiền');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleOpenCreate = () => {
        setCurrentSetting(null);
        setPercentage('');
        setIsInUse(false);
        setOpenDialog(true);
    };

    const handleOpenEdit = (setting) => {
        setCurrentSetting(setting);
        setPercentage(setting.amountPercentage);
        setIsInUse(setting.isInUse);
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        if (!percentage || percentage < 0 || percentage > 100) {
            message.error('Phần trăm phí phải nằm từ 0 - 100!');
            return;
        }

        let settingData;
        if (currentSetting) {
            settingData = {
                id: currentSetting.id,
                amountPercentage: Number(percentage),
                isInUse
            };
        } else {
            settingData = {
                amountPercentage: Number(percentage),
                isInUse
            };
        }

        try {
            if (currentSetting) {
                await axios.put(`${API_URL}`, settingData, {
                    headers: headers
                });
                message.success('Tải danh sách phí nạp tiền thành công');
            } else {
                await axios.post(API_URL, settingData, {
                    headers: headers
                });
                message.success('Tải danh sách phí nạp tiền thành công');
            }
            fetchSettings();
            setOpenDialog(false);
        } catch (err) {
            message.error('Có lỗi xảy ra khi thiết lập phí nạp tiền');
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
          title: 'Xác nhận xóa',
          content: 'Bạn có chắc chắn muốn xóa cài đặt phí này?',
          okText: 'Xóa',
          cancelText: 'Hủy',
          centered: true,
          style: { 
            fontFamily: '"Times New Roman", serif',
          },
          onOk: async () => {
            try {
              await axios.delete(`${API_URL}/${id}`, {
                headers: headers
              });
              message.success('Xóa phí nạp tiền thành công!');
              fetchSettings();
            } catch (err) {
              message.error('Lỗi khi xóa phí nạp tiền');
            }
          },
          onCancel() {
            message.info('Hủy thao tác xóa');
          }
        });
      };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: '#8c7b6b' }} />
        </Box>
    );

    if (error) return (
        <Alert severity="error" sx={{ mt: 2 }}>
            {error}
        </Alert>
    );

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{
                    color: '#5a4a42',
                    fontFamily: '"Times New Roman", serif',
                    fontWeight: 700
                }}>
                    Thiết lập phí nạp tiền
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreate}
                    sx={{
                        bgcolor: '#8c7b6b',
                        '&:hover': { bgcolor: '#6d5c4d' },
                        fontFamily: '"Times New Roman", serif'
                    }}
                >
                    Tạo phí mới
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{
                border: '1px solid #e8d8c0',
                boxShadow: '0 1px 3px rgba(80, 60, 40, 0.2)'
            }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5ebe0' }}>
                        <TableRow>
                            <TableCell sx={{ fontFamily: '"Times New Roman", serif' }}>Phần trăm nạp tiền</TableCell>
                            <TableCell sx={{ fontFamily: '"Times New Roman", serif' }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontFamily: '"Times New Roman", serif' }}>Hành đđộng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {settings.map((setting) => (
                            <TableRow key={setting.id}>
                                <TableCell sx={{ fontFamily: '"Times New Roman", serif' }}>
                                    {setting.amountPercentage}%
                                </TableCell>
                                <TableCell>
                                    {setting.isInUse ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#2e7d32' }}>
                                            <CheckCircle sx={{ mr: 1 }} />
                                            <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>Áp Dụng</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: '#d32f2f' }}>
                                            <Cancel sx={{ mr: 1 }} />
                                            <Typography sx={{ fontFamily: '"Times New Roman", serif' }}>Chưa Áp Dụng</Typography>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenEdit(setting)} sx={{ color: '#8c7b6b' }}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(setting.id)} sx={{ color: '#d32f2f' }}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle sx={{
                    bgcolor: '#f5ebe0',
                    fontFamily: '"Times New Roman", serif',
                    borderBottom: '1px solid #e8d8c0'
                }}>
                    {currentSetting ? 'Chỉnh sửa phí nạp tiền' : 'Tạo phí nạp tiền'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <TextField
                        fullWidth
                        label="Phần trăm phí nạp tiền"
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        InputProps={{ endAdornment: '%' }}
                        sx={{ mb: 2 }}
                        inputProps={{ min: 0, max: 100 }}
                        style={{
                            marginTop: 20
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isInUse}
                                onChange={(e) => setIsInUse(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Áp dụng phí này"
                        sx={{ fontFamily: '"Times New Roman", serif' }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontFamily: '"Times New Roman", serif' }}>
                        Ghi Chú: Khi áp dụng phí nạp tiền mới, phí đang được <br /> áp dụng trước sẽ chuyển đổi thành tắt áp dụng.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ borderTop: '1px solid #e8d8c0' }}>
                    <Button
                        onClick={() => setOpenDialog(false)}
                        sx={{ color: '#5a4a42', fontFamily: '"Times New Roman", serif' }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            bgcolor: '#8c7b6b',
                            '&:hover': { bgcolor: '#6d5c4d' },
                            fontFamily: '"Times New Roman", serif'
                        }}
                    >
                        {currentSetting ? 'Chỉnh sửa' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DepositCommissionFeeManagement;