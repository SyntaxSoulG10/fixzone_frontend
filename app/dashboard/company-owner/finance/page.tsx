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
    LinearProgress
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


const API_BASE_URL = "http://127.0.0.1:8081/api";

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
    const [period, setPeriod] = useState('monthly');
    const [selectedCenter, setSelectedCenter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [centersList, setCentersList] = useState<any[]>([]);
    const [rawData, setRawData] = useState<{
        payments: any[],
        centers: any[],
        customers: any[],
        invoices: any[]
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
        recentTransactions: [] as any[]
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (rawData.payments.length > 0 || rawData.invoices.length > 0) {
            transformFinanceData();
        }
    }, [selectedCenter, period, rawData]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [paymentsRes, centersRes, customersRes, invoicesRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/payment-records`),
                axios.get(`${API_BASE_URL}/service-centers`),
                axios.get(`${API_BASE_URL}/customers`),
                axios.get(`${API_BASE_URL}/invoices`)
            ]);

            const centers = centersRes.data || [];
            setCentersList(centers);
            setRawData({
                payments: paymentsRes.data || [],
                centers: centers,
                customers: customersRes.data || [],
                invoices: invoicesRes.data || []
            });
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const transformFinanceData = () => {
        const { payments, centers, customers, invoices } = rawData;

        // Filter by Center if selected
        let filteredInvoices = invoices.filter((inv: any) => inv.status === 'PAID');
        let filteredPayments = payments.filter((p: any) => p.status === 'Completed');

        if (selectedCenter !== 'all') {
            filteredInvoices = filteredInvoices.filter((inv: any) => inv.centerId === selectedCenter);
            filteredPayments = filteredPayments.filter((p: any) => p.centerId === selectedCenter);
        }

        // 1. Calculate Full Revenue from PAID Invoices
        const totalFullRevenue = filteredInvoices.reduce((sum: number, inv: any) => sum + (Number(inv.total || inv.totalAmount) || 0), 0);
        
        // 2. Calculate Online Revenue (CARD or ONLINE methods)
        const totalOnlineRevenue = filteredPayments
            .filter((p: any) => p.method === 'CARD' || p.method === 'ONLINE')
            .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        
        // 3. Calculate Hand Collection Revenue (CASH method)
        const totalHandCollectionRevenue = filteredPayments
            .filter((p: any) => p.method === 'CASH')
            .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        // Revenue by Center
        const revenueByCenterMap = new Map();
        // Always calculate this from all invoices for the center performance chart
        invoices.filter((inv: any) => inv.status === 'PAID').forEach((inv: any) => {
            const centerIdStr = String((inv as any).centerId);
            const center = centers.find((c: any) => String((c as any).centerId) === centerIdStr);
            const centerName = center ? (center as any).name : 'Unknown Center';
            revenueByCenterMap.set(centerName, (revenueByCenterMap.get(centerName) || 0) + (Number(inv.total) || 0));
        });
        const revenueByCenter = Array.from(revenueByCenterMap.entries()).map(([name, revenue]) => ({ name, revenue }));

        // Growth Data (Last 6 months)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const growthData = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthIdx = d.getMonth();
            const year = d.getFullYear();
            
            const monthTotal = filteredInvoices
                .filter((inv: any) => {
                    const invDate = new Date(inv.createdAt);
                    return invDate.getMonth() === monthIdx && invDate.getFullYear() === year;
                })
                .reduce((sum: number, inv: any) => sum + (Number(inv.total || inv.totalAmount) || 0), 0);
            
            const monthOnline = filteredPayments
                .filter((p: any) => {
                    const payDate = new Date(p.createdAt);
                    return (p.method === 'CARD' || p.method === 'ONLINE') && payDate.getMonth() === monthIdx && payDate.getFullYear() === year;
                })
                .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

            const monthCash = filteredPayments
                .filter((p: any) => {
                    const payDate = new Date(p.createdAt);
                    return p.method === 'CASH' && payDate.getMonth() === monthIdx && payDate.getFullYear() === year;
                })
                .reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

            growthData.push({ 
                month: months[monthIdx], 
                amount: monthTotal,
                online: monthOnline,
                cash: monthCash
            });
        }

        // Recent Transactions
        const recentTransactions = filteredPayments
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
            .map((p: any) => {
                const invoice = invoices.find((inv: any) => (inv as any).invoiceId === (p as any).invoiceId);
                const customer = invoice ? customers.find((c: any) => (c as any).customerId === (invoice as any).issuedToCustomerId) : null;
                return {
                    id: p.paymentId.substring(0, 8).toUpperCase(),
                    customer: customer ? (customer as any).name : 'Guest Customer',
                    service: 'Booking Deposit',
                    amount: `Rs. ${p.amount.toLocaleString()}`,
                    date: new Date(p.createdAt).toLocaleDateString() + ' ' + new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: p.status,
                    method: p.method
                };
            });

        setFinanceData({
            totalRevenue: totalFullRevenue,
            onlineRevenue: totalOnlineRevenue,
            cashRevenue: totalHandCollectionRevenue,
            monthlyGrowth: 21.4,
            avgTransaction: filteredInvoices.length > 0 ? totalFullRevenue / filteredInvoices.length : 0,
            revenueByCenter: revenueByCenter.length > 0 ? revenueByCenter : [{ name: 'No Data', revenue: 0 }],
            growthData: growthData.length > 0 ? growthData : [{ month: 'N/A', amount: 0, online: 0, cash: 0 }],
            recentTransactions
        });
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
