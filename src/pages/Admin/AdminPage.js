import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography
} from "@mui/material";
import { 
    Dashboard, Logout, Gavel, Assignment, ReceiptLong, ManageAccounts, 
    LibraryBooks, Collections, Report, Notifications, ShoppingCart, Home, Wallet,
    Category, Group, Description, MonetizationOn, CollectionsBookmark, 
    RateReview, RequestQuote, PeopleAlt, Title as TitleIcon
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

const drawerWidth = 280;

const AdminPage = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem("currentPage") || "dashboard";
    });

    useEffect(() => {
        localStorage.setItem("currentPage", currentPage);
    }, [currentPage]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        navigate("/login");
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": { 
                        width: drawerWidth, 
                        boxSizing: "border-box", 
                        background: "#24292e", 
                        color: "#fff" 
                    },
                }}
            >
                <Box sx={{ p: 2, textAlign: "center", borderBottom: "1px solid #444" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>Admin Panel</Typography>
                </Box>
                <List>
                    {[  
                        { key: "dashboard", icon: <Dashboard />, text: "Dashboard" },
                        { key: "moderators", icon: <Gavel />, text: "Moderators" },
                        { key: "templates", icon: <Description />, text: "Templates" },
                        { key: "transactions", icon: <MonetizationOn />, text: "Transactions" },
                        { key: "orders", icon: <ShoppingCart />, text: "Orders" },
                        { key: "accounts", icon: <PeopleAlt />, text: "User Accounts" },
                        { key: "poems", icon: <LibraryBooks />, text: "Poems" },
                        { key: "poemtypes", icon: <Category />, text: "Poem Types" },
                        { key: "titlesamples", icon: <TitleIcon />, text: "Title Samples" }, 
                        { key: "poetsamples", icon: <CollectionsBookmark />, text: "Poet Samples" },
                        // { key: "community-collections", icon: <Group />, text: "Community Collections" },
                        { key: "reports", icon: <RateReview />, text: "User Reports" },
                        { key: "requests", icon: <RequestQuote />, text: "User Requests" },
                        { key: "notifications", icon: <Notifications />, text: "Notifications" },
                    ].map((item) => (
                        <ListItem disablePadding key={item.key}>
                            <ListItemButton 
                                onClick={() => setCurrentPage(item.key)}
                                sx={{
                                    backgroundColor: currentPage === item.key ? "#1976d2" : "inherit",
                                    "&:hover": { backgroundColor: currentPage === item.key ? "#1976d2" : "#444" }
                                }}
                            >
                                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ 
                                        fontSize: '0.875rem',
                                        fontWeight: 'medium'
                                    }} 
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                
                <Box sx={{ flexGrow: 1 }} />
                
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={() => navigate("/")} 
                        sx={{ 
                            backgroundColor: "#24292e", 
                            "&:hover": { backgroundColor: "#1e88e5" }, 
                            color: "#fff" 
                        }}
                    >
                        <ListItemIcon><Home sx={{ color: "#fff" }} /></ListItemIcon>
                        <ListItemText 
                            primary="Back to Home" 
                            primaryTypographyProps={{ fontSize: '0.875rem' }} 
                        />
                    </ListItemButton>
                </ListItem>
                
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={handleLogout} 
                        sx={{ 
                            backgroundColor: "#24292e", 
                            "&:hover": { backgroundColor: "#b71c1c" }, 
                            color: "#fff" 
                        }}
                    >
                        <ListItemIcon><Logout sx={{ color: "#fff" }} /></ListItemIcon>
                        <ListItemText 
                            primary="Logout" 
                            primaryTypographyProps={{ fontSize: '0.875rem' }} 
                        />
                    </ListItemButton>
                </ListItem>
            </Drawer>

            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1).replace('-', ' ')}
                </Typography>
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
            </Box>
        </Box>
    );
};

export default AdminPage;