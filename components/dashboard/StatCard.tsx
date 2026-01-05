"use client";

import React from 'react';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

interface StatCardProps {
    title: string;
    count: string | number;
    percentage?: {
        color: 'success' | 'danger' | 'warning' | 'info';
        amount: string;
        label: string;
    };
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'dark' | 'orange' | 'light';
}

export default function StatCard({ title, count, percentage, icon, color = 'primary' }: StatCardProps) {
    const theme = useTheme();

    // Map legacy 'orange' to 'warning' (which is orange in our theme)
    // or 'primary' if primary is orange. In our theme primary IS orange.
    const validColor = color === 'orange' ? 'primary' : color;

    // Helper to get gradient
    const getGradient = (col: string) => {
        const gradients = (theme.palette as any).gradients;
        if (gradients && gradients[col]) {
            return `linear-gradient(195deg, ${gradients[col].main}, ${gradients[col].state})`;
        }
        return theme.palette.primary.main;
    };

    // Helper to get colored shadow
    const getShadow = (col: string) => {
        const boxShadows = (theme as any).boxShadows;
        if (boxShadows && boxShadows.colored && boxShadows.colored[col]) {
            return boxShadows.colored[col];
        }
        return boxShadows ? boxShadows.md : '';
    };

    return (
        <Card sx={{ overflow: 'visible' }}>
            <Box display="flex" justifyContent="space-between" pt={1} px={2}>
                <Box
                    sx={{
                        background: getGradient(validColor),
                        boxShadow: getShadow(validColor),
                        color: validColor === 'light' ? 'text.primary' : '#ffffff',
                        borderRadius: '0.75rem', // xl
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '4rem',
                        height: '4rem',
                        marginTop: '-24px',
                        fontSize: '1.5rem', // Icon size
                        '& svg': {
                            width: '24px',
                            height: '24px',
                            color: validColor === 'light' ? 'inherit' : '#ffffff'
                        }
                    }}
                >
                    {icon}
                </Box>
                <Box textAlign="right" lineHeight={1.25}>
                    <Typography variant="button" fontWeight="light" color="text.secondary" textTransform="capitalize">
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {count}
                    </Typography>
                </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            {percentage && (
                <Box pb={2} px={2}>
                    <Typography component="p" variant="button" color="text.secondary" display="flex" alignItems="center">
                        <Typography
                            component="span"
                            variant="button"
                            fontWeight="bold"
                            color={percentage.color === 'danger' ? 'error.main' : `${percentage.color}.main`}
                            sx={{ mr: 0.5 }}
                        >
                            {percentage.amount}
                        </Typography>
                        {percentage.label}
                    </Typography>
                </Box>
            )}
        </Card>
    );
}
