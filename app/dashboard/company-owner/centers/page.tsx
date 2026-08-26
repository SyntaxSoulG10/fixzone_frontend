"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Grid,
    Card,
    Box,
    Typography,
    Button,
    IconButton,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    LinearProgress,
    InputAdornment,
    Alert,
    alpha,
    Tooltip
} from "@mui/material";
import AddRounded from "@mui/icons-material/AddRounded";
import EditRounded from "@mui/icons-material/EditRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import LocationOnRounded from "@mui/icons-material/LocationOnRounded";
import PhoneRounded from "@mui/icons-material/PhoneRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import AccessTimeRounded from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import SpeedRounded from "@mui/icons-material/SpeedRounded";
import PowerSettingsNewRounded from "@mui/icons-material/PowerSettingsNewRounded";
import CloudUploadRounded from "@mui/icons-material/CloudUploadRounded";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ClearRounded from "@mui/icons-material/ClearRounded";
import MyLocationRounded from "@mui/icons-material/MyLocationRounded";
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import BlockRounded from "@mui/icons-material/BlockRounded";
import HourglassEmptyRounded from "@mui/icons-material/HourglassEmptyRounded";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import EmptyState from "@/components/UI/EmptyState";
import { useSearchParams } from "next/navigation";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { getStripeConnectStatus, connectStripe } from "@/lib/api";
import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * GLOBAL CONSTANTS
 */
const BRAND_ORANGE = "#f3651c";
const DEFAULT_MECHANICS = 5;
const DEFAULT_CAPACITY = 0;
const MIN_CENTER_NAME_LENGTH = 3;
const PHONE_REGEX = /^[0-9+]{10,15}$/;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const hourStr = hour.toString().padStart(2, "0");
    return `${hourStr}:${minute}`;
});

/**
 * DATA MODELS
 */
interface ServiceCenterView {
    id: string;
    name: string;
    location: string;
    googleMapsUrl?: string;
    imageUrl?: string;
    manager: string;
    phone: string;
    revenue: number;
    status: "Active" | "Inactive" | "Suspended" | "Pending" | "Rejected";
    rawStatus: string;
    mechanics: number;
    capacity: number;
    openingHours: string;
}

/**
 * HEADER COMPONENT
 */
function CentersHeader({ onAdd, isExpired }: { onAdd: () => void; isExpired: boolean }) {
    return (
        <Box
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "flex-start" }}
            gap={3}
            mb={4}
            mt={2}
        >
            <Box>
                <Typography variant="h4" fontWeight="800" color="#1e293b" sx={{ fontSize: { xs: "1.5rem", md: "1.875rem" } }} gutterBottom>
                    My Service Centers
                </Typography>
                <Typography variant="body1" color="#64748b" sx={{ fontSize: "1rem" }}>
                    Manage your branch operations, physical locations, branding photos, and service metrics.
                </Typography>
            </Box>
            <Button
                variant="contained"
                onClick={onAdd}
                disabled={isExpired}
                title={isExpired ? "Upgrade your plan to use this feature" : ""}
                startIcon={<AddRounded />}
                sx={{
                    bgcolor: BRAND_ORANGE,
                    "&:hover": { bgcolor: "#d85618" },
                    color: "#ffffff",
                    px: 3,
                    py: 1.2,
                    borderRadius: "0.75rem",
                    textTransform: "none",
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    boxShadow: "0 4px 12px rgba(243, 101, 28, 0.25)",
                    "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#a0aec0" }
                }}
            >
                New Branch
            </Button>
        </Box>
    );
}

/**
 * CARD COMPONENT: Ultra-clean card with image header and MUI icons
 */
