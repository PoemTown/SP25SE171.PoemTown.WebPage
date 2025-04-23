import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography, Divider, Toolbar, CssBaseline, Avatar, useTheme
} from "@mui/material";
import { 
    Logout, LibraryBooks, Collections, Report, Notifications, 
    ManageAccounts, Home, Category,Chat
} from "@mui/icons-material";
import { Title as TitleIcon } from '@mui/icons-material';
import ReportFromUser from "../Admin/Tabs/ReportFromUser";
import PoemManagement from "../Admin/Tabs/PoemManagement";
import PoetSamplesManagement from "../Admin/Tabs/PoetSamplesManagement";
import CommunityCollectionManagement from "../Admin/Tabs/CommunityCollectionManagement";
import AccountManagement from "../Admin/Tabs/AccountManagement";
import PoemTypeManagement from "../Admin/Tabs/PoemTypeManagement";
import TitleSamplesManagement from "../Admin/Tabs/TitleSamplesManagement";
import DailyMessagesManagement from "../Admin/Tabs/DailyMessagesManagement";
const drawerWidth = 260;

const ModeratorPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem("currentPage") || "reports";
    });
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        localStorage.setItem("currentPage", currentPage);
        const storedAvatar = JSON.parse(localStorage.getItem("avatar")) 
        setAvatarUrl(storedAvatar);
    }, [currentPage]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    };

    const menuItems = [
        { 
            title: "Quản lý chính", 
            items: [
                { key: "reports", icon: <Report />, text: "Báo cáo từ người dùng" },
                { key: "poems", icon: <LibraryBooks />, text: "Bài thơ" },
                { key: "poetsamples", icon: <Collections />, text: "Nhà thơ nổi tiếng" },
            ]
        },
        { 
            title: "Quản lý khác", 
            items: [
                { key: "users", icon: <ManageAccounts />, text: "Tài khoản người dùng" },
                { key: "poemtypes", icon: <Category />, text: "Thể loại thơ" },
                { key: "titlesamples", icon: <TitleIcon />, text: "Mẫu danh hiệu" },
                { key: "dailymessages", icon: <Chat />, text: "Thông nghiệp hằng ngày" },
            ]
        }
    ];

    const getPageTitle = (key) => {
        const pageTitles = {
            "reports": "Quản lý báo cáo",
            "poems": "Quản lý bài thơ",
            "poetsamples": "Quản lý nhà thơ",
            "users": "Quản lý người dùng",
            "poemtypes": "Quản lý thể loại thơ",
            "titlesamples": "Quản lý mẫu danh hiệu",
            "dailymessages": "Quản lý tin nhắn hàng ngày",
        };
        return pageTitles[key] || key;
    };

    return (
        <Box sx={{ display: 'flex', bgcolor: '#f8f5f0', minHeight: '100vh', backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
            <CssBaseline />
            
            {/* Vintage Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: 'linear-gradient(195deg, #6d5c4d, #4a3f35)',
                        color: 'rgba(255, 248, 240, 0.8)',
                        borderRight: 'none',
                        boxShadow: 'inset -5px 0 10px -5px rgba(0, 0, 0, 0.3)',
                    },
                }}
            >
                <Toolbar sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    px: [1],
                    py: 3,
                    borderBottom: '1px solid rgba(255, 248, 240, 0.12)',
                    background: 'rgba(60, 50, 40, 0.3)'
                }}>
                    <Avatar 
                        src={avatarUrl}
                        sx={{ 
                            width: 44, 
                            height: 44, 
                            mr: 2,
                            bgcolor: '#8c7b6b',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                            border: '2px solid #d9c7b8',
                            filter: 'sepia(30%)'
                        }}
                    />
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div"
                        sx={{ 
                            fontWeight: 600,
                            color: '#e8d8c0',
                            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                            letterSpacing: '0.5px',
                            fontFamily: '"Times New Roman", serif'
                        }}
                    >
                        Trang điều hành
                    </Typography>
                </Toolbar>
                
                <Box sx={{ overflow: 'auto', px: 2 }}>
                    {menuItems.map((section, index) => (
                        <React.Fragment key={index}>
                            <Typography 
                                variant="overline" 
                                sx={{ 
                                    display: 'block', 
                                    mt: index !== 0 ? 2 : 1, 
                                    mb: 1, 
                                    px: 2,
                                    color: 'rgba(232, 216, 192, 0.7)',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase',
                                    fontFamily: '"Times New Roman", serif'
                                }}
                            >
                                {section.title}
                            </Typography>
                            <List>
                                {section.items.map((item) => (
                                    <ListItem 
                                        disablePadding 
                                        key={item.key}
                                        sx={{
                                            mb: 0.5,
                                            borderRadius: 1,
                                            overflow: 'hidden',
                                            '&:hover': {
                                                boxShadow: '0 0 8px rgba(220, 200, 180, 0.3)'
                                            }
                                        }}
                                    >
                                        <ListItemButton 
                                            onClick={() => setCurrentPage(item.key)}
                                            sx={{
                                                py: 1,
                                                px: 2,
                                                borderRadius: 1,
                                                backgroundColor: currentPage === item.key ? 
                                                    'rgba(100, 80, 60, 0.4)' : 'transparent',
                                                '&:hover': { 
                                                    backgroundColor: currentPage === item.key ? 
                                                        'rgba(100, 80, 60, 0.4)' : 'rgba(100, 80, 60, 0.2)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <ListItemIcon sx={{ 
                                                color: currentPage === item.key ? 
                                                    '#e8d8c0' : 'rgba(232, 216, 192, 0.6)',
                                                minWidth: '36px'
                                            }}>
                                                {React.cloneElement(item.icon, {
                                                    sx: { 
                                                        filter: currentPage === item.key ? 
                                                            'sepia(60%)' : 'sepia(30%)'
                                                    }
                                                })}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={item.text} 
                                                primaryTypographyProps={{ 
                                                    fontSize: '0.875rem',
                                                    fontWeight: currentPage === item.key ? '500' : '400',
                                                    color: currentPage === item.key ? '#e8d8c0' : 'rgba(232, 216, 192, 0.8)',
                                                    fontFamily: '"Times New Roman", serif'
                                                }} 
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </React.Fragment>
                    ))}
                </Box>
                
                <Box sx={{ mt: 'auto', p: 2 }}>
                    <Divider sx={{ borderColor: 'rgba(232, 216, 192, 0.12)', mb: 2 }} />
                    <ListItemButton 
                        onClick={() => navigate("/")} 
                        sx={{
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            '&:hover': { 
                                backgroundColor: 'rgba(100, 80, 60, 0.2)',
                                boxShadow: '0 0 8px rgba(220, 200, 180, 0.2)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <ListItemIcon sx={{ color: 'rgba(232, 216, 192, 0.6)', minWidth: '36px' }}>
                            <Home sx={{ filter: 'sepia(30%)' }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Về trang chủ" 
                            primaryTypographyProps={{ 
                                fontSize: '0.875rem',
                                color: 'rgba(232, 216, 192, 0.8)',
                                fontFamily: '"Times New Roman", serif'
                            }} 
                        />
                    </ListItemButton>
                    
                    <ListItemButton 
                        onClick={handleLogout} 
                        sx={{
                            py: 1,
                            px: 2,
                            borderRadius: 1,
                            '&:hover': { 
                                backgroundColor: 'rgba(120, 50, 40, 0.3)',
                                boxShadow: '0 0 8px rgba(180, 100, 80, 0.2)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <ListItemIcon sx={{ color: 'rgba(200, 120, 100, 0.8)', minWidth: '36px' }}>
                            <Logout sx={{ filter: 'sepia(40%)' }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Đăng xuất" 
                            primaryTypographyProps={{ 
                                fontSize: '0.875rem',
                                color: 'rgba(232, 216, 192, 0.8)',
                                fontFamily: '"Times New Roman", serif'
                            }} 
                        />
                    </ListItemButton>
                </Box>
            </Drawer>

            {/* Vintage Main Content */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    background: '#f8f5f0',
                    minHeight: '100vh',
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")'
                }}
            >
                <Toolbar />
                <Box
                    sx={{
                        backgroundColor: '#fffaf0',
                        borderRadius: 2,
                        boxShadow: '0 1px 3px rgba(80, 60, 40, 0.2)',
                        p: 3,
                        mb: 3,
                        border: '1px solid #e8d8c0',
                        position: 'relative',
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'linear-gradient(90deg, #8c7b6b, #d9c7b8, #8c7b6b)',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px'
                        }
                    }}
                >
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 700,
                            color: '#5a4a42',
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            fontFamily: '"Times New Roman", serif',
                            '&:before': {
                                content: '""',
                                display: 'block',
                                width: '4px',
                                height: '24px',
                                backgroundColor: '#8c7b6b',
                                mr: 2,
                                borderRadius: '2px'
                            }
                        }}
                    >
                        {getPageTitle(currentPage)}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                        {currentPage === "reports" && <ReportFromUser />}
                        {currentPage === "poems" && <PoemManagement />}
                        {currentPage === "poetsamples" && <PoetSamplesManagement />}
                        {currentPage === "community-collections" && <CommunityCollectionManagement />}
                        {currentPage === "users" && <AccountManagement />}
                        {currentPage === "poemtypes" && <PoemTypeManagement />}
                        {currentPage === "titlesamples" && <TitleSamplesManagement />}
                        {currentPage === "dailymessages" && <DailyMessagesManagement />}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ModeratorPage;