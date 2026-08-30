import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import VideocamIcon from "@mui/icons-material/Videocam";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const theme = createTheme({
  palette: {
    primary: {
      main: "#D97500",
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
});

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0); // 0 = Sign In, 1 = Sign Up
  const [open, setOpen] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password || (formState === 1 && !name)) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      if (formState === 0) {
        // LOGIN
        await handleLogin(username, password);
        setError("");
        setMessage("Login successful!");
        setOpen(true);
        navigate("/home", { replace: true });
      } else {
        // REGISTER & AUTO-LOGIN
        const result = await handleRegister(name, username, password);
        setError("");
        setMessage(result || "Account created successfully!");
        setOpen(true);
        // Auto login newly registered user to proceed seamlessly to /home
        await handleLogin(username, password);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Authentication failed. Please try again.";
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(217, 117, 0, 0.05) 0%, transparent 40%), " +
            "radial-gradient(circle at 90% 80%, rgba(255, 140, 0, 0.05) 0%, transparent 45%)",
          padding: 2,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            maxWidth: 440,
            width: "100%",
            borderRadius: "24px",
            padding: { xs: 3, sm: 4.5 },
            backgroundColor: "#09090b",
            border: "1px solid rgba(217, 117, 0, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(217, 117, 0, 0.2)",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Brand Icon Header */}
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mb: 1.5,
              background: "linear-gradient(135deg, #FF8C00 0%, #D97500 100%)",
              boxShadow: "0 8px 20px rgba(217, 117, 0, 0.4)",
            }}
          >
            <VideocamIcon sx={{ fontSize: 30, color: "#fff" }} />
          </Avatar>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#ffffff",
              mb: 0.5,
              textAlign: "center",
            }}
          >
            Apna Video Call
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#a1a1aa",
              mb: 3,
              textAlign: "center",
            }}
          >
            {formState === 0
              ? "Welcome back! Sign in to continue"
              : "Create an account to start video calling"}
          </Typography>

          {/* Segmented Pill Tabs */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              backgroundColor: "rgba(24, 24, 27, 0.8)",
              borderRadius: "14px",
              padding: "4px",
              mb: 3,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <Button
              fullWidth
              disableRipple
              onClick={() => {
                setFormState(0);
                setError("");
              }}
              sx={{
                borderRadius: "10px",
                py: 1,
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                color: formState === 0 ? "#ffffff" : "#a1a1aa",
                backgroundColor:
                  formState === 0 ? "#D97500" : "transparent",
                boxShadow:
                  formState === 0
                    ? "0 4px 12px rgba(217, 117, 0, 0.4)"
                    : "none",
                "&:hover": {
                  backgroundColor:
                    formState === 0 ? "#c66a00" : "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              disableRipple
              onClick={() => {
                setFormState(1);
                setError("");
              }}
              sx={{
                borderRadius: "10px",
                py: 1,
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "none",
                transition: "all 0.3s ease",
                color: formState === 1 ? "#ffffff" : "#a1a1aa",
                backgroundColor:
                  formState === 1 ? "#D97500" : "transparent",
                boxShadow:
                  formState === 1
                    ? "0 4px 12px rgba(217, 117, 0, 0.4)"
                    : "none",
                "&:hover": {
                  backgroundColor:
                    formState === 1 ? "#c66a00" : "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              Sign Up
            </Button>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleAuth}
            noValidate
            sx={{ width: "100%" }}
          >
            {formState === 1 && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="fullname"
                label="Full Name"
                name="fullname"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeOutlinedIcon sx={{ color: "#D97500" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontWeight: 500,
                    backgroundColor: "rgba(24, 24, 27, 0.6)",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.15)" },
                    "&:hover fieldset": { borderColor: "#FF8C00" },
                    "&.Mui-focused fieldset": { borderColor: "#D97500" },
                  },
                  "& .MuiInputLabel-root": { color: "#a1a1aa" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#D97500" },
                }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={username}
              autoFocus={formState === 0}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: "#D97500" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontWeight: 500,
                  backgroundColor: "rgba(24, 24, 27, 0.6)",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.15)" },
                  "&:hover fieldset": { borderColor: "#FF8C00" },
                  "&.Mui-focused fieldset": { borderColor: "#D97500" },
                },
                "& .MuiInputLabel-root": { color: "#a1a1aa" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#D97500" },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              value={password}
              type={showPassword ? "text" : "password"}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#D97500" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#a1a1aa" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontWeight: 500,
                  backgroundColor: "rgba(24, 24, 27, 0.6)",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.15)" },
                  "&:hover fieldset": { borderColor: "#FF8C00" },
                  "&.Mui-focused fieldset": { borderColor: "#D97500" },
                },
                "& .MuiInputLabel-root": { color: "#a1a1aa" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#D97500" },
              }}
            />

            {error && (
              <Alert
                severity="error"
                sx={{
                  mt: 1.5,
                  mb: 1,
                  borderRadius: "10px",
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#fca5a5",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  "& .MuiAlert-icon": { color: "#f87171" },
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2.5,
                mb: 1,
                py: 1.4,
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "none",
                background: "linear-gradient(135deg, #FF8C00 0%, #D97500 100%)",
                boxShadow: "0 10px 25px -5px rgba(217, 117, 0, 0.5)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #e07b00 0%, #c66a00 100%)",
                  boxShadow: "0 15px 30px -5px rgba(217, 117, 0, 0.7)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {formState === 0 ? "Sign In" : "Create Account"}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="success"
          sx={{
            width: "100%",
            borderRadius: "12px",
            backgroundColor: "#10b981",
            color: "#ffffff",
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
