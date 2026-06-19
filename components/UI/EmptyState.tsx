import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    minHeight?: number | string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    minHeight = 400
}: EmptyStateProps) {
    const theme = useTheme();

    return (
        <Paper 
            elevation={0}
            sx={{
                minHeight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 4,
                borderRadius: 4,
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                border: `1px dashed ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                }
            }}
        >
            {icon && (
                <Box 
                    sx={{ 
                        fontSize: 64, 
                        color: theme.palette.text.secondary,
                        mb: 2,
                        opacity: 0.8,
                        animation: 'float 3s ease-in-out infinite',
                        '@keyframes float': {
                            '0%': { transform: 'translateY(0px)' },
                            '50%': { transform: 'translateY(-10px)' },
                            '100%': { transform: 'translateY(0px)' },
                        }
                    }}
                >
                    {icon}
                </Box>
            )}
            <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
                {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                {description}
            </Typography>
            
            {actionLabel && onAction && (
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={onAction}
                    sx={{
                        borderRadius: '20px',
                        px: 4,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        boxShadow: `0 4px 14px 0 ${theme.palette.primary.main}40`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px 0 ${theme.palette.primary.main}60`,
                        }
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Paper>
    );
}
