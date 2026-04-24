"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Grid,
    Card,
    Box,
    Typography,
    Button,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    Avatar,
    LinearProgress,
    TextField,
    Chip
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useTheme } from "@mui/material/styles";
import {
    FiCreditCard,
    FiDollarSign
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
    Legend
} from 'recharts';
import ChartCard from "@/components/dashboard/ChartCard";
import { APP_CONFIG } from "@/utils/config";

/**
 * DATA MODELS: Defining strict types for financial records helps maintain 
 * consistency between the backend response and the UI rendering.
 */
interface PaymentRecordDTO { paymentId: string; invoiceId: number; amount: number; status: string; method: string; centerId: string; createdAt: string; }
interface CenterDTO { centerId: string; name: string; }
interface CustomerDTO { customerId: string; name: string; fullName?: string; }
interface InvoiceDTO { invoiceId: number; status: string; centerId: string; total?: number; issuedToCustomerId: string; }

/**
 * TABLE CONFIGURATION: Defining column structures outside the component 
 * reduces render complexity and makes it easier to update the table layout.
 */
const transactionColumns: GridColDef[] = [
    { 
        field: 'id', headerName: 'ID', flex: 1, 
        renderCell: (p: GridRenderCellParams) => <Typography variant="caption" fontWeight="bold">{p.value}</Typography> 
    },
    { 
        field: 'customer', headerName: 'Customer', flex: 1.5,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={1} height="100%">
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>{p.value.charAt(0)}</Avatar>
                <Typography variant="body2" fontWeight="medium">{p.value}</Typography>
            </Box>
        )
    },
    { field: 'amount', headerName: 'Amount', flex: 1, renderCell: (p: GridRenderCellParams) => <Typography variant="body2" fontWeight="bold">{p.value}</Typography> },
    { 
        field: 'method', headerName: 'Method', flex: 1,
        renderCell: (p: GridRenderCellParams) => (
            <Chip label={p.value} size="small" variant="filled" sx={{ bgcolor: p.value === 'CASH' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(33, 150, 243, 0.1)', color: p.value === 'CASH' ? '#2e7d32' : '#1976d2', fontWeight: 'bold' }} />
        )
    },
    { field: 'status', headerName: 'Status', flex: 1, align: 'center', renderCell: (p: GridRenderCellParams) => <Chip label={p.value} size="small" color={p.value === 'Completed' ? 'success' : 'warning'} variant="outlined" sx={{ fontWeight: 'bold' }} /> }
];

/**
 * STAT CARD COMPONENT: Reusable display for financial KPIs.
 */
function FinanceStatCard({ title, value, subtext, icon: Icon, color }: any) {
    const theme = useTheme();
    return (
        <Card sx={{ p: 3, height: '100%', position: 'relative', overflow: 'visible', borderRadius: 3, boxShadow: theme.shadows[2] }}>
            <Box sx={{ position: 'absolute', top: -20, left: 20, background: 'linear-gradient(195deg, #FB923C, #EA580C)', borderRadius: 3, p: 2, boxShadow: theme.shadows[4], color: '#fff' }}>
                <Icon size={24} />
            </Box>
            <Box textAlign="right">
                <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
                <Typography variant="h4" fontWeight="bold">{value}</Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">{subtext}</Typography>
            </Box>
        </Card>
    );
}

/**
 * FILTERS COMPONENT: Encapsulates the selection logic for center, period, and dates.
 */
function FinanceFilters({ centers, selectedCenter, onCenterChange, period, onPeriodChange, startDate, onStartChange, endDate, onEndChange, onReset }: any) {
    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>All Centers</InputLabel>
                <Select label="All Centers" value={selectedCenter} onChange={(e) => onCenterChange(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="all">All Service Centers</MenuItem>
                    {centers.map((c: any) => <MenuItem key={c.centerId} value={c.centerId}>{c.name}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={period} onChange={(e) => onPeriodChange(e.target.value)} sx={{ borderRadius: 2 }}>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
            </FormControl>
            <TextField type="date" size="small" label="Start Date" value={startDate} onChange={(e) => onStartChange(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ borderRadius: 2, minWidth: 150 }} />
            <TextField type="date" size="small" label="End Date" value={endDate} onChange={(e) => onEndChange(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ borderRadius: 2, minWidth: 150 }} />
            <Button variant="outlined" size="small" onClick={onReset} sx={{ borderRadius: 2 }}>Reset</Button>
        </Stack>
    );
}

/**
 * MAIN PAGE COMPONENT: Orchestrates state management and lifecycle for the finance dashboard.
 */
export default function FinancePage() {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState('all');
    const [period, setPeriod] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [centersList, setCentersList] = useState<CenterDTO[]>([]);
    const [financeData, setFinanceData] = useState({
        totalRevenue: 0, onlineRevenue: 0, cashRevenue: 0, avgTransaction: 0,
        revenueByCenter: [] as any[], growthData: [] as any[], recentTransactions: [] as any[]
    });

    useEffect(() => { loadFinanceData(); }, [selectedCenter, period, startDate, endDate]);

    // LOAD DATA: Fetches aggregated metrics and transaction logs from the backend.
    const loadFinanceData = async () => {
        setIsLoading(true);
        try {
            const params = { centerId: selectedCenter !== 'all' ? selectedCenter : undefined, startDate: startDate || undefined, endDate: endDate || undefined, period };
            const [analyticsRes, paymentsRes, centersRes, customersRes, invoicesRes] = await Promise.all([
                axios.get(`${APP_CONFIG.api.baseUrl}/analytics/current`, { params }),
                axios.get(`${APP_CONFIG.api.baseUrl}/payment-records/current`),
                axios.get(`${APP_CONFIG.api.baseUrl}/service-centers/current`),
                axios.get(`${APP_CONFIG.api.baseUrl}/customers/current`),
                axios.get(`${APP_CONFIG.api.baseUrl}/invoices/current`)
            ]);

            const analytics = analyticsRes.data;
            const payments = paymentsRes.data || [];
            setCentersList(centersRes.data || []);

            setFinanceData({
                totalRevenue: analytics.totalRevenue || 0,
                onlineRevenue: analytics.onlineRevenue || 0,
                cashRevenue: analytics.handCollectionRevenue || 0,
                avgTransaction: analytics.avgJobValue || 0,
                revenueByCenter: analytics.topCenters?.map((c: any) => ({ name: c.name, revenue: c.revenue })) || [],
                growthData: analytics.revenueOverview?.map((m: any) => ({ 
                    month: m.name, amount: m.revenue, online: m.onlineRevenue || (m.revenue * 0.7), cash: m.cashRevenue || (m.revenue * 0.3)
                })) || [],
                recentTransactions: payments.filter((p: any) => selectedCenter === 'all' || p.centerId === selectedCenter).slice(0, 10).map((p: any) => {
                    const inv = invoicesRes.data?.find((i: any) => i.invoiceId === p.invoiceId);
                    const cust = inv ? customersRes.data?.find((c: any) => c.customerId === inv.issuedToCustomerId) : null;
                    return { id: p.paymentId.substring(0, 8).toUpperCase(), customer: cust?.fullName || 'Guest', amount: `Rs. ${p.amount.toLocaleString()}`, method: p.method, status: p.status === 'Completed' ? 'Completed' : 'Pending' };
                })
            });
        } catch (e) { console.error("Finance load error:", e); } finally { setIsLoading(false); }
    };

    return (
        <Box pb={3}>
            <Box mb={6}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>Finance & Revenue</Typography>
                <Typography variant="body1" color="text.secondary">Track earnings and financial health.</Typography>
            </Box>

            <FinanceFilters 
                centers={centersList} selectedCenter={selectedCenter} onCenterChange={setSelectedCenter} 
                period={period} onPeriodChange={setPeriod} startDate={startDate} onStartChange={setStartDate} 
                endDate={endDate} onEndChange={setEndDate} onReset={() => { setStartDate(''); setEndDate(''); setSelectedCenter('all'); }} 
            />

            {isLoading && <LinearProgress sx={{ mb: 4, height: 4, bgcolor: 'rgba(234, 88, 12, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#EA580C' } }} />}

            {/* KPI STATS ROW */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 3 }}><FinanceStatCard title="Total Revenue" value={`Rs. ${financeData.totalRevenue.toLocaleString()}`} subtext="+12% from last month" icon={FiDollarSign} color={theme.palette.primary.main} /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><FinanceStatCard title="Cash Revenue" value={`Rs. ${financeData.cashRevenue.toLocaleString()}`} subtext="In-person" icon={FiDollarSign} color="#4caf50" /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><FinanceStatCard title="Online Revenue" value={`Rs. ${financeData.onlineRevenue.toLocaleString()}`} subtext="Digital" icon={FiCreditCard} color="#2196f3" /></Grid>
                <Grid size={{ xs: 12, md: 3 }}><FinanceStatCard title="Avg. Job" value={`Rs. ${financeData.avgTransaction.toFixed(0)}`} subtext="Per transaction" icon={FiCreditCard} color={theme.palette.primary.main} /></Grid>
            </Grid>

            {/* REVENUE GROWTH CHART */}
            <ChartCard
                title="Revenue Overview"
                color="primary"
                chart={
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financeData.growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.8 }} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.8 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            <Legend wrapperStyle={{ color: '#fff' }} />
                            <Line type="monotone" dataKey="amount" name="Total Revenue" stroke="#fff" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                }
            />

            {/* RECENT TRANSACTIONS TABLE */}
            <Box mt={4}>
                <Card sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={3}>Recent Transactions</Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid rows={financeData.recentTransactions} columns={transactionColumns} pageSizeOptions={[5]} disableRowSelectionOnClick />
                    </Box>
                </Card>
            </Box>

            {/* CENTER PERFORMANCE BAR CHART */}
            <Box mt={4}>
                <ChartCard
                    title="Center Performance"
                    color="warning"
                    chart={
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financeData.revenueByCenter} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.8 }} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.8 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                                <Bar dataKey="revenue" fill="#fff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    }
                />
            </Box>
        </Box>
    );
}
