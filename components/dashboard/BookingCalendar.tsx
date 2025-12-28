"use client";

import React, { useState } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Grid,
    Paper,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';

// Define status styles to match the rest of the app
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

interface Booking {
    id: string;
    customer: string;
    vehicle: string;
    service: string;
    mechanic: string;
    time: string;
    status: string;
    date: string; // Format: "Aug 17, 2025" or similar parser-friendly string
}

interface BookingCalendarProps {
    bookings: Booking[];
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
    const theme = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 17)); // August 2025 based on dummy data

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Helper to check if a booking is on a specific day
    const getBookingsForDay = (day: Date) => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return isSameDay(bookingDate, day);
        });
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* Calendar Header */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                p={2}
                bgcolor="background.paper"
                borderRadius={3}
                sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        {format(currentDate, "MMMM yyyy")}
                    </Typography>
                </Box>
                <Box display="flex" gap={1}>
                    <IconButton onClick={handlePrevMonth} size="small" sx={{ border: 1, borderColor: 'divider' }}>
                        <FiChevronLeft />
                    </IconButton>
                    <IconButton onClick={handleNextMonth} size="small" sx={{ border: 1, borderColor: 'divider' }}>
                        <FiChevronRight />
                    </IconButton>
                </Box>
            </Box>

            {/* Calendar Grid */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden'
                }}
            >
                {/* Week Days Header */}
                <Grid container>
                    {weekDays.map((day) => (
                        <Grid item xs={12 / 7} key={day} sx={{ borderBottom: 1, borderRight: 1, borderColor: 'divider', '&:nth--last-of-type(1)': { borderRight: 0 } }}>
                            <Box py={2} textAlign="center" bgcolor={alpha(theme.palette.primary.main, 0.04)}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                    {day}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {/* Days Grid */}
                <Grid container>
                    {days.map((day, index) => {
                        const dayBookings = getBookingsForDay(day);
                        const isSelectedMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <Grid
                                item
                                xs={12 / 7}
                                key={day.toString()}
                                sx={{
                                    height: 160,
                                    borderBottom: 1,
                                    borderRight: 1,
                                    borderColor: 'divider',
                                    bgcolor: isSelectedMonth ? 'background.paper' : alpha(theme.palette.action.disabledBackground, 0.3),
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: isSelectedMonth ? alpha(theme.palette.primary.main, 0.02) : undefined
                                    }
                                }}
                            >
                                <Box p={1} height="100%" display="flex" flexDirection="column">
                                    {/* Date Number */}
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        mb={1}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={isTodayDate ? "bold" : "medium"}
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '50%',
                                                bgcolor: isTodayDate ? 'primary.main' : 'transparent',
                                                color: isTodayDate ? '#fff' : (isSelectedMonth ? 'text.primary' : 'text.disabled')
                                            }}
                                        >
                                            {format(day, dateFormat)}
                                        </Typography>
                                        {dayBookings.length > 0 && (
                                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ px: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                                {dayBookings.length}
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Events List */}
                                    <Box sx={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        {dayBookings.slice(0, 3).map((booking) => {
                                            const styles = getStatusStyles(booking.status);
                                            return (
                                                <Tooltip key={booking.id} title={`${booking.vehicle} - ${booking.service}`} placement="top">
                                                    <Box
                                                        sx={{
                                                            p: 0.5,
                                                            px: 1,
                                                            borderRadius: '4px',
                                                            bgcolor: alpha(styles.bgcolor, 0.7),
                                                            borderLeft: `3px solid ${styles.color}`,
                                                            cursor: 'pointer',
                                                            '&:hover': { filter: 'brightness(0.95)' }
                                                        }}
                                                    >
                                                        <Typography variant="caption" display="block" noWrap fontWeight="bold" color="text.primary" fontSize="0.7rem">
                                                            {booking.time} - {booking.customer.split(' ')[0]}
                                                        </Typography>
                                                        <Typography variant="caption" display="block" noWrap color="text.secondary" fontSize="0.65rem">
                                                            {booking.vehicle}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            );
                                        })}
                                        {dayBookings.length > 3 && (
                                            <Typography variant="caption" color="primary" textAlign="center" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                                + {dayBookings.length - 3} more
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>
        </Box>
    );
}
