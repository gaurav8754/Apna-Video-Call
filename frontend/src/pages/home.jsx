import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField, Box, Typography, Avatar } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import VideocamIcon from '@mui/icons-material/Videocam';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const currentUser = localStorage.getItem("username") || "User";

    const { addToUserHistory } = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
            {/* Header Navbar */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: { xs: 2.5, sm: 5 },
                    py: 2,
                    backgroundColor: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
                }}
            >
                {/* Brand Logo */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                        sx={{
                            width: 42,
                            height: 42,
                            background: "linear-gradient(135deg, #FF8C00 0%, #D97500 100%)",
                            boxShadow: "0 4px 12px rgba(217, 117, 0, 0.3)",
                        }}
                    >
                        <VideocamIcon sx={{ fontSize: 24, color: "#ffffff" }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: "-0.5px" }}>
                        Apna Video Call
                    </Typography>
                </Box>

                {/* Right Actions & User Info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#64748b", display: { xs: "none", sm: "block" } }}>
                        Welcome, <span style={{ color: "#D97500" }}>{currentUser}</span>
                    </Typography>

                    <Button
                        onClick={() => navigate("/history")}
                        startIcon={<RestoreIcon />}
                        sx={{
                            borderRadius: "10px",
                            px: 2,
                            py: 0.8,
                            fontWeight: 600,
                            textTransform: "none",
                            color: "#0f172a",
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #e2e8f0",
                            "&:hover": {
                                backgroundColor: "#e2e8f0",
                            },
                        }}
                    >
                        History
                    </Button>

                    <Button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("username");
                            navigate("/auth");
                        }}
                        startIcon={<LogoutIcon />}
                        sx={{
                            borderRadius: "10px",
                            px: 2,
                            py: 0.8,
                            fontWeight: 600,
                            textTransform: "none",
                            color: "#ef4444",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            "&:hover": {
                                backgroundColor: "#fee2e2",
                            },
                        }}
                    >
                        Logout
                    </Button>
                </Box>
            </Box>

            {/* Main Content */}
            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2 style={{ marginBottom: "32px", lineHeight: "1.4", color: "#0f172a" }}>
                            Delivering Seamless Video Calls for Smarter Communication
                        </h2>

                        <div style={{ display: 'flex', gap: "12px", alignItems: "center" }}>
                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                id="outlined-basic" 
                                label="Meeting Code" 
                                variant="outlined" 
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "12px",
                                        "& fieldset": { borderColor: "#cbd5e1" },
                                        "&:hover fieldset": { borderColor: "#FF8C00" },
                                        "&.Mui-focused fieldset": { borderColor: "#D97500" },
                                    },
                                    "& .MuiInputLabel-root.Mui-focused": { color: "#D97500" },
                                }}
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant='contained' 
                                style={{
                                    height: "56px",
                                    paddingInline: "28px",
                                    borderRadius: "12px",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    background: "linear-gradient(135deg, #FF8C00 0%, #D97500 100%)",
                                    boxShadow: "0 8px 20px -4px rgba(217, 117, 0, 0.4)",
                                }}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </Box>
    )
}

export default withAuth(HomeComponent)