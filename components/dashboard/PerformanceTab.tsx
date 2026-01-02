"use client";

import React from 'react';
import {
    Grid,
    Card,
    Box,
    Typography,
    LinearProgress
} from '@mui/material';
import ChartCard from "@/components/dashboard/ChartCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const performanceData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
];

const centerPerformance = [
    { name: 'Downtown Hub', progress: 80, color: 'primary' },
    { name: 'North Branch', progress: 65, color: 'primary' },
    { name: 'Westside Station', progress: 45, color: 'primary' },
    { name: 'East End Garage', progress: 90, color: 'primary' },
];

export default function PerformanceTab() {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 8 }}>
                <Box mb={3}>
                    <ChartCard
                        title="Revenue Overview"
                        description={
                            <Typography variant="button" color="text.secondary" fontWeight="light">
                                Weekly revenue performance across all centers
                            </Typography>
                        }
                        date="updated just now"
                        color="primary"
                        chart={
                            isMounted ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={performanceData}
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
                                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                        />
                                        <Bar dataKey="revenue" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : null
                        }
                    />
                </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
                <Card sx={{ height: '100%', mt: { xs: 3, lg: 4 }, overflow: 'visible' }}>
                    <Box p={2}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Center Utilization
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={3} mt={2}>
                            {centerPerformance.map((center, index) => (
                                <Box key={index}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight="bold" color="text.primary">
                                            {center.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {center.progress}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={center.progress}
                                        color={center.color as any}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: 'grey.200'
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
}
