"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    IconButton
} from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import { useTheme } from "@mui/material/styles";
import {
    FiUsers,
    FiRefreshCw,
    FiSearch,
    FiX,
    FiMail
} from "react-icons/fi";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StatCard from "@/components/dashboard/StatCard";
import { formatDistanceToNow } from "date-fns";
import { useDashboardData } from "@/context/DashboardDataContext";
import EmptyState from "@/components/UI/EmptyState";

interface CustomerDTO {
    userId?: string;
    id?: string;
    fullName?: string;
    name?: string;
    email: string;
    visits?: number;
    totalSpent?: number;
    lastLoginAt?: string;
    createdAt?: string;
    status?: string;
    profilePictureUrl?: string;
}

interface Customer {
    id: string | number;
    name: string;
    email: string;
    visits: number;
    totalSpent: number;
    lastVisit: string;
    status: string;
    avatarUrl: string;
}

export default function CustomersPage() {
    const theme = useTheme();
    const { customersData, analyticsData } = useDashboardData();
    const mapCustomers = (data: CustomerDTO[]): Customer[] => {
        return (data || []).map((customer: CustomerDTO) => ({
            id: customer.userId || customer.id || Math.random().toString(),
            name: customer.fullName || customer.name || "Unknown Customer",
            email: customer.email || "N/A",
            visits: customer.visits || 0,
            totalSpent: customer.totalSpent || 0,
            lastVisit: customer.lastLoginAt || customer.createdAt || "N/A",
            status: customer.status || "Active",
            avatarUrl: customer.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName || customer.name || "U")}&background=ea580c&color=fff`
        }));
    };

    const [customers, setCustomers] = useState<Customer[]>(() => mapCustomers(customersData));
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState<boolean>(() => !customersData || customersData.length === 0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        setCustomers(mapCustomers(customersData || []));
        setLoading(false);
    }, [customersData]);

    const formatCurrency = (amount: number) => {
        return `Rs. ${Number(amount || 0).toLocaleString('en-LK')}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === "N/A") return "N/A";
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return dateString;
        }
    };

    const filteredCustomers = useMemo(() => {
        if (!searchTerm.trim()) return customers;
        const q = searchTerm.toLowerCase().trim();
        return customers.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.status.toLowerCase().includes(q)
        );
    }, [customers, searchTerm]);

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Customer',
            flex: 2,
            minWidth: 260,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={2} sx={{ height: '100%' }}>
                    <Avatar 
                        src={params.row.avatarUrl} 
                        alt={params.row.name} 
                        sx={{ 
                            width: 40, 
                            height: 40,
                            bgcolor: '#ea580c',
                            fontWeight: 'bold',
                            fontSize: '0.95rem'
                        }}
                    >
                        {params.row.name.charAt(0)}
                    </Avatar>
                    <Box display="flex" flexDirection="column" justifyContent="center">
                        <Typography variant="subtitle2" fontWeight="bold" color="#1e293b" lineHeight={1.2}>
                            {params.row.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.25}>
                            <FiMail size={12} color="#94a3b8" />
                            <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                                {params.row.email}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            ),
        },
        {
            field: 'visits',
            headerName: 'Completed Bookings',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 160,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Chip
                        label={`${params.value} ${params.value === 1 ? 'booking' : 'bookings'}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            bgcolor: params.value > 1 ? 'rgba(234, 88, 12, 0.08)' : '#f1f5f9',
                            color: params.value > 1 ? '#c2410c' : '#64748b',
                            border: `1px solid ${params.value > 1 ? 'rgba(234, 88, 12, 0.2)' : '#e2e8f0'}`
                        }}
                    />
                </Box>
            )
        },
        {
            field: 'totalSpent',
            headerName: 'Total Spent',
            flex: 1,
            headerAlign: 'right',
            align: 'right',
            minWidth: 160,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" justifyContent="flex-end" height="100%">
                    <Typography variant="body2" fontWeight="bold" color="#16a34a">
                        {formatCurrency(params.value)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'lastVisit',
            headerName: 'Last Booking / Activity',
            flex: 1,
            minWidth: 180,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(params.value)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 130,
            renderCell: (params: GridRenderCellParams) => {
                const isVIP = params.row.visits > 10;
                const label = isVIP ? 'VIP Client' : (params.value || 'Active');
                return (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Chip
                            label={label}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor: isVIP ? 'rgba(234, 88, 12, 0.12)' : 'rgba(76, 175, 80, 0.12)',
                                color: isVIP ? '#c2410c' : '#2e7d32',
                                border: `1px solid ${isVIP ? 'rgba(234, 88, 12, 0.3)' : 'rgba(76, 175, 80, 0.3)'}`
                            }}
                        />
                    </Box>
                );
            },
        },
    ];

    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.visits > 1).length;
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Customer Directory
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View registered clients, booking histories, lifetime expenditures, and engagement metrics.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <StatCard
                        title="Total Customers"
                        count={totalCustomers.toString()}
                        percentage={{
                            color: 'success',
                            amount: '',
                            label: 'All registered clients across centers'
                        }}
                        icon={<FiUsers />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <StatCard
                        title="Repeat Customers"
                        count={`${repeatRate}%`}
                        percentage={{
                            color: 'primary',
                            amount: `${repeatCustomers} clients`,
                            label: 'with multiple completed bookings'
                        }}
                        icon={<FiRefreshCw />}
                        color="primary"
                    />
                </Grid>
            </Grid>

            <Card sx={{ p: 3, borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                <Box mb={3} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={2}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="#1e293b">
                            Client List ({filteredCustomers.length})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Search and inspect customer loyalty across your company
                        </Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch color="#94a3b8" />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                                        <FiX size={14} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null
                        }}
                        sx={{ 
                            minWidth: { xs: '100%', sm: 260 },
                            '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' }
                        }}
                    />
                </Box>

                {filteredCustomers.length === 0 ? (
                    <Box py={6}>
                        <EmptyState 
                            icon={<FiUsers />}
                            title={searchTerm ? "No Matching Customers" : "No Customers Yet"}
                            description={searchTerm ? `No customer records matched "${searchTerm}". Try a different query.` : "Customer profiles will populate here as bookings are placed across your branches."}
                        />
                    </Box>
                ) : (
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={filteredCustomers}
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
                            rowHeight={72}
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-cell': {
                                    borderBottom: `1px solid #f1f5f9`,
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    borderBottom: `1px solid #e2e8f0`,
                                    backgroundColor: '#f8fafc',
                                    color: '#64748b',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase'
                                },
                            }}
                        />
                    </Box>
                )}
            </Card>

            <FeedbackSnackbar 
                open={snackbar.open} 
                severity={snackbar.severity}
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
            />
        </Box>
    );
}
