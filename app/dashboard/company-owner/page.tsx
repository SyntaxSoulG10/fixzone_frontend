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

// Define strict typing for API responses to avoid 'any' which breaks type safety.
interface ServiceCenterData {
    isActive: boolean;
}

interface CustomerData {
    id: string; // The specific attributes of customer are less relevant if we only need count
}

// Define strict types for components to avoid 'any'
interface QuickActionProps {
    title: string;
    icon: React.ReactNode;
    href: string;
    color: 'primary' | 'default';
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

export default function CompanyOwnerDashboard() {
    const [activeTab, setActiveTab] = useState<string>('overview');
    
    const [statistics, setStatistics] = useState<DashboardStatistics>({
        totalRevenue: 0,
        activeCenters: 0,
        totalCustomers: 0,
        revenueChange: "+0%",
        jobsChange: "+0%",
        customersChange: "+0%"
    });

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [companyName, setCompanyName] = useState<string>("Company Dashboard");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeDashboardData = async () => {
            try {
                const [serviceCentersResponse, customersResponse, analyticsResponse, ownerResponse] = await Promise.all([
                    axios.get<ServiceCenterData[]>(APP_CONFIG.api.serviceCenters + "/current"),
                    axios.get<CustomerData[]>(APP_CONFIG.api.customers + "/current"),
                    axios.get<AnalyticsData>(APP_CONFIG.api.analytics + "/current"),
                    axios.get<any>(APP_CONFIG.api.owners + "/current")
                ]);

                const analyticsData = analyticsResponse.data;
                setAnalytics(analyticsData);
                setCompanyName(ownerResponse.data.companyName || "Ranasinghe Motors");

                setStatistics({
                    totalRevenue: analyticsData.totalRevenue || 0,
                    activeCenters: serviceCentersResponse.data.filter((center) => center.isActive).length,
                    totalCustomers: customersResponse.data.length,
                    revenueChange: analyticsData.revenueChange || "+0%",
                    jobsChange: analyticsData.jobsChange || "+0%",
                    customersChange: "+8.2%" 
                });
            } catch (error) {
                console.error("Dashboard failed to fetch required business metrics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeDashboardData();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setActiveTab(newValue);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box pb={3}>
            {/* Header section separating titles and primary call-to-actions */}
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

            {/* Core statistics summary to give the user an immediate understanding of top-level metrics */}
            <Grid container spacing={3} mb={4}>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <StatCard
                        title="Total Revenue"
                        count={`Rs. ${statistics.totalRevenue.toLocaleString()}`}
                        percentage={{
                            color: statistics.revenueChange.startsWith('+') ? 'success' : 'danger',
                            amount: statistics.revenueChange,
                            label: 'vs. last month'
                        }}
                        icon={<FiDollarSign />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <StatCard
                        title="Active Centers"
                        count={statistics.activeCenters.toString()}
                        percentage={{
                            color: 'success',
                            amount: '+1',
                            label: 'New branch opened'
                        }}
                        icon={<FiBriefcase />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                    <StatCard
                        title="Total Customers"
                        count={statistics.totalCustomers.toString()}
                        percentage={{
                            color: 'success',
                            amount: statistics.customersChange,
                            label: 'vs. last month'
                        }}
                        icon={<FiUsers />}
                        color="primary"
                    />
                </Grid>
            </Grid>

            {/* Tab navigation segregates detailed information views without overcrowding a single screen */}
            <Box mb={4}>
                <Box borderBottom={1} borderColor="divider" mb={3}>
                    <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard tabs" textColor="primary" indicatorColor="primary">
                        <Tab label="Overview" value="overview" icon={<FiGrid />} iconPosition="start" />
                        <Tab label="Performance" value="performance" icon={<FiBarChart2 />} iconPosition="start" />
                    </Tabs>
                </Box>

                <Box minHeight={400}>
                    {activeTab === 'overview' && <OverviewTab data={analytics} />}
                    {activeTab === 'performance' && <PerformanceTab data={analytics} />}
                </Box>
            </Box>

            {/* Quick Actions provide highly visible shortcuts for common administrative flows */}
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
                        title="Create Service Center"
                        icon={<FiPlus size={24} />}
                        href="/dashboard/company-owner/centers"
                        color="default"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <QuickActionBtn
                        title="Manage Services"
                        icon={<FiLayers size={24} />}
                        href="/dashboard/company-owner/services"
                        color="default"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

// Extracted sub-component to ensure code reusability and to clean up the main render function.
function QuickActionBtn(props: QuickActionProps) {
    const { title, icon, href, color } = props;
    const isPrimaryStylingActivated = color === 'primary';

    return (
        <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
            <Card sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.02)' },
                bgcolor: isPrimaryStylingActivated ? 'primary.main' : 'background.paper',
                color: isPrimaryStylingActivated ? '#ffffff' : 'text.primary'
            }}>
                <Box fontSize={24} color={isPrimaryStylingActivated ? "inherit" : "primary.main"}>
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
