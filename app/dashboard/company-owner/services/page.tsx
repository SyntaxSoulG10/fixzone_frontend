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
    FiGrid,
    FiAlertCircle
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

export const VEHICLE_BRAND_OPTIONS = [
    { value: "ALL", label: "All Brands (Universal)" },
    { value: "Toyota", label: "Toyota" },
    { value: "Honda", label: "Honda" },
    { value: "Nissan", label: "Nissan" },
    { value: "Suzuki", label: "Suzuki" },
    { value: "Mitsubishi", label: "Mitsubishi" },
    { value: "Hyundai", label: "Hyundai" },
    { value: "Kia", label: "Kia" },
    { value: "Mazda", label: "Mazda" },
    { value: "BMW", label: "BMW" },
    { value: "Mercedes-Benz", label: "Mercedes-Benz" },
    { value: "Audi", label: "Audi" },
    { value: "Ford", label: "Ford" },
    { value: "Tata", label: "Tata" },
    { value: "Mahindra", label: "Mahindra" },
    { value: "Subaru", label: "Subaru" },
    { value: "Lexus", label: "Lexus" },
    { value: "Land Rover", label: "Land Rover" },
    { value: "Yamaha", label: "Yamaha" },
    { value: "Bajaj", label: "Bajaj" },
    { value: "TVS", label: "TVS" },
    { value: "OTHER", label: "Other / Custom" }
];

export const COMPATIBLE_BRANDS_BY_TYPE: Record<string, string[]> = {
    "ALL": ["ALL", "Toyota", "Honda", "Nissan", "Suzuki", "Mitsubishi", "Hyundai", "BMW", "Mercedes-Benz"],
    "CAR": ["ALL", "Toyota", "Honda", "Nissan", "Suzuki", "Mitsubishi", "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Mazda"],
    "SUV": ["ALL", "Toyota", "Nissan", "Mitsubishi", "Honda", "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Audi", "Land Rover", "Ford"],
    "VAN": ["ALL", "Toyota", "Nissan", "Suzuki", "Mitsubishi", "Hyundai", "Mercedes-Benz", "Ford", "Tata"],
    "BUS": ["ALL", "Toyota", "Nissan", "Mercedes-Benz", "Tata", "Mitsubishi", "OTHER"],
    "TRUCK": ["ALL", "Toyota", "Nissan", "Mitsubishi", "Ford", "Tata", "Mahindra", "Mercedes-Benz", "OTHER"],
    "BIKE": ["ALL", "Honda", "Yamaha", "Suzuki", "Bajaj", "TVS", "BMW", "OTHER"]
};

