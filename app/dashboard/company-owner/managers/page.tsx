"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
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
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import {
    FiPlus,
    FiBriefcase,
    FiTrash2,
    FiSearch,
    FiMail,
    FiLock,
    FiX,
    FiUsers
} from "react-icons/fi";
import { APP_CONFIG } from "@/utils/config";
import { useDashboardData } from "@/context/DashboardDataContext";
import { isValidEmail } from "@/utils/helpers";
import EmptyState from "@/components/UI/EmptyState";

/**
 * Validation and default constants for managers.
 */
const MIN_MANAGER_NAME_LENGTH = 3;

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
const getManagerColumns = (theme: any, onEdit: any, onToggle: any, onDelete: any, onResend: any, isExpired: boolean, resendingId: string | null): GridColDef[] => [
    {
        field: 'name', headerName: 'Name', flex: 2, minWidth: 250,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={2} height="100%">
                <Avatar src={p.row.avatar} sx={{ bgcolor: '#ea580c', color: '#fff', fontWeight: 700 }}>{p.row.name.charAt(0)}</Avatar>
                <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">{p.row.name}</Typography>
                    <Box display="flex" alignItems="center" gap={0.5} color="text.secondary"><FiBriefcase size={12} /><Typography variant="caption">Service Center Manager</Typography></Box>
                </Box>
            </Box>
        )
    },
    { 
        field: 'center', 
        headerName: 'Assigned Center', 
        flex: 1.5, 
        minWidth: 200, 
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" height="100%">
                <Chip label={p.value} size="small" variant="outlined" sx={{ fontWeight: 600, borderRadius: '6px' }} />
            </Box>
        ) 
    },
    {
        field: 'email', headerName: 'Login / Contact', flex: 1.5, minWidth: 250,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
                <Box display="flex" alignItems="center" gap={1}><FiMail size={13} color="#64748b" /><Typography variant="caption" fontWeight={600} color="#334155">{p.value}</Typography></Box>
                <Box display="flex" alignItems="center" gap={1}><FiLock size={12} color="#94a3b8" /><Typography variant="caption" color="text.secondary">Last Login: {p.row.lastLogin}</Typography></Box>
            </Box>
        )
    },
    {
        field: 'status', headerName: 'Status', flex: 1.2, minWidth: 150,
        renderCell: (p: GridRenderCellParams) => {
            const isInvited = p.value === 'INVITED' || p.value === 'Pending';
            const isActive = p.value === 'Active';
            return (
                <Box display="flex" alignItems="center" height="100%">
                    <Chip 
                        label={isInvited ? "Pending Invite" : (isActive ? "Active" : "Inactive")} 
                        size="small" 
                        sx={{ 
                            fontWeight: 700, 
                            borderRadius: '999px',
                            bgcolor: isInvited ? '#FEF3C7' : (isActive ? '#E6F4EA' : '#F1F5F9'), 
                            color: isInvited ? '#D97706' : (isActive ? '#1E8E3E' : '#64748B') 
                        }} 
                    />
                </Box>
            );
        }
    },
    {
        field: 'actions', 
        headerName: 'Actions', 
        flex: 2, 
        minWidth: 320, 
        align: 'right', 
        headerAlign: 'right',
        sortable: false,
        renderCell: (p: GridRenderCellParams) => {
            const isInvited = p.row.status === 'INVITED' || p.row.status === 'Pending';
            const isResending = resendingId === p.row.id;
            return (
                <Box display="flex" gap={1} height="100%" alignItems="center" justifyContent="flex-end" sx={{ flexWrap: 'nowrap' }}>
                    {isInvited && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            disabled={isExpired || isResending} 
                            onClick={() => onResend(p.row.id)}
                            startIcon={isResending ? <CircularProgress size={14} color="inherit" /> : undefined}
                            sx={{ 
                                textTransform: 'none', 
                                borderRadius: '0.5rem', 
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                px: 1.75,
                                py: 0.5,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                borderColor: '#ea580c',
                                color: '#ea580c',
                                '&:hover': { borderColor: '#c2410c', bgcolor: 'rgba(234, 88, 12, 0.04)' },
                                '&.Mui-disabled': { borderColor: '#e2e8f0', color: '#94a3b8' }
                            }}
                        >
                            {isResending ? "Sending..." : "Resend Invite"}
                        </Button>
                    )}
                    <Button 
                        size="small" 
                        variant="outlined" 
                        disabled={isExpired} 
                        title={isExpired ? "Upgrade your plan to use this feature" : ""} 
                        onClick={() => onEdit(p.row)}
                        sx={{ 
                            textTransform: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 1.75,
                            py: 0.5,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            borderColor: '#cbd5e1',
                            color: '#334155',
                            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                        }}
                    >
                        Edit
                    </Button>
                    <Button 
                        size="small" 
                        variant="outlined"
                        color={p.row.status === 'Active' ? 'warning' : 'success'} 
                        disabled={isExpired || isInvited} 
                        title={isExpired ? "Upgrade your plan to use this feature" : ""} 
                        onClick={() => onToggle(p.row.id, p.row.status)}
                        sx={{ 
                            textTransform: 'none', 
                            borderRadius: '0.5rem', 
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 1.5,
                            py: 0.5,
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                        }}
                    >
                        {p.row.status === 'Active' ? 'Disable' : 'Enable'}
                    </Button>
                    <IconButton 
                        size="small" 
                        color="error" 
                        disabled={isExpired} 
                        title={isExpired ? "Upgrade your plan to use this feature" : ""} 
                        onClick={() => onDelete(p.row.id)}
                        sx={{ flexShrink: 0 }}
                    >
                        <FiTrash2 size={16} />
                    </IconButton>
                </Box>
            );
        }
    }
];

