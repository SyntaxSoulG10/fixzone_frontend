"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    CircularProgress,
    InputAdornment,
    Switch,
    Tabs,
    Tab,
    Stack,
    alpha,
    Tooltip
} from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import EmptyState from "@/components/UI/EmptyState";
import StatCard from "@/components/dashboard/StatCard";
import { 
    FiPlus, 
    FiEdit2, 
    FiTrash2, 
    FiClock, 
    FiCheck, 
    FiX, 
    FiSave, 
    FiLayers,
    FiMapPin, 
    FiPackage, 
    FiSearch,
    FiCheckCircle,
    FiDollarSign,
    FiGrid
} from "react-icons/fi";
import { FaCar, FaBus, FaMotorcycle, FaShuttleVan, FaTruck, FaCarSide } from "react-icons/fa";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { useDashboardData } from "@/context/DashboardDataContext";

const BRAND_ORANGE = "#ea580c";
const MIN_PACKAGE_NAME_LENGTH = 3;
const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const MIN_DURATION = 5;
const MAX_DURATION = 1440;
const MIN_DESC_LENGTH = 10;
const DEFAULT_PRICE = 0;
const DEFAULT_DURATION = 30;

export const VEHICLE_TYPE_OPTIONS = [
    { value: "ALL", label: "All Types", Icon: FiGrid, description: "Universal package for all vehicle classes" },
    { value: "CAR", label: "Car / Sedan", Icon: FaCar, description: "Sedans, hatchbacks, and compacts" },
    { value: "SUV", label: "SUV / 4x4", Icon: FaCarSide, description: "Crossovers, mid & full-size SUVs" },
    { value: "VAN", label: "Van / Minibus", Icon: FaShuttleVan, description: "Passenger and cargo vans" },
    { value: "BUS", label: "Bus / Heavy", Icon: FaBus, description: "Buses and coaches" },
    { value: "TRUCK", label: "Light Truck", Icon: FaTruck, description: "Light commercial lorries & pickups" },
    { value: "BIKE", label: "Motorcycle", Icon: FaMotorcycle, description: "Motorcycles and scooters" },
];

export const STANDARD_INCLUSION_PRESETS: { [category: string]: string[] } = {
    "Lubrication & Fluids": [
        "Engine Oil Replacement (up to 4L)",
        "Genuine Oil Filter Replacement",
        "Engine Flush & Sludge Clean",
        "Coolant Top-up & Radiator Test",
        "Brake & Clutch Fluid Inspection",
        "Windshield Washer Fluid Top-up"
    ],
    "Diagnostics & Electrical": [
        "30-Point Computer ECU Diagnostic Scan",
        "Hybrid Battery Cell Voltage Analysis",
        "12V Battery Health & Alternator Test",
        "Starter Motor & Charging System Test",
        "Spark Plug Check & Calibration"
    ],
    "Brakes & Suspension": [
        "4-Wheel Brake Pad Cleaning & Inspection",
        "Brake Caliper Pin Lubrication",
        "Brake Disc Rotor Thickness Check",
        "Suspension Bush & Shock Absorber Test",
        "Steering Linkage & Ball Joint Check"
    ],
    "Detailing & Cleaning": [
        "High-Pressure Underbody Wash & Degrease",
        "Foam Body Wash & Wax Polish",
        "Interior Cabin Deep Vacuuming",
        "Dashboard & Door Trim UV Conditioner",
        "Tire Shine & Alloy Wheel Dressing"
    ]
};

interface ServicePackage {
    id: string;
    centerId: string;
    centerName?: string;
    name: string;
    type?: string;
    category?: string;
    vehicleType?: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    isActive: boolean;
}

