import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography, Divider, Toolbar, CssBaseline, Avatar, useTheme
} from "@mui/material";
import { 
    Dashboard, Logout, Gavel, Assignment, ReceiptLong, ManageAccounts, 
    LibraryBooks, Collections, Report, Notifications, ShoppingCart, Home, Wallet,
    Category, Group, Description, MonetizationOn, CollectionsBookmark, 
    RateReview, RequestQuote, PeopleAlt, Title as TitleIcon, ContactMail,
    Article, Chat, Announcement, Menu as MenuIcon
} from "@mui/icons-material";
import TransactionsManagement from "./Tabs/TransactionsManagement";
import OrderManagement from "./Tabs/OrderManagement";
import AccountManagement from "./Tabs/AccountManagement";
import TemplateManagement from "./Tabs/TemplateManagement";
import DashboardPage from "./Tabs/Dashboard";
import ModeratorManager from "./Tabs/ModeratorManager";
import PoemManagement from "./Tabs/PoemManagement";
import ReportFromUser from "./Tabs/ReportFromUser";
import PoetSamplesManagement from "./Tabs/PoetSamplesManagement";
import CommunityCollectionManagement from "./Tabs/CommunityCollectionManagement";
import RequestFromUser from "./Tabs/RequestFromUser";
import PoemTypeManagement from "./Tabs/PoemTypeManagement";
import TitleSamplesManagement from "./Tabs/TitleSamplesManagement";
import ContactsManagement from "./Tabs/ContactsManagement";
import ContentsManagement from "./Tabs/ContentsManagement"; 
import DailyMessagesManagement from "./Tabs/DailyMessagesManagement";
import AnnouncementsManagement from "./Tabs/AnnouncementsManagement";

const drawerWidth = 260;

const AdminPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem("currentPage") || "dashboard";
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
            title: "Trang chính", 
            items: [
                { key: "dashboard", icon: <Dashboard />, text: "Bảng thống kê" },
            ]
        },
        { 
            title: "Quản lý", 
            items: [
                { key: "accounts", icon: <PeopleAlt />, text: "Tài khoản người dùng" },
                { key: "moderators", icon: <Gavel />, text: "Quản trị viên" },
                { key: "transactions", icon: <MonetizationOn />, text: "Giao dịch" },
                { key: "orders", icon: <ShoppingCart />, text: "Đơn hàng" },
            ]
        },
        { 
            title: "Nội dung", 
            items: [
                { key: "poems", icon: <LibraryBooks />, text: "Bài thơ" },
                { key: "poemtypes", icon: <Category />, text: "Thể loại thơ" },
                { key: "titlesamples", icon: <TitleIcon />, text: "Mẫu danh hiệu" }, 
                { key: "poetsamples", icon: <CollectionsBookmark />, text: "Nhà thơ nổi tiếng" },
                { key: "templates", icon: <Description />, text: "Mẫu trang trí" },
                { key: "contents", icon: <Article />, text: "Nội dung" },
            ]
        },
        { 
            title: "Giao tiếp", 
            items: [
                { key: "dailymessages", icon: <Chat />, text: "Tin nhắn hàng ngày" },
                { key: "announcements", icon: <Announcement />, text: "Thông báo" },
                { key: "contacts", icon: <ContactMail />, text: "Liên hệ" },
            ]
        },
        { 
            title: "Phản hồi", 
            items: [
                { key: "reports", icon: <RateReview />, text: "Báo cáo từ người dùng" },
                { key: "requests", icon: <RequestQuote />, text: "Yêu cầu từ người dùng" },
            ]
        }
    ];

    const getPageTitle = (key) => {
        const pageTitles = {
            "dashboard": "Bảng thống kê",
            "accounts": "Quản lý tài khoản người dùng",
            "moderators": "Quản lý quản trị viên",
            "transactions": "Quản lý giao dịch",
            "orders": "Quản lý đơn hàng",
            "poems": "Quản lý bài thơ",
            "poemtypes": "Quản lý thể loại thơ",
            "titlesamples": "Quản lý mẫu danh hiệu",
            "poetsamples": "Quản lý nhà thơ",
            "templates": "Quản lý mẫu trang trí",
            "contents": "Quản lý nội dung",
            "dailymessages": "Quản lý tin nhắn hàng ngày",
            "announcements": "Quản lý thông báo",
            "contacts": "Quản lý liên hệ",
            "reports": "Quản lý báo cáo",
            "requests": "Quản lý yêu cầu"
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
                        Trang quản trị
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
                        {currentPage === "transactions" && <TransactionsManagement />}
                        {currentPage === "orders" && <OrderManagement />}
                        {currentPage === "accounts" && <AccountManagement />}
                        {currentPage === "templates" && <TemplateManagement />}
                        {currentPage === "dashboard" && <DashboardPage />}
                        {currentPage === "moderators" && <ModeratorManager />}
                        {currentPage === "poems" && <PoemManagement />}
                        {currentPage === "reports" && <ReportFromUser />}
                        {currentPage === "requests" && <RequestFromUser />}
                        {currentPage === "community-collections" && <CommunityCollectionManagement />}
                        {currentPage === "poetsamples" && <PoetSamplesManagement />}
                        {currentPage === "poemtypes" && <PoemTypeManagement />}
                        {currentPage === "titlesamples" && <TitleSamplesManagement />}
                        {currentPage === "contents" && <ContentsManagement />}
                        {currentPage === "dailymessages" && <DailyMessagesManagement />} 
                        {currentPage === "announcements" && <AnnouncementsManagement />} 
                        {currentPage === "contacts" && <ContactsManagement />}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AdminPage;