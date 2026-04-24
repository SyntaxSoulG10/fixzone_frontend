"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Grid,
    Card,
    Box,
    Typography,
    Button,
    IconButton,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    LinearProgress,
    TextField
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import {
    FiTrendingUp,
    FiCreditCard,
    FiDollarSign,
    FiPieChart,
    FiDownload
} from "react-icons/fi";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import ChartCard from "@/components/dashboard/ChartCard";
import DonutStatCard from "@/components/dashboard/DonutStatCard";


import { APP_CONFIG } from "@/utils/config";

// Interface representation for our complex backend entities to avoid generic any types.
interface PaymentRecordDTO {
    paymentId: string;
    invoiceId: number;
    amount: number;
    status: string;
    method: string;
    centerId: string;
    createdAt: string;
}

interface CenterDTO {
    centerId: string;
    name: string;
}

interface CustomerDTO {
    customerId: string;
    name: string;
}

interface InvoiceDTO {
    invoiceId: number;
    status: string;
    centerId: string;
    total?: number;
    totalAmount?: number;
    createdAt: string;
    issuedToCustomerId: string;
}

const columns: GridColDef[] = [
    {
        field: 'id',
        headerName: 'Transaction ID',
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant="caption" fontWeight="bold" color="text.secondary">
                {params.value}
            </Typography>
        )
    },
    {
        field: 'customer',
        headerName: 'Customer',
        flex: 1.5,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={1} height="100%">
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                    {params.value.charAt(0)}
                </Avatar>
                <Typography variant="body2" fontWeight="medium">
                    {params.value}
                </Typography>
            </Box>
        )
    },
    {
        field: 'service',
        headerName: 'Service Package',
        flex: 1.5,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant="body2" color="text.secondary">
                {params.value}
            </Typography>
        )
    },
    {
        field: 'date',
        headerName: 'Date',
        flex: 1,
        minWidth: 150,
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant="body2" color="text.secondary">
                {params.value}
            </Typography>
        )
    },
    {
        field: 'amount',
        headerName: 'Amount',
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
            <Typography variant="body2" fontWeight="bold" color="text.primary">
                {params.value}
            </Typography>
        )
    },
    {
        field: 'method',
        headerName: 'Method',
        flex: 1,
        minWidth: 120,
        renderCell: (params: GridRenderCellParams) => (
            <Chip
                label={params.value === 'CASH' ? 'Cash' : 'Online'}
                size="small"
                variant="filled"
                sx={{ 
                    bgcolor: params.value === 'CASH' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)',
                    color: params.value === 'CASH' ? '#2e7d32' : '#1976d2',
                    fontWeight: 'bold'
                }}
            />
        )
    },
    {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 120,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
                <Chip
                    label={params.value}
                    size="small"
                    color={
                        params.value === 'Completed' ? 'success' :
                            params.value === 'Pending' ? 'warning' : 'error'
                    }
                    variant="outlined"
                    sx={{ fontWeight: 'bold', height: 24 }}
                />
            </Box>
        )
    }
];

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => {
    const theme = useTheme();
    return (
        <Card sx={{ p: 3, height: '100%', position: 'relative', overflow: 'visible', borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    background: 'linear-gradient(195deg, #FB923C, #EA580C)',
                    borderRadius: 3,
                    p: 2,
                    boxShadow: theme.shadows[4],
                    color: '#fff'
                }}
            >
                <Icon size={24} />
            </Box>
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                    {value}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                    {subtext}
                </Typography>
            </Box>
        </Card>
    );
};

