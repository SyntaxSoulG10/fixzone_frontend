"use client";

import React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { FiInfo } from 'react-icons/fi';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';

interface DataItem {
    name: string;
    value: number; // Percentage or raw value
    color: string;
    [key: string]: any;
}

interface DonutStatCardProps {
    title: string;
    totalValue: string | number;
    unit: string;
    description?: string; // e.g., "Consumption"
    subtext?: string;
    data: DataItem[];
}

export default function DonutStatCard({ title, totalValue, unit, data, subtext }: DonutStatCardProps) {
    return (
        <Card sx={{ height: '100%', p: 3 }}>
            {/* Header */}
            <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        {title}
                    </Typography>
                    <IconButton size="small">
                        <FiInfo size={18} />
                    </IconButton>
                </Box>
                {subtext && (
                    <Typography variant="button" fontWeight="light" color="text.secondary" sx={{ textTransform: 'none' }}>
                        {subtext}
                    </Typography>
                )}
            </Box>

            {/* Content Container */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" height="100%">

                {/* Left Side: Donut Chart */}
                <Box width={{ xs: '100%', md: '50%' }} height={250} position="relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="75%"
                                outerRadius="90%"
                                paddingAngle={2}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        sx={{ transform: 'translate(-50%, -50%)', textAlign: 'center' }}
                    >
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            {totalValue}
                        </Typography>
                        <Typography variant="button" color="text.secondary" fontWeight="regular">
                            {unit}
                        </Typography>
                    </Box>
                </Box>

                {/* Right Side: Legend List */}
                <Box width={{ xs: '100%', md: '50%' }} pl={{ md: 4 }}>
                    <Box display="flex" flexDirection="column" gap={0}>
                        {data.map((item, index) => (
                            <Box key={index}>
                                <Box py={1.5} display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <Box
                                            width={20}
                                            height={20}
                                            borderRadius="0.375rem" // roughly 6px
                                            bgcolor={item.color}
                                            sx={{ flexShrink: 0 }}
                                        />
                                        <Typography variant="button" fontWeight="bold" color="text.secondary" textTransform="capitalize" sx={{ lineHeight: 1 }}>
                                            {item.name}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.value}%
                                    </Typography>
                                </Box>
                                {index < data.length - 1 && (
                                    <Divider sx={{ my: 0 }} />
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Card>
    );
}
