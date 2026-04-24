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
                    percentage={{
                        color: stats.revenueChange.startsWith('+') ? 'success' : 'danger',
                        amount: stats.revenueChange,
                        label: 'vs. last month'
                    }}
                    icon={<FiDollarSign />}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Active Centers"
                    count={stats.activeCenters.toString()}
                    percentage={{ color: 'success', amount: '', label: 'Total registered locations' }}
                    icon={<FiBriefcase />}
                    color="primary"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <StatCard
                    title="Total Customers"
                    count={stats.totalCustomers.toString()}
                    percentage={{
                        color: 'success',
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

/**
 * MAIN DASHBOARD COMPONENT: Orchestrates data loading and layout.
 */
export default function CompanyOwnerDashboard() {
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [companyName, setCompanyName] = useState<string>("Company Dashboard");
    const [statistics, setStatistics] = useState<DashboardStatistics>({
        totalRevenue: 0, activeCenters: 0, totalCustomers: 0,
        revenueChange: "+0%", jobsChange: "+0%", customersChange: "+0%"
    });

    // INITIALIZATION: We fetch all critical dashboard data in parallel to minimize loading time.
    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [centersRes, custRes, analyticsRes, ownerRes] = await Promise.all([
                    axios.get<ServiceCenterData[]>(APP_CONFIG.api.serviceCenters + "/current"),
                    axios.get<any[]>(APP_CONFIG.api.customers + "/current"),
                    axios.get<AnalyticsData>(APP_CONFIG.api.analytics + "/current"),
                    axios.get<any>(APP_CONFIG.api.owners + "/current")
                ]);

                const analyticsData = analyticsRes.data;
                setAnalytics(analyticsData);
                setCompanyName(ownerRes.data.companyName || "Company Dashboard");
                setStatistics({
                    totalRevenue: analyticsData.totalRevenue || 0,
                    activeCenters: centersRes.data.filter(c => c.isActive).length,
                    totalCustomers: custRes.data.length,
                    revenueChange: analyticsData.revenueChange || "+0%",
                    jobsChange: analyticsData.jobsChange || "+0%",
                    customersChange: analyticsData.jobsChange || "+0%"
                });
            } catch (error) {
                console.error("Dashboard failed to initialize:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            <DashboardHeader companyName={companyName} />
            
            <StatsGrid stats={statistics} />

            {/* TAB SECTION: Separates Overview metrics from Performance charts. */}
            <Box mb={4}>
                <Box borderBottom={1} borderColor="divider" mb={3}>
                    <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} textColor="primary" indicatorColor="primary">
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
                    <QuickActionBtn title="Create Service Center" icon={<FiPlus size={24} />} href="/dashboard/company-owner/centers" color="default" />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn title="Manage Services" icon={<FiLayers size={24} />} href="/dashboard/company-owner/services" color="default" />
                </Grid>
            </Grid>
        </Box>
    );
}
