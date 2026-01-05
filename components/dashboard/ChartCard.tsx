"use client";

import React, { ReactNode } from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { FiClock } from 'react-icons/fi';

interface ChartCardProps {
    title: string;
    description: ReactNode;
    date: string;
    chart: ReactNode;
    color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'dark' | 'orange' | 'green' | 'light';
}

export default function ChartCard({ title, description, date, chart, color = 'primary' }: ChartCardProps) {
    const theme = useTheme();

    // Map legacy colors to theme palette keys
    const validColor = color === 'orange' ? 'primary' : (color === 'green' ? 'success' : color);

    const getGradient = (col: string) => {
        const gradients = (theme.palette as any).gradients;
        if (gradients && gradients[col]) {
            return `linear-gradient(195deg, ${gradients[col].main}, ${gradients[col].state})`;
        }
        return theme.palette.primary.main;
    };

    const getShadow = (col: string) => {
        const boxShadows = (theme as any).boxShadows;
        if (boxShadows && boxShadows.colored && boxShadows.colored[col]) {
            return boxShadows.colored[col];
        }
        return boxShadows ? boxShadows.md : '';
    };

    return (
        <Card sx={{ height: '100%', overflow: 'visible', mt: 4 }}>
            <Box
                sx={{
                    background: getGradient(validColor),
                    boxShadow: getShadow(validColor),
                    color: validColor === 'light' ? 'text.primary' : '#ffffff',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    position: 'relative',
                    mt: '-40px',
                    mx: 2,
                    height: '12.5rem',
                    overflow: 'hidden'
                }}
            >
                <Box height="100%" width="100%">
                    {chart}
                </Box>
            </Box>
            <Box p={2}>
                <Typography variant="h6" textTransform="capitalize" fontWeight="bold">
                    {title}
                </Typography>
                <Typography component="div" variant="button" color="text.secondary" fontWeight="light">
                    {description}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" alignItems="center" color="text.secondary">
                    <FiClock style={{ marginRight: '5px' }} />
                    <Typography variant="button" fontWeight="light" color="text.secondary">
                        {date}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
}
