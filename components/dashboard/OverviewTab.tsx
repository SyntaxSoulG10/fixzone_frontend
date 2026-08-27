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
    const chartData = (data?.revenueOverview && data.revenueOverview.length > 0)
        ? data.revenueOverview.map((item: any) => ({
            name: item.name,
            sales: Number(item.revenue || 0)
        }))
        : Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - (5 - i));
            return {
                name: d.toLocaleString('en-US', { month: 'short' }),
                sales: 0
            };
        });

    return (
        <Grid container spacing={3} mb={4}>
            {/* Revenue Trend Chart */}
            <Grid size={{ xs: 12, lg: 7 }}>
                <ChartCard
                    title="Revenue Trend"
                    description={
                        <Box display="flex" alignItems="center">
                            <Typography variant="button" fontWeight="bold" color={data?.revenueChange?.startsWith('+') ? "success.main" : "error.main"}>
                                {data?.revenueChange || "0%"}
                            </Typography>
                            <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                change in revenue vs last month
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
                                        interval={0}
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
            </Grid>

            {/* Top Performing Centers */}
            <Grid size={{ xs: 12, lg: 5 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box p={3} flex={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" fontWeight="bold">
                                Top Performing Centers
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Revenue & Jobs
                            </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {data?.topCenters?.length > 0 ? (
                                data.topCenters.map((center: any, index: number) => {
                                    const percentage = data.totalRevenue > 0 
                                        ? Math.min(100, Math.round((center.revenue / data.totalRevenue) * 100)) 
                                        : 0;
                                    return (
                                        <Box key={center.id || index} display="flex" alignItems="center" justifyContent="space-between" p={1.5} bgcolor="background.paper" borderRadius="0.75rem" border="1px solid" borderColor="divider">
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Box
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    width="2.25rem"
                                                    height="2.25rem"
                                                    borderRadius="50%"
                                                    bgcolor="primary.main"
                                                    color="#ffffff"
                                                    fontWeight="bold"
                                                    fontSize="0.875rem"
                                                >
                                                    {center.initial || index + 1}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">{center.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{center.jobs || 0} Jobs • {percentage}% contribution</Typography>
                                                </Box>
                                            </Box>
                                            <Box textAlign="right">
                                                <Typography variant="subtitle2" fontWeight="bold">Rs. {center.revenue?.toLocaleString() || 0}</Typography>
                                                <Box width="5rem" height="0.35rem" bgcolor="grey.200" borderRadius="xl" mt={0.5} overflow="hidden">
                                                    <Box width={`${percentage}%`} height="100%" bgcolor="primary.main" borderRadius="xl" />
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
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