function CenterCard({
    center,
    onToggleStatus,
    onEdit,
    onDelete,
    isExpired
}: {
    center: ServiceCenterView;
    onToggleStatus: (id: string, current: string) => void;
    onEdit: (center: ServiceCenterView) => void;
    onDelete: (id: string) => void;
    isExpired: boolean;
}) {
    const isActive = center.status === "Active";
    const isSuspended = center.status === "Suspended";
    const isPending = center.status === "Pending";
    const isRejected = center.status === "Rejected";

    const getStatusChip = () => {
        if (isSuspended) {
            return (
                <Chip
                    icon={<BlockRounded sx={{ fontSize: "1rem !important", color: "#dc2626 !important" }} />}
                    label="Suspended by Admin"
                    size="small"
                    sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: "700", border: "1px solid #fca5a5" }}
                />
            );
        }
        if (isPending) {
            return (
                <Chip
                    icon={<HourglassEmptyRounded sx={{ fontSize: "1rem !important", color: "#d97706 !important" }} />}
                    label="Pending Review"
                    size="small"
                    sx={{ bgcolor: "#fef3c7", color: "#d97706", fontWeight: "700", border: "1px solid #fcd34d" }}
                />
            );
        }
        if (isRejected) {
            return (
                <Chip
                    icon={<BlockRounded sx={{ fontSize: "1rem !important", color: "#b91c1c !important" }} />}
                    label="Rejected"
                    size="small"
                    sx={{ bgcolor: "#fee2e2", color: "#b91c1c", fontWeight: "700", border: "1px solid #fca5a5" }}
                />
            );
        }
        if (isActive) {
            return (
                <Chip
                    icon={<CheckCircleOutlineRounded sx={{ fontSize: "1rem !important", color: "#16a34a !important" }} />}
                    label="Active"
                    size="small"
                    sx={{ bgcolor: "#dcfce7", color: "#15803d", fontWeight: "700", border: "1px solid #bbf7d0" }}
                />
            );
        }
        return (
            <Chip
                label="Disabled"
                size="small"
                sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontWeight: "700", border: "1px solid #cbd5e1" }}
            />
        );
    };

    return (
        <Card
            sx={{
                borderRadius: "1.25rem",
                border: isSuspended ? "1.5px solid #fca5a5" : "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
                transition: "all 0.25s ease-in-out",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.1)",
                    borderColor: isSuspended ? "#f87171" : "#cbd5e1"
                }
            }}
        >
            {/* Top Banner: Real Image or Sleek Gradient */}
            <Box
                sx={{
                    height: 140,
                    position: "relative",
                    bgcolor: "#1e293b",
                    backgroundImage: center.imageUrl
                        ? `linear-gradient(180deg, rgba(15, 23, 42, 0.2) 0%, rgba(15, 23, 42, 0.8) 100%), url(${center.imageUrl})`
                        : `linear-gradient(135deg, ${BRAND_ORANGE} 0%, #c2410c 100%)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "flex-end",
                    p: 2
                }}
            >
                {/* Status Badge floating at top right */}
                <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    {getStatusChip()}
                </Box>

                {/* Branch icon & Title overlay */}
                <Box display="flex" alignItems="center" gap={1.5} sx={{ zIndex: 1, width: "100%" }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "0.75rem",
                            bgcolor: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: BRAND_ORANGE,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                            flexShrink: 0
                        }}
                    >
                        <StorefrontRounded sx={{ fontSize: 26 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            fontWeight="800"
                            sx={{
                                color: "#ffffff",
                                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                fontSize: "1.1rem",
                                lineHeight: 1.2
                            }}
                            noWrap
                        >
                            {center.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: "rgba(255, 255, 255, 0.85)",
                                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                                display: "block"
                            }}
                            noWrap
                        >
                            {center.location}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Content Body */}
            <Box p={3} sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                {/* Status Notification Alerts */}
                {isSuspended && (
                    <Box sx={{ mb: 2, p: 1.5, borderRadius: "0.75rem", bgcolor: "#fee2e2", border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: 1 }}>
                        <WarningAmberRounded sx={{ color: "#dc2626", fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="caption" color="#b91c1c" fontWeight={600} lineHeight={1.3}>
                            Suspended by Administrator. This branch is hidden across the platform.
                        </Typography>
                    </Box>
                )}

                {isPending && (
                    <Box sx={{ mb: 2, p: 1.5, borderRadius: "0.75rem", bgcolor: "#fef3c7", border: "1px solid #fcd34d", display: "flex", alignItems: "center", gap: 1 }}>
                        <HourglassEmptyRounded sx={{ color: "#d97706", fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="caption" color="#b45309" fontWeight={600} lineHeight={1.3}>
                            Pending Review. Awaiting platform administrator approval.
                        </Typography>
                    </Box>
                )}

                {isRejected && (
                    <Box sx={{ mb: 2, p: 1.5, borderRadius: "0.75rem", bgcolor: "#fee2e2", border: "1px solid #fca5a5", display: "flex", alignItems: "center", gap: 1 }}>
                        <BlockRounded sx={{ color: "#dc2626", fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="caption" color="#b91c1c" fontWeight={600} lineHeight={1.3}>
                            Registration Rejected. Contact administrator support.
                        </Typography>
                    </Box>
                )}

                {/* Details List with Professional MUI Icons */}
                <Box display="flex" flexDirection="column" gap={1.5} mb={2.5}>
                    <Box display="flex" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
                        <LocationOnRounded sx={{ color: "#94a3b8", fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="body2" color="#475569" noWrap sx={{ flex: 1 }}>
                            {center.location}
                        </Typography>
                        {(center.googleMapsUrl || center.location.startsWith("http://") || center.location.startsWith("https://")) && (
                            <a
                                href={center.googleMapsUrl || center.location}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 3,
                                    color: BRAND_ORANGE,
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    textDecoration: "none",
                                    flexShrink: 0
                                }}
                                title="Open Google Maps"
                            >
                                Maps <OpenInNewRounded sx={{ fontSize: 13 }} />
                            </a>
                        )}
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <PersonOutlineRounded sx={{ color: "#94a3b8", fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="body2" color="#475569">
                            {center.manager}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1.5}>
                        <PhoneRounded sx={{ color: "#94a3b8", fontSize: 20, flexShrink: 0 }} />
                        <Typography variant="body2" color="#475569">
                            {center.phone}
                        </Typography>
                    </Box>

                    {center.openingHours && (
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <AccessTimeRounded sx={{ color: "#94a3b8", fontSize: 20, flexShrink: 0 }} />
                            <Typography variant="body2" color="#475569">
                                {center.openingHours}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ my: 1.5, borderColor: "#f1f5f9" }} />

                {/* KPI Metrics */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 4 }}>
                        <Box sx={{ p: 1, bgcolor: "#f8fafc", borderRadius: "0.75rem", textAlign: "center", border: "1px solid #f1f5f9" }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={0.25}>
                                <TrendingUpRounded sx={{ color: "#16a34a", fontSize: 16 }} />
                                <Typography variant="caption" color="#64748b" fontWeight="700">Revenue</Typography>
                            </Box>
                            <Typography variant="body2" color="#16a34a" fontWeight="800">
                                Rs.{center.revenue.toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                        <Box sx={{ p: 1, bgcolor: "#f8fafc", borderRadius: "0.75rem", textAlign: "center", border: "1px solid #f1f5f9" }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={0.25}>
                                <GroupsRounded sx={{ color: "#3b82f6", fontSize: 16 }} />
                                <Typography variant="caption" color="#64748b" fontWeight="700">Team</Typography>
                            </Box>
                            <Typography variant="body2" color="#1e293b" fontWeight="800">
                                {center.mechanics}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                        <Box sx={{ p: 1, bgcolor: "#f8fafc", borderRadius: "0.75rem", textAlign: "center", border: "1px solid #f1f5f9" }}>
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5} mb={0.25}>
                                <SpeedRounded sx={{ color: "#f97316", fontSize: 16 }} />
                                <Typography variant="caption" color="#64748b" fontWeight="700">Load</Typography>
                            </Box>
                            <Typography variant="body2" color="#ea580c" fontWeight="800">
                                {center.capacity}%
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box display="flex" justifyContent="space-between" alignItems="center" pt={1}>
                    {isSuspended ? (
                        <Typography variant="caption" color="#dc2626" fontWeight="700">
                            Locked
                        </Typography>
                    ) : isPending || isRejected ? (
                        <Typography variant="caption" color="#64748b" fontWeight="600">
                            Status Managed by Admin
                        </Typography>
                    ) : (
                        <Button
                            size="small"
                            disabled={isExpired}
                            onClick={() => onToggleStatus(center.id, center.status)}
                            startIcon={<PowerSettingsNewRounded />}
                            sx={{
                                color: isActive ? "#dc2626" : "#16a34a",
                                fontWeight: "700",
                                textTransform: "none",
                                borderRadius: "0.5rem",
                                "&:hover": { bgcolor: isActive ? "#fee2e2" : "#dcfce7" },
                                "&.Mui-disabled": { color: "#94a3b8" }
                            }}
                        >
                            {isActive ? "Disable" : "Enable"}
                        </Button>
                    )}

                    <Box display="flex" gap={1}>
                        <IconButton
                            size="small"
                            disabled={isExpired}
                            title={isExpired ? "Upgrade your plan to use this feature" : "Delete Branch"}
                            onClick={() => onDelete(center.id)}
                            sx={{
                                color: "#ef4444",
                                border: "1px solid #fee2e2",
                                borderRadius: "0.5rem",
                                "&:hover": { bgcolor: "#fee2e2", borderColor: "#fca5a5" },
                                "&.Mui-disabled": { color: "#cbd5e1", borderColor: "#f1f5f9" }
                            }}
                        >
                            <DeleteOutlineRounded sx={{ fontSize: 18 }} />
                        </IconButton>

                        <Button
                            variant="outlined"
                            size="small"
                            disabled={isExpired}
                            startIcon={<EditRounded />}
                            onClick={() => onEdit(center)}
                            sx={{
                                color: BRAND_ORANGE,
                                borderColor: BRAND_ORANGE,
                                borderRadius: "0.5rem",
                                fontWeight: "700",
                                textTransform: "none",
                                "&:hover": { bgcolor: alpha(BRAND_ORANGE, 0.08), borderColor: "#d85618" },
                                "&.Mui-disabled": { borderColor: "#e2e8f0", color: "#94a3b8" }
                            }}
                        >
                            Edit
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}

/**
 * FORM DIALOG: Comprehensive dialog with Center Photo/Logo Upload & Map integration
 */
function CenterDialog({
    open,
    onClose,
    isEdit,
    formData,
    onChange,
    onImageChange,
    onImageRemove,
    onSave,
    onDetectLocation,
    detecting
}: {
    open: boolean;
    onClose: () => void;
    isEdit: boolean;
    formData: any;
    onChange: (e: any) => void;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageRemove: () => void;
    onSave: () => void;
    onDetectLocation: () => void;
    detecting: boolean;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const fakeEvent = {
                target: { files: e.dataTransfer.files }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            onImageChange(fakeEvent);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: "1.25rem", p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: "800", color: "#1e293b", pb: 1 }}>
                {isEdit ? "Edit Service Center" : "Add New Service Center"}
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor: "#f1f5f9" }}>
                <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
                    {/* CENTER PHOTO / LOGO UPLOAD SECTION */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight="700" color="#334155" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.75 }}>
                            <PhotoCameraRounded sx={{ fontSize: 18, color: BRAND_ORANGE }} />
                            Center Photo / Logo
                        </Typography>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={onImageChange}
                        />

                        {formData.imageUrl ? (
                            <Box
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    height: 170,
                                    borderRadius: "0.875rem",
                                    overflow: "hidden",
                                    border: "2px solid #e2e8f0",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    backgroundImage: `url(${formData.imageUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        p: 1.5,
                                        bgcolor: "rgba(15, 23, 42, 0.75)",
                                        backdropFilter: "blur(6px)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}
                                >
                                    <Typography variant="caption" color="#ffffff" fontWeight="600">
                                        Photo selected (will upload to database)
                                    </Typography>
                                    <Box display="flex" gap={1}>
                                        <Button
                                            size="small"
                                            onClick={() => fileInputRef.current?.click()}
                                            startIcon={<PhotoCameraRounded />}
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, 0.2)",
                                                color: "#ffffff",
                                                textTransform: "none",
                                                fontWeight: "600",
                                                fontSize: "0.75rem",
                                                borderRadius: "0.5rem",
                                                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.35)" }
                                            }}
                                        >
                                            Change
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={onImageRemove}
                                            startIcon={<DeleteOutlineRounded />}
                                            sx={{
                                                bgcolor: "rgba(239, 68, 68, 0.3)",
                                                color: "#fecaca",
                                                textTransform: "none",
                                                fontWeight: "600",
                                                fontSize: "0.75rem",
                                                borderRadius: "0.5rem",
                                                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.5)" }
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        ) : (
                            <Box
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                sx={{
                                    border: `2px dashed ${dragOver ? BRAND_ORANGE : "#cbd5e1"}`,
                                    borderRadius: "0.875rem",
                                    bgcolor: dragOver ? alpha(BRAND_ORANGE, 0.05) : "#f8fafc",
                                    p: 3,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        bgcolor: alpha(BRAND_ORANGE, 0.04),
                                        borderColor: BRAND_ORANGE
                                    }
                                }}
                            >
                                <CloudUploadRounded sx={{ fontSize: 36, color: dragOver ? BRAND_ORANGE : "#94a3b8", mb: 0.5 }} />
                                <Typography variant="body2" fontWeight="700" color="#334155">
                                    Click or drag & drop to upload Center Photo / Logo
                                </Typography>
                                <Typography variant="caption" color="#94a3b8">
                                    PNG, JPG, or WEBP (Max 10MB). Stored securely in database & CDN.
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <TextField
                        label="Center Name"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        fullWidth
                        placeholder="e.g. Colombo West Branch"
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0.75rem" } }}
                    />

                    <Box>
                        <TextField
                            label="Physical Address / Location"
                            placeholder="Enter the full street address or landmarks"
                            name="location"
                            value={formData.location}
                            onChange={onChange}
                            fullWidth
                            multiline
                            rows={2}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0.75rem" } }}
                        />
                        <Box display="flex" justifyContent="flex-end" mt={0.5}>
                            <Button
                                size="small"
                                onClick={onDetectLocation}
                                disabled={detecting}
                                startIcon={<MyLocationRounded />}
                                sx={{ color: BRAND_ORANGE, textTransform: "none", fontWeight: "700" }}
                            >
                                {detecting ? "Detecting GPS location..." : "Auto-detect My Location"}
                            </Button>
                        </Box>
                    </Box>

                    <TextField
                        label="Google Maps Share Link (Optional)"
                        placeholder="e.g. https://maps.app.goo.gl/..."
                        name="googleMapsUrl"
                        value={formData.googleMapsUrl || ""}
                        onChange={onChange}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LocationOnRounded sx={{ color: "#94a3b8", fontSize: 20 }} />
                                </InputAdornment>
                            )
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0.75rem" } }}
                    />

                    <Box display="flex" gap={2} alignItems="center">
                        <FormControl fullWidth required>
                            <InputLabel id="open-time-label">Open From</InputLabel>
                            <Select
                                labelId="open-time-label"
                                label="Open From"
                                name="openTime"
                                value={formData.openTime || "08:00"}
                                onChange={onChange}
                                sx={{ borderRadius: "0.75rem" }}
                            >
                                {TIME_OPTIONS.map((time) => (
                                    <MenuItem key={time} value={time}>
                                        {time}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Typography variant="body2" color="#64748b" fontWeight="700">
                            to
                        </Typography>
                        <FormControl fullWidth required>
                            <InputLabel id="close-time-label">Open Until</InputLabel>
                            <Select
                                labelId="close-time-label"
                                label="Open Until"
                                name="closeTime"
                                value={formData.closeTime || "18:00"}
                                onChange={onChange}
                                sx={{ borderRadius: "0.75rem" }}
                            >
                                {TIME_OPTIONS.map((time) => (
                                    <MenuItem key={time} value={time}>
                                        {time}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                            <TextField
                                label="Contact Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={onChange}
                                fullWidth
                                placeholder="+94112345678"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneRounded sx={{ color: "#94a3b8", fontSize: 18 }} />
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "0.75rem" } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Status"
                                    onChange={onChange}
                                    sx={{ borderRadius: "0.75rem" }}
                                >
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ color: "#64748b", fontWeight: "600", textTransform: "none" }}>
                    Cancel
                </Button>
                <Button
                    onClick={onSave}
                    variant="contained"
                    sx={{
                        bgcolor: BRAND_ORANGE,
                        "&:hover": { bgcolor: "#d85618" },
                        borderRadius: "0.75rem",
                        px: 4,
                        py: 1,
                        fontWeight: "700",
                        textTransform: "none",
                        boxShadow: "0 4px 10px rgba(243, 101, 28, 0.3)"
                    }}
                >
                    {isEdit ? "Update Branch" : "Create Branch"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * MAIN PAGE COMPONENT
 */
export default function MyCentersPage() {
    const { centersData, ownerData, isLoading: isContextLoading, refreshCenters } = useDashboardData();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "warning" | "info"
    });
    const [stripeConnected, setStripeConnected] = useState(false);
    const [stripeLoading, setStripeLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        googleMapsUrl: "",
        imageUrl: "",
        phone: "",
        openTime: "08:00",
        closeTime: "18:00",
        status: "Active",
        mechanics: DEFAULT_MECHANICS,
        capacity: DEFAULT_CAPACITY
    });
    const [detecting, setDetecting] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setSnackbar({ open: true, message: "Image size must be under 10MB", severity: "error" });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const handleImageRemove = () => {
        setFormData(prev => ({ ...prev, imageUrl: "" }));
    };

    const handleDetectLocation = () => {
        if (typeof window === "undefined" || !navigator.geolocation) {
            setSnackbar({ open: true, message: "Geolocation is not supported by your browser", severity: "error" });
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                        { headers: { "User-Agent": "FixZone-Client-Application" } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.display_name) {
                            setFormData(prev => ({ ...prev, location: data.display_name }));
                            setSnackbar({ open: true, message: "Location detected successfully!", severity: "success" });
                            return;
                        }
                    }
                    setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }));
                    setSnackbar({ open: true, message: "Location coordinates detected!", severity: "success" });
                } catch (error) {
                    console.error("Reverse geocoding failed", error);
                    setFormData(prev => ({ ...prev, location: `${latitude}, ${longitude}` }));
                    setSnackbar({ open: true, message: "Location coordinates detected (address lookup failed)", severity: "success" });
                } finally {
                    setDetecting(false);
                }
            },
            (error) => {
                console.error("Geolocation error", error);
                let msg = "Failed to get your location";
                if (error.code === error.PERMISSION_DENIED) {
                    msg = "Location access denied. Please enable location permissions.";
                }
                setSnackbar({ open: true, message: msg, severity: "error" });
                setDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const mapCentersData = (data: any[]): ServiceCenterView[] => {
        return (data || []).map((c: any) => {
            let status: "Active" | "Inactive" | "Suspended" | "Pending" | "Rejected" = "Active";
            const normalizedStatus = (c.status || "").toUpperCase();
            if (normalizedStatus === "SUSPENDED") {
                status = "Suspended";
            } else if (normalizedStatus === "PENDING") {
                status = "Pending";
            } else if (normalizedStatus === "REJECTED") {
                status = "Rejected";
            } else if (!c.isActive) {
                status = "Inactive";
            } else {
                status = "Active";
            }

            return {
                id: c.centerId,
                name: c.name,
                location: c.address,
                googleMapsUrl: c.googleMapsUrl || "",
                imageUrl: c.imageUrl || "",
                manager: c.managerName || "Not Assigned",
                phone: c.contactPhone || "N/A",
                revenue: c.revenue || 0,
                status,
                rawStatus: c.status || "",
                mechanics: c.mechanicsCount || 0,
                capacity: c.currentCapacity || 0,
                openingHours: c.openingHours || ""
            };
        });
    };

    const [centers, setCenters] = useState<ServiceCenterView[]>(() => mapCentersData(centersData));

    useEffect(() => {
        setCenters(mapCentersData(centersData));
    }, [centersData]);

    const refreshStripeStatus = async () => {
        try {
            const data = await getStripeConnectStatus();
            setStripeConnected(Boolean(data.stripeConnected));
        } catch {
            setStripeConnected(Boolean(ownerData?.stripeOnboardingComplete));
        }
    };

    useEffect(() => {
        if (ownerData?.stripeOnboardingComplete !== undefined) {
            setStripeConnected(Boolean(ownerData.stripeOnboardingComplete));
        }
        refreshStripeStatus();
    }, [ownerData?.stripeOnboardingComplete]);

    useEffect(() => {
        if (!searchParams) return;
        const connectResult = searchParams.get("connect");
        if (connectResult === "success") {
            setSnackbar({ open: true, message: "Stripe account connected successfully.", severity: "success" });
            refreshStripeStatus();
            if (typeof window !== "undefined") {
                window.history.replaceState(null, "", window.location.pathname);
            }
        } else if (connectResult === "error") {
            setSnackbar({ open: true, message: "Stripe connection failed. Please try again.", severity: "error" });
            refreshStripeStatus();
            if (typeof window !== "undefined") {
                window.history.replaceState(null, "", window.location.pathname);
            }
        }
    }, [searchParams]);

    const handleConnectStripe = async () => {
        setStripeLoading(true);
        try {
            const url = await connectStripe();
            if (!url || typeof url !== "string") {
                throw new Error("No Stripe onboarding URL returned");
            }
            window.location.href = url;
        } catch (e: any) {
            const errorMsg =
                e.response?.data?.message || e.response?.data || e.message || "Failed to generate Stripe link. Please try again.";
            setSnackbar({
                open: true,
                message: typeof errorMsg === "string" ? errorMsg : "Failed to generate Stripe link. Please try again.",
                severity: "error"
            });
            setStripeLoading(false);
        }
    };

    const handleSave = async () => {
        if (!isEditMode && !stripeConnected) {
            setSnackbar({
                open: true,
                message: "Please complete your Stripe account setup first before creating a service center branch or HQ.",
                severity: "error"
            });
            return;
        }

        if (!formData.name || formData.name.trim().length < MIN_CENTER_NAME_LENGTH) {
            setSnackbar({ open: true, message: `Center name must be at least ${MIN_CENTER_NAME_LENGTH} characters`, severity: "error" });
            return;
        }
        if (!formData.location) {
            setSnackbar({ open: true, message: "Address/Location is required", severity: "error" });
            return;
        }

        if (formData.openTime >= formData.closeTime) {
            setSnackbar({ open: true, message: "Closing time must be after opening time", severity: "error" });
            return;
        }

        if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ""))) {
            setSnackbar({ open: true, message: "Please enter a valid phone number (10-15 digits)", severity: "error" });
            return;
        }

        const payload = {
            name: formData.name,
            address: formData.location,
            contactPhone: formData.phone,
            openingHours: `${formData.openTime} - ${formData.closeTime}`,
            isActive: formData.status === "Active",
            mechanicsCount: formData.mechanics,
            currentCapacity: formData.capacity,
            googleMapsUrl: formData.googleMapsUrl,
            imageUrl: formData.imageUrl,
            ownerId: ownerData?.userId
        };

        if (isEditMode && selectedId) {
            setCenters(prev =>
                prev.map(c =>
                    c.id === selectedId
                        ? {
                              ...c,
                              name: formData.name,
                              location: formData.location,
                              googleMapsUrl: formData.googleMapsUrl,
                              imageUrl: formData.imageUrl,
                              phone: formData.phone,
                              openingHours: `${formData.openTime} - ${formData.closeTime}`,
                              status: formData.status as any
                          }
                        : c
                )
            );
        }

        setOpenDialog(false);
        setIsLoading(true);
        try {
            if (isEditMode && selectedId) {
                await axios.put(`${APP_CONFIG.api.serviceCenters}/${selectedId}`, payload);
                setSnackbar({ open: true, message: "Center updated successfully!", severity: "success" });
            } else {
                await axios.post(APP_CONFIG.api.serviceCenters, payload);
                setSnackbar({ open: true, message: "New center branch created and saved!", severity: "success" });
            }
            refreshCenters();
        } catch (e: any) {
            const data = e.response?.data;
            const errorMsg = typeof data === "string" ? data : data?.message || "Save operation failed";
            setSnackbar({ open: true, message: errorMsg, severity: "error" });
            refreshCenters();
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, current: string) => {
        const center = centers.find(c => c.id === id);
        if (!center) return;
        if ((center.status || "").toUpperCase() === "SUSPENDED") {
            setSnackbar({ open: true, message: "This branch is suspended by administrator and cannot be modified.", severity: "error" });
            return;
        }

        const nextStatus = current === "Active" ? "Inactive" : "Active";
        setCenters(prev => prev.map(c => (c.id === id ? { ...c, status: nextStatus } : c)));
        setSnackbar({ open: true, message: `Branch is now ${nextStatus === "Active" ? "Enabled" : "Disabled"}`, severity: "success" });

        try {
            await axios.put(`${APP_CONFIG.api.serviceCenters}/${id}`, {
                name: center.name,
                address: center.location,
                contactPhone: center.phone,
                openingHours: center.openingHours,
                googleMapsUrl: center.googleMapsUrl,
                imageUrl: center.imageUrl,
                isActive: nextStatus === "Active",
                ownerId: ownerData?.userId
            });
            refreshCenters();
        } catch (e: any) {
            setCenters(prev => prev.map(c => (c.id === id ? { ...c, status: current as any } : c)));
            const data = e.response?.data;
            const errorMsg = typeof data === "string" ? data : data?.message || "Status update failed";
            setSnackbar({ open: true, message: errorMsg, severity: "error" });
        }
    };

    const handleEditClick = (center: ServiceCenterView) => {
        let openT = "08:00";
        let closeT = "18:00";
        if (center.openingHours && center.openingHours.includes(" - ")) {
            const parts = center.openingHours.split(" - ");
            if (parts.length === 2) {
                openT = parts[0].trim();
                closeT = parts[1].trim();
            }
        }
        setFormData({
            name: center.name,
            location: center.location,
            googleMapsUrl: center.googleMapsUrl || "",
            imageUrl: center.imageUrl || "",
            phone: center.phone,
            openTime: openT,
            closeTime: closeT,
            status: center.status,
            mechanics: center.mechanics,
            capacity: center.capacity
        });
        setSelectedId(center.id);
        setIsEditMode(true);
        setOpenDialog(true);
    };

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
        isOpen: false,
        id: "",
        name: ""
    });

    const handleDelete = async (id: string) => {
        const centerToDelete = centers.find(c => c.id === id);
        setCenters(prev => prev.filter(c => c.id !== id));
        setDeleteModal({ isOpen: false, id: "", name: "" });
        setSnackbar({ open: true, message: "Service center deleted successfully", severity: "success" });

        try {
            await axios.delete(`${APP_CONFIG.api.serviceCenters}/${id}`);
            refreshCenters();
        } catch (e: any) {
            if (centerToDelete) {
                setCenters(prev => [...prev, centerToDelete]);
            }
            const data = e.response?.data;
            const errorMsg = typeof data === "string" ? data : data?.message || "Delete operation failed";
            setSnackbar({ open: true, message: errorMsg, severity: "error" });
        }
    };

    const isExpired =
        ownerData?.subscriptionStatus === "TRIAL_EXPIRED" || ownerData?.subscriptionStatus === "PREMIUM_EXPIRED";
    const filtered = centers.filter(
        c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const hasSuspendedCenters = centers.some(c => c.status === "Suspended");

    return (
        <Box sx={{ pb: 6, px: { xs: 2, md: 4 } }}>
            <CentersHeader
                onAdd={() => {
                    if (!stripeConnected) {
                        setSnackbar({
                            open: true,
                            message: "Please complete your Stripe account setup first before creating a service center branch or HQ.",
                            severity: "error"
                        });
                        return;
                    }
                    setIsEditMode(false);
                    setFormData({
                        name: "",
                        location: "",
                        googleMapsUrl: "",
                        imageUrl: "",
                        phone: "",
                        openTime: "08:00",
                        closeTime: "18:00",
                        status: "Active",
                        mechanics: DEFAULT_MECHANICS,
                        capacity: DEFAULT_CAPACITY
                    });
                    setOpenDialog(true);
                }}
                isExpired={isExpired}
            />

            {!stripeConnected && (
                <Alert
                    severity="error"
                    icon={<WarningAmberRounded sx={{ fontSize: 22 }} />}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleConnectStripe}
                            disabled={stripeLoading}
                            sx={{ fontWeight: 700, textTransform: "none", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "0.5rem", px: 1.75 }}
                        >
                            Set Up Stripe Account
                        </Button>
                    }
                    sx={{ mb: 4, borderRadius: "1rem", fontWeight: 600, border: "1px solid #fca5a5" }}
                >
                    Stripe Account Required: You cannot create a service center branch or HQ until you have set up and connected your Stripe payout account.
                </Alert>
            )}

            {hasSuspendedCenters && (
                <Alert
                    severity="error"
                    icon={<WarningAmberRounded sx={{ fontSize: 22 }} />}
                    sx={{ mb: 4, borderRadius: "1rem", fontWeight: 600, border: "1px solid #fca5a5" }}
                >
                    Warning: One or more of your service center branches have been suspended by the platform administrator.
                    Suspended branches are inactive and hidden from customer searches. Please check your notifications or contact
                    administrator support.
                </Alert>
            )}

            {isLoading && (
                <LinearProgress
                    sx={{
                        mb: 4,
                        height: 4,
                        bgcolor: alpha(BRAND_ORANGE, 0.1),
                        "& .MuiLinearProgress-bar": { bgcolor: BRAND_ORANGE }
                    }}
                />
            )}

            {/* STRIPE PAYOUT BANNER */}
            <Box
                sx={{
                    mb: 4,
                    p: 3,
                    borderRadius: "1.25rem",
                    border: "1px solid",
                    borderColor: stripeConnected ? "#e2e8f0" : alpha(BRAND_ORANGE, 0.3),
                    bgcolor: stripeConnected ? "#ffffff" : alpha(BRAND_ORANGE, 0.04),
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", md: "center" },
                    gap: 2,
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)"
                }}
            >
                <Box>
                    <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        color={stripeConnected ? "#1e293b" : BRAND_ORANGE}
                        textTransform="uppercase"
                        letterSpacing={0.8}
                    >
                        Stripe Direct Payout Setup
                    </Typography>
                    <Typography variant="body2" color={stripeConnected ? "#64748b" : "#334155"} fontWeight={600} sx={{ mt: 0.5 }}>
                        {stripeConnected
                            ? "Your company owner account is fully connected for automated customer payouts and direct bookings."
                            : "Complete Stripe Connect onboarding to enable direct online card payments for your branches."}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<OpenInNewRounded />}
                    onClick={handleConnectStripe}
                    disabled={stripeLoading || isExpired}
                    title={isExpired ? "Upgrade your plan to use this feature" : ""}
                    sx={{
                        bgcolor: BRAND_ORANGE,
                        "&:hover": { bgcolor: "#d85618" },
                        color: "#ffffff",
                        px: 3,
                        py: 1,
                        borderRadius: "0.75rem",
                        textTransform: "none",
                        fontSize: "0.95rem",
                        fontWeight: "700",
                        boxShadow: "0 4px 10px rgba(243, 101, 28, 0.25)",
                        "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#a0aec0" }
                    }}
                >
                    {stripeLoading ? "Opening Stripe..." : stripeConnected ? "Stripe Dashboard" : "Connect Stripe Account"}
                </Button>
            </Box>

            {/* SEARCH & FILTERS BAR */}
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="body2" color="#64748b" fontWeight="600">
                    Total Branches: <strong>{filtered.length}</strong>
                </Typography>
                <TextField
                    size="small"
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchRounded sx={{ color: "#94a3b8" }} />
                            </InputAdornment>
                        ),
                        endAdornment: searchTerm ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearchTerm("")}>
                                    <ClearRounded sx={{ fontSize: 16 }} />
                                </IconButton>
                            </InputAdornment>
                        ) : null
                    }}
                    sx={{
                        width: { xs: "100%", sm: 340 },
                        "& .MuiOutlinedInput-root": { borderRadius: "0.75rem", bgcolor: "#ffffff" }
                    }}
                />
            </Box>

            {/* SERVICE CENTERS GRID */}
            {filtered.length === 0 && !isContextLoading ? (
                <EmptyState
                    icon={<StorefrontRounded sx={{ fontSize: 48, color: "#94a3b8" }} />}
                    title="No Service Centers Found"
                    description="You haven't added any service center branches yet, or none matched your search criteria."
                    actionLabel="Add First Branch"
                    onAction={() => {
                        if (!stripeConnected) {
                            setSnackbar({
                                open: true,
                                message: "Please complete your Stripe account setup first before creating a service center branch or HQ.",
                                severity: "error"
                            });
                            return;
                        }
                        setIsEditMode(false);
                        setFormData({
                            name: "",
                            location: "",
                            googleMapsUrl: "",
                            imageUrl: "",
                            phone: "",
                            openTime: "08:00",
                            closeTime: "18:00",
                            status: "Active",
                            mechanics: DEFAULT_MECHANICS,
                            capacity: DEFAULT_CAPACITY
                        });
                        setOpenDialog(true);
                    }}
                />
            ) : (
                <Grid container spacing={3.5}>
                    {filtered.map(center => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={center.id}>
                            <CenterCard
                                center={center}
                                onToggleStatus={handleToggleStatus}
                                onEdit={handleEditClick}
                                onDelete={(id: string) => setDeleteModal({ isOpen: true, id, name: center.name })}
                                isExpired={isExpired}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* CREATION & EDIT DIALOG */}
            <CenterDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                isEdit={isEditMode}
                formData={formData}
                onChange={(e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                onSave={handleSave}
                onDetectLocation={handleDetectLocation}
                detecting={detecting}
            />

            {/* DELETE CENTER CONFIRMATION MODAL */}
            <ConfirmDialog
                open={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
                title="Delete Service Center Branch?"
                message={
                    <>
                        Are you sure you want to permanently delete{" "}
                        <strong style={{ color: "#0f172a" }}>{deleteModal.name}</strong>? This action will remove its
                        associated managers, service packages, and transaction records.
                    </>
                }
                confirmText="Delete Branch"
                cancelText="Keep Branch"
                variant="danger"
                isLoading={isLoading}
                onConfirm={() => handleDelete(deleteModal.id)}
            />

            {/* SNACKBAR NOTIFICATIONS */}
            <FeedbackSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </Box>
    );
}