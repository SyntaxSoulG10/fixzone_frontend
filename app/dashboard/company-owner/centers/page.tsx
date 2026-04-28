"use client";

import React, { useState, useEffect } from "react";
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
    Snackbar,
    Alert,
    LinearProgress,
    SelectChangeEvent,
    InputAdornment,
    alpha
} from "@mui/material";
import {
    FiMapPin,
    FiPhone,
    FiPlus,
    FiEdit2,
    FiUser,
    FiPower,
    FiSearch,
    FiTrash2
} from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";

/**
 * Global branding constants.
 * Centralizes theme configuration and avoids magic numbers.
 */
const BRAND_ORANGE = "#f3651c";
const DEFAULT_MECHANICS = 5;
const DEFAULT_CAPACITY = 0;
const MIN_CENTER_NAME_LENGTH = 3;
const PHONE_REGEX = /^[0-9+]{10,15}$/;

/**
 * Interfaces for service center data.
 * Ensures type safety and predictable data handling.
 */
interface ServiceCenterView {
    id: string;
    name: string;
    location: string;
    manager: string;
    phone: string;
    revenue: number;
    status: "Active" | "Inactive";
    mechanics: number;
    capacity: number;
}

/**
 * Encapsulates the page title and primary action button.
 */
function CentersHeader({ onAdd }: { onAdd: () => void }) {
    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'flex-start' }} gap={3} mb={6} mt={2}>
            <Box>
                <Typography variant="h4" fontWeight="800" color="#2d3748" sx={{ fontSize: '1.875rem' }} gutterBottom>
                    My Service Centers
                </Typography>
                <Typography variant="body1" color="#718096" sx={{ fontSize: '1.125rem' }}>
                    Manage your branches and operational locations.
                </Typography>
            </Box>
            <Button
                variant="contained"
                onClick={onAdd}
                startIcon={<FiPlus size={20} />}
                sx={{
                    bgcolor: BRAND_ORANGE, '&:hover': { bgcolor: '#d85618' },
                    color: '#ffffff', px: 3, py: 1.2, borderRadius: '0.75rem',
                    textTransform: 'none', fontSize: '1rem', fontWeight: '600',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
            >
                New Branch
            </Button>
        </Box>
    );
}

/**
 * Represents a single service center branch.
 * Separates visual layout from list management logic.
 */
