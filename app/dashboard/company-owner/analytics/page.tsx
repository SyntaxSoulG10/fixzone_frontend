"use client";

import {
    Grid,
    Card,
    Box,
    Typography,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Icon
} from "@mui/material";
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
import { FiDollarSign, FiUsers, FiBriefcase, FiArrowUp } from "react-icons/fi";
import React from 'react';
import DonutStatCard from "@/components/dashboard/DonutStatCard";

// Mock Data
const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 6890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
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

const PIE_COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0'];

export default function AnalyticsPage() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <Box pb={3}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Business Analytics
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Deep dive into your company performance metrics.
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Revenue"
                        count="$124,500"
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
                        color="info"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Avg. Job Value"
                        count="$103.40"
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

            {/* Charts Section */}
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
                            color="dark"
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
                                                tickFormatter={(value) => `$${value}`}
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
                            color="info"
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

                {/* Services Pie Chart */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <DonutStatCard
                        title="Services Breakdown"
                        totalValue={serviceTypeData.reduce((acc, curr) => acc + curr.value, 0)}
                        unit="JOBS"
                        data={(() => {
                            const total = serviceTypeData.reduce((acc, curr) => acc + curr.value, 0);
                            const referenceColors = ['#e91e63', '#343a40', '#2196f3', '#4caf50', '#ff9800'];
                            return serviceTypeData.map((item, index) => ({
                                name: item.name,
                                value: Math.round((item.value / total) * 100), // Use % for display to match screenshot
                                color: referenceColors[index % referenceColors.length]
                            }));
                        })()}
                    />
                </Grid>

                {/* Top Centers Table */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%', overflow: 'visible' }}>
                        
                            
                                <Box pt={3} px={3}>
    <Typography variant="h6" fontWeight="bold">Top Centers</Typography>
</Box>
                           
                        
                        <Box p={2}>
                            <TableContainer>
                                <Table>
                                    <TableHead sx={{ display: 'table-header-group' }}>
                                        <TableRow>
                                            <TableCell>Center Name</TableCell>
                                            <TableCell>Jobs</TableCell>
                                            <TableCell align="right">Revenue</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box width={32} height={32} borderRadius="50%" bgcolor="warning.main" display="flex" alignItems="center" justifyContent="center" fontSize={12} color="#ffffff" fontWeight="bold">D</Box>
                                                    Downtown Branch
                                                </Box>
                                            </TableCell>
                                            <TableCell>450</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>$45,200</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box width={32} height={32} borderRadius="50%" bgcolor="info.main" display="flex" alignItems="center" justifyContent="center" fontSize={12} color="#ffffff" fontWeight="bold">W</Box>
                                                    Westside Hub
                                                </Box>
                                            </TableCell>
                                            <TableCell>320</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>$32,100</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box width={32} height={32} borderRadius="50%" bgcolor="success.main" display="flex" alignItems="center" justifyContent="center" fontSize={12} color="#ffffff" fontWeight="bold">N</Box>
                                                    North Garage
                                                </Box>
                                            </TableCell>
                                            <TableCell>180</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>$18,400</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
