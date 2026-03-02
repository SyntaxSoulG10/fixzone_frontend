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
    Paper
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
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

const API_BASE_URL = "http://127.0.0.1:8081/api/service-centers";

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

    const getStatusChipColor = (status: string) => {
        switch (status) {
            case 'Active':
                return { bgcolor: '#E6F4EA', color: '#1E8E3E' };
            case 'Inactive':
                return { bgcolor: '#FCE8E6', color: '#C5221F' };
            default:
                return { bgcolor: alpha(theme.palette.grey[500], 0.1), color: 'text.secondary' };
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Service Center',
            flex: 2,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={2} height="100%">
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                    >
                        {params.row.name.charAt(0)}
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {params.row.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <FiMapPin size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {params.row.location}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            field: 'manager',
            headerName: 'Manager',
            flex: 1.2,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={1} height="100%">
                    <FiUser size={14} color={theme.palette.text.secondary} />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'phone',
            headerName: 'Contact',
            flex: 1.2,
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={1} height="100%">
                    <FiPhone size={14} color={theme.palette.text.secondary} />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'revenue',
            headerName: 'Revenue',
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" height="100%">
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                        Rs. {parseInt(params.value).toLocaleString()}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'mechanics',
            headerName: 'Team',
            flex: 0.8,
            minWidth: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" height="100%">
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            ...getStatusChipColor(params.value),
                            fontWeight: 'bold',
                            borderRadius: '6px'
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1.5,
            minWidth: 200,
            headerAlign: 'right',
            align: 'right',
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" justifyContent="flex-end" gap={1} height="100%" alignItems="center">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                            setFormData({
                                name: params.row.name,
                                location: params.row.location,
                                manager: params.row.manager,
                                phone: params.row.phone,
                                status: params.row.status,
                                mechanics: params.row.mechanics,
                                capacity: params.row.capacity
                            });
                            setSelectedId(params.row.id);
                            setIsEditMode(true);
                            setOpenDialog(true);
                        }}
                    >
                        <FiEdit2 size={16} />
                    </IconButton>
                    <IconButton
                        size="small"
                        color={params.row.status === 'Active' ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(params.row.id, params.row.status)}
                    >
                        <FiPower size={16} />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box pb={3}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        Service Centers
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your branch locations and oversee operational data.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ color: '#ffffff', px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontSize: '1rem', boxShadow: theme.shadows[3] }}
                    onClick={handleOpenAdd}
                    startIcon={<FiPlus />}
                >
                    New Center
                </Button>
            </Box>

            <Card sx={{ boxShadow: theme.shadows[1], borderRadius: 3, overflow: 'hidden' }}>
                <Box p={2} borderBottom={1} borderColor="divider" display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Typography variant="h6" fontWeight="bold">
                        Center List
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="Search centers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch color={theme.palette.text.secondary} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 250 }}
                    />
                </Box>
                <Box sx={{ height: 600, width: '100%' }}>
                    {isLoading && <LinearProgress sx={{ width: '100%', position: 'absolute' }} />}
                    <DataGrid
                        rows={filteredCenters}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        rowHeight={70}
                        sx={{
                            border: 0,
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                borderBottom: '1px solid #e2e8f0',
                                color: 'text.secondary',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem'
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid #f1f5f9'
                            }
                        }}
                    />
                </Box>
            </Card>

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
                            label="Manager Name"
                            name="manager"
                            value={formData.manager}
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
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Inactive">Inactive</MenuItem>
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