export default function FinancePage() {
    const theme = useTheme();
    // Use strictly typed tracking states to organize configuration inputs
    const [period, setPeriod] = useState<string>('monthly');
    const [selectedCenter, setSelectedCenter] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Explicit lists and map tracking
    const [centersList, setCentersList] = useState<CenterDTO[]>([]);
    const [rawData, setRawData] = useState<{
        payments: PaymentRecordDTO[],
        centers: CenterDTO[],
        customers: CustomerDTO[],
        invoices: InvoiceDTO[]
    }>({
        payments: [],
        centers: [],
        customers: [],
        invoices: []
    });

    const [financeData, setFinanceData] = useState({
        totalRevenue: 0,
        onlineRevenue: 0,
        cashRevenue: 0,
        monthlyGrowth: 0,
        avgTransaction: 0,
        revenueByCenter: [] as { name: string, revenue: number }[],
        growthData: [] as { month: string, amount: number, online: number, cash: number }[],
        recentTransactions: [] as any[] // Kept generic temporarily for UI table mapping
    });

    // Run primary API loading separately to ensure unblocked render tree painting.
    useEffect(() => {
        fetchInitialData();
    }, [selectedCenter, period, startDate, endDate]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const params = {
                centerId: selectedCenter !== 'all' ? selectedCenter : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                period: period
            };

            const [analyticsRes, paymentsRes, centersRes, customersRes, invoicesRes] = await Promise.all([
                axios.get(`${APP_CONFIG.api.baseUrl}/analytics/current`, { params }),
                axios.get(`${APP_CONFIG.api.baseUrl}/payment-records/current`),
                axios.get(`${APP_CONFIG.api.baseUrl}/service-centers/current`),
                axios.get(`${APP_CONFIG.api.baseUrl}/customers/current`),
                axios.get(`${APP_CONFIG.api.baseUrl}/invoices/current`)
            ]);

            const analytics = analyticsRes.data;
            const centers = centersRes.data || [];
            const payments = paymentsRes.data || [];
            const invoices = invoicesRes.data || [];
            const customers = customersRes.data || [];

            setCentersList(centers);
            setRawData({
                payments,
                centers,
                customers,
                invoices
            });

            // Use backend pre-calculated analytics directly for the main stats
            setFinanceData({
                totalRevenue: analytics.totalRevenue || 0,
                onlineRevenue: analytics.onlineRevenue || 0,
                cashRevenue: analytics.handCollectionRevenue || 0,
                monthlyGrowth: parseFloat(analytics.revenueChange || "0"),
                avgTransaction: analytics.avgJobValue || 0,
                revenueByCenter: analytics.topCenters?.map((c: any) => ({ name: c.name, revenue: c.revenue })) || [],
                growthData: analytics.revenueOverview?.map((m: any) => ({ 
                    month: m.name, 
                    amount: m.revenue,
                    online: m.onlineRevenue || (m.revenue * 0.7), 
                    cash: m.cashRevenue || (m.revenue * 0.3)
                })) || [],
                recentTransactions: (payments || [])
                    .filter((p: any) => selectedCenter === 'all' || p.centerId === selectedCenter)
                    .filter((p: any) => !startDate || new Date(p.createdAt) >= new Date(startDate))
                    .filter((p: any) => {
                        if (!endDate) return true;
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        return new Date(p.createdAt) <= end;
                    })
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((p: any) => {
                        const inv = invoices.find((i: any) => i.invoiceId === p.invoiceId);
                        const cust = inv ? customers.find((c: any) => c.customerId === inv.issuedToCustomerId) : null;
                        return {
                            id: p.paymentId.substring(0, 8).toUpperCase(),
                            customer: cust ? cust.fullName || cust.name : 'Guest Customer',
                            service: 'Service Payment',
                            amount: `Rs. ${p.amount.toLocaleString()}`,
                            date: new Date(p.createdAt).toLocaleDateString(),
                            status: p.status === 'Completed' ? 'Completed' : 'Pending',
                            method: p.method
                        };
                    })
            });
        } catch (error) {
            console.error("Backend error when pulling finance data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const transformFinanceData = () => {
        // We now rely on the backend analytics for the primary view, 
        // but we keep this for local filtering if the user changes the center dropdown.
        if (selectedCenter === 'all') return;

        const { payments, invoices, customers } = rawData;
        const filteredInvoices = invoices.filter((inv: any) => inv.centerId === selectedCenter && inv.status === 'PAID');
        const filteredPayments = payments.filter((p: any) => p.centerId === selectedCenter);

        const total = filteredInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
        const online = filteredPayments.filter((p: any) => p.method !== 'CASH').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const cash = filteredPayments.filter((p: any) => p.method === 'CASH').reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

        setFinanceData(prev => ({
            ...prev,
            totalRevenue: total,
            onlineRevenue: online,
            cashRevenue: cash,
            avgTransaction: filteredInvoices.length > 0 ? total / filteredInvoices.length : 0,
        }));
    };

    return (
        <Box pb={3}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={6}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        Finance & Revenue
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track your earnings, growth, and financial health.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="center-select-label">All Centers</InputLabel>
                        <Select
                            labelId="center-select-label"
                            label="All Centers"
                            value={selectedCenter}
                            onChange={(e) => setSelectedCenter(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="all">All Service Centers</MenuItem>
                            {centersList.map((center) => (
                                <MenuItem key={center.centerId} value={center.centerId}>
                                    {center.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        type="date"
                        size="small"
                        label="Start Date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ borderRadius: 2, minWidth: 150 }}
                    />
                    <TextField
                        type="date"
                        size="small"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ borderRadius: 2, minWidth: 150 }}
                    />
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => { setStartDate(''); setEndDate(''); setSelectedCenter('all'); }}
                        sx={{ borderRadius: 2 }}
                    >
                        Reset
                    </Button>
                </Stack>
            </Box>

            {isLoading && (
                <Box mb={4}>
                    <LinearProgress sx={{ borderRadius: 1, height: 4, bgcolor: 'rgba(234, 88, 12, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#EA580C' } }} />
                </Box>
            )}

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard
                        title="Total Revenue"
                        value={`Rs. ${financeData.totalRevenue.toLocaleString()}`}
                        subtext="+12% from last month"
                        icon={FiDollarSign}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard
                        title="Cash Revenue"
                        value={`Rs. ${financeData.cashRevenue.toLocaleString()}`}
                        subtext="In-person collection"
                        icon={FiDollarSign}
                        color="#4caf50"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard
                        title="Online Revenue"
                        value={`Rs. ${financeData.onlineRevenue.toLocaleString()}`}
                        subtext="Digital bookings"
                        icon={FiCreditCard}
                        color="#2196f3"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <StatCard
                        title="Avg. Transaction"
                        value={`Rs. ${financeData.avgTransaction.toFixed(0).toLocaleString()}`}
                        subtext="Across all methods"
                        icon={FiCreditCard}
                        color={theme.palette.primary.main}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <ChartCard
                        title="Revenue Overview"
                        description={
                            <Box display="flex" alignItems="center">
                                <Typography variant="button" fontWeight="bold" color="success.main">
                                    +18.5%
                                </Typography>
                                <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                    more earnings than last month
                                </Typography>
                            </Box>
                        }
                        date="just updated"
                        color="primary"
                        chart={
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={financeData.growthData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                    <XAxis
                                        dataKey="month"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#fff', opacity: 0.8 }}
                                    />
                                    <YAxis
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#fff', opacity: 0.8 }}
                                        tickFormatter={(value: any) => `Rs. ${(Number(value) || 0) / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                        formatter={(value: any, name: any, props: any) => {
                                            const data = props.payload;
                                            return [
                                                `Rs. ${Number(data.amount).toLocaleString()}`, 'Total Revenue',
                                                `Rs. ${Number(data.cash || 0).toLocaleString()}`, 'Cash Revenue',
                                                `Rs. ${Number(data.online || 0).toLocaleString()}`, 'Online Revenue'
                                            ];
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: '#fff', fontSize: '12px' }} />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
                                        name="amount"
                                        stroke="#ffffff"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                        activeDot={{ r: 6, stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        }
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 12 }}>
                    <Box mt={4}>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Recent Transactions (Online Deposits)
                                </Typography>
                                <Button size="small" variant="text">View All</Button>
                            </Box>
                            <Box sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={financeData.recentTransactions}
                                    columns={columns}
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 5,
                                            },
                                        },
                                    }}
                                    pageSizeOptions={[5]}
                                    disableRowSelectionOnClick
                                    sx={{
                                        border: 0,
                                        '& .MuiDataGrid-columnHeaders': {
                                            backgroundColor: '#f8fafc',
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
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 12 }}>
                    <Box mt={4}>
                        <ChartCard
                            title="Center Performance"
                            description="Revenue comparison across all branches"
                            date="campaign sent 2 days ago"
                            color="warning"
                            chart={
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={financeData.revenueByCenter}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                            tickFormatter={(value: any) => `Rs. ${(Number(value) || 0) / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            name="Revenue"
                                            fill="#ffffff"
                                            radius={[4, 4, 0, 0]}
                                            maxBarSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
