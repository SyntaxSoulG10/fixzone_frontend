"use client";

import React from 'react';
import ChartCard from "@/components/dashboard/ChartCard";
// import Button from "@/components/UI/Button"; // Replacing with MUI Button
import Link from 'next/link';
import { Grid, Card, Box, Typography, Button } from '@mui/material';
import {
    FiBarChart2,
    FiClock,
    FiFileText,
    FiUsers,
    FiCalendar,
    FiArrowRight
} from "react-icons/fi";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Data from material-dashboard-react-main (reportsLineChartData.js)
const salesData = [
    { name: 'Apr', sales: 50 },
    { name: 'May', sales: 40 },
    { name: 'Jun', sales: 300 },
    { name: 'Jul', sales: 320 },
    { name: 'Aug', sales: 500 },
    { name: 'Sep', sales: 350 },
    { name: 'Oct', sales: 200 },
    { name: 'Nov', sales: 230 },
    { name: 'Dec', sales: 500 },
];

export default function OverviewTab() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <Grid container spacing={3}>
            {/* Left Column: Sales Chart */}
            <Grid size={{ xs: 12, lg: 8 }}>
                <Box mb={3}>
                    <ChartCard
                        title="Daily Sales"
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
                        color="success" // mapped to success (green)
                        chart={
                            isMounted ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={salesData}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                            interval={0}
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
                                        <Line
                                            type="monotone"
                                            dataKey="sales"
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

                <Card>
                    <Box p={2}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top Performing Centers
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {[1, 2, 3].map((i) => (
                                <Box key={i} display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="background.paper" borderRadius="lg" boxShadow="0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)">
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            width="2.5rem"
                                            height="2.5rem"
                                            borderRadius="50%"
                                            bgcolor="warning.main"
                                            color="#ffffff"
                                            fontWeight="bold"
                                            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                        >
                                            #{i}
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">Downtown Service Hub</Typography>
                                            <Typography variant="caption" color="text.secondary">New York, NY</Typography>
                                        </Box>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography variant="subtitle2" fontWeight="bold">$45,200</Typography>
                                        <Box width="6rem" height="0.4rem" bgcolor="grey.200" borderRadius="xl" mt={0.5} overflow="hidden">
                                            <Box width="70%" height="100%" bgcolor="warning.main" borderRadius="xl" />
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Card>
            </Grid>

            {/* Right Column: Live Activity */}
            <Grid size={{ xs: 12, lg: 4 }}>
                <Card sx={{ height: '100%', mt: { xs: 3, lg: 4 } }}>
                    <Box p={2}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Recent Activity
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={3} mt={2}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Box key={i} display="flex" gap={2}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <Box width="0.5rem" height="0.5rem" borderRadius="50%" bgcolor="warning.main" boxShadow="0 0 0 4px #fff, 0 0 0 8px #ffd59f" />
                                        {i !== 5 && <Box width="2px" flexGrow={1} bgcolor="grey.200" my={0.5} />}
                                    </Box>
                                    <Box pb={i !== 5 ? 2 : 0}>
                                        <Typography variant="subtitle2" fontWeight="bold">New Job Created</Typography>
                                        <Typography variant="caption" color="text.secondary" component="div">
                                            Downtown Branch started a new tire service.
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled" fontWeight="medium" mt={0.5} display="block">
                                            10:42 AM
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box mt={3}>
                            <Button fullWidth variant="text" color="primary">
                                View Full History
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}
