"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
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
    SelectChangeEvent,
    FormControl,
    InputLabel,
    Chip,
    Snackbar,
    Alert,
    Avatar,
    Paper,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    CircularProgress
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material";
import {
    FiPlus,
    FiBriefcase,
    FiUser,
    FiTrash2,
    FiSearch,
    FiMail,
    FiPhone,
    FiPower,
    FiLock,
    FiCheckCircle
} from "react-icons/fi";


const INITIAL_MANAGERS = [
    {
        id: 1,
        name: "Anil Perera",
        center: "Colombo Main Branch",
        email: "anil.p@fixzone.lk",
        phone: "+94 77 123 4567",
        status: "Active",
        avatar: "",
        lastLogin: "2 hours ago"
    },
    {
        id: 2,
        name: "Sunil Gunawardena",
        center: "Kandy Service Center",
        email: "sunil.g@fixzone.lk",
        phone: "+94 71 234 5678",
        status: "Active",
        avatar: "",
        lastLogin: "1 day ago"
    },
    {
        id: 3,
        name: "Nimali Dias",
        center: "Galle Southern Hub",
        email: "nimali.d@fixzone.lk",
        phone: "+94 76 345 6789",
        status: "Inactive",
        avatar: "",
        lastLogin: "Never"
    }
];

const SERVICE_CENTERS = [
    "Colombo Main Branch",
    "Kandy Service Center",
    "Galle Southern Hub",
    "Negombo City Point",
    "Kurunegala Express"
];

