"use client";

import {
    Grid,
    Card,
    Box,
    Typography,
    Divider,
    Icon,
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
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { FiDollarSign, FiUsers, FiBriefcase, FiArrowUp, FiClock } from "react-icons/fi";
import React from 'react';
import DonutStatCard from "@/components/dashboard/DonutStatCard";


const revenueData = [
    { name: 'Jan', revenue: 400000 },
    { name: 'Feb', revenue: 300000 },
    { name: 'Mar', revenue: 500000 },
    { name: 'Apr', revenue: 278000 },
    { name: 'May', revenue: 689000 },
    { name: 'Jun', revenue: 239000 },
    { name: 'Jul', revenue: 349000 },
];

const customerGrowthData = [
    { name: 'Jan', new: 20, active: 40 },
    { name: 'Feb', new: 30, active: 60 },
    { name: 'Mar', new: 45, active: 90 },
    { name: 'Apr', new: 25, active: 100 },
    { name: 'May', new: 60, active: 150 },
    { name: 'Jun', new: 80, active: 210 },
];

const serviceTypeData = [
    { name: 'Oil Change', value: 400 },
    { name: 'Tire Service', value: 300 },
    { name: 'Engine Repair', value: 300 },
    { name: 'Car Wash', value: 200 },
];

const TOP_CENTERS = [
    { id: 1, name: "Colombo Main Branch", initial: "C", color: "primary.main", jobs: 450, revenue: 452000 },
    { id: 2, name: "Kandy Service Center", initial: "K", color: "info.main", jobs: 320, revenue: 321000 },
    { id: 3, name: "Galle Southern Hub", initial: "G", color: "success.main", jobs: 180, revenue: 184000 }
];

const columns: GridColDef[] = [
    {
        field: 'name',
        headerName: 'Center Name',
        flex: 2,
        renderCell: (params: GridRenderCellParams) => (
            <Box display="flex" alignItems="center" gap={2} height="100%">
                <Box width={32} height={32} borderRadius="50%" bgcolor={params.row.color} display="flex" alignItems="center" justifyContent="center" fontSize={12} color="#ffffff" fontWeight="bold">
                    {params.row.initial}
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

const PIE_COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'];

export default function AnalyticsPage() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

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

            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Revenue"
                        count="Rs. 1,245,000"
                        icon={<FiDollarSign />}
                        percentage={{
                            color: 'success',
                            amount: '+55%',
                            label: 'than last week'
                        }}
                        color="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Jobs"
                        count="1,204"
                        icon={<FiBriefcase />}
                        percentage={{
                            color: 'success',
                            amount: '+3%',
                            label: 'than last month'
                        }}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Pending Jobs"
                        count="42"
                        percentage={{
                            color: 'danger',
                            amount: '-5%',
                            label: 'vs. yesterday'
                        }}
                        icon={<FiClock />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Avg. Job Value"
                        count="Rs. 10,340"
                        icon={<FiArrowUp />}
                        percentage={{
                            color: 'danger',
                            amount: '-2%',
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
                                    <Typography variant="button" fontWeight="bold" color="success.main">
                                        +15%
                                    </Typography>
                                    <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                        increase in today sales.
                                    </Typography>
                                </Box>
                            }
                            date="updated 4 min ago"
                            color="primary"
                            chart={
                                isMounted ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={revenueData}
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
                                ) : null
                            }
                        />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={3}>
                        <ChartCard
                            title="Customer Growth"
                            description="New vs Active Customers over time"
                            date="campaign sent 2 days ago"
                            color="primary"
                            chart={
                                isMounted ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={customerGrowthData}
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
                                            <Bar dataKey="new" name="New" fill="#ffffff" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                            <Bar dataKey="active" name="Active" fill="rgba(255,255,255,0.5)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : null
                            }
                        />
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <DonutStatCard
                        title="Services Breakdown"
                        totalValue={serviceTypeData.reduce((acc, curr) => acc + curr.value, 0)}
                        unit="JOBS"
                        data={(() => {
                            const total = serviceTypeData.reduce((acc, curr) => acc + curr.value, 0);
                            const referenceColors = ['#EA580C', '#343a40', '#FB923C', '#FED7AA', '#e91e63'];
                            return serviceTypeData.map((item, index) => ({
                                name: item.name,
                                value: Math.round((item.value / total) * 100),
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
                                rows={TOP_CENTERS}
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
                </Grid>
            </Grid>
        </Box>
    );
}
