"use client";

import React from "react";
import {
    Box,
    Grid,
    Card,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
    FiUsers,
    FiUserPlus,
    FiRefreshCw
} from "react-icons/fi";
import StatCard from "@/components/dashboard/StatCard";

// Mock Data
const TOP_CUSTOMERS = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        visits: 12,
        spent: "$4,500",
        lastVisit: "2 days ago",
        status: "VIP",
        avatar: "" // Placeholder
    },
    {
        id: 2,
        name: "Sarah Smith",
        email: "sarah.s@example.com",
        visits: 8,
        spent: "$2,100",
        lastVisit: "5 days ago",
        status: "Regular",
        avatar: ""
    },
    {
        id: 3,
        name: "Michael Brown",
        email: "m.brown@test.com",
        visits: 15,
        spent: "$5,200",
        lastVisit: "1 week ago",
        status: "VIP",
        avatar: ""
    },
    {
        id: 4,
        name: "Emily Davis",
        email: "emily.d@example.com",
        visits: 3,
        spent: "$450",
        lastVisit: "2 weeks ago",
        status: "New",
        avatar: ""
    },
    {
        id: 5,
        name: "David Wilson",
        email: "david.w@example.com",
        visits: 6,
        spent: "$1,200",
        lastVisit: "1 month ago",
        status: "Regular",
        avatar: ""
    },
];

export default function CustomersPage() {
    const theme = useTheme();

    return (
        <Box pb={3}>
            {/* Header */}
            <Box mb={6}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    Customers
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Overview of your customer base and top performers.
                </Typography>
            </Box>

            {/* Stats Section */}
            <Grid container spacing={3} mb={6}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Customers"
                        value="1,245"
                        subtext="All registered clients"
                        icon={FiUsers}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="New This Month"
                        value="48"
                        subtext="+12% growth"
                        icon={FiUserPlus}
                        color="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Repeat Customers"
                        value="85%"
                        subtext="High retention rate"
                        icon={FiRefreshCw}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* Top Customers Section */}
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top Customers
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Clients with the most visits
                        </Typography>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Customer</TableCell>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }} align="center">Visits</TableCell>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }} align="center">Total Spent</TableCell>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }}>Last Visit</TableCell>
                                <TableCell sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold', fontSize: '0.75rem' }} align="center">Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {TOP_CUSTOMERS.length > 0 ? (
                                TOP_CUSTOMERS.map((customer) => (
                                    <TableRow key={customer.id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar src={customer.avatar} alt={customer.name} sx={{ width: 40, height: 40 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {customer.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {customer.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" fontWeight="bold">
                                                {customer.visits}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                {customer.spent}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {customer.lastVisit}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={customer.status}
                                                size="small"
                                                color={
                                                    customer.status === 'VIP' ? 'warning' :
                                                        customer.status === 'New' ? 'success' : 'default'
                                                }
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Box py={3}>
                                            <Typography color="text.secondary">No customers found</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </Box>
    );
}
