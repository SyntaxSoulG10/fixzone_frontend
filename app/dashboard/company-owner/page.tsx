"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Grid,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Card,
    Icon
} from "@mui/material";

import StatCard from "@/components/dashboard/StatCard";
import OverviewTab from "@/components/dashboard/OverviewTab";
import PerformanceTab from "@/components/dashboard/PerformanceTab";
import ActivityTab from "@/components/dashboard/ActivityTab";
import {
    FiBriefcase,
    FiDollarSign,
    FiUsers,
    FiGrid,
    FiBarChart2,
    FiClock,
    FiPlus,
    FiFileText,
    FiCalendar,
    FiArrowRight,
} from "react-icons/fi";

export default function CompanyOwnerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    return (
        <Box pb={3}>
            {/* Header Section */}
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'start' }} gap={3} mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        Company Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back! Manage your service centers and track performance.
                    </Typography>
                </Box>
                <Box display="flex" gap={2}>
                    <Link href="/dashboard/company-owner/centers" style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" color="secondary" sx={{ height: 44 }}>
                            Manage Centers
                        </Button>
                    </Link>
                    <Link href="/dashboard/company-owner/bookings" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary" sx={{ height: 44, color: '#ffffff !important' }}>
                            <FiPlus style={{ marginRight: 8 }} /> New Booking
                        </Button>
                    </Link>
                </Box>
            </Box>

            {/* Quick Stats Row */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title="Total Revenue"
                        count="$124,500"
                        percentage={{
                            color: 'success',
                            amount: '+12.5%',
                            label: 'vs. last month'
                        }}
                        icon={<FiDollarSign />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title="Active Centers"
                        count="8"
                        percentage={{
                            color: 'success',
                            amount: '+1',
                            label: 'New branch opened'
                        }}
                        icon={<FiBriefcase />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title="Total Customers"
                        count="1,240"
                        percentage={{
                            color: 'success',
                            amount: '+8.2%',
                            label: 'vs. last month'
                        }}
                        icon={<FiUsers />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title="Pending Jobs"
                        count="42"
                        percentage={{
                            color: 'danger',
                            amount: '-5%',
                            label: 'vs. yesterday'
                        }}
                        icon={<FiClock />}
                        color="primary"
                    />
                </Grid>
            </Grid>

            {/* Main Content Area with Tabs */}
            <Box mb={4}>
                <Box borderBottom={1} borderColor="divider" mb={3}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs" textColor="inherit" indicatorColor="primary">
                        <Tab label="Overview" value="overview" icon={<FiGrid />} iconPosition="start" />
                        <Tab label="Performance" value="performance" icon={<FiBarChart2 />} iconPosition="start" />
                        <Tab label="Recent Activity" value="activity" icon={<FiClock />} iconPosition="start" />
                    </Tabs>
                </Box>

                <Box minHeight={400}>
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'performance' && <PerformanceTab />}
                    {activeTab === 'activity' && <ActivityTab />}
                </Box>
            </Box>

            {/* Quick Actions Footer */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn
                        title="Service Reports"
                        icon={<FiFileText size={24} />}
                        href="/dashboard/company-owner/reports"
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn
                        title="Team Management"
                        icon={<FiUsers size={24} />}
                        href="/dashboard/company-owner/profile"
                        color="default"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn
                        title="Booking Calendar"
                        icon={<FiCalendar size={24} />}
                        href="/dashboard/company-owner/bookings"
                        color="default"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

// --- Sub Components ---
// QuickActionBtn remains local or moved?
// Keeping QuickActionBtn local as it's small/specific

function QuickActionBtn({ title, icon, href, color }: any) {
    // Determine styles based on color prop logic (replicating original intent with MUI)
    const isPrimary = color === 'primary';

    return (
        <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
            <Card sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' },
                bgcolor: isPrimary ? 'primary.main' : 'background.paper',
                color: isPrimary ? '#ffffff' : 'text.primary'
            }}>
                <Box fontSize={24} color={isPrimary ? "inherit" : "primary.main"}>
                    {icon}
                </Box>
                <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="inherit">
                        {title}
                    </Typography>
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                        Click to view details
                    </Typography>
                </Box>
                <FiArrowRight style={{ opacity: 0.7 }} />
            </Card>
        </Link>
    );
}