function ServicesHeader({ onAdd, isExpired }: { onAdd: () => void, isExpired: boolean }) {
    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2} mb={4}>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom sx={{ letterSpacing: -0.5 }}>
                    Service Packages
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage service pricing, vehicle classifications, and diagnostic checklists across branches.
                </Typography>
            </Box>
            <Button
                variant="contained"
                onClick={onAdd}
                disabled={isExpired}
                title={isExpired ? "Upgrade your plan to use this feature" : ""}
                startIcon={<FiPlus size={18} />}
                sx={{
                    background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                    color: '#ffffff',
                    px: 3.5,
                    py: 1.25,
                    borderRadius: '0.75rem',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 16px 0 rgba(234, 88, 12, 0.4)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        background: 'linear-gradient(195deg, #ea580c, #c2410c)',
                        boxShadow: '0 6px 20px 0 rgba(234, 88, 12, 0.5)',
                        transform: 'translateY(-1px)'
                    },
                    '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#a0aec0', background: 'none' }
                }}
            >
                Create Package
            </Button>
        </Box>
    );
}

function ServicePackageCard({ 
    pkg, 
    centerName,
    onEdit, 
    onDelete, 
    isExpired 
}: { 
    pkg: ServicePackage; 
    centerName: string;
    onEdit: (pkg: ServicePackage) => void; 
    onDelete: (id: string) => void; 
    isExpired: boolean; 
}) {
    const vehicleMeta = VEHICLE_TYPE_OPTIONS.find(v => v.value === (pkg.vehicleType || "ALL")) || VEHICLE_TYPE_OPTIONS[0];
    const VehicleIcon = vehicleMeta.Icon;

    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '1rem',
            border: '1px solid',
            borderColor: 'rgba(226, 232, 240, 0.8)',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 16px 32px -4px rgba(15, 23, 42, 0.08), 0 6px 16px -2px rgba(234, 88, 12, 0.16)',
                borderColor: 'rgba(234, 88, 12, 0.35)'
            }
        }}>
            {/* Top Accent Gradient Bar */}
            <Box sx={{
                height: '4px',
                width: '100%',
                background: pkg.isActive 
                    ? 'linear-gradient(90deg, #EA580C 0%, #FB923C 100%)' 
                    : 'linear-gradient(90deg, #94a3b8 0%, #cbd5e1 100%)',
            }} />

            <Box p={3} pb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        {/* Themed Gradient Icon Avatar */}
                        <Box sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '0.75rem',
                            background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                            boxShadow: '0 4px 12px 0 rgba(234, 88, 12, 0.35)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <VehicleIcon size={20} color="#ffffff" />
                        </Box>
                        <Box>
                            <Box display="flex" alignItems="center" gap={0.75}>
                                <Chip
                                    label={vehicleMeta.label.split('/')[0].trim()}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        height: 22,
                                        bgcolor: 'rgba(234, 88, 12, 0.08)',
                                        color: '#c2410c',
                                        border: '1px solid rgba(234, 88, 12, 0.2)'
                                    }}
                                />
                                <Chip
                                    label={pkg.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        height: 22,
                                        bgcolor: pkg.isActive ? 'rgba(76, 175, 80, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                        color: pkg.isActive ? '#2e7d32' : '#475569',
                                        border: `1px solid ${pkg.isActive ? 'rgba(76, 175, 80, 0.3)' : 'rgba(100, 116, 139, 0.2)'}`
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={0.5}>
                        <Tooltip title="Edit Package">
                            <IconButton
                                size="small"
                                onClick={() => onEdit(pkg)}
                                disabled={isExpired}
                                sx={{
                                    color: 'text.secondary',
                                    borderRadius: '0.5rem',
                                    '&:hover': { color: BRAND_ORANGE, bgcolor: 'rgba(234, 88, 12, 0.08)' }
                                }}
                            >
                                <FiEdit2 size={15} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Package">
                            <IconButton
                                size="small"
                                onClick={() => onDelete(pkg.id)}
                                disabled={isExpired}
                                sx={{
                                    color: 'text.secondary',
                                    borderRadius: '0.5rem',
                                    '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' }
                                }}
                            >
                                <FiTrash2 size={15} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ fontSize: '1.1rem', mb: 0.75, lineHeight: 1.3 }}>
                    {pkg.name}
                </Typography>

                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={1.5} color="text.secondary">
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <FiMapPin size={13} color="#ea580c" />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                            {centerName}
                        </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <FiClock size={13} color="#ea580c" />
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                            {pkg.duration} mins duration
                        </Typography>
                    </Box>
                </Box>

                <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                        lineHeight: 1.5, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        fontSize: '0.875rem'
                    }}
                >
                    {pkg.description || "Standard vehicle servicing and inspection package."}
                </Typography>
            </Box>

            {/* High-Quality Themed Price Card */}
            <Box 
                px={3} 
                py={1.75} 
                mx={3} 
                sx={{
                    background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.05) 0%, rgba(251, 146, 60, 0.02) 100%)',
                    border: '1px solid rgba(234, 88, 12, 0.15)',
                    borderRadius: '0.85rem'
                }}
                display="flex" 
                alignItems="baseline" 
                justifyContent="space-between"
            >
                <Typography variant="caption" fontWeight={700} color="#7b809a" textTransform="uppercase" letterSpacing={0.5}>
                    Base Price
                </Typography>
                <Typography variant="h6" fontWeight="800" color="#c2410c">
                    <Typography component="span" variant="caption" fontWeight={700} color={BRAND_ORANGE} sx={{ mr: 0.5 }}>
                        Rs.
                    </Typography>
                    {Number(pkg.price).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
            </Box>

            <Box p={3} pt={2} mt="auto">
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.25}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                        Included Services ({pkg.features.length})
                    </Typography>
                </Box>

                <Stack spacing={1}>
                    {pkg.features.map((feature, idx) => (
                        <Box key={idx} display="flex" alignItems="center" gap={1}>
                            <Box sx={{ color: '#4CAF50', display: 'flex', flexShrink: 0 }}>
                                <FiCheckCircle size={14} />
                            </Box>
                            <Typography variant="caption" color="text.primary" fontWeight={500} sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                                {feature}
                            </Typography>
                        </Box>
                    ))}

                    {pkg.features.length === 0 && (
                        <Typography variant="caption" color="text.disabled" fontStyle="italic">
                            No specific checklist items listed
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Card>
    );
}

