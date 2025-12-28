"use client";

import { useState } from "react";
import {
    Grid,
    Card,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Menu,
    MenuItem
} from "@mui/material";
import {
    FiList,
    FiCalendar,
    FiFilter,
    FiSearch,
    FiMoreVertical,
    FiPlus
} from "react-icons/fi";
import Link from "next/link";
// We might need a Calendar component later, but for now placeholder is fine

const DUMMY_BOOKINGS = [
    { id: "BK-0001", customer: "Nike Fernando", vehicle: "Honda Civic 2020", service: "Standard Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "Quality Check", date: "Aug 17, 2025" },
    { id: "BK-0002", customer: "Emma Thomsan", vehicle: "Toyota Camry 2021", service: "Oil Changing", mechanic: "Mike Johnson", time: "8.00 AM", status: "Quality Check", date: "Aug 17, 2025" },
    { id: "BK-0003", customer: "Rolf David", vehicle: "Ford F-150", service: "Standard Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "Aug 17, 2025" },
    { id: "BK-0004", customer: "Eric Brown", vehicle: "Tesla Model 3", service: "Brake Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "Aug 17, 2025" },
    { id: "BK-0005", customer: "Oliver Tuwin", vehicle: "BMW X5", service: "Full Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "Pending", date: "Aug 18, 2025" },
];

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState('list');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Quality Check': return 'success';
            case 'In Progress': return 'warning';
            case 'Pending': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box pb={3}>
            {/* Header */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={3} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        Booking Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and Track all Service Booking.
                    </Typography>
                </Box>
                <Link href="#" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" sx={{ color: '#ffffff' }}>
                        <FiPlus style={{ marginRight: 8 }} /> New Booking
                    </Button>
                </Link>
            </Box>

            {/* Tabs */}
            <Card sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange} textColor="inherit" indicatorColor="primary" sx={{ px: 2, pt: 2 }}>
                    <Tab label="All Bookings" value="list" icon={<FiList />} iconPosition="start" />
                    <Tab label="Schedule Calendar" value="calendar" icon={<FiCalendar />} iconPosition="start" />
                </Tabs>

                {activeTab === 'list' && (
                    <Box p={3}>
                        {/* Filters */}
                        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3} justifyContent="space-between">
                            <TextField
                                placeholder="Search Bookings..."
                                variant="outlined"
                                size="small"
                                sx={{ flexGrow: 1, maxWidth: 400 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FiSearch />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button variant="outlined" color="secondary" startIcon={<FiFilter />}>
                                Filter
                            </Button>
                        </Box>

                        {/* List View */}
                        <TableContainer>
                            <Table>
                                <TableHead sx={{ display: 'table-header-group' }}>
                                    <TableRow>
                                        <TableCell>Booking ID</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Vehicle</TableCell>
                                        <TableCell>Service</TableCell>
                                        <TableCell>Mechanic</TableCell>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {DUMMY_BOOKINGS.map((booking) => (
                                        <TableRow key={booking.id} hover>
                                            <TableCell>
                                                <Typography variant="caption" fontWeight="bold" fontFamily="monospace">
                                                    {booking.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Box
                                                        width={32}
                                                        height={32}
                                                        borderRadius="50%"
                                                        bgcolor="info.main"
                                                        display="flex"
                                                        alignItems="center"
                                                        justifyContent="center"
                                                        fontSize={12}
                                                        fontWeight="bold"
                                                        color="#ffffff"
                                                    >
                                                        {booking.customer.charAt(0)}
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {booking.customer}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            0713114270
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {booking.vehicle}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ABC-1234
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{booking.service}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{booking.mechanic}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{booking.time}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={booking.status}
                                                    color={getStatusColor(booking.status) as any}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', color: booking.status === 'Pending' ? 'text.secondary' : '#ffffff' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={handleMenuOpen}>
                                                    <FiMoreVertical />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl)}
                                                    onClose={handleMenuClose}
                                                >
                                                    <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
                                                    <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
                                                    <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>Delete</MenuItem>
                                                </Menu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {activeTab === 'calendar' && (
                    <Box p={8} textAlign="center">
                        <Box
                            mx="auto"
                            mb={3}
                            width={80}
                            height={80}
                            borderRadius="50%"
                            bgcolor="grey.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize={32}
                            color="text.secondary"
                        >
                            <FiCalendar />
                        </Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Schedule Calendar
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Calendar view functionality coming soon. Implement FullCalendar or bespoke grid here.
                        </Typography>
                    </Box>
                )}
            </Card>
        </Box>
    );
}
