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
    FormControl,
    InputLabel,
    Chip,
    Snackbar,
    Alert,
    Avatar,
    InputAdornment,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    alpha
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import {
    FiPlus,
    FiBriefcase,
    FiTrash2,
    FiSearch,
    FiMail,
    FiLock
} from "react-icons/fi";
import { APP_CONFIG } from "@/utils/config";

/**
 * DATA MODELS: Defining strict types for managers and centers 
 * ensures that our data transformations are type-safe and consistent.
 */
interface ManagerView {
    id: string;
    name: string;
    email: string;
    phone: string;
    center: string;
    centerId: string;
    status: string;
    lastLogin: string;
    avatar: string;
}

interface CenterAPIResponse { centerId: string; name: string; }

/**
 * TABLE COLUMNS: Defining the table structure outside the component 
 * reduces complexity and improves rendering performance.
 */
const getManagerColumns = (theme: any, onEdit: any, onToggle: any, onDelete: any): GridColDef[] => [
    {
        field: 'name', headerName: 'Name', flex: 2, minWidth: 250,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={2} height="100%">
                <Avatar src={p.row.avatar} sx={{ bgcolor: theme.palette.primary.main, color: '#fff' }}>{p.row.name.charAt(0)}</Avatar>
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold">{p.row.name}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}><FiBriefcase size={12} /><Typography variant="caption">Manager</Typography></Box>
                </Box>
            </Box>
        )
    },
    { field: 'center', headerName: 'Center', flex: 1.5, minWidth: 200, renderCell: (p: GridRenderCellParams) => <Typography variant="body2">{p.value}</Typography> },
    {
        field: 'email', headerName: 'Access Info', flex: 1.5, minWidth: 250,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                <Box display="flex" alignItems="center" gap={1}><FiMail size={12} /><Typography variant="caption">{p.value}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1}><FiLock size={12} /><Typography variant="caption">Last: {p.row.lastLogin}</Typography></Box>
            </Box>
        )
    },
    {
        field: 'status', headerName: 'Status', flex: 1,
        renderCell: (p: GridRenderCellParams) => <Chip label={p.value} size="small" sx={{ fontWeight: 'bold', bgcolor: p.value === 'Active' ? '#E6F4EA' : '#FCE8E6', color: p.value === 'Active' ? '#1E8E3E' : '#C5221F' }} />
    },
    {
        field: 'actions', headerName: 'Actions', flex: 1.5, minWidth: 220, align: 'right', sortable: false,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" gap={1} height="100%" alignItems="center" justifyContent="flex-end">
                <Button size="small" variant="outlined" onClick={() => onEdit(p.row)}>Edit</Button>
                <Button size="small" color={p.row.status === 'Active' ? 'warning' : 'success'} onClick={() => onToggle(p.row.id, p.row.status)}>{p.row.status === 'Active' ? 'Disable' : 'Enable'}</Button>
                <IconButton size="small" color="error" onClick={() => onDelete(p.row.id)}><FiTrash2 /></IconButton>
            </Box>
        )
    }
];

/**
 * HEADER COMPONENT: Encapsulates page title and add action.
 */
function ManagersHeader({ onAdd }: { onAdd: () => void }) {
    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={4}>
            <Box>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Managers</Typography>
                <Typography variant="body1" color="text.secondary">Oversee your service center leadership team.</Typography>
            </Box>
            <Button variant="contained" color="primary" sx={{ px: 3, borderRadius: 2, textTransform: 'none' }} onClick={onAdd} startIcon={<FiPlus />}>Add Manager</Button>
        </Box>
    );
}

/**
 * DIALOG COMPONENT: Standardized form for manager data.
 */
