"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Chip,
    CircularProgress,
    Snackbar,
    Alert
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    FiUsers,
    FiUserPlus,
    FiRefreshCw,
    FiSearch,
    FiDownload,
    FiFilter,
    FiUser,
    FiMoreVertical,
    FiMail,
    FiPhone
} from "react-icons/fi";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StatCard from "@/components/dashboard/StatCard";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";    
import { formatDistanceToNow } from "date-fns";
// Interface representation for the structure originating directly from the Backend API
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

// Client-side View Model mapped safely for rendering
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

import { useDashboardData } from "@/context/DashboardDataContext";

export default function CustomersPage() {
    const theme = useTheme();
    const { customersData, analyticsData, refreshAll } = useDashboardData();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        const loadCustomers = async () => {
            setLoading(true);
            try {
                if (customersData.length === 0) {
                    await refreshAll();
                }
                
                const mappedCustomers: Customer[] = (customersData || []).map((customer: CustomerDTO) => ({
                    id: customer.userId || customer.id || Math.random().toString(),
                    name: customer.fullName || customer.name || "Unknown Customer",
                    email: customer.email,
                    visits: customer.visits || 0,
                    totalSpent: customer.totalSpent || 0,
                    lastVisit: customer.lastLoginAt || customer.createdAt || "N/A",
                    status: customer.status || "Active",
                    avatarUrl: customer.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName || customer.name || "U")}&background=random&color=fff`
                }));
                setCustomers(mappedCustomers);
            } catch (err: any) {
                console.error("Failed to load customers:", err);
                const msg = err.response?.data?.message || err.message || "Failed to load customers.";
                setSnackbar({ open: true, message: msg, severity: 'error' });
            } finally {
                setLoading(false);
            }
        };
        loadCustomers();
    }, [customersData, refreshAll]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount).replace('₹', 'Rs. ');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (e) {
            return dateString;
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: 'Customer',
            flex: 2,
            minWidth: 250,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" gap={2} sx={{ height: '100%' }}>
                    <Avatar src={params.row.avatarUrl} alt={params.row.name} sx={{ width: 40, height: 40 }} />
                    <Box display="flex" flexDirection="column" justifyContent="center">
                        <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.2}>
                            {params.row.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                            {params.row.email}
                        </Typography>
                    </Box>
                </Box>
            ),
        },
        {
            field: 'visits',
            headerName: 'Visits',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 100,
        },
        {
            field: 'totalSpent',
            headerName: 'Total Spent',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            minWidth: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Typography variant="body2" color="text.secondary">
                        {formatCurrency(params.value)}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'lastVisit',
            headerName: 'Last Visit',
            flex: 1,
            minWidth: 150,
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
            minWidth: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <Chip
                        label={params.value}
                        size="small"
                        color={
                            params.value === 'VIP' ? 'warning' :
                                params.value === 'New' ? 'success' : 'default'
                        }
                        variant="outlined"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
            ),
        },
    ];

    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.visits > 1).length;
    const repeatRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
    
    const customerGrowthArray = analyticsData?.customerGrowth || [];
    const latestGrowth = customerGrowthArray[customerGrowthArray.length - 1];
    const newCustomersCount = latestGrowth?.newCustomers || 0;
    const growthPercentage = analyticsData?.jobsChange || "+0%"; // Uses jobs change as a proxy for growth

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            <Box mb={6}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Customers
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Overview of your customer base and top performers.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={6}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Customers"
                        count={totalCustomers.toString()}
                        percentage={{
                            color: 'success',
                            amount: '',
                            label: 'All registered clients'
                        }}
                        icon={<FiUsers />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="New Customers"
                        count={newCustomersCount.toString()}
                        percentage={{
                            color: growthPercentage.startsWith('+') ? 'success' : 'danger',
                            amount: growthPercentage,
                            label: 'growth'
                        }}
                        icon={<FiUserPlus />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Repeat Customers"
                        count={`${repeatRate}%`}
                        percentage={{
                            color: 'info',
                            amount: '',
                            label: 'High retention rate'
                        }}
                        icon={<FiRefreshCw />}
                        color="primary"
                    />
                </Grid>
            </Grid>

            <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2], height: 600, width: '100%' }}>
                <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top Customers
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Clients with the most visits
                        </Typography>
                    </Box>
                </Box>

                <DataGrid
                    rows={customers}
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
                    sx={{
                        border: 0,
                        '& .MuiDataGrid-cell': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderBottom: `2px solid ${theme.palette.divider}`,
                            backgroundColor: theme.palette.background.default,
                        },
                    }}
                />
            </Card>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
