import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import VideocamIcon from "@mui/icons-material/Videocam";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Button, Container, Grid, IconButton, Paper, Chip, Tooltip } from "@mui/material";

export default function History() {
  const { getHistoryOfUser, deleteHistoryItem } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        if (Array.isArray(history)) {
          setMeetings(history);
        } else {
          setMeetings([]);
        }
      } catch (err) {
        console.error("Error fetching history:", err);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting history entry?")) return;
    try {
      await deleteHistoryItem(id);
      setMeetings((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      const msg = err?.response?.data?.message || "Only admin (Gaurav Shukla) or meeting owner can delete this history entry.";
      alert(msg);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} at ${hours}:${minutes}`;
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f8fafc", py: 4 }}>
      <Container maxWidth="md">
        {/* Navigation & Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => routeTo("/home")}
            sx={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              "&:hover": { backgroundColor: "#f1f5f9" },
            }}
          >
            <ArrowBackIcon sx={{ color: "#D97500" }} />
          </IconButton>

          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a", flexGrow: 1 }}>
            Call History
          </Typography>

          <Chip
            label={`${meetings.length} Total Calls`}
            sx={{
              backgroundColor: "rgba(217, 117, 0, 0.12)",
              color: "#D97500",
              fontWeight: 700,
              borderRadius: "10px",
            }}
          />
        </Box>

        {/* History List */}
        {loading ? (
          <Typography sx={{ textAlign: "center", color: "#64748b", py: 6 }}>
            Loading call history...
          </Typography>
        ) : meetings.length > 0 ? (
          <Grid container spacing={2.5}>
            {meetings.map((item, index) => (
              <Grid item xs={12} sm={6} key={item._id || index}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <VideocamIcon sx={{ color: "#D97500", fontSize: 24 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                          Code: {item.meetingCode}
                        </Typography>
                      </Box>
                      <Tooltip title="Delete History Entry">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item._id)}
                          sx={{
                            color: "#ef4444",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            "&:hover": { backgroundColor: "#fee2e2" },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
                      <CalendarTodayIcon sx={{ fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatDate(item.date)}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => routeTo(`/${item.meetingCode}`)}
                      sx={{
                        mt: 2,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        borderColor: "#cbd5e1",
                        color: "#D97500",
                        "&:hover": {
                          borderColor: "#D97500",
                          backgroundColor: "rgba(217, 117, 0, 0.08)",
                        },
                      }}
                    >
                      Re-join Meeting
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              borderRadius: "20px",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          >
            <VideocamIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0f172a", mb: 0.5 }}>
              No Meeting History Found
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Your past video call codes will appear here once you host or join calls.
            </Typography>
            <Button
              variant="contained"
              onClick={() => routeTo("/home")}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #FF8C00 0%, #D97500 100%)",
              }}
            >
              Go to Home Page
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