function CenterCard({ center, onToggleStatus, onEdit, onDelete }: { center: ServiceCenterView, onToggleStatus: any, onEdit: any, onDelete: any }) {
    const isActive = center.status === 'Active';
    
    return (
        <Card sx={{
            position: 'relative', borderRadius: '1.25rem', border: '1px solid #edf2f7',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'visible',
            transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
        }}>
            {/* Branch Badge */}
            <Box sx={{
                position: 'absolute', top: -20, left: 24, width: 56, height: 56,
                bgcolor: BRAND_ORANGE, color: '#fff', borderRadius: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: '800', boxShadow: '0 4px 6px rgba(243, 101, 28, 0.3)', zIndex: 1
            }}>
                {center.name.charAt(0)}
            </Box>

            <Chip label={center.status} size="small" sx={{
                position: 'absolute', top: 16, right: 16, fontWeight: '700', borderRadius: '0.5rem',
                bgcolor: isActive ? '#e6f4ea' : '#fee2e2', color: isActive ? '#1e8e3e' : '#dc2626'
            }} />

            <Box p={3} pt={6}>
                <Typography variant="h6" fontWeight="700" color="#2d3748" gutterBottom>{center.name}</Typography>
                
                <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
                    <Box display="flex" alignItems="center" gap={1.5}><FiMapPin color="#a0aec0" /><Typography variant="body2" color="#718096" noWrap>{center.location}</Typography></Box>
                    <Box display="flex" alignItems="center" gap={1.5}><FiUser color="#a0aec0" /><Typography variant="body2" color="#718096">{center.manager}</Typography></Box>
                    <Box display="flex" alignItems="center" gap={1.5}><FiPhone color="#a0aec0" /><Typography variant="body2" color="#718096">{center.phone}</Typography></Box>
                </Box>

                <Divider sx={{ my: 2.5 }} />

                {/* KPI metrics for this specific center */}
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="#a0aec0" display="block" align="center" fontWeight="600">Revenue</Typography>
                        <Typography variant="body2" color="#1e8e3e" align="center" fontWeight="800">Rs.{center.revenue.toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="#a0aec0" display="block" align="center" fontWeight="600">Team Size</Typography>
                        <Typography variant="body2" color="#2d3748" align="center" fontWeight="800">{center.mechanics}</Typography>
                    </Grid>
                </Grid>

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button
                        size="small"
                        onClick={() => onToggleStatus(center.id, center.status)}
                        startIcon={<FiPower />}
                        sx={{ color: isActive ? '#e53e3e' : '#1e8e3e', fontWeight: '600', textTransform: 'none' }}
                    >
                        {isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <IconButton
                        size="small"
                        onClick={() => onDelete(center.id)}
                        sx={{ color: '#e53e3e', '&:hover': { bgcolor: 'rgba(229, 62, 62, 0.1)' } }}
                        title="Delete Branch"
                    >
                        <FiTrash2 />
                    </IconButton>
                    <Box display="flex" gap={1}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FiEdit2 />}
                            onClick={() => onEdit(center)}
                            sx={{ color: BRAND_ORANGE, borderColor: BRAND_ORANGE, borderRadius: '0.5rem', '&:hover': { bgcolor: alpha(BRAND_ORANGE, 0.05), borderColor: '#d85618' }, textTransform: 'none' }}
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
 * Standardized dialog form for adding or editing center data.
 */
function CenterDialog({ open, onClose, isEdit, formData, onChange, onSave }: any) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '1.25rem', p: 1 } }}>
            <DialogTitle sx={{ fontWeight: '800', color: '#2d3748' }}>
                {isEdit ? "Edit Service Center" : "Add New Service Center"}
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2.5} pt={2}>
                    <TextField label="Center Name" name="name" value={formData.name} onChange={onChange} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }} />
                    <TextField label="Manager Name" name="manager" value={formData.manager} onChange={onChange} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }} />
                    <TextField label="Address" name="location" value={formData.location} onChange={onChange} fullWidth multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}><TextField label="Phone" name="phone" value={formData.phone} onChange={onChange} fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }} /></Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select name="status" value={formData.status} label="Status" onChange={onChange} sx={{ borderRadius: '0.75rem' }}>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ color: '#718096' }}>Cancel</Button>
                <Button onClick={onSave} variant="contained" sx={{ bgcolor: BRAND_ORANGE, borderRadius: '0.75rem', px: 4, fontWeight: '700', textTransform: 'none' }}>
                    {isEdit ? "Update Branch" : "Create Branch"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * Orchestrates the service centers lifecycle.
 * Optimized with DashboardDataContext for instant tab switching.
 */
export default function MyCentersPage() {
    const { centersData, isLoading: isContextLoading, refreshAll } = useDashboardData();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [formData, setFormData] = useState({ name: "", location: "", manager: "", phone: "", status: "Active", mechanics: DEFAULT_MECHANICS, capacity: DEFAULT_CAPACITY });

    // Maps raw centers data from context to the view model
    const centersList: ServiceCenterView[] = centersData.map((c: any) => ({
        id: c.centerId, name: c.name, location: c.address,
        manager: c.managerName || "N/A", phone: c.contactPhone,
        revenue: c.revenue || 0, status: c.isActive ? "Active" : "Inactive",
        mechanics: c.mechanicsCount || 0, capacity: c.currentCapacity || 0
    }));

    useEffect(() => { 
        if (centersData.length === 0) refreshAll(); 
    }, [centersData.length, refreshAll]);

    const handleSave = async () => {
        // Validates input fields before submission
        if (!formData.name.trim() || formData.name.length < MIN_CENTER_NAME_LENGTH) {
            setSnackbar({ open: true, message: `Center name must be at least ${MIN_CENTER_NAME_LENGTH} characters`, severity: 'error' });
            return;
        }
        if (!formData.manager.trim()) {
            setSnackbar({ open: true, message: 'Manager name is required', severity: 'error' });
            return;
        }
        if (!formData.location.trim()) {
            setSnackbar({ open: true, message: 'Address is required', severity: 'error' });
            return;
        }
        
        // Basic phone validation (digits and min length)
        if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ''))) {
            setSnackbar({ open: true, message: 'Please enter a valid phone number (10-15 digits)', severity: 'error' });
            return;
        }

        const payload = { 
            name: formData.name, address: formData.location, contactPhone: formData.phone,
            managerName: formData.manager, isActive: formData.status === 'Active',
            mechanicsCount: formData.mechanics, currentCapacity: formData.capacity,
            ownerId: APP_CONFIG.placeholders.ownerId
        };
        setIsLoading(true);
        try {
            if (isEditMode && selectedId) {
                await axios.put(`${APP_CONFIG.api.serviceCenters}/${selectedId}`, payload);
                setSnackbar({ open: true, message: 'Center updated successfully!', severity: 'success' });
            } else {
                await axios.post(APP_CONFIG.api.serviceCenters, payload);
                setSnackbar({ open: true, message: 'New center branch created!', severity: 'success' });
            }
            
            // Refreshes global data after changes
            await refreshAll();
            setOpenDialog(false);
        } catch (e: any) { 
            const errorMsg = e.response?.data?.message || 'Save operation failed';
            setSnackbar({ open: true, message: errorMsg, severity: 'error' }); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, current: string) => {
        const center = centersData.find((c: any) => c.centerId === id);
        if (!center) return;
        setIsLoading(true);
        try {
            await axios.put(`${APP_CONFIG.api.serviceCenters}/${id}`, {
                ...center, isActive: current !== 'Active', ownerId: APP_CONFIG.placeholders.ownerId
            });
            await refreshAll();
            setSnackbar({ open: true, message: `Branch is now ${current === 'Active' ? 'Disabled' : 'Enabled'}`, severity: 'success' });
        } catch (e: any) { 
            setSnackbar({ open: true, message: e.response?.data?.message || 'Status update failed', severity: 'error' }); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (center: ServiceCenterView) => {
        setFormData({ name: center.name, location: center.location, manager: center.manager, phone: center.phone, status: center.status, mechanics: center.mechanics, capacity: center.capacity });
        setSelectedId(center.id);
        setIsEditMode(true);
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service center? This will also remove its service packages and invoices.")) return;
        
        setIsLoading(true);
        try {
            await axios.delete(`${APP_CONFIG.api.serviceCenters}/${id}`);
            setSnackbar({ open: true, message: 'Service center deleted successfully', severity: 'success' });
            await refreshAll();
        } catch (e: any) {
            setSnackbar({ open: true, message: e.response?.data?.message || 'Delete operation failed', severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = centersList.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.location.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Box sx={{ pb: 6, px: { xs: 2, md: 4 } }}>
            <CentersHeader onAdd={() => { setIsEditMode(false); setFormData({ name: "", location: "", manager: "", phone: "", status: "Active", mechanics: DEFAULT_MECHANICS, capacity: DEFAULT_CAPACITY }); setOpenDialog(true); }} />

            {isLoading && <LinearProgress sx={{ mb: 4, height: 4, bgcolor: alpha(BRAND_ORANGE, 0.1), '& .MuiLinearProgress-bar': { bgcolor: BRAND_ORANGE } }} />}

            <Box mb={4} display="flex" justifyContent="flex-end">
                <TextField
                    size="small" placeholder="Search branches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch color="#a0aec0" /></InputAdornment> }}
                    sx={{ width: { xs: '100%', md: 300 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                />
            </Box>

            <Grid container spacing={4}>
                {filtered.map(center => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={center.id}>
                        <CenterCard center={center} onToggleStatus={handleToggleStatus} onEdit={handleEditClick} onDelete={handleDelete} />
                    </Grid>
                ))}
            </Grid>

            <CenterDialog open={openDialog} onClose={() => setOpenDialog(false)} isEdit={isEditMode} formData={formData} onChange={(e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })} onSave={handleSave} />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} sx={{ borderRadius: '0.75rem' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}