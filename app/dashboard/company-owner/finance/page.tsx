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
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar
} from "@mui/material";
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



const RECENT_TRANSACTIONS = [
    {
        id: "TRX-9821",
        customer: "John Doe",
        service: "Premium Detailing Package",
        amount: "$149.99",
        date: "Today, 10:42 AM",
        status: "Completed",
        method: "Credit Card"
    },
    {
        id: "TRX-9822",
        customer: "Sarah Smith",
        service: "Standard Oil Change",
        amount: "$49.99",
        date: "Today, 09:15 AM",
        status: "Completed",
        method: "Apple Pay"
    },
    {
        id: "TRX-9823",
        customer: "Michael Brown",
        service: "Full Diagnostic Scan",
        amount: "$89.00",
        date: "Yesterday, 04:30 PM",
        status: "Pending",
        method: "Bank Transfer"
    },
    {
        id: "TRX-9824",
        customer: "Emily Davis",
        service: "Brake Pad Replacement",
        amount: "$120.00",
        date: "Yesterday, 02:15 PM",
        status: "Completed",
        method: "Cash"
    },
    {
        id: "TRX-9825",
        customer: "David Wilson",
        service: "Standard Oil Change",
        amount: "$49.99",
        date: "Yesterday, 11:00 AM",
        status: "Refunded",
        method: "Credit Card"
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
                <Grid size={{ xs: 12, lg: 12 }}>
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

                {/* Revenue by Center Bar Chart */}
                <Grid size={{ xs: 12, lg: 12 }}>
                    <Box mt={4}>
                        <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Recent Transactions
                                </Typography>
                                <Button size="small" variant="text">View All</Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Transaction ID</TableCell>
                                            <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Customer</TableCell>
                                            <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Service Package</TableCell>
                                            <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Date</TableCell>
                                            <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Amount</TableCell>
                                            <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }} align="center">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {RECENT_TRANSACTIONS.map((trx) => (
                                            <TableRow key={trx.id} hover>
                                                <TableCell>
                                                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                                        {trx.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                                                            {trx.customer.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {trx.customer}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {trx.service}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {trx.date}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                        {trx.amount}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        label={trx.status}
                                                        size="small"
                                                        color={
                                                            trx.status === 'Completed' ? 'success' :
                                                                trx.status === 'Pending' ? 'warning' : 'error'
                                                        }
                                                        variant="outlined"
                                                        sx={{ fontWeight: 'bold', height: 24 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Box>
                </Grid>

                {/* Revenue by Center Bar Chart */}
                <Grid size={{ xs: 12, lg: 12 }}>
                    <Box mt={4}>
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
