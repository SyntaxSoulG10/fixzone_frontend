"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Avatar,
    Chip,
    CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    FiUsers,
    FiUserPlus,
    FiRefreshCw
} from "react-icons/fi";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StatCard from "@/components/dashboard/StatCard";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

interface Customer {
    id: number;
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
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const dummyCustomers: Customer[] = [
        {
            id: 1,
            name: "Kasun Perera",
            email: "kasun.perera@example.com",
            visits: 12,
            totalSpent: 15600,
            lastVisit: "2023-10-25T10:00:00Z",
            status: "VIP",
            avatarUrl: "https://i.pravatar.cc/150?u=1",
        },
        {
            id: 2,
            name: "Nimali Silva",
            email: "nimali.silva@example.com",
            visits: 5,
            totalSpent: 3500,
            lastVisit: "2023-11-01T14:30:00Z",
            status: "Active",
            avatarUrl: "https://i.pravatar.cc/150?u=2",
        },
        {
            id: 3,
            name: "Ruwan Fernando",
            email: "ruwan.f@example.com",
            visits: 8,
            totalSpent: 8900,
            lastVisit: "2023-10-15T09:15:00Z",
            status: "Active",
            avatarUrl: "https://i.pravatar.cc/150?u=3",
        },
        {
            id: 4,
            name: "Dilshan Bandara",
            email: "dilshan.b@example.com",
            visits: 1,
            totalSpent: 450,
            lastVisit: "2023-11-05T16:20:00Z",
            status: "New",
            avatarUrl: "https://i.pravatar.cc/150?u=4",
        },
        {
            id: 5,
            name: "Chamari Atapattu",
            email: "chamari.a@example.com",
            visits: 20,
            totalSpent: 25000,
            lastVisit: "2023-10-28T11:45:00Z",
            status: "VIP",
            avatarUrl: "https://i.pravatar.cc/150?u=5",
        }
    ];

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await axios.get("http://localhost:8081/api/customers");
                const mappedCustomers = response.data.map((customer: any) => ({
                    ...customer,
                    id: customer.userId || customer.id, // Ensure we have an 'id' for DataGrid
                    name: customer.fullName || customer.name,
                    visits: customer.visits || 0,
                    totalSpent: customer.totalSpent || 0,
                    lastVisit: customer.lastLoginAt || customer.createdAt || "N/A",
                    status: customer.status || "Active",
                    avatarUrl: customer.avatarUrl || `https://i.pravatar.cc/150?u=${customer.userId || customer.id}`
                }));
                setCustomers(mappedCustomers);
            } catch (error) {
                console.error("Error fetching customers, using dummy data:", error);
                setCustomers(dummyCustomers);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

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
                <Grid sx={{ xs: 12, md: 4 }}>
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
                <Grid sx={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="New This Month"
                        count="48"
                        percentage={{
                            color: 'success',
                            amount: '+12%',
                            label: 'growth'
                        }}
                        icon={<FiUserPlus />}
                        color="primary"
                    />
                </Grid>
                <Grid sx={{ xs: 12, md: 4 }}>
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
        </Box>
    );
}
