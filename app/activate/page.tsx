"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
    Container,
    Paper
} from "@mui/material";
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiShield, FiMail, FiKey } from "react-icons/fi";

function ActivateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const qToken = searchParams.get("token") || urlParams?.get("token") || "";
        const qEmail = searchParams.get("email") || urlParams?.get("email") || "";
        
        if (qToken) setToken(qToken);
        if (qEmail) setEmail(qEmail);
    }, [searchParams]);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const currentToken = token.trim();
        if (!currentToken) {
            setError("Please provide a valid activation token.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please re-check.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${APP_CONFIG.api.auth}/activate-manager`, {
                token: currentToken,
                password
            });
            setSuccess(true);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to activate account. The invitation link may have expired.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f172a" }}>
                <CircularProgress color="warning" />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#0f172a",
                p: { xs: 2, sm: 4 },
                background: "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)"
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={12}
                    sx={{
                        borderRadius: 3,
                        p: { xs: 3, sm: 5 },
                        bgcolor: "#1e293b",
                        color: "#f8fafc",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
                    }}
                >
                    {/* Header Icon & Title */}
                    <Box sx={{ textAlign: "center", mb: 4 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                bgcolor: "rgba(234, 88, 12, 0.15)",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                                border: "1px solid rgba(234, 88, 12, 0.3)"
                            }}
                        >
                            <FiShield size={32} color="#ea580c" />
                        </Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: "#ffffff", mb: 1 }}>
                            Activate Account
                        </Typography>
                        <Typography variant="body1" sx={{ color: "#94a3b8" }}>
                            {email ? (
                                <span>Setting up password for <strong style={{ color: "#f97316" }}>{email}</strong></span>
                            ) : (
                                "Complete your setup to access the FixZone Service Manager Portal."
                            )}
                        </Typography>
                    </Box>

                    {success ? (
                        <Box sx={{ textAlign: "center", py: 2 }}>
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: "50%",
                                    bgcolor: "rgba(16, 185, 129, 0.15)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 2.5
                                }}
                            >
                                <FiCheckCircle size={40} color="#10b981" />
                            </Box>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: "#ffffff", mb: 1 }}>
                                Account Activated!
                            </Typography>
                            <Typography variant="body2" sx={{ color: "#94a3b8", mb: 4 }}>
                                Your password has been set successfully. You can now log in to the FixZone Manager Dashboard.
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={() => router.push("/login")}
                                sx={{
                                    bgcolor: "#ea580c",
                                    color: "#ffffff",
                                    py: 1.6,
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    "&:hover": { bgcolor: "#c2410c" }
                                }}
                            >
                                Proceed to Login
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleActivate} noValidate>
                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {!token && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" sx={{ color: "#94a3b8", mb: 1, display: "block" }}>
                                        Activation Token
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Paste your invitation token"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FiKey color="#64748b" />
                                                </InputAdornment>
                                            )
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                bgcolor: "#0f172a",
                                                color: "#ffffff",
                                                borderRadius: 2,
                                                "& fieldset": { borderColor: "#334155" },
                                                "&:hover fieldset": { borderColor: "#ea580c" },
                                                "&.Mui-focused fieldset": { borderColor: "#ea580c" }
                                            }
                                        }}
                                    />
                                </Box>
                            )}

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="caption" sx={{ color: "#94a3b8", mb: 1, display: "block" }}>
                                    Create New Password (min. 8 characters)
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter secure password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FiLock color="#64748b" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: "#94a3b8" }}
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "#0f172a",
                                            color: "#ffffff",
                                            borderRadius: 2,
                                            "& fieldset": { borderColor: "#334155" },
                                            "&:hover fieldset": { borderColor: "#ea580c" },
                                            "&.Mui-focused fieldset": { borderColor: "#ea580c" }
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" sx={{ color: "#94a3b8", mb: 1, display: "block" }}>
                                    Confirm New Password
                                </Typography>
                                <TextField
                                    fullWidth
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Re-type your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FiLock color="#64748b" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirm(!showConfirm)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: "#94a3b8" }}
                                                >
                                                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            bgcolor: "#0f172a",
                                            color: "#ffffff",
                                            borderRadius: 2,
                                            "& fieldset": { borderColor: "#334155" },
                                            "&:hover fieldset": { borderColor: "#ea580c" },
                                            "&.Mui-focused fieldset": { borderColor: "#ea580c" }
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading}
                                sx={{
                                    bgcolor: "#ea580c",
                                    color: "#ffffff",
                                    py: 1.6,
                                    fontSize: "1rem",
                                    fontWeight: "bold",
                                    borderRadius: 2,
                                    textTransform: "none",
                                    "&:hover": { bgcolor: "#c2410c" },
                                    "&.Mui-disabled": { bgcolor: "rgba(234, 88, 12, 0.4)", color: "rgba(255, 255, 255, 0.6)" }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Set Password & Activate Account"}
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
}

export default function ActivatePage() {
    return (
        <Suspense fallback={<Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#0f172a" }}><CircularProgress color="warning" /></Box>}>
            <ActivateContent />
        </Suspense>
    );
}