/**
 * HEADER COMPONENT: Encapsulates page title and add action functionality.
 */
function ManagersHeader({ onAdd, isExpired }: { onAdd: () => void, isExpired: boolean }) {
    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={4}>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Managers Directory
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Oversee branch leadership and system access permissions.
                </Typography>
            </Box>
            <Button 
                variant="contained" 
                onClick={onAdd} 
                disabled={isExpired} 
                title={isExpired ? "Upgrade your plan to use this feature" : ""} 
                startIcon={<FiPlus />}
                sx={{
                    background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                    color: '#ffffff !important',
                    px: 3.5,
                    py: 1.2,
                    borderRadius: '0.75rem',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        background: 'linear-gradient(195deg, #ea580c, #c2410c)',
                        boxShadow: '0 6px 20px rgba(234, 88, 12, 0.45)',
                        transform: 'translateY(-1px)'
                    }
                }}
            >
                Add Manager
            </Button>
        </Box>
    );
}

/**
 * DIALOG COMPONENT: Standardized form dialog for managing manager data.
 */
function ManagerDialog({ open, onClose, isEdit, formData, onChange, onSave, centers, dialogError, isSaving }: any) {
    const isEmailInvalid = Boolean(formData.email) && !isValidEmail(formData.email.trim());
    return (
        <Dialog open={open} onClose={isSaving ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '1rem' } }}>
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{isEdit ? "Edit Manager Access" : "Add New Manager"}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2.5} pt={2}>
                    {dialogError && (
                        <Alert severity="error" sx={{ borderRadius: '0.75rem' }}>{dialogError}</Alert>
                    )}
                    <TextField label="Full Name" name="name" value={formData.name} onChange={onChange} fullWidth required disabled={isSaving} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }} />
                    <FormControl fullWidth required disabled={isSaving} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                        <InputLabel>Assign Center</InputLabel>
                        <Select name="center" value={formData.center} label="Assign Center" onChange={onChange}>
                            {centers.map((c: any) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField 
                        label="Email (Login ID)" 
                        name="email" 
                        type="email" 
                        placeholder="manager@gmail.com"
                        value={formData.email} 
                        onChange={onChange} 
                        error={isEmailInvalid}
                        helperText={isEmailInvalid ? "Please enter a valid, real email address (e.g. manager@gmail.com, dummy domains like example.com are not allowed)" : ""}
                        fullWidth 
                        required 
                        disabled={isSaving}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}
                    />
                    {!isEdit && (
                        <FormControlLabel control={<Checkbox checked={formData.sendInvite} onChange={onChange} name="sendInvite" color="primary" disabled={isSaving} />} label="Send Email Invitation" />
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} disabled={isSaving} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                <Button 
                    onClick={onSave} 
                    variant="contained" 
                    disabled={isSaving} 
                    startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : undefined}
                    sx={{ 
                        borderRadius: '0.75rem', 
                        px: 4, 
                        background: 'linear-gradient(195deg, #FB923C, #EA580C)', 
                        fontWeight: 700,
                        textTransform: 'none' 
                    }}
                >
                    {isSaving ? "Saving..." : (isEdit ? "Save Changes" : "Create Account")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/**
 * MAIN COMPONENT: Orchestrates the display and lifecycle of manager accounts.
 */
export default function ManagersPage() {
    const theme = useTheme();
    const { managersData, centersData, ownerData, isLoading: contextLoading, refreshManagers } = useDashboardData();
    const isExpired = ownerData?.subscriptionStatus === 'TRIAL_EXPIRED' || ownerData?.subscriptionStatus === 'PREMIUM_EXPIRED';
    const mapManagers = (mgrData: any[], ctrData: any[]) => {
        const centersMap = (ctrData || []).reduce((m: any, c: any) => ({ ...m, [c.centerId]: c.name }), {});
        return (mgrData || []).map((m: any) => ({
            id: m.userId, name: m.fullName, email: m.email, phone: m.phone, 
            center: centersMap[m.managedCenterId] || "Unassigned", centerId: m.managedCenterId,
            status: m.status || "Active", lastLogin: m.lastLoginAt ? new Date(m.lastLoginAt).toLocaleString() : "Never",
            avatar: m.profilePictureUrl || `https://ui-avatars.com/api/?name=${m.fullName}`
        }));
    };

    const [managers, setManagers] = useState<ManagerView[]>(() => mapManagers(managersData, centersData));
    const [centersList, setCentersList] = useState<string[]>(() => (centersData || []).map((c: any) => c.name));
    const [loading, setLoading] = useState<boolean>(() => contextLoading && (!managersData || managersData.length === 0));
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [dialogError, setDialogError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", center: "", email: "", phone: "", status: "Active", sendInvite: true });
    const [isSaving, setIsSaving] = useState(false);
    const [resendingId, setResendingId] = useState<string | null>(null);

    useEffect(() => { 
        setCentersList((centersData || []).map((c: any) => c.name));
        setManagers(mapManagers(managersData || [], centersData || []));
        setLoading(false);
    }, [managersData, centersData]);

    const handleFormChange = (e: any) => {
        setDialogError(null);
        setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
    };

    const handleSave = async () => {
        // Form Validation
        if (!formData.name.trim() || formData.name.length < MIN_MANAGER_NAME_LENGTH) {
            setDialogError(`Full name must be at least ${MIN_MANAGER_NAME_LENGTH} characters`);
            setSnackbar({ open: true, message: `Full name must be at least ${MIN_MANAGER_NAME_LENGTH} characters`, severity: 'error' });
            return;
        }
        
        if (!formData.email.trim() || !isValidEmail(formData.email.trim())) {
            setDialogError('Please enter a valid, real email address (dummy domains like example.com are not allowed)');
            setSnackbar({ open: true, message: 'Please enter a valid, real email address', severity: 'error' });
            return;
        }
        
        if (!formData.center) {
            setDialogError('Please assign a service center');
            setSnackbar({ open: true, message: 'Please assign a service center', severity: 'error' });
            return;
        }

        const center = centersData.find(c => c.name === formData.center);
        if (!center) return;
        const payload = { 
            fullName: formData.name, 
            email: formData.email.trim().toLowerCase(), 
            managedCenterId: center.centerId, 
            status: formData.status, 
            sendInvite: formData.sendInvite 
        };
        // Optimistic update for edit mode
        if (isEditMode && selectedId) {
            setManagers(prev => prev.map(m => m.id === selectedId ? {
                ...m,
                name: formData.name,
                email: formData.email.trim().toLowerCase(),
                center: formData.center,
                status: formData.status
            } : m));
        }

        setOpenDialog(false);
        setIsSaving(true);
        try {
            if (isEditMode && selectedId) {
                await axios.put(`${APP_CONFIG.api.managers}/${selectedId}`, payload);
                setSnackbar({ open: true, message: 'Manager updated successfully!', severity: 'success' });
            } else {
                await axios.post(APP_CONFIG.api.managers, payload);
                setSnackbar({ open: true, message: 'New manager account created and invite sent!', severity: 'success' });
            }
            setDialogError(null);
            refreshManagers();
        } catch (e: any) { 
            const errorMsg = e.response?.data?.message || 'Operation failed';
            setDialogError(errorMsg);
            setSnackbar({ open: true, message: errorMsg, severity: 'error' }); 
            refreshManagers();
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (id: string, current: string) => {
        const manager = managers.find(m => m.id === id);
        const targetStatus = current === 'Active' ? 'Inactive' : 'Active';
        
        // Optimistic toggle (0ms)
        setManagers(prev => prev.map(m => m.id === id ? { ...m, status: targetStatus } : m));
        setSnackbar({ open: true, message: `Manager account ${current === 'Active' ? 'Disabled' : 'Enabled'}`, severity: 'success' });

        try {
            const payload = manager ? {
                fullName: manager.name,
                email: manager.email,
                managedCenterId: manager.centerId,
                status: targetStatus
            } : {
                status: targetStatus
            };
            await axios.put(`${APP_CONFIG.api.managers}/${id}`, payload);
            refreshManagers();
        } catch (e: any) { 
            // Revert on error
            setManagers(prev => prev.map(m => m.id === id ? { ...m, status: current } : m));
            setSnackbar({ open: true, message: e.response?.data?.message || 'Update failed', severity: 'error' }); 
        }
    };

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string }>({ isOpen: false, id: '' });

    const handleDeleteManager = async (id: string) => {
        const managerToDelete = managers.find(m => m.id === id);
        // Optimistic delete (0ms)
        setManagers(prev => prev.filter(m => m.id !== id));
        setDeleteModal({ isOpen: false, id: '' });
        setSnackbar({ open: true, message: 'Manager deleted successfully', severity: 'success' });

        try {
            await axios.delete(`${APP_CONFIG.api.managers}/${id}`);
            refreshManagers();
        } catch (e: any) { 
            // Revert on error
            if (managerToDelete) {
                setManagers(prev => [...prev, managerToDelete]);
            }
            setSnackbar({ open: true, message: e.response?.data?.message || 'Delete failed', severity: 'error' });
        }
    };

    const handleResendInvite = async (id: string) => {
        setResendingId(id);
        try {
            await axios.post(`${APP_CONFIG.api.managers}/${id}/resend-invite`);
            setSnackbar({ open: true, message: 'Invitation email resent successfully!', severity: 'success' });
        } catch (e: any) {
            setSnackbar({ open: true, message: e.response?.data?.message || 'Failed to resend invitation', severity: 'error' });
        } finally {
            setResendingId(null);
        }
    };

    const filtered = managers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.center.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress sx={{ color: '#ea580c' }} /></Box>;

    return (
        <Box pb={3}>
            <ManagersHeader onAdd={() => { setFormData({ name: "", center: "", email: "", phone: "", status: "Active", sendInvite: true }); setDialogError(null); setIsEditMode(false); setOpenDialog(true); }} isExpired={isExpired} />

            <Card sx={{ borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <Box p={2.5} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} bgcolor="#ffffff">
                    <Typography variant="h6" fontWeight={700} color="text.primary">Branch Managers ({filtered.length})</Typography>
                    <TextField 
                        size="small" 
                        placeholder="Search managers..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ 
                            startAdornment: <InputAdornment position="start"><FiSearch color="#94a3b8" /></InputAdornment>,
                            endAdornment: searchTerm ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                                        <FiX size={15} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        }} 
                        sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }} 
                    />
                </Box>
                
                {filtered.length === 0 ? (
                    <Box p={4}>
                        <EmptyState 
                            icon={<FiUsers size={40} />}
                            title="No Managers Found"
                            description={searchTerm ? "No managers match your search criteria." : "You haven't assigned any branch managers yet."}
                            actionLabel={searchTerm ? undefined : "Add First Manager"}
                            onAction={searchTerm ? undefined : () => {
                                setFormData({ name: "", center: "", email: "", phone: "", status: "Active", sendInvite: true });
                                setDialogError(null);
                                setIsEditMode(false);
                                setOpenDialog(true);
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid 
                            rows={filtered} 
                            columns={getManagerColumns(
                                theme, 
                                (m: any) => { 
                                    setFormData({ name: m.name, center: m.center, email: m.email, phone: m.phone, status: m.status, sendInvite: false }); 
                                    setDialogError(null);
                                    setSelectedId(m.id); 
                                    setIsEditMode(true); 
                                    setOpenDialog(true); 
                                }, 
                                handleToggleStatus, 
                                (id: string) => setDeleteModal({ isOpen: true, id }),
                                handleResendInvite,
                                isExpired,
                                resendingId
                            )} 
                            pageSizeOptions={[5, 10]} 
                            disableRowSelectionOnClick 
                            rowHeight={80} 
                            sx={{
                                border: 'none',
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                },
                                '& .MuiDataGrid-cell': {
                                    borderBottom: '1px solid #f1f5f9'
                                }
                            }}
                        />
                    </Box>
                )}
            </Card>

            <ManagerDialog 
                open={openDialog} 
                onClose={() => { if (!isSaving) { setOpenDialog(false); setDialogError(null); } }} 
                isEdit={isEditMode} 
                formData={formData} 
                onChange={handleFormChange} 
                onSave={handleSave} 
                centers={centersList} 
                dialogError={dialogError}
                isSaving={isSaving}
            />

            {/* Delete Manager Dialog */}
            <ConfirmDialog 
                open={deleteModal.isOpen} 
                onClose={() => setDeleteModal({ isOpen: false, id: '' })}
                title="Delete Manager Account?"
                message="Are you sure you want to remove this manager account? This action cannot be undone."
                confirmText="Delete Manager"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => handleDeleteManager(deleteModal.id)}
            />

            <FeedbackSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </Box>
    );
}