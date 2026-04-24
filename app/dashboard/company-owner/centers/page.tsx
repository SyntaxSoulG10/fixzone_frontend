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
    Paper,
    Avatar
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";
import {
    FiMapPin,
    FiPhone,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiLayout,
    FiUser,
    FiPower,
    FiSearch,
    FiActivity
} from "react-icons/fi";
import axios from "axios";
import APP_CONFIG from "@/config";

const API_BASE_URL = `${APP_CONFIG.API_BASE_URL}/api/service-centers`;
const PRIMARY_ORANGE = "#f3651c";

export default function MyCentersPage() {
    const theme = useTheme();
    const [centers, setCenters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_BASE_URL);
            const data = response.data;
            // Map backend DTO to frontend structure
            const mappedData = (data || []).map((center: any) => ({
                id: center.centerId,
                name: center.name,
                location: center.address,
                manager: center.managerName || "N/A",
                phone: center.contactPhone,
                revenue: center.revenue ? center.revenue : 0,
                status: center.isActive ? "Active" : "Inactive",
                mechanics: center.mechanicsCount || 0,
                capacity: center.currentCapacity || 0
            }));
            setCenters(mappedData);
        } catch (error) {
            console.error("Error fetching centers:", error);
            setSnackbar({ open: true, message: 'Failed to fetch centers from backend', severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        location: "",
        manager: "",
        phone: "",
        status: "Active",
        mechanics: 5,
        capacity: 0
    });

    const handleOpenAdd = () => {
        setFormData({ name: "", location: "", manager: "", phone: "", status: "Active", mechanics: 5, capacity: 0 });
        setIsEditMode(false);
        setOpenDialog(true);
    };

    const handleSave = async () => {
        const payload = {
            name: formData.name,
            address: formData.location,
            contactPhone: formData.phone,
            managerName: formData.manager,
            isActive: formData.status === 'Active',
            mechanicsCount: formData.mechanics,
            currentCapacity: formData.capacity,
            // Owner ID should be retrieved from auth context, for now we assume it's set or handled by backend
            ownerId: "00000000-0000-0000-0000-000000010011" // Placeholder
        };

        try {
            if (isEditMode && selectedId) {
                await axios.put(`${API_BASE_URL}/${selectedId}`, payload);
            } else {
                await axios.post(API_BASE_URL, payload);
            }

            fetchCenters(); // Refresh the list
            setSnackbar({
                open: true,
                message: `Center ${isEditMode ? 'updated' : 'added'} successfully`,
                severity: 'success'
            });
            setOpenDialog(false);
        } catch (error) {
            console.error("Error saving center:", error);
            setSnackbar({ open: true, message: 'Failed to save center to backend', severity: 'error' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        const centerToUpdate = centers.find(c => c.id === id);

        const payload = {
            centerId: id,
            name: centerToUpdate.name,
            address: centerToUpdate.location,
            contactPhone: centerToUpdate.phone,
            managerName: centerToUpdate.manager,
            isActive: newStatus === 'Active',
            mechanicsCount: centerToUpdate.mechanics,
            currentCapacity: centerToUpdate.capacity,
            ownerId: "00000000-0000-0000-0000-000000010011" // Keep owner ID
        };

        try {
            await axios.put(`${API_BASE_URL}/${id}`, payload);
            fetchCenters(); // Refresh the list
            setSnackbar({
                open: true,
                message: `Center ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`,
                severity: 'success'
            });
        } catch (error) {
            console.error("Error updating status:", error);
            setSnackbar({ open: true, message: 'Failed to update status in backend', severity: 'error' });
        }
    };

    const filteredCenters = centers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.manager.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ pb: 6, px: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Box
                display="flex"
                flexDirection={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ md: 'flex-start' }}
                gap={3}
                mb={6}
                mt={2}
            >
                <Box>
                    <Typography variant="h4" fontWeight="800" color="#2d3748" sx={{ fontSize: '1.875rem' }} gutterBottom>
                        My Service Centers
                    </Typography>
                    <Typography variant="body1" color="#718096" sx={{ fontSize: '1.125rem' }}>
                        Manage your branches and locations.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: PRIMARY_ORANGE,
                        '&:hover': { bgcolor: '#d85618' },
                        color: '#ffffff',
                        px: 3,
                        py: 1.2,
                        borderRadius: '0.75rem',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    onClick={handleOpenAdd}
                    startIcon={<FiPlus size={20} />}
                >
                    New Branch
                </Button>
            </Box>

            {/* Loading Stats Placeholder */}
            {isLoading && (
                <Box mb={4}>
                    <LinearProgress sx={{ borderRadius: 1, height: 6, bgcolor: alpha(PRIMARY_ORANGE, 0.1), '& .MuiLinearProgress-bar': { bgcolor: PRIMARY_ORANGE } }} />
                </Box>
            )}

            {/* Filter Section */}
            <Box mb={4} display="flex" justifyContent="flex-end">
                <TextField
                    size="small"
                    placeholder="Search branches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FiSearch color="#a0aec0" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        width: { xs: '100%', md: 300 },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '0.75rem',
                            bgcolor: '#fff',
                        }
                    }}
                />
            </Box>

            {/* Cards Grid */}
            <Grid container spacing={4}>
                {filteredCenters.map((center) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={center.id}>
                        <Card
                            sx={{
                                position: 'relative',
                                borderRadius: '1.25rem',
                                border: '1px solid #edf2f7',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                overflow: 'visible',
                                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                }
                            }}
                        >
                            {/* Branch Icon (First Letter) */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -20,
                                    left: 24,
                                    width: 56,
                                    height: 56,
                                    bgcolor: PRIMARY_ORANGE,
                                    color: '#fff',
                                    borderRadius: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    boxShadow: '0 4px 6px rgba(243, 101, 28, 0.3)',
                                    zIndex: 1
                                }}
                            >
                                {center.name.charAt(0)}
                            </Box>

                            {/* Status Badge */}
                            <Chip
                                label={center.status}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    bgcolor: center.status === 'Active' ? '#e6f4ea' : '#fee2e2',
                                    color: center.status === 'Active' ? '#1e8e3e' : '#dc2626',
                                    fontWeight: '700',
                                    fontSize: '0.75rem',
                                    borderRadius: '0.5rem',
                                    px: 0.5
                                }}
                            />

                            <Box p={3} pt={6}>
                                {/* Branch Name */}
                                <Typography variant="h6" fontWeight="700" color="#2d3748" gutterBottom sx={{ fontSize: '1.25rem' }}>
                                    {center.name}
                                </Typography>

                                {/* Info Items */}
                                <Box display="flex" flexDirection="column" gap={1.5} mb={3}>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <FiMapPin color="#a0aec0" size={18} />
                                        <Typography variant="body2" color="#718096" noWrap>
                                            {center.location}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <FiUser color="#a0aec0" size={18} />
                                        <Typography variant="body2" color="#718096">
                                            {center.manager}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <FiPhone color="#a0aec0" size={18} />
                                        <Typography variant="body2" color="#718096">
                                            {center.phone}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2.5, borderColor: '#f1f5f9' }} />

                                {/* Metrics Section */}
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 4 }}>
                                        <Typography variant="caption" color="#a0aec0" display="block" align="center" sx={{ fontWeight: '600', mb: 0.5 }}>
                                            Revenue
                                        </Typography>
                                        <Typography variant="body2" color="#1e8e3e" align="center" sx={{ fontWeight: '800' }}>
                                            Rs.{parseInt(center.revenue).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Box sx={{ width: '1px', height: '30px', bgcolor: '#f1f5f9', alignSelf: 'center' }} />
                                    <Grid size={{ xs: 3.5 }}>
                                        <Typography variant="caption" color="#a0aec0" display="block" align="center" sx={{ fontWeight: '600', mb: 0.5 }}>
                                            Team
                                        </Typography>
                                        <Typography variant="body2" color="#2d3748" align="center" sx={{ fontWeight: '800' }}>
                                            {center.mechanics}
                                        </Typography>
                                    </Grid>
                                    <Box sx={{ width: '1px', height: '30px', bgcolor: '#f1f5f9', alignSelf: 'center' }} />
                                    <Grid size={{ xs: 3.5 }}>
                                        <Typography variant="caption" color="#a0aec0" display="block" align="center" sx={{ fontWeight: '600', mb: 0.5 }}>
                                            Load
                                        </Typography>
                                        <Typography variant="body2" color="#e53e3e" align="center" sx={{ fontWeight: '800' }}>
                                            {center.capacity}%
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {/* Action Buttons */}
                                <Box display="flex" justifyContent="space-between" mt={4} alignItems="center">
                                    <Button
                                        size="small"
                                        onClick={() => handleToggleStatus(center.id, center.status)}
                                        startIcon={<FiPower size={18} />}
                                        sx={{
                                            color: center.status === 'Active' ? '#e53e3e' : '#1e8e3e',
                                            textTransform: 'none',
                                            fontWeight: '600',
                                            '&:hover': { bgcolor: alpha(center.status === 'Active' ? '#e53e3e' : '#1e8e3e', 0.1) }
                                        }}
                                    >
                                        {center.status === 'Active' ? 'Disable' : 'Enable'}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<FiEdit2 size={14} />}
                                        onClick={() => {
                                            setFormData({
                                                name: center.name,
                                                location: center.location,
                                                manager: center.manager,
                                                phone: center.phone,
                                                status: center.status,
                                                mechanics: center.mechanics,
                                                capacity: center.capacity
                                            });
                                            setSelectedId(center.id);
                                            setIsEditMode(true);
                                            setOpenDialog(true);
                                        }}
                                        sx={{
                                            bgcolor: PRIMARY_ORANGE,
                                            '&:hover': { bgcolor: '#d85618' },
                                            color: '#fff',
                                            borderRadius: '0.5rem',
                                            px: 2,
                                            textTransform: 'none',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog for Add/Edit */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: '1.25rem', p: 1 }
                }}
            >
                <DialogTitle sx={{ pb: 1, typography: 'h5', fontWeight: '800', color: '#2d3748' }}>
                    {isEditMode ? "Edit Service Center" : "Add New Service Center"}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={2}>
                        <TextField
                            label="Center Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                        />
                        <TextField
                            label="Manager Name"
                            name="manager"
                            value={formData.manager}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                        />
                        <TextField
                            label="Location Address"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={2}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        label="Status"
                                        onChange={handleChange}
                                        sx={{ borderRadius: '0.75rem' }}
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }}><Typography variant="caption" color="#a0aec0" fontWeight="600">OPERATIONAL DETAILS</Typography></Divider>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Mechanics Count"
                                    name="mechanics"
                                    type="number"
                                    value={formData.mechanics}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Current Capacity (%)"
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ color: '#718096', fontWeight: '600' }}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            bgcolor: PRIMARY_ORANGE,
                            '&:hover': { bgcolor: '#d85618' },
                            borderRadius: '0.75rem',
                            px: 4,
                            py: 1,
                            color: '#fff',
                            fontWeight: '700',
                            textTransform: 'none'
                        }}
                    >
                        {isEditMode ? "Update Branch" : "Create Branch"}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: '0.75rem', fontWeight: '600' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}