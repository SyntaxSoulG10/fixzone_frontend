"use client";

import React from 'react';
import { Card, Box, Typography, Button } from '@mui/material';

const activities = [
    {
        title: "New Order #1832412",
        description: "21 Dec 11 PM",
        color: "primary",
        icon: "shopping_cart"
    },
    {
        title: "Server payments for April",
        description: "21 Dec 9:34 PM",
        color: "primary", // orange in our theme
        icon: "payment"
    },
    {
        title: "New card added for order #4395133",
        description: "20 Dec 2:20 AM",
        color: "primary",
        icon: "credit_card"
    },
    {
        title: "Unlock packages for development",
        description: "18 Dec 4:54 AM",
        color: "primary",
        icon: "lock_open"
    },
    {
        title: "New order #9583120",
        description: "17 Dec",
        color: "primary",
        icon: "shopping_cart"
    }
];

export default function ActivityTab() {
    return (
        <Card sx={{ p: 3 }}>
            <Box mb={2}>
                <Typography variant="h6" fontWeight="bold">
                    Activity Timeline
                </Typography>
                <Typography variant="button" color="text.secondary" fontWeight="regular">
                    30 done this month
                </Typography>
            </Box>

            <Box display="flex" flexDirection="column" mt={2}>
                {activities.map((activity, index) => {
                    const isLast = index === activities.length - 1;
                    return (
                        <Box key={index} display="flex" gap={2}>
                            <Box display="flex" flexDirection="column" alignItems="center">
                                {/* Dot */}
                                <Box
                                    width="0.75rem"
                                    height="0.75rem"
                                    borderRadius="50%"
                                    bgcolor={`${activity.color}.main`}
                                    boxShadow={`0 0 0 4px #fff`}
                                    zIndex={1}
                                />
                                {/* Line */}
                                {!isLast && (
                                    <Box
                                        width="2px"
                                        flexGrow={1}
                                        bgcolor="grey.300"
                                        my={0.5}
                                    />
                                )}
                            </Box>
                            <Box pb={isLast ? 0 : 3} pt="2px">
                                <Typography variant="button" fontWeight="bold" display="block" color="text.primary">
                                    {activity.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight="regular">
                                    {activity.description}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Card>
    );
}
