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
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import { useTheme } from "@mui/material/styles";
import {
    FiUsers,
    FiRefreshCw,
    FiSearch,
    FiX,
    FiMail,
    FiFilter
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
    centerName: string;
    visitedCenterIds: string[];
    avatarUrl: string;
}

export default function CustomersPage() {
    const theme = useTheme();
    const { customersData, centersData, invoicesData } = useDashboardData();
    const mapCustomers = (data: CustomerDTO[]): Customer[] => {
        const centersMap: Record<string, string> = {};
        (centersData || []).forEach((c: any) => {
            if (c.centerId) centersMap[c.centerId] = c.name;
            if (c.id) centersMap[c.id] = c.name;
        });

        return (data || []).map((customer: CustomerDTO) => {
            const cId = customer.userId || customer.id;
            const matchedInvoices = (invoicesData || []).filter((inv: any) => 
                (inv.issuedToCustomerId && String(inv.issuedToCustomerId) === String(cId)) || 
                (inv.customerId && String(inv.customerId) === String(cId))
            );
            const visitedIds = Array.from(new Set(matchedInvoices.map((inv: any) => inv.centerId).filter(Boolean)));
            const visitedNames = visitedIds.map((id: any) => centersMap[id]).filter(Boolean);
            const primaryBranch = visitedNames.length > 0 ? visitedNames[0] : (centersData && centersData.length > 0 ? centersData[0]?.name : "All Branches");

            return {
                id: cId || Math.random().toString(),
                name: customer.fullName || customer.name || "Unknown Customer",
                email: customer.email || "N/A",
                visits: customer.visits || 0,
                totalSpent: customer.totalSpent || 0,
                lastVisit: customer.lastLoginAt || customer.createdAt || "N/A",
                status: customer.status || "Active",
                centerName: primaryBranch,
                visitedCenterIds: (visitedIds as string[]).length > 0 ? (visitedIds as string[]) : (centersData && centersData[0]?.centerId ? [centersData[0].centerId] : []),
                avatarUrl: customer.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName || customer.name || "U")}&background=ea580c&color=fff`
            };
        });
    };

    const [customers, setCustomers] = useState<Customer[]>(() => mapCustomers(customersData));
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenterFilter, setSelectedCenterFilter] = useState("ALL");
    const [loyaltyFilter, setLoyaltyFilter] = useState("ALL");
    const [sortFilter, setSortFilter] = useState("DEFAULT");
    const [loading, setLoading] = useState<boolean>(() => !customersData || customersData.length === 0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        setCustomers(mapCustomers(customersData || []));
        setLoading(false);
    }, [customersData, centersData, invoicesData]);

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
        const q = searchTerm.toLowerCase().trim();
        let result = customers.filter(c => {
            const matchSearch = !q ||
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.status.toLowerCase().includes(q) ||
                c.centerName.toLowerCase().includes(q);

            const matchCenter = selectedCenterFilter === "ALL" ||
                c.centerName === selectedCenterFilter ||
                (c.visitedCenterIds && c.visitedCenterIds.includes(selectedCenterFilter));

            const matchLoyalty = 
                loyaltyFilter === "ALL" ? true :
                loyaltyFilter === "REPEAT" ? c.visits > 1 :
                loyaltyFilter === "FIRST_TIME" ? c.visits === 1 :
                loyaltyFilter === "NEW_LEAD" ? c.visits === 0 :
                loyaltyFilter === "VIP" ? (c.visits >= 5 || c.totalSpent >= 25000) :
                loyaltyFilter === "SUSPENDED" ? (c.status || "").toUpperCase() === "SUSPENDED" : true;

            return matchSearch && matchCenter && matchLoyalty;
        });

        if (sortFilter === "SPENT_DESC") {
            result = [...result].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        } else if (sortFilter === "VISITS_DESC") {
            result = [...result].sort((a, b) => (b.visits || 0) - (a.visits || 0));
        }

        return result;
    }, [customers, searchTerm, selectedCenterFilter, loyaltyFilter, sortFilter]);

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
            field: 'centerName',
            headerName: 'Branch / Center',
            flex: 1.4,
            minWidth: 190,
            renderCell: (params: GridRenderCellParams) => (
                <Box display="flex" alignItems="center" height="100%">
                    <Chip
                        label={params.value || "All Branches"}
                        size="small"
                        variant="outlined"
                        sx={{
                            fontWeight: 600,
                            borderRadius: '6px',
                            color: '#475569',
                            borderColor: '#cbd5e1',
                            bgcolor: 'rgba(241, 245, 249, 0.6)'
                        }}
                    />
                </Box>
            )
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
                const rawStatus = (params.row.status || '').toUpperCase();
                const isSuspended = rawStatus === 'SUSPENDED';
                const isInactive = rawStatus === 'INACTIVE';
                const isVIP = !isSuspended && params.row.visits > 10;
                
                let label = 'Active';
                let bgcolor = 'rgba(76, 175, 80, 0.12)';
                let color = '#2e7d32';
                let border = '1px solid rgba(76, 175, 80, 0.3)';

                if (isSuspended) {
                    label = 'Suspended';
                    bgcolor = 'rgba(239, 68, 68, 0.12)';
                    color = '#dc2626';
                    border = '1px solid rgba(239, 68, 68, 0.3)';
                } else if (isVIP) {
                    label = 'VIP Client';
                    bgcolor = 'rgba(234, 88, 12, 0.12)';
                    color = '#c2410c';
                    border = '1px solid rgba(234, 88, 12, 0.3)';
                } else if (isInactive) {
                    label = 'Inactive';
                    bgcolor = '#f1f5f9';
                    color = '#64748b';
                    border = '1px solid #e2e8f0';
                }
                return (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Chip
                            label={label}
                            size="small"
                            sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                bgcolor,
                                color,
                                border
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
                {/* Header Row */}
                <Box mb={2.5} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="#1e293b">
                            Client List ({filteredCustomers.length})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Search and inspect customer loyalty across your company branches
                        </Typography>
                    </Box>
                    {(searchTerm || selectedCenterFilter !== "ALL" || loyaltyFilter !== "ALL" || sortFilter !== "DEFAULT") && (
                        <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => { setSearchTerm(""); setSelectedCenterFilter("ALL"); setLoyaltyFilter("ALL"); setSortFilter("DEFAULT"); }}
                            sx={{ 
                                color: '#ea580c', 
                                borderColor: 'rgba(234, 88, 12, 0.3)',
                                bgcolor: 'rgba(234, 88, 12, 0.04)',
                                fontWeight: 700, 
                                textTransform: 'none', 
                                borderRadius: '0.5rem',
                                px: 1.75,
                                py: 0.5,
                                fontSize: '0.8rem',
                                '&:hover': {
                                    bgcolor: 'rgba(234, 88, 12, 0.08)',
                                    borderColor: '#ea580c'
                                }
                            }}
                        >
                            Reset Filters
                        </Button>
                    )}
                </Box>

                {/* Filter Toolbar Row */}
                <Box mb={3} display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
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
                            flex: { xs: '1 1 100%', sm: 1 },
                            minWidth: { sm: 220 },
                            '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' }
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 170 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                        <InputLabel>All Branches</InputLabel>
                        <Select value={selectedCenterFilter} label="All Branches" onChange={(e) => setSelectedCenterFilter(e.target.value)}>
                            <MenuItem value="ALL">All Service Centers</MenuItem>
                            {(centersData || []).map((c: any) => (
                                <MenuItem key={c.centerId || c.id || c.name} value={c.name}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                        <InputLabel>Client Category</InputLabel>
                        <Select value={loyaltyFilter} label="Client Category" onChange={(e) => setLoyaltyFilter(e.target.value)}>
                            <MenuItem value="ALL">All Clients</MenuItem>
                            <MenuItem value="REPEAT">Repeat Clients (2+)</MenuItem>
                            <MenuItem value="FIRST_TIME">First-Time Clients (1)</MenuItem>
                            <MenuItem value="NEW_LEAD">New Leads (0 Visits)</MenuItem>
                            <MenuItem value="VIP">VIP Clients (High Value)</MenuItem>
                            <MenuItem value="SUSPENDED">Suspended Clients</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, '& .MuiOutlinedInput-root': { borderRadius: '0.75rem' } }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select value={sortFilter} label="Sort By" onChange={(e) => setSortFilter(e.target.value)}>
                            <MenuItem value="DEFAULT">Default Order</MenuItem>
                            <MenuItem value="SPENT_DESC">Highest Spent</MenuItem>
                            <MenuItem value="VISITS_DESC">Most Bookings</MenuItem>
                        </Select>
                    </FormControl>
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
                    <Box sx={{ width: '100%' }}>
                        <DataGrid
                            rows={filteredCustomers}
                            columns={columns}
                            autoHeight
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
