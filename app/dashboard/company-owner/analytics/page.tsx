"use client";

import {
    Grid,
    Card,
    Box,
    Typography,
    Divider,
    LinearProgress,
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
import React, { useState, useEffect } from 'react';
import DonutStatCard from "@/components/dashboard/DonutStatCard";
import { getCompanyAnalytics, AnalyticsData } from "@/services/analyticsService";


const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Center Name',
        flex: 2,
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
    },
    {
        field: 'revenue',
        headerName: 'Revenue',
        flex: 1,
        headerAlign: 'right',
        align: 'right',
        renderCell: (params: GridRenderCellParams) => (
            <Typography fontWeight="bold">Rs. {params.value.toLocaleString()}</Typography>
        )
    }
];

export default function AnalyticsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            // Using a default company code for now, this could come from auth/session
            const analyticsData = await getCompanyAnalytics("FIX001");
            setData(analyticsData);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
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

            {isLoading && (
                <Box mb={4}>
                    <LinearProgress sx={{ borderRadius: 1, height: 4, bgcolor: 'rgba(234, 88, 12, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#EA580C' } }} />
                </Box>
            )}

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
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
                            title="Customer Growth"
                            description="New vs Active Customers over time"
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
                                        <Bar dataKey="newCustomers" name="New" fill="#ffffff" radius={[4, 4, 0, 0]} maxBarSize={30} />
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
                            const referenceColors = ['#EA580C', '#343a40', '#FB923C', '#FED7AA', '#e91e63'];
                            return serviceData.map((item, index) => ({
                                name: item.name,
                                value: total > 0 ? Math.round((item.value / total) * 100) : 0,
                                color: referenceColors[index % referenceColors.length]
                            }));
                        })()}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%', overflow: 'visible' }}>
                        <Box pt={3} px={3}>
                            <Typography variant="h6" fontWeight="bold">Top Centers</Typography>
                        </Box>
                        <Box sx={{ height: 400, width: '100%' }}>
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
        </Box>
    );
}
