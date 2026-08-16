"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";
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
    FiDollarSign, 
    FiTag 
} from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import { 
    Snackbar, 
    Alert, 
    CircularProgress,
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    Box, 
    Typography, 
    IconButton, 
    Chip, 
    InputAdornment, 
    Grid, 
    Divider, 
    Switch, 
    FormControlLabel,
    Button as MuiButton,
    alpha
} from "@mui/material";
import EmptyState from "@/components/UI/EmptyState";

/**
 * Validation and default constants for service packages.
 */
const BRAND_ORANGE = "#f3651c";
const MIN_PACKAGE_NAME_LENGTH = 3;
const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const MIN_DURATION = 5;
const MAX_DURATION = 1440; // 24 hours
const MIN_DESC_LENGTH = 10;
const DEFAULT_PRICE = 0;
const DEFAULT_DURATION = 30;

const POPULAR_FEATURE_SUGGESTIONS = [
    "Oil & Filter Change",
    "Comprehensive Engine Diagnostics",
    "Brake System Inspection",
    "Wheel Alignment & Balancing",
    "Fluid Top-up & Check",
    "Battery Health Test",
    "Full Interior & Exterior Wash"
];

/**
 * Interface defining the structure of a service package.
 * Used for maintaining consistency between the frontend and the API.
 */
interface ServicePackage {
    id: string;
    centerId: string;
    name: string;
    type?: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    isActive: boolean;
}

/**
 * CARD COMPONENT: Represents a single service package offering.
 * Separates visual layout from list management logic.
 */
