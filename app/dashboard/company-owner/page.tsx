"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
    Grid,
    Box,
    Typography,
    Button,
    Tabs,
    Tab,
    Card,
    CircularProgress
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
} from "react-icons/fi";

/**
 * Strict interfaces for data models to ensure type safety.
 */
// Service center metadata
interface ServiceCenterData {
    isActive: boolean; // Flag to determine if center is operational
}

// Aggregated KPI metrics for dashboard display
interface DashboardStatistics {
    totalRevenue: number; // Sum of all revenue (cash + online)
    activeCenters: number; // Count of operational centers
    totalCustomers: number; // Count of unique customers
    revenueChange: string; // Percentage change vs last period (e.g., "+12%")
    jobsChange: string; // Percentage change in jobs vs last period
    customersChange: string; // Percentage change in customer count vs last period
}

// Full analytics payload from API
interface AnalyticsData {
    totalRevenue: number; // Total revenue amount
    revenueChange: string; // Revenue trend indicator
    totalJobs: number; // Total number of jobs completed
    jobsChange: string; // Jobs trend indicator
    topCenters: any[]; // Array of centers ranked by revenue
    revenueOverview: any[]; // Time-series revenue data for charts
}

/**
 * Header section component.
 * Displays welcome message with company name and primary action button.
 */
function DashboardHeader({ companyName }: { companyName: string }) {
    return (
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'start' }} gap={3} mb={4}>
            {/* Left side: Title and welcome message */}
            <Box>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                    {companyName} Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back! Manage your service centers and track performance.
                </Typography>
            </Box>
            {/* Right side: Action button to manage service centers */}
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
 * High-level KPI cards grid.
 * Displays key performance indicators: revenue, active centers, and customer count.
 */
function StatsGrid({ stats }: { stats: DashboardStatistics }) {
    return (
        <Grid container spacing={3} mb={4}>
            {/* Revenue card: Total revenue with trend indicator */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Total Revenue"
                    count={`Rs. ${stats.totalRevenue.toLocaleString()}`}
                    percentage={{
                        color: stats.revenueChange.startsWith('+') ? 'success' : 'danger',
                        amount: stats.revenueChange,
                        label: 'vs. last month'
                    }}
                    icon={<FiDollarSign />}
                    color="primary"
                />
            </Grid>
            
            {/* Centers card: Total active service centers */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Active Centers"
                    count={stats.activeCenters.toString()}
                    percentage={{ color: 'success', amount: '', label: 'Total registered locations' }}
                    icon={<FiBriefcase />}
                    color="primary"
                />
            </Grid>
            
            {/* Customers card: Total customer base with growth indicator */}
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Total Customers"
                    count={stats.totalCustomers.toString()}
                    percentage={{
                        color: stats.customersChange.startsWith('+') ? 'success' : 'danger',
                        amount: stats.customersChange,
                        label: 'vs. last month'
                    }}
                    icon={<FiUsers />}
                    color="primary"
                />
            </Grid>
        </Grid>
    );
}

/**
 * Reusable button component for quick actions.
 * Navigates to dashboard sections like centers, services, and reports.
 */
function QuickActionBtn({ title, icon, href, color }: { title: string, icon: React.ReactNode, href: string, color: 'primary' | 'default' }) {
    const isPrimary = color === 'primary';

    return (
        <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
            <Card sx={{
                p: 2, display: 'flex', alignItems: 'center', gap: 2,
                transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' },
                // Primary actions highlighted in brand color, secondary in neutral
                bgcolor: isPrimary ? 'primary.main' : 'background.paper',
                color: isPrimary ? '#ffffff' : 'text.primary'
            }}>
                {/* Icon with color coordination */}
                <Box fontSize={24} color={isPrimary ? "inherit" : "primary.main"}>{icon}</Box>
                
                {/* Title and helper text */}
                <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight="bold" color="inherit">{title}</Typography>
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>Click to view details</Typography>
                </Box>
                
                {/* Arrow indicator for interaction hint */}
                <FiArrowRight style={{ opacity: 0.7 }} />
            </Card>
        </Link>
    );
}

import { useDashboardData } from "@/context/DashboardDataContext";

/**
 * Main dashboard component handling data loading and layout orchestration.
 * Serves as the home page for company owners with overview and performance tabs.
 */
export default function CompanyOwnerDashboard() {
    // Tab state: toggle between Overview and Performance views
    const [activeTab, setActiveTab] = useState<string>('overview');
    
    // Fetch all dashboard data from context (analytics, owner profile, centers, customers)
    const { 
        analyticsData: analytics, 
        ownerData, 
        centersData: centers, 
        customersData: customers, 
        isLoading, 
        refreshAll 
    } = useDashboardData();

    // Get company name from owner profile or fallback to generic label
    const companyName = ownerData?.companyName || "Company Dashboard";
    
    // Calculates dashboard statistics from context: revenue, active centers, customer count, and trends
    const statistics: DashboardStatistics = {
        totalRevenue: analytics?.totalRevenue || 0,
        activeCenters: centers.filter((c: any) => c.isActive).length, // Only count operational centers
        totalCustomers: customers.length,
        revenueChange: analytics?.revenueChange || "+0%",
        jobsChange: analytics?.jobsChange || "+0%",
        customersChange: analytics?.jobsChange || "+0%"
    };

    // Initialize page: analytics data is cached so no fetch needed on mount
    useEffect(() => {
        // Component initialization
    }, []);

    // Show loading state while initial data loads
    if (isLoading && !analytics) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            {/* Page header with company name and "Manage Centers" button */}
            <DashboardHeader companyName={companyName} />
            
            {/* KPI cards: revenue, active centers, total customers */}
            <StatsGrid stats={statistics} />

            {/* Overview and Performance tabs */}
            <Box mb={4}>
                {/* Tab navigation bar */}
                <Box borderBottom={1} borderColor="divider" mb={3}>
                    <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} textColor="primary" indicatorColor="primary">
                        <Tab label="Overview" value="overview" icon={<FiGrid />} iconPosition="start" />
                        <Tab label="Performance" value="performance" icon={<FiBarChart2 />} iconPosition="start" />
                    </Tabs>
                </Box>
                
                {/* Tab content: render Overview or Performance component based on active tab */}
                <Box minHeight={400}>
                    {activeTab === 'overview' && <OverviewTab data={analytics} />}
                    {activeTab === 'performance' && <PerformanceTab data={analytics} />}
                </Box>
            </Box>

            {/* Quick action shortcuts: Reports, Create Center, Manage Services */}
            <Grid container spacing={3}>
                {/* Service reports quick access */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Service Reports" icon={<FiFileText size={24} />} href="/dashboard/company-owner/reports" color="primary" />
                </Grid>
                
                {/* Create new service center shortcut */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Create Service Center" icon={<FiPlus size={24} />} href="/dashboard/company-owner/centers" color="default" />
                </Grid>
                
                {/* Manage services offering shortcut */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Manage Services" icon={<FiLayers size={24} />} href="/dashboard/company-owner/services" color="default" />
                </Grid>
            </Grid>
        </Box>
    );
}
