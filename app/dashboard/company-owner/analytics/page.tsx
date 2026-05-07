"use client";

import {
    Grid,
    Card,
    Box,
    Typography,
    Divider,
    LinearProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    TextField,
    Button,
    Snackbar,
    Alert
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';
import { FiDollarSign, FiBriefcase, FiArrowUp, FiClock } from "react-icons/fi";
import React, { useState, useEffect, useMemo } from 'react';
import DonutStatCard from "@/components/dashboard/DonutStatCard";
import { getCompanyAnalytics, getCurrentOwnerAnalytics, AnalyticsData } from "@/services/analyticsService";
import { APP_CONFIG } from "@/utils/config";
import axios from "axios";
import { useDashboardData } from "@/context/DashboardDataContext";
import { formatCurrency, formatDate, validateDateRange } from "@/utils/helpers";
import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Chart display constants.
 */
// Colors for donut chart visualization
const DONUT_CHART_COLORS = [
    '#EA580C', // Primary Orange
    '#1E293B', // Charcoal Slate
    '#F97316', // Bright Orange
    '#334155', // Dark Slate
    '#FB923C', // Medium Orange
    '#475569', // Medium Slate
    '#F59E0B', // Amber
    '#64748B', // Slate Gray
    '#C2410C', // Burnt Orange
    '#0F172A'  // Deep Black-Navy
];


const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Center Name',
        flex: 2,
        minWidth: 200,
        renderCell: (params: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={2} height="100%">
                <Box width={32} height={32} borderRadius="50%" bgcolor={params.row.color || 'primary.main'} display="flex" alignItems="center" justifyContent="center" fontSize={12} color="#ffffff" fontWeight="bold">
                    {params.row.initial || params.value.charAt(0)}
                </Box>
                {params.value}
            </Box>
        )
    },
    {
        field: 'jobs',
        headerName: 'Jobs',
        flex: 1,
        minWidth: 100,
    },
    {
        field: 'revenue',
        headerName: 'Revenue',
        flex: 1.5,
        minWidth: 160,
        headerAlign: 'right',
        align: 'right',
        renderCell: (params: GridRenderCellParams) => (
            <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>{formatCurrency(params.value)}</Typography>
        )
    }
];

