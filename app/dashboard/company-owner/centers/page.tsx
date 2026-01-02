"use client";

import React, { useState } from "react";
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
    LinearProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";
import {
    FiMapPin,
    FiPhone,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiLayout
} from "react-icons/fi";

// Mock Initial Data
const INITIAL_CENTERS = [
    {
        id: 1,
        name: "Downtown Branch",
        location: "123 Main St, New York, NY",
        phone: "+1 (555) 123-4567",
        revenue: "45200",
        status: "Active",
        mechanics: 12,
        capacity: 85 // % full
    },
    {
        id: 2,
        name: "Westside Hub",
        location: "456 West Ave, New York, NY",
        phone: "+1 (555) 987-6543",
        revenue: "32100",
        status: "Active",
        mechanics: 8,
        capacity: 45 // % full
    },
];

export default function MyCentersPage() {
    const theme = useTheme();
    const [centers, setCenters] = useState(INITIAL_CENTERS);

    // Feedback State
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        phone: "",
        status: "Active",
        mechanics: 5,
        capacity: 0
    });

    // --- CRUD Operations ---

    const handleOpenAdd = () => {
        setFormData({ name: "", location: "", phone: "", status: "Active", mechanics: 5, capacity: 0 });
        setIsEditMode(false);
        setOpenDialog(true);
    };

    const handleSave = () => {
        if (isEditMode && selectedId !== null) {
            // Update existing
            setCenters(prev => prev.map(c =>
                c.id === selectedId
                    ? { ...c, ...formData }
                    : c
            ));
            setSnackbar({ open: true, message: 'Center updated successfully', severity: 'success' });
        } else {
            // Create new
            const newId = Math.max(...centers.map(c => c.id), 0) + 1;
            setCenters(prev => [...prev, { id: newId, revenue: "0", ...formData }]);
            setSnackbar({ open: true, message: 'New center added successfully!', severity: 'success' });
        }
        setOpenDialog(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const getCenterStatusStyles = (status: string) => {
        switch (status) {
            case 'Active':
                return {
                    bgcolor: '#E6F4EA',
                    color: '#1E8E3E',
                    border: '1px solid #E6F4EA'
                };
            case 'Maintenance':
                return {
                    bgcolor: '#FFF4E5',
                    color: '#B76E00',
                    border: '1px solid #FFF4E5'
                };
            case 'Inactive':
                return {
                    bgcolor: '#FCE8E6',
                    color: '#C5221F',
                    border: '1px solid #FCE8E6'
                };
            default:
                return {
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    color: 'text.secondary',
                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`
                };
        }
    };

    return (
        <Box pb={3}>
            {/* Header */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={6}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        My Service Centers
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your branches and locations.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ color: '#ffffff', px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }}
                    onClick={handleOpenAdd}
                    startIcon={<FiPlus />}
                >
                    New Branch
                </Button>
            </Box>

            <Grid container spacing={3}>
                {centers.length === 0 ? (
                    <Grid size={{ xs: 12 }}>
                        <Box
                            textAlign="center"
                            py={8}
                            bgcolor="background.paper"
                            borderRadius={3}
                            border="1px dashed"
                            borderColor="divider"
                            sx={{ opacity: 0.8 }}
                        >
                            <Box
                                width={80}
                                height={80}
                                borderRadius="50%"
                                bgcolor={alpha(theme.palette.primary.main, 0.08)}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                mx="auto"
                                mb={3}
                                color="primary.main"
                            >
                                <FiLayout size={40} />
                            </Box>
                            <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
                                No Service Centers Found
                            </Typography>
                            <Typography variant="body1" color="text.secondary" mb={4} maxWidth={400} mx="auto">
                                You haven't added any service centers yet. Get started by adding your first location to track performance.
                            </Typography>
                            <Button variant="outlined" startIcon={<FiPlus />} onClick={handleOpenAdd}>
                                Add First Center
                            </Button>
                        </Box>
                    </Grid>
                ) : (
                    centers.map((center) => (
                        <Grid key={center.id} size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={{
                                height: '100%',
                                position: 'relative',
                                overflow: 'visible',
                                mt: 4,
                                borderRadius: '0.75rem',
                                boxShadow: theme.shadows[1]
                            }}>
                                {/* Floating Header Icon - Orange Gradient */}
                                <Box
                                    sx={{
                                        background: center.status === 'Active'
                                            ? `linear-gradient(195deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                                            : `linear-gradient(195deg, ${theme.palette.grey[600]}, ${theme.palette.grey[800]})`,
                                        boxShadow: center.status === 'Active' ? theme.shadows[4] : theme.shadows[2],
                                        color: '#ffffff',
                                        borderRadius: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '4rem',
                                        height: '4rem',
                                        position: 'absolute',
                                        top: '-24px',
                                        left: '24px',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        zIndex: 1
                                    }}
                                >
                                    {center.name.charAt(0)}
                                </Box>

                                <Box p={3} pt={4}>
                                    <Box display="flex" justifyContent="flex-end" mb={1}>
                                        <Chip
                                            label={center.status}
                                            size="small"
                                            sx={{
                                                ...getCenterStatusStyles(center.status),
                                                height: 24,
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </Box>

                                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 1 }}>
                                        {center.name}
                                    </Typography>

                                    <Box display="flex" flexDirection="column" gap={1} mb={3}>
                                        <Box display="flex" alignItems="center" gap={1.5} color="text.secondary">
                                            <FiMapPin size={16} style={{ opacity: 0.7 }} />
                                            <Typography variant="body2" noWrap sx={{ opacity: 0.9 }}>{center.location}</Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1.5} color="text.secondary">
                                            <FiPhone size={16} style={{ opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>{center.phone}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Mini Stats */}
                                    <Grid container spacing={2} alignItems="center" mb={2}>
                                        <Grid size={4}>
                                            <Box textAlign="center">
                                                <Typography variant="caption" color="text.secondary" display="block">Revenue</Typography>
                                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                                    ${parseInt(center.revenue).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={4}>
                                            <Box textAlign="center" borderLeft={1} borderRight={1} borderColor="divider">
                                                <Typography variant="caption" color="text.secondary" display="block">Team</Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {center.mechanics}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={4}>
                                            <Box textAlign="center">
                                                <Typography variant="caption" color="text.secondary" display="block">Load</Typography>
                                                <Typography variant="body2" fontWeight="bold" color={center.capacity > 80 ? 'primary.main' : 'text.primary'}>
                                                    {center.capacity}%
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Actions Bottom */}
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<FiTrash2 />}
                                            onClick={() => {
                                                if (window.confirm("Are you sure you want to delete this center?")) {
                                                    setCenters(prev => prev.filter(c => c.id !== center.id));
                                                    setSnackbar({ open: true, message: 'Center deleted.', severity: 'success' });
                                                }
                                            }}
                                            sx={{ textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            startIcon={<FiEdit2 />}
                                            onClick={() => {
                                                setFormData({
                                                    name: center.name,
                                                    location: center.location,
                                                    phone: center.phone,
                                                    status: center.status,
                                                    mechanics: center.mechanics,
                                                    capacity: center.capacity
                                                });
                                                setSelectedId(center.id);
                                                setIsEditMode(true);
                                                setOpenDialog(true);
                                            }}
                                            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                                        >
                                            Edit
                                        </Button>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    )))}
            </Grid>

            {/* Add/Edit Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ pb: 1, typography: 'h5', fontWeight: 'bold' }}>
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
                        />
                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextField
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="status"
                                        value={formData.status}
                                        label="Status"
                                        // @ts-ignore
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
                                        <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">Operational Details</Typography></Divider>

                        <Grid container spacing={2}>
                            <Grid size={6}>
                                <TextField
                                    label="Mechanics Count"
                                    name="mechanics"
                                    type="number"
                                    value={formData.mechanics}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    label="Current Capacity (%)"
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    fullWidth
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2, px: 4, color: '#fff' }}
                    >
                        {isEditMode ? "Save Changes" : "Create Branch"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
