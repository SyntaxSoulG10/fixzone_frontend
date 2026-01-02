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
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    InputAdornment
} from "@mui/material";
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
    FiPower
} from "react-icons/fi";

// Mock Data
const INITIAL_MANAGERS = [
    {
        id: 1,
        name: "Alice Johnson",
        center: "Downtown Branch",
        email: "alice@example.com",
        phone: "+1 (555) 101-2020",
        status: "Active",
        avatar: "",
    },
    {
        id: 2,
        name: "Bob Williams",
        center: "Westside Hub",
        email: "bob@example.com",
        phone: "+1 (555) 303-4040",
        status: "Active",
        avatar: "",
    },
    {
        id: 3,
        name: "Charlie Brown",
        center: "North Branch",
        email: "charlie@example.com",
        phone: "+1 (555) 505-6060",
        status: "Inactive",
        avatar: "",
    }
];

const SERVICE_CENTERS = [
    "Downtown Branch",
    "Westside Hub",
    "North Branch",
    "East End Garage"
];

export default function ManagersPage() {
    const theme = useTheme();
    const [managers, setManagers] = useState(INITIAL_MANAGERS);
    const [searchTerm, setSearchTerm] = useState("");

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
        center: "",
        email: "",
        phone: "",
        status: "Active"
    });

    const handleOpenAdd = () => {
        setFormData({ name: "", center: "", email: "", phone: "", status: "Active" });
        setIsEditMode(false);
        setOpenDialog(true);
    };

    const handleOpenEdit = (manager: any) => {
        setFormData({
            name: manager.name,
            center: manager.center,
            email: manager.email,
            phone: manager.phone,
            status: manager.status
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
                m.id === selectedId ? { ...m, ...formData } : m
            ));
            setSnackbar({ open: true, message: 'Manager updated successfully', severity: 'success' });
        } else {
            const newId = Math.max(...managers.map(m => m.id), 0) + 1;
            setManagers(prev => [...prev, { id: newId, ...formData, avatar: "" }]);
            setSnackbar({ open: true, message: 'Manager added successfully', severity: 'success' });
        }
        setOpenDialog(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name as string]: value }));
    };

    const handleToggleStatus = (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        setManagers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        setSnackbar({
            open: true,
            message: `Manager ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`,
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

    return (
        <Box pb={3}>
            {/* Header */}
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

            {/* Content */}
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
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Assigned Service Center</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Contact Details</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredManagers.map((manager) => (
                                <TableRow key={manager.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff' }}>
                                                {manager.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {manager.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ID: #{manager.id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <FiBriefcase color={theme.palette.text.secondary} />
                                            <Typography variant="body2">{manager.center}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column" gap={0.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <FiMail size={14} color={theme.palette.text.secondary} />
                                                <Typography variant="caption">{manager.email}</Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <FiPhone size={14} color={theme.palette.text.secondary} />
                                                <Typography variant="caption">{manager.phone}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={manager.status}
                                            size="small"
                                            sx={{
                                                ...getStatusChipColor(manager.status),
                                                fontWeight: 'bold',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleOpenEdit(manager)}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                Assign / Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                color={manager.status === 'Active' ? 'error' : 'success'}
                                                onClick={() => handleToggleStatus(manager.id, manager.status)}
                                                startIcon={<FiPower />}
                                                sx={{ textTransform: 'none', borderRadius: 2 }}
                                            >
                                                {manager.status === 'Active' ? 'Disable' : 'Enable'}
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredManagers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">No managers found matching your search.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

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
                    {isEditMode ? "Edit Manager" : "Add New Manager"}
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
                            <InputLabel>Assigned Service Center</InputLabel>
                            <Select
                                name="center"
                                value={formData.center}
                                label="Assigned Service Center"
                                // @ts-ignore
                                onChange={handleChange}
                            >
                                {SERVICE_CENTERS.map((center) => (
                                    <MenuItem key={center} value={center}>{center}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                            variant="outlined"
                        />
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
                            </Select>
                        </FormControl>
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
                        {isEditMode ? "Save Changes" : "Add Manager"}
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
