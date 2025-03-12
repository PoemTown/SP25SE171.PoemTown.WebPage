import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography
} from "@mui/material";
import { 
    Dashboard, Logout, Gavel, Assignment, ReceiptLong, ManageAccounts, 
    LibraryBooks, Collections, Report, Notifications, ShoppingCart
} from "@mui/icons-material";
import TransactionsManagement from "./Tabs/TransactionsManagement";
import OrderManagement from "./Tabs/OrderManagement";

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
                    "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", background: "#24292e", color: "#fff" },
                }}
            >
                <Box sx={{ p: 2, textAlign: "center", borderBottom: "1px solid #444" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>Admin Panel</Typography>
                </Box>
                <List>
                    {[ 
                        { key: "moderators", icon: <Gavel />, text: "Moderators Management" },
                        { key: "templates", icon: <Assignment />, text: "Templates Management" },
                        { key: "dashboard", icon: <Dashboard />, text: "Dashboard" },
                        { key: "transactions", icon: <ReceiptLong />, text: "Transactions Management" },
                        { key: "orders", icon: <ShoppingCart />, text: "Order Management" },
                        { key: "accounts", icon: <ManageAccounts />, text: "Account User Management" },
                        { key: "poems", icon: <LibraryBooks />, text: "Poems Management" },
                        { key: "community-collections", icon: <Collections />, text: "Community Collections Management" },
                        { key: "reports", icon: <Report />, text: "Reports from Users" },
                        { key: "notifications", icon: <Notifications />, text: "Notification Management" },
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
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ flexGrow: 1 }} />
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={handleLogout} 
                        sx={{ backgroundColor: "#24292e", "&:hover": { backgroundColor: "#b71c1c" }, color: "#fff" }}
                    >
                        <ListItemIcon><Logout sx={{ color: "#fff" }} /></ListItemIcon>
                        <ListItemText primary="Đăng xuất" />
                    </ListItemButton>
                </ListItem>
            </Drawer>

            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>Trang: {currentPage}</Typography>
                {currentPage === "transactions" && <TransactionsManagement />}
                {currentPage === "orders" && <OrderManagement />}
            </Box>
        </Box>
    );
};

export default AdminPage;