function ServicePackageCard({ pkg, onEdit, onDelete }: { pkg: ServicePackage, onEdit: (pkg: ServicePackage) => void, onDelete: (id: string) => void }) {
    return (
        <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={() => onEdit(pkg)}
                    className="p-2 bg-white text-slate-600 rounded-full shadow-sm hover:text-primary hover:bg-slate-50 border border-slate-100 transition-colors"
                    title="Edit"
                >
                    <FiEdit2 size={16} />
                </button>
                <button
                    onClick={() => onDelete(pkg.id)}
                    className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 border border-slate-100 transition-colors"
                    title="Delete"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>

            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                            {pkg.name}
                        </h3>

                        <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex items-center text-xs text-slate-500">
                                <FiClock className="mr-1" size={12} />
                                {pkg.duration} mins
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-2 h-10">
                    {pkg.description}
                </p>

                <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">Rs. {Number(pkg.price).toFixed(2)}</span>
                    <span className="text-slate-500 ml-1 text-sm font-medium">/ service</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features</h4>
                    <ul className="space-y-2">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                <FiCheck className="mr-2 mt-0.5 text-primary shrink-0" size={14} />
                                <span className="line-clamp-1">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    {pkg.features.length > 3 && (
                        <p className="text-xs text-slate-400 pl-6">+ {pkg.features.length - 3} more</p>
                    )}
                    {pkg.features.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No features listed</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * FORM DIALOG: Standardized, premium dialog for adding or editing service packages.
 */
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

    const featuresList = featuresInput
        ? featuresInput.split("\n").map((f: string) => f.trim()).filter((f: string) => f.length > 0)
        : [];

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

    return (
        <Dialog 
            open={true} 
            onClose={handleCloseModal} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ 
                sx: { 
                    borderRadius: '1.5rem', 
                    p: 0.5,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                } 
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '0.875rem',
                        bgcolor: alpha(BRAND_ORANGE, 0.12),
                        color: BRAND_ORANGE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                    }}>
                        <FiPackage />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight="800" color="#1e293b" sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
                            {isEditing ? `Edit Package: ${currentPackage.name || ''}` : "Create New Package"}
                        </Typography>
                        <Typography variant="caption" color="#64748b" sx={{ fontSize: '0.825rem' }}>
                            {isEditing ? "Update your package details, pricing, and inclusions." : "Define pricing, duration, and inclusions for this service offering."}
                        </Typography>
                    </Box>
                </Box>
                <IconButton 
                    onClick={handleCloseModal} 
                    disabled={isSaving}
                    sx={{ color: '#94a3b8', '&:hover': { bgcolor: '#f1f5f9', color: '#475569' } }}
                >
                    <FiX size={20} />
                </IconButton>
            </DialogTitle>

            <Divider />

            <form onSubmit={handleSave}>
                <DialogContent sx={{ p: 3.5, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Basic Info Section */}
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        <FormControl fullWidth required>
                            <InputLabel id="service-center-select-label">Service Center Branch</InputLabel>
                            <Select
                                labelId="service-center-select-label"
                                label="Service Center Branch"
                                value={currentPackage.centerId || ""}
                                onChange={e => setCurrentPackage({ ...currentPackage, centerId: e.target.value })}
                                startAdornment={
                                    <InputAdornment position="start" sx={{ pl: 0.5 }}>
                                        <FiMapPin color={BRAND_ORANGE} />
                                    </InputAdornment>
                                }
                                sx={{ borderRadius: '0.875rem' }}
                            >
                                {centers.length === 0 ? (
                                    <MenuItem value="" disabled>No service centers available</MenuItem>
                                ) : (
                                    centers.map((center: any) => (
                                        <MenuItem key={center.id} value={center.id}>
                                            {center.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Package Name"
                            required
                            fullWidth
                            placeholder="e.g. Master Engine Tune-Up & Fluid Overhaul"
                            value={currentPackage.name || ""}
                            onChange={e => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiTag color="#94a3b8" />
                                    </InputAdornment>
                                )
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.875rem' } }}
                        />

                        {/* Pricing & Duration 2-column Grid */}
                        <Grid container spacing={2.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Price (LKR)"
                                    type="number"
                                    required
                                    fullWidth
                                    inputProps={{ min: MIN_PRICE, step: "0.01" }}
                                    placeholder="0.00"
                                    value={currentPackage.price || ""}
                                    onChange={e => {
                                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                        setCurrentPackage({ ...currentPackage, price: val });
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography fontWeight="800" color={BRAND_ORANGE} sx={{ fontSize: '0.9rem' }}>
                                                    Rs.
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.875rem' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Estimated Duration (Minutes)"
                                    type="number"
                                    required
                                    fullWidth
                                    inputProps={{ min: MIN_DURATION, step: "5" }}
                                    placeholder="30"
                                    value={currentPackage.duration || ""}
                                    onChange={e => {
                                        const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                        setCurrentPackage({ ...currentPackage, duration: val });
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FiClock color="#94a3b8" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Typography variant="caption" color="#64748b" fontWeight="600">
                                                    mins
                                                </Typography>
                                            </InputAdornment>
                                        )
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.875rem' } }}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            label="Service Description"
                            required
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Provide a detailed summary of what is covered under this service package for vehicle owners..."
                            value={currentPackage.description || ""}
                            onChange={e => setCurrentPackage({ ...currentPackage, description: e.target.value })}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.875rem' } }}
                        />
                    </Box>

                    {/* Features Section with Chip Builder */}
                    <Box sx={{
                        p: 2.5,
                        borderRadius: '1rem',
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="subtitle2" fontWeight="700" color="#1e293b">
                                    Package Inclusions & Features
                                </Typography>
                                <Typography variant="caption" color="#64748b">
                                    Add individual checklist items that customers will receive with this package.
                                </Typography>
                            </Box>
                            <Chip 
                                label={`${featuresList.length} items`} 
                                size="small" 
                                sx={{ bgcolor: alpha(BRAND_ORANGE, 0.1), color: BRAND_ORANGE, fontWeight: '700' }} 
                            />
                        </Box>

                        {/* Add Feature input */}
                        <Box display="flex" gap={1.5}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Type a feature item (e.g. Spark Plug Replacement) and press Add or Enter"
                                value={newFeatureText}
                                onChange={e => setNewFeatureText(e.target.value)}
                                onKeyDown={handleFeatureKeyDown}
                                sx={{ 
                                    bgcolor: '#ffffff',
                                    '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } 
                                }}
                            />
                            <MuiButton
                                variant="contained"
                                onClick={() => addFeature(newFeatureText)}
                                disabled={!newFeatureText.trim()}
                                startIcon={<FiPlus />}
                                sx={{
                                    bgcolor: BRAND_ORANGE,
                                    '&:hover': { bgcolor: '#d85618' },
                                    color: '#ffffff',
                                    borderRadius: '0.75rem',
                                    px: 2.5,
                                    textTransform: 'none',
                                    fontWeight: '700',
                                    flexShrink: 0
                                }}
                            >
                                Add
                            </MuiButton>
                        </Box>

                        {/* Feature Chips */}
                        {featuresList.length > 0 ? (
                            <Box display="flex" flexWrap="wrap" gap={1} pt={0.5}>
                                {featuresList.map((feat: string, idx: number) => (
                                    <Chip
                                        key={idx}
                                        label={feat}
                                        onDelete={() => removeFeature(idx)}
                                        icon={<FiCheck color={BRAND_ORANGE} size={14} />}
                                        sx={{
                                            bgcolor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            fontWeight: '600',
                                            borderRadius: '0.625rem',
                                            py: 2,
                                            '& .MuiChip-label': { color: '#334155' }
                                        }}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Typography variant="body2" color="#94a3b8" fontStyle="italic">
                                No features added yet. Add at least one feature item below or select from quick suggestions.
                            </Typography>
                        )}

                        {/* Quick Add Suggestions */}
                        <Box pt={1}>
                            <Typography variant="caption" fontWeight="700" color="#64748b" display="block" mb={1}>
                                Quick Suggestions:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.75}>
                                {POPULAR_FEATURE_SUGGESTIONS.map((sug, i) => (
                                    <Chip
                                        key={i}
                                        label={`+ ${sug}`}
                                        size="small"
                                        clickable
                                        onClick={() => addFeature(sug)}
                                        sx={{
                                            bgcolor: '#ffffff',
                                            color: '#475569',
                                            border: '1px dashed #cbd5e1',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            '&:hover': { bgcolor: alpha(BRAND_ORANGE, 0.08), borderColor: BRAND_ORANGE, color: BRAND_ORANGE }
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>

                    {/* Status Toggle Card */}
                    <Box sx={{
                        p: 2,
                        borderRadius: '1rem',
                        bgcolor: currentPackage.isActive ? '#f0fdf4' : '#f8fafc',
                        border: '1px solid',
                        borderColor: currentPackage.isActive ? '#bbf7d0' : '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight="700" color={currentPackage.isActive ? '#166534' : '#475569'}>
                                {currentPackage.isActive ? "Active Service Package" : "Inactive Draft Package"}
                            </Typography>
                            <Typography variant="caption" color={currentPackage.isActive ? '#15803d' : '#64748b'}>
                                {currentPackage.isActive 
                                    ? "Visible to customers for online booking and service requests." 
                                    : "Hidden from customer view. Can be enabled anytime."}
                            </Typography>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={Boolean(currentPackage.isActive)}
                                    onChange={e => setCurrentPackage({ ...currentPackage, isActive: e.target.checked })}
                                    sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': { color: BRAND_ORANGE },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: BRAND_ORANGE }
                                    }}
                                />
                            }
                            label=""
                        />
                    </Box>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 3, px: 3.5, gap: 1.5 }}>
                    <MuiButton
                        onClick={handleCloseModal}
                        disabled={isSaving}
                        sx={{
                            color: '#64748b',
                            fontWeight: '600',
                            textTransform: 'none',
                            borderRadius: '0.75rem',
                            px: 3
                        }}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        type="submit"
                        variant="contained"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : <FiSave />}
                        sx={{
                            bgcolor: BRAND_ORANGE,
                            '&:hover': { bgcolor: '#d85618' },
                            color: '#ffffff',
                            borderRadius: '0.75rem',
                            px: 4,
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: '700',
                            boxShadow: '0 4px 6px -1px rgba(243, 101, 28, 0.25)',
                            '&.Mui-disabled': { bgcolor: '#cbd5e1', color: '#94a3b8' }
                        }}
                    >
                        {isSaving ? "Saving Package..." : isEditing ? "Save Changes" : "Create Package"}
                    </MuiButton>
                </DialogActions>
            </form>
        </Dialog>
    );
}

/**
 * Orchestrates the management of service packages.
 * Allows creating, editing, and deleting available service offerings.
 */
export default function ServicesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [centers, setCenters] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [snackbar, setSnackbar] = useState({ 
        open: false, 
        message: '', 
        severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
    });

    const [currentPackage, setCurrentPackage] = useState<ServicePackage>({
        id: "",
        centerId: "",
        name: "",
        description: "",
        price: DEFAULT_PRICE,
        duration: DEFAULT_DURATION,
        features: [],
        isActive: true
    });

    const [featuresInput, setFeaturesInput] = useState("");

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchPackages(), fetchCenters()]);
            } catch (err) {
                showSnackbar("Failed to initialize data", "error");
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
                description: pkg.description,
                price: pkg.basePrice,
                duration: pkg.estimatedDurationMins,
                features: pkg.type ? pkg.type.split(",").filter((f: string) => f.length > 0) : [],
                isActive: pkg.isActive
            }));
            setPackages(mappedData);
        } catch (error: any) {
            console.error("Error fetching service packages:", error);
            showSnackbar(error.response?.data?.message || "Error fetching service packages", "error");
        }
    };

    const fetchCenters = async () => {
        try {
            const response = await axios.get(APP_CONFIG.api.serviceCenters + "/current");
            const mappedCenters = (response.data || []).map((center: any) => ({
                id: center.centerId,
                name: center.name
            }));
            setCenters(mappedCenters);
            if (mappedCenters.length > 0 && !currentPackage.centerId) {
                setCurrentPackage(prev => ({ ...prev, centerId: mappedCenters[0].id }));
            }
        } catch (error: any) {
            console.error("Error fetching centers:", error);
            showSnackbar("Error fetching service centers", "error");
        }
    };

    const handleOpenCreate = () => {
        if (centers.length === 0) {
            showSnackbar("Please create a service center first", "warning");
            return;
        }
        setCurrentPackage({
            id: "",
            centerId: centers[0].id,
            name: "",
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
        setCurrentPackage(pkg);
        setFeaturesInput(pkg.features.join("\n"));
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (!isSaving) setIsModalOpen(false);
    };

    const validateForm = () => {
        if (!currentPackage.name.trim() || currentPackage.name.length < MIN_PACKAGE_NAME_LENGTH) {
            showSnackbar(`Package name must be at least ${MIN_PACKAGE_NAME_LENGTH} characters`, "warning");
            return false;
        }
        if (currentPackage.price <= MIN_PRICE) {
            showSnackbar(`Price must be greater than ${MIN_PRICE}`, "warning");
            return false;
        }
        if (currentPackage.price > MAX_PRICE) {
            showSnackbar(`Price exceeds maximum allowed value`, "warning");
            return false;
        }
        if (currentPackage.duration < MIN_DURATION || currentPackage.duration > MAX_DURATION) {
            showSnackbar(`Duration must be between ${MIN_DURATION} minutes and ${MAX_DURATION / 60} hours`, "warning");
            return false;
        }
        if (!currentPackage.description.trim() || currentPackage.description.length < MIN_DESC_LENGTH) {
            showSnackbar(`Please provide a more detailed description (min ${MIN_DESC_LENGTH} chars)`, "warning");
            return false;
        }
        if (!currentPackage.centerId) {
            showSnackbar("Please select a service center", "warning");
            return false;
        }
        return true;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        const processedFeatures = featuresInput
            .split("\n")
            .map(f => f.trim())
            .filter(f => f.length > 0);

        const packageData = {
            packageId: isEditing ? currentPackage.id : undefined,
            centerId: currentPackage.centerId,
            name: currentPackage.name,
            type: processedFeatures.join(","),
            description: currentPackage.description,
            basePrice: Number(currentPackage.price),
            estimatedDurationMins: Number(currentPackage.duration),
            isActive: currentPackage.isActive
        };

        try {
            if (isEditing) {
                await axios.put(`${APP_CONFIG.api.baseUrl}/service-packages/${currentPackage.id}`, packageData);
                showSnackbar("Service package updated successfully");
            } else {
                await axios.post(`${APP_CONFIG.api.baseUrl}/service-packages`, packageData);
                showSnackbar("Service package created successfully");
            }
            await fetchPackages();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving service package:", error);
            showSnackbar(error.response?.data?.message || "Failed to save service package", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, name: string }>({ isOpen: false, id: '', name: '' });

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${APP_CONFIG.api.baseUrl}/service-packages/${id}`);
            showSnackbar("Service package deleted successfully");
            fetchPackages();
            setDeleteModal({ isOpen: false, id: '', name: '' });
        } catch (error: any) {
            console.error("Error deleting service package:", error);
            showSnackbar(error.response?.data?.message || "Failed to delete service package", "error");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
            <PageHeader
                title="Service Packages"
                description="Create and manage your service offerings and pricing."
                action={
                    <Button onClick={handleOpenCreate}>
                        <FiPlus className="mr-2 h-4 w-4" />
                        Create Package
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <CircularProgress color="primary" sx={{ mb: 2 }} />
                        <p className="text-slate-500">Loading service packages...</p>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="col-span-full">
                        <EmptyState 
                            icon={<FiLayers />}
                            title="No Service Packages"
                            description="You haven't added any service offerings yet. Create your first service package to allow customers to book appointments."
                            actionLabel="Create First Package"
                            onAction={handleOpenCreate}
                        />
                    </div>
                ) : (
                    <>
                        {packages.map((pkg) => (
                            <ServicePackageCard 
                                key={pkg.id} 
                                pkg={pkg} 
                                onEdit={handleOpenEdit} 
                                onDelete={(id: string) => setDeleteModal({ isOpen: true, id, name: pkg.name })} 
                            />
                        ))}
                        <button
                            onClick={handleOpenCreate}
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary/50 hover:bg-slate-50 transition-all group min-h-100"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                <FiPlus className="text-slate-400 group-hover:text-primary" size={24} />
                            </div>
                            <span className="font-medium text-slate-600 group-hover:text-primary">Create New Package</span>
                        </button>
                    </>
                )}
            </div>

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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
                title="Delete Service Package?"
                message={<>Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{deleteModal.name}</strong>? This action cannot be undone.</>}
                confirmText="Delete Package"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => handleDelete(deleteModal.id)}
            />

            <FeedbackSnackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                severity={snackbar.severity}
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </div>
    );
}
