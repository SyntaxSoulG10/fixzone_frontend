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

export default function OverviewTab({ data }: { data: any }) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // Transform backend revenueOverview to chart format if data exists
    const chartData = data?.revenueOverview?.map((item: any) => ({
        name: item.name,
        sales: item.revenue
    })) || [
        { name: 'Apr', sales: 0 },
        { name: 'May', sales: 0 },
        { name: 'Jun', sales: 0 },
    ];

    return (
        <Grid container spacing={3}>
            {/* Left Column: Sales Chart */}
            <Grid size={{ xs: 12 }}>
                <Box mb={3}>
                    <ChartCard
                        title="Revenue Trend"
                        description={
                            <Box display="flex" alignItems="center">
                                <Typography variant="button" fontWeight="bold" color={data?.revenueChange?.startsWith('+') ? "success.main" : "error.main"}>
                                    {data?.revenueChange || "0%"}
                                </Typography>
                                <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                    change in revenue.
                                </Typography>
                            </Box>
                        }
                        date={`Updated ${data?.updatedAt || 'just now'}`}
                        color="primary"
                        chart={
                            isMounted ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                                    <LineChart
                                        data={chartData}
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
                                            tickFormatter={(value) => `Rs. ${value >= 1000 ? (value / 1000) + 'k' : value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                            formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
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
                            {data?.topCenters?.length > 0 ? (
                                data.topCenters.map((center: any, index: number) => (
                                    <Box key={center.id || index} display="flex" alignItems="center" justifyContent="space-between" p={2} bgcolor="background.paper" borderRadius="lg" boxShadow="0rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1), 0rem 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06)">
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Box
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                width="2.5rem"
                                                height="2.5rem"
                                                borderRadius="50%"
                                                bgcolor="primary.main"
                                                color="#ffffff"
                                                fontWeight="bold"
                                                boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                            >
                                                {center.initial || index + 1}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">{center.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{center.jobs} Jobs completed</Typography>
                                            </Box>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="subtitle2" fontWeight="bold">Rs. {center.revenue?.toLocaleString()}</Typography>
                                            <Box width="6rem" height="0.4rem" bgcolor="grey.200" borderRadius="xl" mt={0.5} overflow="hidden">
                                                <Box width={`${Math.min(100, (center.revenue / data.totalRevenue) * 200)}%`} height="100%" bgcolor="primary.main" borderRadius="xl" />
                                            </Box>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                                    No center performance data available yet.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}