export default function ManagersPage() {
    const theme = useTheme();
    const [managers, setManagers] = useState<any[]>([]);
    const [centersList, setCentersList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [managersRes, centersRes] = await Promise.all([
                    axios.get("http://localhost:8081/api/managers"),
                    axios.get("http://localhost:8081/api/service-centers")
                ]);

                const centersMap = centersRes.data.reduce((acc: any, center: any) => {
                    acc[center.centerId] = center.name;
                    return acc;
                }, {});

                setCentersList(centersRes.data.map((c: any) => c.name));

                const mappedManagers = managersRes.data.map((m: any) => ({
                    id: m.userId,
                    name: m.fullName,
                    email: m.email,
                    phone: m.phone,
                    center: centersMap[m.managedCenterId] || "Unassigned",
                    status: m.emailVerified ? "Active" : "Active", // Assuming active for now
                    lastLogin: m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString() : "Never",
                    avatar: ""
                }));

                setManagers(mappedManagers);
            } catch (error) {
                console.error("Error fetching managers:", error);
                setManagers(INITIAL_MANAGERS);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        center: "",
        email: "",
        phone: "",
        status: "Active",
        sendInvite: true
    });

    const handleOpenAdd = () => {
        setFormData({ name: "", center: "", email: "", phone: "", status: "Active", sendInvite: true });
        setIsEditMode(false);
        setOpenDialog(true);
    };

    const handleOpenEdit = (manager: any) => {
        setFormData({
            name: manager.name,
            center: manager.center,
            email: manager.email,
            phone: manager.phone,
            status: manager.status,
            sendInvite: false
        });
        setSelectedId(manager.id);
        setIsEditMode(true);
        setOpenDialog(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.center) {
            setSnackbar({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
            return;
        }

        if (isEditMode && selectedId !== null) {
            setManagers(prev => prev.map(m =>
                m.id === selectedId ? { ...m, ...formData, lastLogin: m.lastLogin } : m
            ));
            setSnackbar({ open: true, message: 'Manager updated successfully', severity: 'success' });
        } else {
            const newId = Math.max(...managers.map(m => m.id), 0) + 1;
            setManagers(prev => [...prev, { id: newId, ...formData, avatar: "", lastLogin: "Never" }]);
            if (formData.sendInvite) {
                console.log(`Sending invitation email to ${formData.email}`);
                setSnackbar({ open: true, message: 'Manager added & invitation sent!', severity: 'success' });
            } else {
                setSnackbar({ open: true, message: 'Manager added successfully', severity: 'success' });
            }
        }
        setOpenDialog(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent<string>) => {
        const { name, value } = e.target;

        let newValue = value;
        if ('checked' in e.target && (e.target as HTMLInputElement).type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({ ...prev, [name as string]: newValue }));
    };

    const handleToggleStatus = (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        setManagers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        setSnackbar({
            open: true,
            message: `Account access ${newStatus === 'Active' ? 'enabled' : 'disabled'}`,
            severity: 'success'
        });
    };

    const getStatusChipColor = (status: string) => {
        return status === 'Active'
            ? { bgcolor: '#E6F4EA', color: '#1E8E3E' }
            : { bgcolor: '#FCE8E6', color: '#C5221F' };
    };

    const filteredManagers = managers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.center.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 2,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={2} height="100%">
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff' }}>
                        {params.row.name.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {params.row.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <FiBriefcase size={12} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                                Manager
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )
        },
        {
            field: 'center',
            headerName: 'Assigned Center',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                    <Typography variant="body2" fontWeight="medium">{params.value}</Typography>
                    <Typography variant="caption" color="text.secondary">Active Assignment</Typography>
                </Box>
            )
        },
        {
            field: 'email',
            headerName: 'Access Info',
            flex: 1.5,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" flexDirection="column" justifyContent="center" height="100%" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FiMail size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption">{params.value}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FiLock size={14} color={theme.palette.text.secondary} />
                        <Typography variant="caption">Last login: {params.row.lastLogin}</Typography>
                    </Box>
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
            minWidth: 250,
            headerAlign: 'right',
            align: 'right',
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" justifyContent="flex-end" gap={1} height="100%" alignItems="center">
                    <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenEdit(params.row)}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        Edit Access
                    </Button>
                    <Button
                        size="small"
                        color={params.row.status === 'Active' ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(params.row.id, params.row.status)}
                        startIcon={params.row.status === 'Active' ? <FiPower /> : <FiCheckCircle />}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                        {params.row.status === 'Active' ? 'Disable' : 'Activate'}
                    </Button>
                </Box>
            )
        }
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        Managers
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your service center managers and their assignments.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ color: '#ffffff', px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontSize: '1rem', boxShadow: theme.shadows[3] }}
                    onClick={handleOpenAdd}
                    startIcon={<FiPlus />}
                >
                    Add Manager
                </Button>
            </Box>

            <Card sx={{ boxShadow: theme.shadows[1], borderRadius: 3, overflow: 'hidden' }}>
                <Box p={2} borderBottom={1} borderColor="divider" display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Typography variant="h6" fontWeight="bold">
                        Manager List
                    </Typography>
                    <TextField
                        size="small"
                        placeholder="Search managers..."
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
                    <DataGrid
                        rows={filteredManagers}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 5,
                                },
                            },
                        }}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        rowHeight={80}
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
                    {isEditMode ? "Edit Manager Access" : "Add New Manager"}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2.5} pt={2}>
                        <TextField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Assign Service Center</InputLabel>
                            <Select
                                name="center"
                                value={formData.center}
                                label="Assign Service Center"
                                onChange={handleChange}
                            >
                                {SERVICE_CENTERS.map((center) => (
                                    <MenuItem key={center} value={center}>{center}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Email Address (Login ID)"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                            helperText="This email will be used for logging in."
                        />
                        <TextField
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />

                        <Divider sx={{ my: 1 }}><Typography variant="caption" color="text.secondary">Access Control & Security</Typography></Divider>

                        <Box p={2} bgcolor="background.paper" borderRadius={2} border={1} borderColor="divider">
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2" color="text.secondary">System Role</Typography>
                                <Chip label="Manager" color="primary" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                This user will have full management access to the assigned service center dashboard.
                            </Typography>

                            {!isEditMode && (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.sendInvite}
                                            onChange={handleChange}
                                            name="sendInvite"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">Send Email Invitation</Typography>
                                            <Typography variant="caption" color="text.secondary">User will receive a link to set their own password (Recommended).</Typography>
                                        </Box>
                                    }
                                />
                            )}

                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel>Account Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    label="Account Status"
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Active">Active (Access Enabled)</MenuItem>
                                    <MenuItem value="Inactive">Inactive (Access Disabled)</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                        sx={{ borderRadius: 2, px: 4, color: '#fff', boxShadow: theme.shadows[2] }}
                    >
                        {isEditMode ? "Save Changes" : "Create Account"}
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
