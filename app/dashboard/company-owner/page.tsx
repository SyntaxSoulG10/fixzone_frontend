"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Link from "next/link";
import {
    Grid,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Card,
    CircularProgress,
    Alert
} from "@mui/material";

import StatCard from "@/components/dashboard/StatCard";
import OverviewTab from "@/components/dashboard/OverviewTab";
import PerformanceTab from "@/components/dashboard/PerformanceTab";
import { APP_CONFIG } from "@/utils/config";
import {
    FiBriefcase,
    FiDollarSign,
    FiUsers,
    FiGrid,
    FiBarChart2,
    FiPlus,
    FiFileText,
    FiArrowRight,
    FiLayers,
    FiAlertTriangle,
} from "react-icons/fi";

/**
 * PROPS & DATA MODELS: We use strict interfaces to avoid 'any' types.
 * This makes the code predictable and prevents runtime errors.
 */
interface ServiceCenterData {
    isActive: boolean;
}

interface DashboardStatistics {
    totalRevenue: number;
    activeCenters: number;
    totalCustomers: number;
    revenueChange: string;
    jobsChange: string;
    customersChange: string;
}

interface AnalyticsData {
    totalRevenue: number;
    revenueChange: string;
    totalJobs: number;
    jobsChange: string;
    topCenters: any[];
    revenueOverview: any[];
}

/**
 * HEADER SECTION: Separates the greeting from the main dashboard logic.
 */
function DashboardHeader({ companyName }: { companyName: string }) {
    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'start' }} gap={3} mb={4}>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    {companyName} Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back! Manage your service centers and track performance.
                </Typography>
            </Box>
            <Box display="flex" gap={2}>
                <Link href="/dashboard/company-owner/centers" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" sx={{ height: 44, color: '#ffffff !important' }}>
                        Manage Centers
                    </Button>
                </Link>
            </Box>
        </Box>
    );
}

/**
 * STATISTICS SECTION: Displays the high-level KPI cards.
 */
function StatsGrid({ stats }: { stats: DashboardStatistics }) {
    return (
        <Grid container spacing={3} mb={4}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Total Revenue"
                    count={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                    percentage={stats.totalRevenue > 0 ? {
                        color: stats.revenueChange?.startsWith('+') ? 'success' : 'danger',
                        amount: stats.revenueChange || '0%',
                        label: 'vs. last month'
                    } : undefined}
                    icon={<FiDollarSign />}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Active Centers"
                    count={stats.activeCenters.toString()}
                    percentage={stats.activeCenters > 0 ? { color: 'success', amount: '', label: 'Total registered locations' } : undefined}
                    icon={<FiBriefcase />}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Total Customers"
                    count={stats.totalCustomers.toString()}
                    percentage={stats.totalCustomers > 0 ? {
                        color: 'success',
                        amount: stats.customersChange,
                        label: 'vs. last month'
                    } : undefined}
                    icon={<FiUsers />}
                    color="primary"
                />
            </Grid>
        </Grid>
    );
}

/**
 * QUICK ACTION BUTTON: A reusable component for dashboard shortcuts.
 */
function QuickActionBtn({ title, icon, href, color }: { title: string, icon: React.ReactNode, href: string, color: 'primary' | 'default' }) {
    const isPrimary = color === 'primary';

    return (
        <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
            <Card sx={{
                p: 2, display: 'flex', alignItems: 'center', gap: 2,
                transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' },
                bgcolor: isPrimary ? 'primary.main' : 'background.paper',
                color: isPrimary ? '#ffffff' : 'text.primary'
            }}>
                <Box fontSize={24} color={isPrimary ? "inherit" : "primary.main"}>{icon}</Box>
                <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="inherit">{title}</Typography>
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>Click to view details</Typography>
                </Box>
                <FiArrowRight style={{ opacity: 0.7 }} />
            </Card>
        </Link>
    );
}

import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * MAIN DASHBOARD COMPONENT: Orchestrates data loading and layout.
 * Now optimized with DashboardDataContext to prevent unnecessary re-fetching.
 */
export default function CompanyOwnerDashboard() {
    const [activeTab, setActiveTab] = useState<string>('overview');
    const { 
        analyticsData: analytics, 
        ownerData, 
        centersData: centers, 
        customersData: customers, 
        isLoading, 
        refreshAll 
    } = useDashboardData();

    const companyName = ownerData?.companyName || "Company Dashboard";
    const hasSuspendedCenters = centers.some((c: any) => (c.status || '').toUpperCase() === 'SUSPENDED');
    
    // Derived statistics from context data
    const statistics: DashboardStatistics = {
        totalRevenue: analytics?.totalRevenue || 0,
        activeCenters: centers.filter((c: any) => c.isActive && (c.status || '').toUpperCase() !== 'SUSPENDED' && (c.status || '').toUpperCase() !== 'REJECTED' && (c.status || '').toUpperCase() !== 'PENDING').length,
        totalCustomers: customers.length,
        revenueChange: analytics?.revenueChange || "+0%",
        jobsChange: analytics?.jobsChange || "+0%",
        customersChange: analytics?.jobsChange || "+0%"
    };

    useEffect(() => {
        // Data is handled by the root provider
    }, []);

    if (isLoading && !analytics) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            <DashboardHeader companyName={companyName} />

            {hasSuspendedCenters && (
                <Alert 
                    severity="error" 
                    icon={<FiAlertTriangle size={20} />}
                    sx={{ mb: 4, borderRadius: '1rem', fontWeight: 600, border: '1px solid #fca5a5' }}
                >
                    Notice: One or more of your service center branches are currently suspended by the platform administrator. Suspended locations are deactivated and hidden from customer searches. Please check your service centers or notifications for details.
                </Alert>
            )}
            
            <StatsGrid stats={statistics} />

            {/* TAB SECTION: Separates Overview metrics from Performance charts. */}
            <Box mb={4}>
                <Box borderBottom={1} borderColor="divider" mb={3}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(_, val) => setActiveTab(val)} 
                        textColor="primary" 
                        indicatorColor="primary"
                        sx={{
                            '& .MuiTabs-indicator': { backgroundColor: '#ea580c', height: 3, borderRadius: '3px 3px 0 0' },
                            '& .MuiTab-root': { 
                                textTransform: 'none', 
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                color: '#64748b', 
                                '&.Mui-selected': { color: '#ea580c' } 
                            }
                        }}
                    >
                        <Tab label="Overview" value="overview" icon={<FiGrid />} iconPosition="start" />
                        <Tab label="Performance" value="performance" icon={<FiBarChart2 />} iconPosition="start" />
                    </Tabs>
                </Box>
                <Box minHeight={400}>
                    {activeTab === 'overview' && <OverviewTab data={analytics} />}
                    {activeTab === 'performance' && <PerformanceTab data={analytics} />}
                </Box>
            </Box>

            {/* QUICK ACTIONS: High-visibility shortcuts for common admin tasks. */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Service Reports" icon={<FiFileText size={24} />} href="/dashboard/company-owner/reports" color="primary" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Manage Service Centers" icon={<FiPlus size={24} />} href="/dashboard/company-owner/centers" color="primary" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Manage Services" icon={<FiLayers size={24} />} href="/dashboard/company-owner/services" color="primary" />
                </Grid>
            </Grid>
        </Box>
    );
}
