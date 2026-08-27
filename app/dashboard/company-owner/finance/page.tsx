"use client";

import React, { useState, useEffect } from "react";
import axios from "@/lib/axios";
import { useDashboardData } from "@/context/DashboardDataContext";
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
    Chip,
    Snackbar,
    Alert
} from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
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
import StatCard from "@/components/dashboard/StatCard";
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
        field: 'id', headerName: 'ID', width: 100,
        renderCell: (p: GridRenderCellParams) => <Typography variant="caption" fontWeight="bold">{p.value}</Typography> 
    },
    { 
        field: 'date', headerName: 'Date', width: 130,
        renderCell: (p: GridRenderCellParams) => <Typography variant="body2" color="text.secondary">{p.value}</Typography>
    },
    { 
        field: 'customer', headerName: 'Customer', flex: 1.5,
        renderCell: (p: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={1} height="100%">
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>{(p.value || 'U').charAt(0)}</Avatar>
                <Typography variant="body2" fontWeight="medium">{p.value}</Typography>
            </Box>
        )
    },
    { field: 'amount', headerName: 'Amount', flex: 1, renderCell: (p: GridRenderCellParams) => <Typography variant="body2" fontWeight="bold">Rs. {p.value?.toLocaleString()}</Typography> },
    { 
        field: 'method', headerName: 'Method', flex: 1,
        renderCell: (p: GridRenderCellParams) => (
            <Chip label={p.value} size="small" variant="filled" sx={{ bgcolor: p.value === 'CASH' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(234, 88, 12, 0.1)', color: p.value === 'CASH' ? '#2e7d32' : '#c2410c', fontWeight: 'bold' }} />
        )
    },
    { 
        field: 'status', headerName: 'Status', flex: 1, align: 'center', 
        renderCell: (p: GridRenderCellParams) => (
            <Chip 
                label={p.value === 'PAID' ? 'Completed' : p.value} 
                size="small" 
                color={p.value === 'PAID' ? 'success' : 'warning'} 
                variant="outlined" 
                sx={{ fontWeight: 'bold' }} 
            />
        )
    }
];

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
            <TextField type="date" size="small" label="Start Date" value={startDate} onChange={(e) => onStartChange(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ max: endDate || new Date().toISOString().split('T')[0] }} sx={{ borderRadius: 2, minWidth: 150 }} />
            <TextField type="date" size="small" label="End Date" value={endDate} onChange={(e) => onEndChange(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: startDate, max: new Date().toISOString().split('T')[0] }} sx={{ borderRadius: 2, minWidth: 150 }} />
            <Button variant="outlined" size="small" onClick={onReset} sx={{ borderRadius: 2 }}>Reset</Button>
        </Stack>
    );
}

/**
 * RESTORED PAGE: FinancePage
 * Restoring the original complex UI while maintaining performance through DashboardDataContext.
 */
