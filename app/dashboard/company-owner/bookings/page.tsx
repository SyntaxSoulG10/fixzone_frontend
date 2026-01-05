"use client";

import { useState } from "react";
import {
    Card,
    Box,
    Typography,
    Button,
    Grid,
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
    MenuItem,
    Paper,
    Avatar,
    useTheme,
    alpha,
    Divider
} from "@mui/material";
import {
    FiFilter,
    FiSearch,
    FiMoreVertical,
    FiPlus,
    FiCalendar,
    FiCheckCircle,
    FiArrowUp
} from "react-icons/fi";
import Link from "next/link";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Badge } from '@mui/material';

const DUMMY_BOOKINGS = [
    { id: "BK-0001", customer: "Nike Fernando", vehicle: "Honda Civic 2020", service: "Standard Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "Quality Check", date: "August 17, 2025" },
    { id: "BK-0002", customer: "Emma Thomsan", vehicle: "Toyota Camry 2021", service: "Oil Changing", mechanic: "Mike Johnson", time: "8.00 AM", status: "Quality Check", date: "August 17, 2025" },
    { id: "BK-0003", customer: "Rolf David", vehicle: "Ford F-150", service: "Standard Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "August 17, 2025" },
    { id: "BK-0004", customer: "Eric Brown", vehicle: "Tesla Model 3", service: "Brake Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "August 17, 2025" },
    { id: "BK-0005", customer: "Oliver Tuwin", vehicle: "BMW X5", service: "Full Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "August 18, 2025" },
    { id: "BK-0006", customer: "Chris Evans", vehicle: "Audi Q7", service: "Engine Tune-up", mechanic: "Mike Johnson", time: "10.00 AM", status: "Pending", date: "August 18, 2025" },
    { id: "BK-0007", customer: "Sarah Connor", vehicle: "Jeep Wrangler", service: "Tire Replacement", mechanic: "Mike Johnson", time: "11.00 AM", status: "Quality Check", date: "August 18, 2025" },
];

export default function BookingsPage() {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Quality Check':
                return {
                    bgcolor: '#E6F4EA',
                    color: '#1E8E3E',
                    border: '1px solid #E6F4EA'
                };
            case 'In Progress':
                return {
                    bgcolor: '#FFF4E5',
                    color: '#B76E00',
                    border: '1px solid #FFF4E5'
                };
            case 'Pending':
                return {
                    bgcolor: '#E8F0FE',
                    color: '#1967D2',
                    border: '1px solid #E8F0FE'
                };
            default:
                return {
                    bgcolor: '#F1F3F4',
                    color: '#5F6368',
                    border: '1px solid #F1F3F4'
                };
        }
    };

    const renderWeekPickerDay = (
        props: PickersDayProps & { selectedDay?: Date | null },
    ) => {
        const { day, selectedDay, ...other } = props;
        return (
            <PickersDay {...other} day={day} />
        );
    };

    const StatBox = ({ title, count, icon, color }: { title: string, count: number, icon: React.ReactNode, color: string }) => {
        // Map string color to theme palette
        let gradient, shadowColor, textColor;

        if (color === 'dark') {
            gradient = `linear-gradient(195deg, ${theme.palette.grey[700]}, ${theme.palette.grey[900]})`;
            shadowColor = theme.palette.grey[700];
            textColor = theme.palette.grey[900];
        } else if (color === 'success') {
            gradient = `linear-gradient(195deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`;
            shadowColor = theme.palette.success.main;
            textColor = theme.palette.success.main;
        } else if (color === 'info') {
            gradient = `linear-gradient(195deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`;
            shadowColor = theme.palette.info.main;
            textColor = theme.palette.info.main;
        } else {
            gradient = `linear-gradient(195deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`;
            shadowColor = theme.palette.primary.main;
            textColor = theme.palette.primary.main;
        }

        return (
            <Card sx={{
                position: 'relative',
                overflow: 'visible',
                mt: 3,
                py: 3,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: alpha(textColor!, 0.1), // Ultra light background matching the color
                boxShadow: 'none',
                border: 'none',
                borderRadius: '1rem'
            }}>
                <Box
                    sx={{
                        background: gradient,
                        boxShadow: `0 4px 20px 0 ${alpha(shadowColor, 0.14)}, 0 7px 10px -5px ${alpha(shadowColor, 0.4)}`,
                        color: '#ffffff',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '3.5rem',
                        height: '3.5rem',
                        position: 'absolute',
                        top: '-20px',
                        zIndex: 1
                    }}
                >
                    {icon}
                </Box>
                <Box textAlign="center" mt={8}>
                    <Typography variant="body1" fontWeight="bold" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="text.primary">
                        {count}
                    </Typography>
                </Box>
            </Card>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
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
                    <Button variant="contained" color="primary" sx={{ color: '#ffffff', textTransform: 'none', borderRadius: 2 }}>
                        New Booking
                    </Button>
                </Box>

                <Grid container spacing={3} mb={4}>
                    {/* Left: Calendar */}
                    <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                        <Card sx={{ p: 2, borderRadius: 3, boxShadow: theme.shadows[1], display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" fontWeight="bold" ml={2} mb={1}>Schedule Calendar</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <StaticDatePicker
                                    displayStaticWrapperAs="desktop"
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    slots={{
                                        day: renderWeekPickerDay,
                                    }}
                                    slotProps={{
                                        layout: {
                                            sx: {
                                                width: '100%',
                                                '.MuiDateCalendar-root': { width: '100%', maxWidth: '100%' },
                                                '.MuiPickersCalendarHeader-root': { pl: 2, pr: 2 },
                                                '.MuiDayCalendar-weekDayLabel': { width: 40, height: 40, fontWeight: 'bold' },
                                                '.MuiPickersDay-root': { width: 40, height: 40, fontSize: '0.9rem' },
                                                '.MuiMonthCalendar-root': { width: '100%' },
                                            }
                                        },
                                        actionBar: {
                                            actions: []
                                        }
                                    }}
                                    sx={{ bgcolor: 'transparent', width: '100%' }}
                                />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={1} mr={1}>
                                <Button size="small" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>Cancel</Button>
                                <Button size="small" variant="contained" color="primary" sx={{ color: 'white', fontWeight: 'bold', px: 3 }}>OK</Button>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Right: Today's Summary */}
                    <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                        <Box mb={2}><Typography variant="h6" fontWeight="bold">Today's Summary</Typography></Box>
                        <Grid container spacing={4} mt={1}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatBox
                                    title="Total Booking"
                                    count={20}
                                    icon={<FiCalendar size={24} />}
                                    color="primary"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatBox
                                    title="Completed"
                                    count={20}
                                    icon={<FiCheckCircle size={24} />}
                                    color="success"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatBox
                                    title="Upcoming"
                                    count={20}
                                    icon={<FiArrowUp size={24} />}
                                    color="primary"
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                {/* All Booking Section */}
                <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.shadows[1] }}>
                    <Typography variant="h6" fontWeight="bold" mb={3} color="text.primary">
                        All Bookings
                    </Typography>

                    {/* Filters */}
                    <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={3} justifyContent="space-between">
                        <TextField
                            placeholder="Search Bookings..."
                            variant="outlined"
                            size="small"
                            sx={{
                                flexGrow: 1,
                                maxWidth: '100%',
                                mr: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.grey[100], 0.5)
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FiSearch color={theme.palette.text.secondary} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<FiFilter />}
                            sx={{ borderRadius: 2, px: 3, borderColor: 'primary.main', color: 'primary.main' }}
                        >
                            Filter
                        </Button>
                    </Box>

                    {/* List View */}
                    <TableContainer>
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Booking Id</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Customer</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Vehicle</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Service</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Mechanic</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Time</TableCell>
                                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', borderBottom: 'none' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {DUMMY_BOOKINGS.map((booking) => (
                                    <TableRow key={booking.id} hover sx={{ '& td': { borderBottom: `1px solid ${theme.palette.divider}`, py: 1.5 } }}>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {booking.id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar
                                                    sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}
                                                >
                                                    {booking.customer.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="button" display="block" textTransform="none" fontWeight="bold" color="text.primary">
                                                        {booking.customer}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        0713114270
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold" color="text.primary">
                                                {booking.vehicle}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                ABC-1234
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold" color="text.primary">{booking.service}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold" color="text.primary">{booking.mechanic}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">{booking.time}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={booking.status}
                                                size="small"
                                                sx={{
                                                    ...getStatusStyles(booking.status),
                                                    fontWeight: 800,
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    height: 24,
                                                    px: 0.5
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Box>
        </LocalizationProvider>
    );
}
