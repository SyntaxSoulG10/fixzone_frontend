"use client";

import React, { useState } from "react";
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
    Stack
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    FiTrendingUp,
    FiCreditCard,
    FiDollarSign,
    FiPieChart
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

// Data Mock
const REVENUE_DATA = [
    { name: 'Downtown', revenue: 45000 },
    { name: 'Westside', revenue: 32000 },
    { name: 'North', revenue: 28000 },
    { name: 'East', revenue: 15000 },
];

const GROWTH_DATA = [
    { month: 'Jan', amount: 12000 },
    { month: 'Feb', amount: 19000 },
    { month: 'Mar', amount: 15000 },
    { month: 'Apr', amount: 22000 },
    { month: 'May', amount: 30000 },
    { month: 'Jun', amount: 45000 },
];

const PAYMENT_DATA = [
    { name: 'Card', value: 60, color: '#EA580C' },
    { name: 'Online', value: 25, color: '#F97316' }, // Orange-500
    { name: 'Cash', value: 15, color: '#FB923C' }, // Orange-400
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

    return (
        <Box pb={3}>
            {/* Header */}
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

            {/* Top Stats */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Revenue"
                        value="$143,000"
                        subtext="+12% from last month"
                        icon={FiDollarSign}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Monthly Growth"
                        value="18.5%"
                        subtext="Consistent upward trend"
                        icon={FiTrendingUp}
                        color={theme.palette.primary.main}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Avg. Transaction"
                        value="$450"
                        subtext="Per job ticket"
                        icon={FiCreditCard}
                        color={theme.palette.primary.main}
                    />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
                {/* Monthly Growth Line Chart */}
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
                                    data={GROWTH_DATA}
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
                                        tickFormatter={(value: number) => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1e293b' }}
                                        formatter={(value: any) => [`$${value}`, 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="amount"
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

                {/* Payment Types Donut Chart */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Box mt={4} height="100%">
                        <DonutStatCard
                            title="Payment Breakdown"
                            totalValue={100}
                            unit="TRXN"
                            subtext="Percentage distribution"
                            data={PAYMENT_DATA}
                        />
                    </Box>
                </Grid>

                {/* Revenue by Center Bar Chart */}
                <Grid size={{ xs: 12, lg: 12 }}>
                    <Box mt={12}>
                        <ChartCard
                            title="Center Performance"
                            description="Revenue comparison across all branches"
                            date="campaign sent 2 days ago"
                            color="warning" // Using warning (orange) to vary slightly but stay in brand
                            chart={
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={REVENUE_DATA}
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
                                            tickFormatter={(value: number) => `$${value / 1000}k`}
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