export function validateBrandAndType(vehicleType?: string, vehicleBrand?: string): { isValid: boolean; error?: string } {
    if (!vehicleBrand || vehicleBrand === "ALL" || !vehicleType || vehicleType === "ALL") {
        return { isValid: true };
    }

    const type = vehicleType.toUpperCase();
    const brand = vehicleBrand.trim();

    // 1. BIKE (Motorcycle / Scooter)
    if (type === "BIKE") {
        const incompatibleForBike = ["Toyota", "Nissan", "Hyundai", "Kia", "Mazda", "Audi", "Mercedes-Benz", "Subaru", "Lexus", "Tata", "Mahindra", "Ford", "Land Rover"];
        if (incompatibleForBike.some(b => b.toLowerCase() === brand.toLowerCase())) {
            return {
                isValid: false,
                error: `${brand} does not manufacture motorcycles or scooters. Please select a valid motorcycle brand (e.g. Honda, Yamaha, Suzuki, Bajaj, TVS, BMW) or change the vehicle classification.`
            };
        }
    }

    // 2. BUS (Commercial Buses & Coaches)
    if (type === "BUS") {
        const incompatibleForBus = ["BMW", "Audi", "Honda", "Suzuki", "Mazda", "Subaru", "Lexus", "Yamaha", "Bajaj", "TVS", "Kia", "Hyundai", "Land Rover", "Ford"];
        if (incompatibleForBus.some(b => b.toLowerCase() === brand.toLowerCase())) {
            return {
                isValid: false,
                error: `${brand} does not manufacture commercial passenger buses. Compatible bus brands include Toyota (Coaster), Nissan (Civilian), Mercedes-Benz, Tata, Ashok Leyland, Mitsubishi (Rosa), etc.`
            };
        }
    }

    // 3. CAR & SUV (Sedans, Hatchbacks, SUVs)
    if (type === "CAR" || type === "SUV") {
        const bikeOnlyBrands = ["Yamaha", "Bajaj", "TVS"];
        if (bikeOnlyBrands.some(b => b.toLowerCase() === brand.toLowerCase())) {
            return {
                isValid: false,
                error: `${brand} is a two-wheeler / motorcycle manufacturer and does not produce passenger cars or SUVs. Please select Motorcycle (BIKE) or a car manufacturer.`
            };
        }
    }

    // 4. VAN (Commercial Passenger & Cargo Vans)
    if (type === "VAN") {
        const incompatibleForVan = ["Yamaha", "Bajaj", "TVS", "Audi", "BMW", "Subaru", "Lexus", "Land Rover"];
        if (incompatibleForVan.some(b => b.toLowerCase() === brand.toLowerCase())) {
            return {
                isValid: false,
                error: `${brand} does not manufacture commercial passenger or cargo vans. Valid van brands include Toyota, Nissan, Suzuki, Mitsubishi, Hyundai, Ford, Tata, etc.`
            };
        }
    }

    // 5. TRUCK (Light Commercial Lorries & Heavy Pickups)
    if (type === "TRUCK") {
        const incompatibleForTruck = ["Yamaha", "Bajaj", "TVS", "Audi", "BMW", "Subaru", "Lexus"];
        if (incompatibleForTruck.some(b => b.toLowerCase() === brand.toLowerCase())) {
            return {
                isValid: false,
                error: `${brand} does not manufacture commercial lorries or pickup trucks. Valid truck brands include Toyota, Nissan, Mitsubishi, Ford, Tata, Mahindra, Isuzu, etc.`
            };
        }
    }

    return { isValid: true };
}

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
    vehicleBrand?: string;
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
    const isUniversalBrand = !pkg.vehicleBrand || pkg.vehicleBrand === "ALL";

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
                            <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.75}>
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
                                    label={isUniversalBrand ? "All Brands" : pkg.vehicleBrand}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.72rem',
                                        height: 22,
                                        bgcolor: isUniversalBrand ? '#f1f5f9' : 'rgba(59, 130, 246, 0.1)',
                                        color: isUniversalBrand ? '#64748b' : '#1d4ed8',
                                        border: `1px solid ${isUniversalBrand ? '#e2e8f0' : 'rgba(59, 130, 246, 0.3)'}`
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
    isSaving,
    dialogError
}: any) {
    const [newFeatureText, setNewFeatureText] = useState("");
    const [activePresetCategory, setActivePresetCategory] = useState("Lubrication & Fluids");
    const [isCustomBrand, setIsCustomBrand] = useState(false);

    // Sync custom brand toggle with package data on load/edit
    useEffect(() => {
        if (currentPackage.vehicleBrand && 
            !VEHICLE_BRAND_OPTIONS.some(b => b.value === currentPackage.vehicleBrand) && 
            currentPackage.vehicleBrand !== "ALL") {
            setIsCustomBrand(true);
        } else {
            setIsCustomBrand(false);
        }
    }, [currentPackage.vehicleBrand]);

    // Dynamic brand list matching selected vehicle classification
    const compatibleBrandsList = useMemo(() => {
        const type = currentPackage.vehicleType || "ALL";
        return VEHICLE_BRAND_OPTIONS.filter(opt => {
            if (opt.value === "ALL" || opt.value === "OTHER") return true;
            return validateBrandAndType(type, opt.value).isValid;
        });
    }, [currentPackage.vehicleType]);

    // Dynamic vehicle classification matching selected brand
    const compatibleVehicleTypesList = useMemo(() => {
        const brand = currentPackage.vehicleBrand;
        return VEHICLE_TYPE_OPTIONS.filter(opt => {
            if (opt.value === "ALL") return true;
            return validateBrandAndType(opt.value, brand).isValid;
        });
    }, [currentPackage.vehicleBrand]);

    // Dynamic compatibility evaluation
    const compatibility = useMemo(() => {
        return validateBrandAndType(currentPackage.vehicleType, currentPackage.vehicleBrand);
    }, [currentPackage.vehicleType, currentPackage.vehicleBrand]);

    // Recommended brand presets based on vehicle classification
    const popularBrands = useMemo(() => {
        const typeKey = currentPackage.vehicleType || "ALL";
        return COMPATIBLE_BRANDS_BY_TYPE[typeKey] || COMPATIBLE_BRANDS_BY_TYPE["ALL"];
    }, [currentPackage.vehicleType]);

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
                            Configure vehicle classification, target brand (Honda, Toyota, etc.), pricing, and checklists.
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
                    {dialogError && (
                        <Box mb={2.5} p={1.5} bgcolor="#fef2f2" borderRadius="0.75rem" border="1px solid #fecaca">
                            <Typography variant="body2" color="error.main" fontWeight={600}>
                                {dialogError}
                            </Typography>
                        </Box>
                    )}

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <TextField
                                fullWidth
                                label="Package Name"
                                required
                                value={currentPackage.name}
                                onChange={(e) => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                                placeholder="e.g. Toyota / Honda Periodic Major Service"
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

                        {/* VEHICLE BRAND / MAKE SELECTION (Honda, Toyota, etc.) */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth required error={!compatibility.isValid} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                                <InputLabel>Vehicle Make / Brand</InputLabel>
                                <Select
                                    value={
                                        isCustomBrand || (!VEHICLE_BRAND_OPTIONS.some(b => b.value === (currentPackage.vehicleBrand || "ALL")))
                                            ? "OTHER"
                                            : (currentPackage.vehicleBrand || "ALL")
                                    }
                                    label="Vehicle Make / Brand"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "OTHER") {
                                            setIsCustomBrand(true);
                                            setCurrentPackage({ ...currentPackage, vehicleBrand: "" });
                                        } else {
                                            setIsCustomBrand(false);
                                            const type = currentPackage.vehicleType || "ALL";
                                            const validation = validateBrandAndType(type, val);
                                            setCurrentPackage({ 
                                                ...currentPackage, 
                                                vehicleBrand: val,
                                                vehicleType: validation.isValid ? type : "ALL"
                                            });
                                        }
                                    }}
                                >
                                    {compatibleBrandsList.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Quick Compatible Brand Preset Chips */}
                            <Box display="flex" flexWrap="wrap" gap={0.75} mt={1}>
                                {popularBrands.map((brand: string) => (
                                    <Chip
                                        key={brand}
                                        label={brand === "ALL" ? "All Brands" : brand}
                                        size="small"
                                        clickable
                                        onClick={() => {
                                            setIsCustomBrand(false);
                                            const type = currentPackage.vehicleType || "ALL";
                                            const validation = validateBrandAndType(type, brand);
                                            setCurrentPackage({ 
                                                ...currentPackage, 
                                                vehicleBrand: brand,
                                                vehicleType: validation.isValid ? type : "ALL"
                                            });
                                        }}
                                        sx={{
                                            borderRadius: '0.5rem',
                                            fontWeight: 600,
                                            fontSize: '0.72rem',
                                            bgcolor: (currentPackage.vehicleBrand || "ALL") === brand && !isCustomBrand ? 'rgba(59, 130, 246, 0.15)' : '#f1f5f9',
                                            color: (currentPackage.vehicleBrand || "ALL") === brand && !isCustomBrand ? '#1d4ed8' : '#475569',
                                            border: (currentPackage.vehicleBrand || "ALL") === brand && !isCustomBrand ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent'
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Custom Brand Input when OTHER is selected */}
                            {isCustomBrand && (
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Custom Brand Name"
                                    placeholder="Enter vehicle brand (e.g. Daihatsu, Isuzu)"
                                    value={currentPackage.vehicleBrand || ""}
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, vehicleBrand: e.target.value })}
                                    error={!compatibility.isValid}
                                    helperText={!compatibility.isValid ? compatibility.error : ""}
                                    sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                                />
                            )}
                        </Grid>

                        {/* VEHICLE TYPE CLASSIFICATION */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                                <InputLabel>Vehicle Classification</InputLabel>
                                <Select
                                    value={currentPackage.vehicleType || "ALL"}
                                    label="Vehicle Classification"
                                    onChange={(e) => {
                                        const newType = e.target.value;
                                        const brand = currentPackage.vehicleBrand || "ALL";
                                        const validation = validateBrandAndType(newType, brand);
                                        setCurrentPackage({ 
                                            ...currentPackage, 
                                            vehicleType: newType,
                                            vehicleBrand: validation.isValid ? brand : "ALL"
                                        });
                                    }}
                                >
                                    {compatibleVehicleTypesList.map((opt) => {
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

                            <Box 
                                mt={1.5}
                                px={2} 
                                py={1}
                                display="flex" 
                                alignItems="center" 
                                justifyContent="space-between" 
                                bgcolor="#f8fafc" 
                                borderRadius="0.75rem" 
                                border="1px solid #f1f5f9"
                            >
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" fontSize="0.85rem">Offer Active Status</Typography>
                                    <Typography variant="caption" color="text.secondary">Visible for customer online bookings</Typography>
                                </Box>
                                <Switch
                                    checked={currentPackage.isActive}
                                    onChange={(e) => setCurrentPackage({ ...currentPackage, isActive: e.target.checked })}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        </Grid>

                        {/* INCOMPATIBILITY WARNING ALERT */}
                        {!compatibility.isValid && (
                            <Grid size={{ xs: 12 }}>
                                <Box 
                                    p={2} 
                                    display="flex" 
                                    alignItems="flex-start" 
                                    gap={1.5} 
                                    bgcolor="#fff1f2" 
                                    borderRadius="0.75rem" 
                                    border="1px solid #fecdd3"
                                >
                                    <Box color="#e11d48" display="flex" mt={0.25} flexShrink={0}>
                                        <FiAlertCircle size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" color="#9f1239" fontWeight="bold">
                                            Incompatible Brand & Vehicle Type Combination
                                        </Typography>
                                        <Typography variant="body2" color="#be123c" sx={{ fontSize: '0.85rem', mt: 0.25 }}>
                                            {compatibility.error}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        )}

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
                                placeholder="Explain what is covered in this service package (e.g. Specialized 30-point periodic service for Honda & Toyota vehicles)..."
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
    const [selectedBrandFilter, setSelectedBrandFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [dialogError, setDialogError] = useState<string | null>(null);
    
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
        vehicleBrand: "ALL",
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
                vehicleBrand: pkg.vehicleBrand || "ALL",
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
            vehicleBrand: "ALL",
            description: "",
            price: DEFAULT_PRICE,
            duration: DEFAULT_DURATION,
            features: [],
            isActive: true
        });
        setFeaturesInput("");
        setDialogError(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (pkg: ServicePackage) => {
        setCurrentPackage({ 
            ...pkg, 
            vehicleType: pkg.vehicleType || "ALL",
            vehicleBrand: pkg.vehicleBrand || "ALL"
        });
        setFeaturesInput(pkg.features.join("\n"));
        setDialogError(null);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setDialogError(null);

        // Validation Checks
        if (!currentPackage.name || currentPackage.name.trim().length < MIN_PACKAGE_NAME_LENGTH) {
            setDialogError(`Package name must be at least ${MIN_PACKAGE_NAME_LENGTH} characters`);
            return;
        }

        if (!currentPackage.centerId) {
            setDialogError("Please assign a service center branch");
            return;
        }

        if (Number(currentPackage.price) <= 0) {
            setDialogError("Price must be greater than 0");
            return;
        }

        if (Number(currentPackage.duration) < MIN_DURATION || Number(currentPackage.duration) > MAX_DURATION) {
            setDialogError(`Duration must be between ${MIN_DURATION} and ${MAX_DURATION} minutes`);
            return;
        }

        if (!currentPackage.description || currentPackage.description.trim().length < MIN_DESC_LENGTH) {
            setDialogError(`Description must be at least ${MIN_DESC_LENGTH} characters`);
            return;
        }

        // Brand & Type Compatibility Validation
        const compatibility = validateBrandAndType(currentPackage.vehicleType, currentPackage.vehicleBrand);
        if (!compatibility.isValid) {
            setDialogError(compatibility.error || "Incompatible vehicle brand and classification combination");
            return;
        }

        setIsSaving(true);
        const processedFeatures = featuresInput.split("\n").map(f => f.trim()).filter(f => f.length > 0);
        const brandVal = currentPackage.vehicleBrand?.trim();
        const finalBrand = (!brandVal || brandVal.toUpperCase() === "ALL") ? null : brandVal;

        const packageData = {
            packageId: isEditing ? currentPackage.id : undefined,
            centerId: currentPackage.centerId,
            name: currentPackage.name.trim(),
            type: processedFeatures.join(","),
            vehicleType: currentPackage.vehicleType === "ALL" ? null : currentPackage.vehicleType,
            vehicleBrand: finalBrand,
            description: currentPackage.description.trim(),
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
            showSnackbar(isEditing ? "Package updated successfully!" : "New service package created!");
            fetchPackages();
            setIsModalOpen(false);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.details || "Failed to save package";
            setDialogError(msg);
            showSnackbar(msg, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${APP_CONFIG.api.baseUrl}/service-packages/${id}`);
            showSnackbar("Package deleted successfully");
            fetchPackages();
        } catch (err) {
            showSnackbar("Failed to delete package", "error");
        }
        setDeleteModal({ isOpen: false, id: '', name: '' });
    };

    const isExpired = ownerData?.subscriptionStatus === 'TRIAL_EXPIRED' || ownerData?.subscriptionStatus === 'PREMIUM_EXPIRED';
    const activeCount = packages.filter(p => p.isActive).length;
    const activePackages = packages.filter(p => p.isActive);
    const avgPrice = activePackages.length > 0 ? activePackages.reduce((acc, p) => acc + (p.price || 0), 0) / activePackages.length : 0;
    const distinctCentersCount = new Set(packages.map(p => p.centerId)).size;

    // Extract unique brands present in existing packages for filter
    const availableBrands = useMemo(() => {
        const brandSet = new Set<string>();
        packages.forEach(p => {
            if (p.vehicleBrand && p.vehicleBrand !== "ALL") brandSet.add(p.vehicleBrand);
        });
        return Array.from(brandSet);
    }, [packages]);

    const filteredPackages = useMemo(() => {
        return packages.filter(pkg => {
            if (selectedVehicleFilter !== "ALL" && (pkg.vehicleType || "ALL") !== selectedVehicleFilter) return false;
            if (selectedCenterFilter !== "ALL" && pkg.centerId !== selectedCenterFilter) return false;
            if (selectedBrandFilter !== "ALL" && (pkg.vehicleBrand || "ALL") !== selectedBrandFilter) return false;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                return (
                    pkg.name.toLowerCase().includes(query) || 
                    (pkg.vehicleBrand && pkg.vehicleBrand.toLowerCase().includes(query)) ||
                    pkg.description.toLowerCase().includes(query) || 
                    pkg.features.some(f => f.toLowerCase().includes(query))
                );
            }
            return true;
        });
    }, [packages, selectedVehicleFilter, selectedCenterFilter, selectedBrandFilter, searchQuery]);

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
                <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={2} alignItems={{ lg: 'center' }} justifyContent="space-between">
                    <TextField
                        size="small"
                        placeholder="Search by package name, brand (Toyota, Honda...), or features..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><FiSearch color="#94a3b8" /></InputAdornment>,
                            endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery("")}><FiX size={15} /></IconButton></InputAdornment> : null
                        }}
                        sx={{ width: { xs: '100%', lg: 380 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem', bgcolor: '#ffffff' } }}
                    />
                    <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                        <FormControl size="small" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                            <InputLabel>Filter by Branch</InputLabel>
                            <Select value={selectedCenterFilter} label="Filter by Branch" onChange={(e) => setSelectedCenterFilter(e.target.value)}>
                                <MenuItem value="ALL">All Service Centers</MenuItem>
                                {centers.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                            <InputLabel>Filter by Make / Brand</InputLabel>
                            <Select value={selectedBrandFilter} label="Filter by Make / Brand" onChange={(e) => setSelectedBrandFilter(e.target.value)}>
                                <MenuItem value="ALL">All Brands</MenuItem>
                                {VEHICLE_BRAND_OPTIONS.filter(b => b.value !== "ALL" && b.value !== "OTHER").map((b) => (
                                    <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
                                ))}
                                {availableBrands.filter(b => !VEHICLE_BRAND_OPTIONS.some(opt => opt.value === b)).map((b) => (
                                    <MenuItem key={b} value={b}>{b}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {(searchQuery || selectedVehicleFilter !== "ALL" || selectedCenterFilter !== "ALL" || selectedBrandFilter !== "ALL") && (
                            <Button 
                                size="small" 
                                variant="text" 
                                onClick={() => { 
                                    setSearchQuery(""); 
                                    setSelectedVehicleFilter("ALL"); 
                                    setSelectedCenterFilter("ALL"); 
                                    setSelectedBrandFilter("ALL");
                                }} 
                                sx={{ color: BRAND_ORANGE, fontWeight: 700, textTransform: 'none' }}
                            >
                                Reset
                            </Button>
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
                    <Grid size={{ xs: 12 }}><EmptyState icon={<FiLayers size={40} />} title="No Service Packages Found" description="No packages matching the selected filters. Try changing your search or brand filters." actionLabel="Create Package" onAction={handleOpenCreate} /></Grid>
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
                    dialogError={dialogError}
                />
            )}

            <ConfirmDialog
                open={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
                title="Delete Package?"
                message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
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