function ManagerDialog({ open, onClose, isEdit, formData, onChange, onSave, centers }: any) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold' }}>{isEdit ? "Edit Manager Access" : "Add New Manager"}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2.5} pt={2}>
                    <TextField label="Full Name" name="name" value={formData.name} onChange={onChange} fullWidth required />
                    <FormControl fullWidth required>
                        <InputLabel>Assign Center</InputLabel>
                        <Select name="center" value={formData.center} label="Assign Center" onChange={onChange}>
                            {centers.map((c: any) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Email (Login ID)" name="email" value={formData.email} onChange={onChange} fullWidth />
                    {!isEdit && (
                        <FormControlLabel control={<Checkbox checked={formData.sendInvite} onChange={onChange} name="sendInvite" color="primary" />} label="Send Email Invitation" />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onSave} variant="contained" sx={{ borderRadius: 2, px: 4 }}>{isEdit ? "Save Changes" : "Create Account"}</Button>
            </DialogActions>
        </Dialog>
    );
}

import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * MAIN COMPONENT: Manages the lifecycle of manager accounts.
 */
export default function ManagersPage() {
    const theme = useTheme();
    const { managersData, centersData, isLoading: contextLoading, refreshAll } = useDashboardData();
    const [managers, setManagers] = useState<ManagerView[]>([]);
    const [centersList, setCentersList] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [formData, setFormData] = useState({ name: "", center: "", email: "", phone: "", status: "Active", sendInvite: true });

    useEffect(() => { 
        if (managersData.length > 0 && centersData.length > 0) {
            mapData(managersData, centersData);
        }
    }, [managersData, centersData]);

    const mapData = (mgrData: any[], ctrData: any[]) => {
        setLoading(true);
        try {
            setCentersList(ctrData.map((c: any) => c.name));
            const centersMap = ctrData.reduce((m: any, c: any) => ({ ...m, [c.centerId]: c.name }), {});
            setManagers(mgrData.map((m: any) => ({
                id: m.userId, name: m.fullName, email: m.email, phone: m.phone, 
                center: centersMap[m.managedCenterId] || "Unassigned", centerId: m.managedCenterId,
                status: m.status || "Active", lastLogin: m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString() : "Never",
                avatar: m.profilePictureUrl || `https://ui-avatars.com/api/?name=${m.fullName}`
            })));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        const center = centersData.find(c => c.name === formData.center);
        if (!center) return;
        const payload = { fullName: formData.name, email: formData.email, managedCenterId: center.centerId, status: formData.status, sendInvite: formData.sendInvite };
        try {
            if (isEditMode && selectedId) await axios.put(`${APP_CONFIG.api.managers}/${selectedId}`, payload);
            else await axios.post(APP_CONFIG.api.managers, payload);
            setOpenDialog(false);
            await refreshAll();
            setSnackbar({ open: true, message: 'Saved successfully!', severity: 'success' });
        } catch (e) { setSnackbar({ open: true, message: 'Operation failed', severity: 'error' }); }
    };

    const handleToggleStatus = async (id: string, current: string) => {
        try {
            await axios.put(`${APP_CONFIG.api.managers}/${id}`, { status: current === 'Active' ? 'Inactive' : 'Active' });
            await refreshAll();
            setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
        } catch (e) { setSnackbar({ open: true, message: 'Update failed', severity: 'error' }); }
    };

    const filtered = managers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.center.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;

    return (
        <Box pb={3}>
            <ManagersHeader onAdd={() => { setFormData({ name: "", center: "", email: "", phone: "", status: "Active", sendInvite: true }); setIsEditMode(false); setOpenDialog(true); }} />

            <Card sx={{ borderRadius: 3 }}>
                <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">Manager List</Typography>
                    <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><FiSearch /></InputAdornment> }} sx={{ minWidth: 250 }} />
                </Box>
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid rows={filtered} columns={getManagerColumns(theme, (m: any) => { setFormData({ name: m.name, center: m.center, email: m.email, phone: m.phone, status: m.status, sendInvite: false }); setSelectedId(m.id); setIsEditMode(true); setOpenDialog(true); }, handleToggleStatus, async (id: string) => { if(confirm("Delete?")) { await axios.delete(`${APP_CONFIG.api.managers}/${id}`); await refreshAll(); } })} pageSizeOptions={[5, 10]} disableRowSelectionOnClick rowHeight={80} />
                </Box>
            </Card>

            <ManagerDialog open={openDialog} onClose={() => setOpenDialog(false)} isEdit={isEditMode} formData={formData} onChange={(e: any) => setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })} onSave={handleSave} centers={centersList} />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}