function ServicePackageDialog({ 
    isEditing, 
    currentPackage, 
    setCurrentPackage, 
    featuresInput, 
    setFeaturesInput, 
    centers, 
    handleSave, 
    handleCloseModal, 
    isSaving 
}: any) {
    const [newFeatureText, setNewFeatureText] = useState("");
    const [activePresetCategory, setActivePresetCategory] = useState("Lubrication & Fluids");

    const featuresList = useMemo(() => {
        return featuresInput
            ? featuresInput.split("\n").map((f: string) => f.trim()).filter((f: string) => f.length > 0)
            : [];
    }, [featuresInput]);

    const addFeature = (feat: string) => {
        const trimmed = feat.trim();
        if (!trimmed) return;
        if (!featuresList.includes(trimmed)) {
            const updated = [...featuresList, trimmed];
            setFeaturesInput(updated.join("\n"));
        }
        setNewFeatureText("");
    };

    const removeFeature = (indexToRemove: number) => {
        const updated = featuresList.filter((_: any, idx: number) => idx !== indexToRemove);
        setFeaturesInput(updated.join("\n"));
    };

    const handleFeatureKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addFeature(newFeatureText);
        }
    };

    const durationPresets = [30, 45, 60, 90, 120, 180];
    const pricePresets = [5000, 8500, 12000, 18500, 25000, 35000];

    return (
        <Dialog 
            open={true} 
            onClose={handleCloseModal} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ 
                sx: { 
                    borderRadius: '1.25rem', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                } 
            }}
        >
            <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '0.75rem',
                        background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                        boxShadow: '0 4px 12px 0 rgba(234, 88, 12, 0.35)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                    }}>
                        <FiPackage color="#ffffff" />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.2 }}>
                            {isEditing ? `Edit Service Package` : "Create Service Package"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Configure vehicle classification, price points, labor time, and inspection checklists.
                        </Typography>
                    </Box>
                </Box>
                <IconButton 
                    onClick={handleCloseModal} 
                    disabled={isSaving}
                    sx={{ color: 'text.secondary', '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                    <FiX size={20} />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSave}>
                <DialogContent sx={{ p: 3, maxHeight: '75vh', overflowY: 'auto' }}>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <TextField
                                fullWidth
                                label="Package Name"
                                required
                                value={currentPackage.name}
                                onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                                placeholder="e.g. Comprehensive Full Service"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 5 }}>
                            <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                                <InputLabel>Assigned Center</InputLabel>
                                <Select
                                    value={currentPackage.centerId}
                                    label="Assigned Center"
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, centerId: e.target.value })}
                                >
                                    {centers.map((c: any) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                                <InputLabel>Vehicle Classification</InputLabel>
                                <Select
                                    value={currentPackage.vehicleType || "ALL"}
                                    label="Vehicle Classification"
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, vehicleType: e.target.value })}
                                >
                                    {VEHICLE_TYPE_OPTIONS.map((opt) => {
                                        const IconComp = opt.Icon;
                                        return (
                                            <MenuItem key={opt.value} value={opt.value}>
                                                <Box display="flex" alignItems="center" gap={1.25}>
                                                    <IconComp size={16} color="#64748b" />
                                                    <Typography variant="body2" fontWeight={500}>{opt.label}</Typography>
                                                </Box>
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box 
                                height="100%" 
                                px={2} 
                                display="flex" 
                                alignItems="center" 
                                justifyContent="space-between"
                                bgcolor="#f8fafc" 
                                borderRadius="0.75rem"
                                border="1px solid #f1f5f9"
                            >
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">Offer Active Status</Typography>
                                    <Typography variant="caption" color="text.secondary">Visible for customer online bookings</Typography>
                                </Box>
                                <Switch
                                    checked={currentPackage.isActive}
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, isActive: e.target.checked })}
                                    color="primary"
                                />
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Base Price (LKR)"
                                type="number"
                                required
                                value={currentPackage.price}
                                onChange={(e) => setCurrentPackage({ ...currentPackage, price: Number(e.target.value) })}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Typography fontWeight="bold" color={BRAND_ORANGE}>Rs.</Typography></InputAdornment>
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                            />
                            <Box display="flex" flexWrap="wrap" gap={0.75} mt={1}>
                                {pricePresets.map((val) => (
                                    <Chip
                                        key={val}
                                        label={`${val.toLocaleString()}`}
                                        size="small"
                                        clickable
                                        onClick={() => setCurrentPackage({ ...currentPackage, price: val })}
                                        sx={{ 
                                            borderRadius: '0.5rem', 
                                            fontWeight: 600, 
                                            fontSize: '0.72rem',
                                            bgcolor: currentPackage.price === val ? 'rgba(234, 88, 12, 0.12)' : '#f1f5f9',
                                            color: currentPackage.price === val ? '#c2410c' : '#475569',
                                            border: currentPackage.price === val ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid transparent'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Estimated Duration (Minutes)"
                                type="number"
                                required
                                value={currentPackage.duration}
                                onChange={(e) => setCurrentPackage({ ...currentPackage, duration: Number(e.target.value) })}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight="bold">mins</Typography></InputAdornment>
                                }}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                            />
                            <Box display="flex" flexWrap="wrap" gap={0.75} mt={1}>
                                {durationPresets.map((mins) => (
                                    <Chip
                                        key={mins}
                                        label={`${mins}m`}
                                        size="small"
                                        clickable
                                        onClick={() => setCurrentPackage({ ...currentPackage, duration: mins })}
                                        sx={{ 
                                            borderRadius: '0.5rem', 
                                            fontWeight: 600, 
                                            fontSize: '0.72rem',
                                            bgcolor: currentPackage.duration === mins ? 'rgba(234, 88, 12, 0.12)' : '#f1f5f9',
                                            color: currentPackage.duration === mins ? '#c2410c' : '#475569',
                                            border: currentPackage.duration === mins ? '1px solid rgba(234, 88, 12, 0.3)' : '1px solid transparent'
                                        }}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Package Overview & Description"
                                required
                                value={currentPackage.description}
                                onChange={(e) => setCurrentPackage({ ...currentPackage, description: e.target.value })}
                                placeholder="Explain what is covered in this service package..."
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box p={2.5} bgcolor="#f8fafc" borderRadius="0.75rem" border="1px solid #e2e8f0">
                                <Typography variant="subtitle2" fontWeight="bold" color="text.primary" mb={1}>
                                    Included Services, Inclusions & Diagnostic Checks
                                </Typography>

                                <Box display="flex" gap={1} mb={2}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Add a custom inclusion (e.g. Engine Oil Flush) and press Enter"
                                        value={newFeatureText}
                                        onChange={(e) => setNewFeatureText(e.target.value)}
                                        onKeyDown={handleFeatureKeyDown}
                                        sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: '0.5rem' } }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={() => addFeature(newFeatureText)}
                                        sx={{ 
                                            borderRadius: '0.5rem', 
                                            textTransform: 'none', 
                                            fontWeight: 700, 
                                            px: 2.5,
                                            borderColor: BRAND_ORANGE,
                                            color: BRAND_ORANGE,
                                            '&:hover': { borderColor: '#c2410c', bgcolor: 'rgba(234, 88, 12, 0.04)' }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Box>

                                {featuresList.length > 0 && (
                                    <Box display="flex" flexWrap="wrap" gap={1} mb={2.5}>
                                        {featuresList.map((f: string, i: number) => (
                                            <Chip
                                                key={i}
                                                label={f}
                                                onDelete={() => removeFeature(i)}
                                                sx={{
                                                    borderRadius: '0.5rem',
                                                    fontWeight: 600,
                                                    bgcolor: '#ffffff',
                                                    border: '1px solid #cbd5e1'
                                                }}
                                            />
                                        ))}
                                    </Box>
                                )}

                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                                    QUICK PRESETS — CLICK TO ADD TO INCLUSIONS:
                                </Typography>

                                <Box display="flex" flexWrap="wrap" gap={1} mb={1.5}>
                                    {Object.keys(STANDARD_INCLUSION_PRESETS).map((cat) => (
                                        <Chip
                                            key={cat}
                                            label={cat}
                                            size="small"
                                            clickable
                                            onClick={() => setActivePresetCategory(cat)}
                                            sx={{
                                                fontWeight: 700,
                                                background: activePresetCategory === cat ? 'linear-gradient(195deg, #FB923C, #EA580C)' : '#ffffff',
                                                color: activePresetCategory === cat ? '#ffffff' : 'text.primary',
                                                border: '1px solid',
                                                borderColor: activePresetCategory === cat ? 'transparent' : '#cbd5e1',
                                                boxShadow: activePresetCategory === cat ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                                            }}
                                        />
                                    ))}
                                </Box>

                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {STANDARD_INCLUSION_PRESETS[activePresetCategory]?.map((presetItem: string) => {
                                        const isAlreadyAdded = featuresList.includes(presetItem);
                                        return (
                                            <Chip
                                                key={presetItem}
                                                label={presetItem}
                                                size="small"
                                                clickable
                                                onClick={() => isAlreadyAdded ? null : addFeature(presetItem)}
                                                icon={isAlreadyAdded ? <FiCheck size={12} /> : <FiPlus size={12} />}
                                                sx={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    bgcolor: isAlreadyAdded ? 'rgba(76, 175, 80, 0.12)' : '#ffffff',
                                                    color: isAlreadyAdded ? '#2e7d32' : 'text.secondary',
                                                    border: `1px dashed ${isAlreadyAdded ? '#4CAF50' : '#cbd5e1'}`
                                                }}
                                            />
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                    <Button 
                        onClick={handleCloseModal} 
                        disabled={isSaving}
                        sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', px: 2.5 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <FiSave />}
                        sx={{ 
                            background: 'linear-gradient(195deg, #FB923C, #EA580C)', 
                            boxShadow: '0 4px 14px 0 rgba(234, 88, 12, 0.4)',
                            '&:hover': { 
                                background: 'linear-gradient(195deg, #ea580c, #c2410c)',
                                boxShadow: '0 6px 20px 0 rgba(234, 88, 12, 0.5)'
                            },
                            fontWeight: 700, 
                            textTransform: 'none', 
                            borderRadius: '0.75rem',
                            px: 3.5, 
                            py: 1 
                        }}
                    >
                        {isSaving ? "Saving Package..." : isEditing ? "Update Package" : "Create Package"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default function ServicesPage() {
    const { centersData, ownerData } = useDashboardData();
    const mapCenters = (data: any[]) => (data || []).map((c: any) => ({ id: c.centerId, name: c.name }));

    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [centers, setCenters] = useState<{ id: string, name: string }[]>(() => mapCenters(centersData));
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("ALL");
    const [selectedCenterFilter, setSelectedCenterFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    
    const [snackbar, setSnackbar] = useState({ 
        open: false, 
        message: '', 
        severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
    });

    const [currentPackage, setCurrentPackage] = useState<ServicePackage>({
        id: "",
        centerId: "",
        name: "",
        vehicleType: "ALL",
        description: "",
        price: DEFAULT_PRICE,
        duration: DEFAULT_DURATION,
        features: [],
        isActive: true
    });

    const [featuresInput, setFeaturesInput] = useState("");
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, name: string }>({ isOpen: false, id: '', name: '' });

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const tasks: Promise<any>[] = [fetchPackages()];
                if (!centersData || centersData.length === 0) {
                    tasks.push(fetchCenters());
                }
                await Promise.all(tasks);
            } catch (err) {
                showSnackbar("Failed to initialize service packages", "error");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchPackages = async () => {
        try {
            const response = await axios.get(APP_CONFIG.api.baseUrl + "/service-packages/current");
            const mappedData = (response.data || []).map((pkg: any) => ({
                id: pkg.packageId,
                centerId: pkg.centerId,
                name: pkg.name,
                type: pkg.type,
                vehicleType: pkg.vehicleType || "ALL",
                description: pkg.description,
                price: pkg.basePrice,
                duration: pkg.estimatedDurationMins,
                features: pkg.type ? pkg.type.split(",").filter((f: string) => f.length > 0) : [],
                isActive: pkg.isActive
            }));
            setPackages(mappedData);
        } catch (error: any) {
            console.error("Error fetching packages:", error);
        }
    };

    const fetchCenters = async () => {
        try {
            const response = await axios.get(APP_CONFIG.api.serviceCenters + "/current");
            setCenters(mapCenters(response.data));
        } catch (error: any) {
            console.error("Error fetching centers:", error);
        }
    };

    const handleOpenCreate = () => {
        setCurrentPackage({
            id: "",
            centerId: centers.length > 0 ? centers[0].id : "",
            name: "",
            vehicleType: "ALL",
            description: "",
            price: DEFAULT_PRICE,
            duration: DEFAULT_DURATION,
            features: [],
            isActive: true
        });
        setFeaturesInput("");
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (pkg: ServicePackage) => {
        setCurrentPackage({ ...pkg, vehicleType: pkg.vehicleType || "ALL" });
        setFeaturesInput(pkg.features.join("\n"));
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const processedFeatures = featuresInput.split("\n").map(f => f.trim()).filter(f => f.length > 0);
        const packageData = {
            packageId: isEditing ? currentPackage.id : undefined,
            centerId: currentPackage.centerId,
            name: currentPackage.name,
            type: processedFeatures.join(","),
            vehicleType: currentPackage.vehicleType === "ALL" ? null : currentPackage.vehicleType,
            description: currentPackage.description,
            basePrice: Number(currentPackage.price),
            estimatedDurationMins: Number(currentPackage.duration),
            isActive: currentPackage.isActive
        };

        try {
            if (isEditing) {
                await axios.put(`${APP_CONFIG.api.baseUrl}/service-packages/${currentPackage.id}`, packageData);
            } else {
                await axios.post(`${APP_CONFIG.api.baseUrl}/service-packages`, packageData);
            }
            showSnackbar("Saved successfully");
            fetchPackages();
            setIsModalOpen(false);
        } catch (err) {
            showSnackbar("Failed to save", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${APP_CONFIG.api.baseUrl}/service-packages/${id}`);
            showSnackbar("Deleted successfully");
            fetchPackages();
        } catch (err) {
            showSnackbar("Failed to delete", "error");
        }
        setDeleteModal({ isOpen: false, id: '', name: '' });
    };

    const isExpired = ownerData?.subscriptionStatus === 'TRIAL_EXPIRED' || ownerData?.subscriptionStatus === 'PREMIUM_EXPIRED';
    const activeCount = packages.filter(p => p.isActive).length;
    const avgPrice = packages.length > 0 ? packages.reduce((acc, p) => acc + (p.price || 0), 0) / packages.length : 0;
    const distinctCentersCount = new Set(packages.map(p => p.centerId)).size;

    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            if (selectedVehicleFilter !== "ALL" && (pkg.vehicleType || "ALL") !== selectedVehicleFilter) return false;
            if (selectedCenterFilter !== "ALL" && pkg.centerId !== selectedCenterFilter) return false;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return pkg.name.toLowerCase().includes(query) || pkg.description.toLowerCase().includes(query) || pkg.features.some(f => f.toLowerCase().includes(query));
            }
            return true;
        });
    }, [packages, selectedVehicleFilter, selectedCenterFilter, searchQuery]);

    const centerNameMap = useMemo(() => {
        return centers.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as Record<string, string>);
    }, [centers]);

    return (
        <Box pb={4}>
            <ServicesHeader onAdd={handleOpenCreate} isExpired={isExpired} />

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard title="Total Packages" count={packages.length.toString()} percentage={{ color: 'info', amount: `${packages.length}`, label: 'configured' }} icon={<FiLayers />} color="primary" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard title="Active Packages" count={activeCount.toString()} percentage={{ color: 'success', amount: `${packages.length > 0 ? Math.round((activeCount / packages.length) * 100) : 0}%`, label: 'online' }} icon={<FiCheckCircle />} color="success" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard title="Assigned Centers" count={distinctCentersCount.toString()} percentage={{ color: 'info', amount: `${distinctCentersCount} / ${centers.length}`, label: 'branches' }} icon={<FiMapPin />} color="info" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard title="Avg. Package Price" count={`Rs. ${Math.round(avgPrice).toLocaleString()}`} percentage={{ color: 'warning', amount: 'Base', label: 'average' }} icon={<FiDollarSign />} color="warning" />
                </Grid>
            </Grid>

            <Card sx={{ p: 2.5, mb: 4, borderRadius: '1rem', border: '1px solid', borderColor: 'divider', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'center' }} justifyContent="space-between">
                    <TextField
                        size="small"
                        placeholder="Search service packages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><FiSearch color="#94a3b8" /></InputAdornment>,
                            endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery("")}><FiX size={15} /></IconButton></InputAdornment> : null
                        }}
                        sx={{ width: { xs: '100%', md: 380 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem', bgcolor: '#ffffff' } }}
                    />
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                            <InputLabel>Filter by Branch</InputLabel>
                            <Select value={selectedCenterFilter} label="Filter by Branch" onChange={(e) => setSelectedCenterFilter(e.target.value)}>
                                <MenuItem value="ALL">All Service Centers</MenuItem>
                                {centers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        {(searchQuery || selectedVehicleFilter !== "ALL" || selectedCenterFilter !== "ALL") && (
                            <Button size="small" variant="text" onClick={() => { setSearchQuery(""); setSelectedVehicleFilter("ALL"); setSelectedCenterFilter("ALL"); }} sx={{ color: BRAND_ORANGE, fontWeight: 700, textTransform: 'none' }}>Reset</Button>
                        )}
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Tabs 
                    value={selectedVehicleFilter} 
                    onChange={(_, val) => setSelectedVehicleFilter(val)} 
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 48,
                        '& .MuiTabs-indicator': { backgroundColor: BRAND_ORANGE, height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { 
                            textTransform: 'none', 
                            fontWeight: 600, 
                            fontSize: '0.875rem', 
                            color: '#64748b', 
                            minHeight: 48,
                            px: 2,
                            '&.Mui-selected': { color: BRAND_ORANGE, fontWeight: 700 } 
                        }
                    }}
                >
                    {VEHICLE_TYPE_OPTIONS.map((opt) => {
                        const count = packages.filter(p => opt.value === "ALL" ? true : (p.vehicleType || "ALL") === opt.value).length;
                        const IconComponent = opt.Icon;
                        return (
                            <Tab 
                                key={opt.value} 
                                value={opt.value} 
                                icon={<IconComponent size={15} style={{ marginBottom: 0 }} />}
                                iconPosition="start"
                                label={
                                    <Box component="span" display="inline-flex" alignItems="center" gap={0.75}>
                                        <span>{opt.label}</span>
                                        <Chip
                                            label={count}
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                bgcolor: selectedVehicleFilter === opt.value ? alpha(BRAND_ORANGE, 0.12) : '#f1f5f9',
                                                color: selectedVehicleFilter === opt.value ? BRAND_ORANGE : '#64748b',
                                                borderRadius: '999px',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    </Box>
                                } 
                            />
                        );
                    })}
                </Tabs>
            </Card>

            <Grid container spacing={3}>
                {isLoading ? (
                    <Grid size={{ xs: 12 }}><Box py={10} textAlign="center"><CircularProgress sx={{ color: BRAND_ORANGE }} /></Box></Grid>
                ) : filteredPackages.length === 0 ? (
                    <Grid size={{ xs: 12 }}><EmptyState icon={<FiLayers size={40} />} title="No Packages" description="No packages found." actionLabel="Create" onAction={handleOpenCreate} /></Grid>
                ) : (
                    filteredPackages.map((pkg) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={pkg.id}>
                            <ServicePackageCard 
                                pkg={pkg} 
                                centerName={centerNameMap[pkg.centerId] || "Assigned Branch"}
                                onEdit={handleOpenEdit} 
                                onDelete={(id: string) => setDeleteModal({ isOpen: true, id, name: pkg.name })} 
                                isExpired={isExpired}
                            />
                        </Grid>
                    ))
                )}
            </Grid>

            {isModalOpen && (
                <ServicePackageDialog
                    isEditing={isEditing}
                    currentPackage={currentPackage}
                    setCurrentPackage={setCurrentPackage}
                    featuresInput={featuresInput}
                    setFeaturesInput={setFeaturesInput}
                    centers={centers}
                    handleSave={handleSave}
                    handleCloseModal={handleCloseModal}
                    isSaving={isSaving}
                />
            )}

            <ConfirmDialog
                open={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
                title="Delete Package?"
                message={`Are you sure you want to delete ${deleteModal.name}?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => handleDelete(deleteModal.id)}
            />

            <FeedbackSnackbar 
                open={snackbar.open} 
                severity={snackbar.severity}
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </Box>
    );
}