export default function FinancePage() {
    const theme = useTheme();
    const { centersData, analyticsData: contextData, refreshAll } = useDashboardData();
    const [isLoading, setIsLoading] = useState(!contextData);
    const [selectedCenter, setSelectedCenter] = useState('all');
    const [period, setPeriod] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    
    const [financeData, setFinanceData] = useState({
        totalRevenue: contextData?.totalRevenue || 0, 
        onlineRevenue: contextData?.onlineRevenue || 0, 
        cashRevenue: contextData?.handCollectionRevenue || 0, 
        avgTransaction: contextData?.avgJobValue || 0,
        revenueByCenter: (contextData?.topCenters || []).map((c: any) => ({ name: c.name, revenue: c.revenue })),
        growthData: (contextData?.revenueOverview || []).map((m: any) => ({ month: m.name, amount: m.revenue, online: m.onlineRevenue, cash: m.cashRevenue })),
        recentTransactions: (contextData?.recentTransactions || []).map((t: any) => ({ id: t.id, customer: t.customer, amount: t.amount, method: t.method, status: t.status, date: t.date }))
    });

    const centersList = centersData;

    useEffect(() => { 
        loadUnifiedFinanceData(); 
    }, [selectedCenter, period, startDate, endDate]);

    /**
     * LOAD FINANCE DATA
     * Why: Instead of making multiple scattered API calls, we use a single 
     * unified "Analytics" endpoint. This is a "Backends-for-Frontends" (BFF) 
     * pattern that reduces latency and ensures data consistency across the page.
     */
    const loadUnifiedFinanceData = async () => {
        // Validates date range before executing fetch
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            console.warn("Invalid date range selected for finance data");
            setSnackbar({ open: true, message: "Invalid date range selected", severity: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const queryParameters = { 
                centerId: selectedCenter !== 'all' ? selectedCenter : undefined, 
                startDate: startDate || undefined, 
                endDate: endDate || undefined, 
                period 
            };
            
            const apiResponse = await axios.get(`${APP_CONFIG.api.baseUrl}/analytics/current`, { params: queryParameters });
            const analyticsPayload = apiResponse.data;

            setFinanceData({
                totalRevenue: analyticsPayload.totalRevenue || 0,
                onlineRevenue: analyticsPayload.onlineRevenue || 0,
                cashRevenue: analyticsPayload.handCollectionRevenue || 0,
                avgTransaction: analyticsPayload.avgJobValue || 0,
                
                // Map branch performance
                revenueByCenter: (analyticsPayload.topCenters || []).map((branch: any) => ({ 
                    name: branch.name, 
                    revenue: branch.revenue 
                })),
                
                // Map historical growth data
                growthData: (analyticsPayload.revenueOverview || []).map((monthlyData: any) => ({ 
                    month: monthlyData.name, 
                    amount: monthlyData.revenue, 
                    online: monthlyData.onlineRevenue, 
                    cash: monthlyData.cashRevenue 
                })),
                
                // Map recent transaction logs
                recentTransactions: (analyticsPayload.recentTransactions || []).map((transaction: any) => ({
                    id: transaction.id,
                    customer: transaction.customer,
                    amount: transaction.amount,
                    method: transaction.method,
                    status: transaction.status,
                    date: transaction.date
                }))
            });
        } catch (fetchError: any) {
            console.error("Critical error during finance data load:", fetchError);
            const msg = fetchError.response?.data?.message || fetchError.message || "Failed to load finance data.";
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box pb={3}>
            <Box mb={4}>
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
            <Grid container spacing={3} mb={5} mt={1}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard 
                        title="Total Revenue" 
                        count={`Rs. ${(financeData.totalRevenue || 0).toLocaleString('en-LK')}`} 
                        percentage={contextData?.revenueChange ? {
                            color: contextData.revenueChange.startsWith('+') ? 'success' : 'danger',
                            amount: contextData.revenueChange,
                            label: 'vs. last month'
                        } : {
                            color: 'primary',
                            amount: '',
                            label: 'Overall earnings'
                        }} 
                        icon={<FiDollarSign />} 
                        color="primary" 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard 
                        title="Cash Revenue" 
                        count={`Rs. ${(financeData.cashRevenue || 0).toLocaleString('en-LK')}`} 
                        percentage={{
                            color: 'warning',
                            amount: 'Cash',
                            label: 'In-person'
                        }} 
                        icon={<FiDollarSign />} 
                        color="warning" 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard 
                        title="Online Revenue" 
                        count={`Rs. ${(financeData.onlineRevenue || 0).toLocaleString('en-LK')}`} 
                        percentage={{
                            color: 'primary',
                            amount: 'Stripe',
                            label: 'Digital card'
                        }} 
                        icon={<FiCreditCard />} 
                        color="primary" 
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard 
                        title="Avg. Job Value" 
                        count={`Rs. ${Number(financeData.avgTransaction || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`} 
                        percentage={{
                            color: 'success',
                            amount: 'Per job',
                            label: 'Average'
                        }} 
                        icon={<FiCreditCard />} 
                        color="primary" 
                    />
                </Grid>
            </Grid>

            {/* CHARTS GRID ROW */}
            <Grid container spacing={3} mb={4}>
                {/* REVENUE GROWTH CHART */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={2}>
                        <ChartCard 
                            title="Revenue Overview"
                            description="Monthly revenue tracking across payment channels"
                            date="Updated just now"
                            color="primary"
                            chart={
                                <div style={{ width: '100%', height: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={financeData.growthData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.9 }} dy={4} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1e293b' }} />
                                            <Line type="monotone" dataKey="amount" name="Total Revenue" stroke="#ffffff" strokeWidth={3} dot={{ r: 4, fill: '#fff' }} activeDot={{ r: 6, stroke: '#fff' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            }
                        />
                    </Box>
                </Grid>

                {/* CENTER PERFORMANCE BAR CHART */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={2}>
                        <ChartCard
                            title="Center Performance"
                            description="Revenue comparison across all active service branches"
                            date="Real-time branch data"
                            color="warning"
                            chart={
                                <div style={{ width: '100%', height: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financeData.revenueByCenter} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.9 }} dy={4} tickFormatter={(name) => typeof name === 'string' ? name.replace(/^(Raja Motors - |Branch )/i, '') : name} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: '#fff', opacity: 0.9 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1e293b' }} />
                                            <Bar dataKey="revenue" fill="#ffffff" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            }
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* RECENT TRANSACTIONS TABLE */}
            <Box mb={4}>
                <Card sx={{ p: 3, borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary" mb={2.5}>Recent Transactions</Typography>
                    <Box sx={{ height: 400, width: '100%' }}>
                        <DataGrid 
                            rows={financeData.recentTransactions} 
                            columns={transactionColumns} 
                            getRowId={(row) => row.id || Math.random().toString()}
                            pageSizeOptions={[5, 10]} 
                            initialState={{
                                pagination: { paginationModel: { pageSize: 5 } }
                            }}
                            disableRowSelectionOnClick 
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
                </Card>
            </Box>

            <FeedbackSnackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                severity={snackbar.severity}
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
            />
        </Box>
    );
}
