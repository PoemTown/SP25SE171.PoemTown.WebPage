import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import {
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Typography
} from "@mui/material";
import { 
    Logout, LibraryBooks, Collections, Report, Notifications, 
    ManageAccounts, Home
} from "@mui/icons-material";
import ReportFromUser from "../Admin/Tabs/ReportFromUser";
import PoemManagement from "../Admin/Tabs/PoemManagement";
import PoetSamplesManagement from "../Admin/Tabs/PoetSamplesManagement";
import CommunityCollectionManagement from "../Admin/Tabs/CommunityCollectionManagement";
import AccountManagement from "../Admin/Tabs/AccountManagement";

const drawerWidth = 280;

const ModeratorPage = () => {
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem("currentPage") || "reports";
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
                        { key: "reports", icon: <Report />, text: "Report Management" },
                        { key: "poems", icon: <LibraryBooks />, text: "Poem Management" },
                        { key: "poetsamples", icon: <Collections />, text: "PoetSamples Management" },
                        { key: "community-collections", icon: <Collections />, text: "Community Collection Management" },
                        { key: "users", icon: <ManageAccounts />, text: "User Management" },
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
                
                {/* Home button */}
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={() => navigate("/")} 
                        sx={{ backgroundColor: "#24292e", "&:hover": { backgroundColor: "#1e88e5" }, color: "#fff" }}
                    >
                        <ListItemIcon><Home sx={{ color: "#fff" }} /></ListItemIcon>
                        <ListItemText primary="Back to Home" />
                    </ListItemButton>
                </ListItem>
                
                {/* Logout button */}
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={handleLogout} 
                        sx={{ backgroundColor: "#24292e", "&:hover": { backgroundColor: "#b71c1c" }, color: "#fff" }}
                    >
                        <ListItemIcon><Logout sx={{ color: "#fff" }} /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItemButton>
                </ListItem>
            </Drawer>

            <Box sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>Page: {currentPage}</Typography>
                {currentPage === "reports" && <ReportFromUser />}
                {currentPage === "poems" && <PoemManagement />}
                {currentPage === "poetsamples" && <PoetSamplesManagement />}
                {currentPage === "community-collections" && <CommunityCollectionManagement />}
                {currentPage === "users" && <AccountManagement />}
            </Box>
        </Box>
    );
};

export default ModeratorPage;