export default function AnalyticsPage() {
    const { analyticsData: contextData, centersData: centersList = [], refreshAll } = useDashboardData() || {};
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(!contextData);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    
    // Filter state for analytics queries
    const [selectedCenter, setSelectedCenter] = useState<string>('all');
    const [period, setPeriod] = useState<string>('monthly');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        setIsMounted(true);
        // Load initial data from context when component mounts
        if (contextData) {
            setData(contextData as AnalyticsData);
        }
    }, [contextData]);

    // Fetch analytics when filters change
    useEffect(() => {
        if (isMounted) {
            fetchAnalytics();
        }
    }, [isMounted, selectedCenter, period, startDate, endDate]);

    // Fetch analytics data with optional filters
    const fetchAnalytics = async () => {
        // Validate date range
        if (!validateDateRange(startDate, endDate)) {
            setSnackbar({ open: true, message: 'Start date cannot be after end date', severity: 'error' });
            return;
        }

        // Show loading only if no data exists
        if (!data) setIsLoading(true);
        
        try {
            const params = {
                centerId: selectedCenter !== 'all' ? selectedCenter : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                period: period
            };
            const result = await getCurrentOwnerAnalytics(params);
            setData(result);
        } catch (error: any) {
            const msg = getErrorMessage(error);
            setSnackbar({ open: true, message: msg, severity: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isMounted) return null;

    return (
        <Box pb={3}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Business Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Deep dive into your company performance metrics.
                </Typography>
            </Box>

            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="flex-end" alignItems={{ md: 'center' }} gap={2} mb={4}>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap gap={2}>
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
                            {centersList.map((center: any) => (
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
                        inputProps={{ max: endDate || new Date().toISOString().split('T')[0] }}
                        sx={{ borderRadius: 2, minWidth: 150 }}
                    />
                    <TextField
                        type="date"
                        size="small"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ 
                            min: startDate, 
                            max: new Date().toISOString().split('T')[0] 
                        }}
                        sx={{ borderRadius: 2, minWidth: 150 }}
                    />
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => { setStartDate(''); setEndDate(''); setSelectedCenter('all'); setPeriod('monthly'); }}
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
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Revenue"
                        count={`Rs. ${data?.totalRevenue.toLocaleString() || '0'}`}
                        icon={<FiDollarSign />}
                        percentage={{
                            color: data?.revenueChange.startsWith('+') ? 'success' : 'danger',
                            amount: data?.revenueChange || '0%',
                            label: 'than last month'
                        }}
                        color="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Online Revenue"
                        count={`Rs. ${data?.onlineRevenue.toLocaleString() || '0'}`}
                        icon={<FiDollarSign />}
                        percentage={{
                            color: 'success',
                            amount: 'Digital',
                            label: 'via Platform'
                        }}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Hand Collection"
                        count={`Rs. ${data?.handCollectionRevenue.toLocaleString() || '0'}`}
                        icon={<FiDollarSign />}
                        percentage={{
                            color: 'warning',
                            amount: 'Cash',
                            label: 'In-person'
                        }}
                        color="warning"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Jobs"
                        count={data?.totalJobs.toString() || '0'}
                        icon={<FiBriefcase />}
                        percentage={{
                            color: data?.jobsChange.startsWith('+') ? 'success' : 'danger',
                            amount: data?.jobsChange || '0%',
                            label: 'than last month'
                        }}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Pending Jobs"
                        count={data?.pendingJobs.toString() || '0'}
                        percentage={{
                            color: data?.pendingJobsChange.startsWith('-') ? 'success' : 'danger',
                            amount: data?.pendingJobsChange || '0%',
                            label: 'vs. yesterday'
                        }}
                        icon={<FiClock />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Avg. Job Value"
                        count={`Rs. ${data?.avgJobValue.toLocaleString() || '0'}`}
                        icon={<FiArrowUp />}
                        percentage={{
                            color: data?.avgJobValueChange.startsWith('+') ? 'success' : 'danger',
                            amount: data?.avgJobValueChange || '0%',
                            label: 'than yesterday'
                        }}
                        color="primary"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={3}>
                        <ChartCard
                            title="Revenue Overview"
                            description={
                                <Box display="flex" alignItems="center">
                                    <Typography variant="button" fontWeight="bold" color={data?.revenueChange.startsWith('+') ? "success.main" : "error.main"}>
                                        {data?.revenueChange || '0%'}
                                    </Typography>
                                    <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                        increase in today sales.
                                    </Typography>
                                </Box>
                            }
                            date={`updated at ${data?.updatedAt || 'just now'}`}
                            color="primary"
                            chart={
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={data?.revenueOverview || []}
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
                                            tickFormatter={(value) => `Rs. ${value}`}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#ffffff"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                            activeDot={{ r: 6, stroke: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                        />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={3}>
                        <ChartCard
                            title="Customer Activity"
                            description="Active Customers over time"
                            date="last 6 months"
                            color="primary"
                            chart={
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data?.customerGrowth || []}
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
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                        />
                                        <Legend wrapperStyle={{ color: '#fff' }} />
                                        <Bar dataKey="activeCustomers" name="Active" fill="rgba(255,255,255,0.5)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <DonutStatCard
                        title="Services Breakdown"
                        totalValue={data?.serviceBreakdown.reduce((acc, curr) => acc + curr.value, 0) || 0}
                        unit="JOBS"
                        data={(() => {
                            const serviceData = data?.serviceBreakdown || [];
                            const total = serviceData.reduce((acc, curr) => acc + curr.value, 0);
                            return serviceData.map((item, index) => {
                                let colorIndex = index % DONUT_CHART_COLORS.length;
                                // Prevent first and last segments from having the same color if they wrap around
                                if (index > 0 && index === serviceData.length - 1 && colorIndex === 0) {
                                    colorIndex = 1;
                                }
                                return {
                                    name: item.name,
                                    value: total > 0 ? Math.round((item.value / total) * 100) : 0,
                                    color: DONUT_CHART_COLORS[colorIndex]
                                };
                            });
                        })()}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <Card sx={{ height: '100%', overflow: 'hidden' }} >
                        <Box pt={3} px={3}>
                            <Typography variant="h6" fontWeight="bold">Top Centers</Typography>
                        </Box>
                        <Box sx={{ height: 400, width: '100%' }} >
                            <DataGrid
                                rows={data?.topCenters || []}
                                columns={columns}
                                getRowId={(row) => row.id}
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
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
