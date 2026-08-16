"use client";

import { useState, useEffect } from "react";
import { FiBriefcase, FiDollarSign, FiUserCheck, FiX, FiDownload, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { useDashboardData } from "@/context/DashboardDataContext";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton, Grid, Box, Button, ToggleButtonGroup, ToggleButton } from "@mui/material";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line } from "recharts";

// Interfaces for type safety
interface RevenueBar {
    label: string;
    amount: number;
    percentage: number;
}

interface TopStation {
    name: string;
    revenue: number;
    formattedRevenue: string;
}

interface AnalyticsData {
    totalPlatformRevenue: number;
    revenueChange: string;
    totalServiceCenters: number;
    pendingRegistrations: number;
    activeSubscriptions: number;
    subscriptionChange: string;
    weeklyRevenue: RevenueBar[];
    monthlyRevenue: RevenueBar[];
    topStations: TopStation[];
}

export default function SuperAdminDashboard() {
    const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [fullName, setFullName] = useState("Super Admin");

    useEffect(() => {
        const updateName = () => {
            const storedName = localStorage.getItem("userName") || localStorage.getItem("username") || localStorage.getItem("fullName");
            if (storedName) {
                const firstName = storedName.split(' ')[0];
                setFullName(firstName);
            }
        };
        
        updateName();
        
        // Listen for profile updates from the profile page
        window.addEventListener('profileUpdated', updateName);
        return () => window.removeEventListener('profileUpdated', updateName);
    }, []);

    const { analyticsData, statsData, subscriptionsData, isLoading, refreshAll } = useDashboardData();
    const analytics = analyticsData as AnalyticsData | null;
    const loading = isLoading;

    // Transform analytics data for charts (Recharts format)
    const getChartData = () => {
        if (!analytics) return [];
        const source = view === 'weekly' ? analytics.weeklyRevenue : analytics.monthlyRevenue;
        return source.map((d: RevenueBar) => ({
            name: d.label,
            revenue: d.amount,
            percentage: d.percentage,
        }));
    };

    const chartData = getChartData();
    const totalRevenue = chartData.reduce((acc: number, curr: any) => acc + curr.revenue, 0);

    // Mapping for Summary Metrics (used in PDF report)
    const summaryMetrics = analytics ? [
        { 
            label: "Total Revenue", 
            value: `Rs ${analytics.totalPlatformRevenue >= 1000000 
                ? (analytics.totalPlatformRevenue / 1000000).toFixed(1) + 'M' 
                : (analytics.totalPlatformRevenue / 1000).toFixed(0) + 'K'}`, 
            change: `${analytics.revenueChange} growth` 
        },
        { 
            label: "Total Stations", 
            value: analytics.totalServiceCenters.toString(), 
            change: `${analytics.pendingRegistrations} pending` 
        },
        { 
            label: "Active Subs", 
            value: analytics.activeSubscriptions.toString(), 
            change: `${analytics.subscriptionChange} growth` 
        },
    ] : [];

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // 1. Title Section
        doc.setFillColor(234, 88, 12); // Orange header bar
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("System Performance Report", 20, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 20, 25, { align: "right" });

        // 2. Summary Metrics Section
        let yPos = 60;
        doc.setTextColor(51, 65, 85); // Slate-700
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Key Metrics Summary", 20, yPos);

        yPos += 15;
        const boxWidth = (pageWidth - 40 - 10) / 3; // 40 margin, 10 gap

        summaryMetrics.forEach((metric, i) => {
            const x = 20 + (boxWidth + 5) * i;

            // Box
            doc.setDrawColor(226, 232, 240); // Slate-200 border
            doc.setFillColor(248, 250, 252); // Slate-50 bg
            doc.roundedRect(x, yPos, boxWidth, 35, 3, 3, 'FD');

            // Metric Text
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.text(metric.label.toUpperCase(), x + 10, yPos + 10);

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59); // Slate-800
            doc.text(metric.value, x + 10, yPos + 20);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(22, 163, 74); // Green-600
            doc.text(metric.change, x + 10, yPos + 28);
        });

        // 3. Top Stations Table
        yPos += 55;
        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85);
        doc.text("Top Performing Stations", 20, yPos);

        autoTable(doc, {
            startY: yPos + 10,
            head: [['Station Name', 'Revenue']],
            body: (analytics?.topStations || []).map((s: TopStation) => [s.name, s.formattedRevenue]),
            theme: 'grid',
            headStyles: { fillColor: [234, 88, 12], textColor: 255 }, // Orange header
            styles: { fontSize: 10, cellPadding: 5 },
            alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray alternate
        });

        // 4. Subscriptions Table
        yPos = (doc as any).lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85);
        doc.text("Recent Subscriptions Overview", 20, yPos);

        autoTable(doc, {
            startY: yPos + 10,
            head: [['Company', 'Plan', 'Start Date', 'Status']],
            body: (subscriptionsData || []).slice(0, 10).map((sub: any) => [
                sub.companyName || "N/A", 
                sub.planType || 'Standard', 
                sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "N/A",
                sub.status
            ]),
            theme: 'grid',
            headStyles: { fillColor: [51, 65, 85], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
        });

        // 5. Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page 1 of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

        doc.save(`${new Date().toISOString().split('T')[0]}_System_Performance_Report.pdf`);
    };

    const handleDownload = () => {
        setIsDownloading(true);
        // Simulate processing delay for better UX
        setTimeout(() => {
            try {
                generatePDF();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (error) {
                console.error("PDF Generation failed:", error);
                toast.error("Failed to generate PDF. Please try again.");
            } finally {
                setIsDownloading(false);
            }
        }, 1000);
    };

    return (
        <div className="space-y-8 relative">
            {/* Friendly Welcome Banner (Gradient) */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 to-orange-900 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, {fullName}!</h1>
                        <p className="text-orange-100/80">Here&apos;s what&apos;s happening with your network today.</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid — MUI StatCard components */}
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Service Stations"
                        count={analytics?.totalServiceCenters?.toString() || '0'}
                        icon={<FiBriefcase />}
                        percentage={analytics?.pendingRegistrations ? {
                            color: 'warning',
                            amount: `${analytics.pendingRegistrations}`,
                            label: 'pending review'
                        } : undefined}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Platform Revenue"
                        count={loading ? "..." : `Rs. ${analytics?.totalPlatformRevenue?.toLocaleString() || '0'}`}
                        icon={<FiDollarSign />}
                        percentage={analytics?.revenueChange ? {
                            color: analytics.revenueChange.startsWith('+') ? 'success' : 'danger',
                            amount: analytics.revenueChange,
                            label: 'overall growth'
                        } : undefined}
                        color="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <StatCard
                        title="Total Platform Users"
                        count={statsData?.totalUsers?.toString() || '0'}
                        icon={<FiUserCheck />}
                        percentage={{
                            color: 'info',
                            amount: 'All',
                            label: 'across all roles'
                        }}
                        color="primary"
                    />
                </Grid>
            </Grid>

            {/* Charts Section — Dual Chart Layout */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
                <div>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        Subscription Revenue Performance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Track your {view} subscription revenue trends
                    </Typography>
                </div>
                <Box display="flex" alignItems="center" gap={2}>
                    <ToggleButtonGroup
                        value={view}
                        exclusive
                        onChange={(_, val) => val && setView(val)}
                        size="small"
                        sx={{
                            '& .MuiToggleButton-root': {
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                px: 2.5,
                                borderColor: '#e2e8f0',
                                '&.Mui-selected': {
                                    bgcolor: '#EA580C',
                                    color: '#fff',
                                    '&:hover': { bgcolor: '#c2410c' }
                                }
                            }
                        }}
                    >
                        <ToggleButton value="weekly">Weekly</ToggleButton>
                        <ToggleButton value="monthly">Monthly</ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setIsReportOpen(true)}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderColor: '#EA580C',
                            color: '#EA580C',
                            borderRadius: 2,
                            '&:hover': { bgcolor: 'rgba(234,88,12,0.05)', borderColor: '#c2410c' }
                        }}
                    >
                        View Report
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Revenue Bar Chart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={3}>
                        <ChartCard
                            title="Revenue Overview"
                            description={
                                <Box display="flex" alignItems="center">
                                    <Typography variant="button" fontWeight="bold" color="success.main">
                                        Rs {totalRevenue.toLocaleString()}
                                    </Typography>
                                    <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                        total {view} revenue
                                    </Typography>
                                </Box>
                            }
                            date={`updated just now`}
                            color="primary"
                            chart={
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                            angle={-45}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                            formatter={(value: number | undefined) => [`Rs ${(value ?? 0).toLocaleString()}`, 'Revenue']}
                                        />
                                        <Bar dataKey="revenue" name="Revenue" fill="rgba(255,255,255,0.5)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            }
                        />
                    </Box>
                </Grid>

                {/* Subscription Trend Line Chart */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Box mb={3}>
                        <ChartCard
                            title="Subscription Trend"
                            description={
                                <Box display="flex" alignItems="center">
                                    <Typography variant="button" fontWeight="bold" color={analytics?.subscriptionChange?.startsWith('+') ? "success.main" : "error.main"}>
                                        {analytics?.subscriptionChange || '0%'}
                                    </Typography>
                                    <Typography variant="button" color="text.secondary" fontWeight="light" ml={0.5}>
                                        subscription growth
                                    </Typography>
                                </Box>
                            }
                            date={`${view} trend`}
                            color="primary"
                            chart={
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={chartData}
                                        margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.2)" />
                                        <XAxis
                                            dataKey="name"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                            angle={-45}
                                            textAnchor="end"
                                        />
                                        <YAxis
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                                            tick={{ fill: '#fff', opacity: 0.8 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                            formatter={(value: number | undefined) => [`Rs ${(value ?? 0).toLocaleString()}`, 'Revenue']}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="#ffffff"
                                            strokeWidth={3}
                                            dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                            activeDot={{ r: 6, stroke: '#fff' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            }
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Report MUI Dialog */}
            <Dialog 
                open={isReportOpen} 
                onClose={() => setIsReportOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '1.25rem', overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography variant="h6" fontWeight="bold" color="#0f172a">System Performance Report</Typography>
                        <Typography variant="caption" color="text.secondary">Generated on {new Date().toLocaleDateString()}</Typography>
                    </div>
                    <IconButton onClick={() => setIsReportOpen(false)} size="small">
                        <FiX className="text-xl" />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Key Metrics Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        {summaryMetrics.map((metric: any, i: number) => (
                            <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'bg-orange-50 border-orange-100' : i === 1 ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                                <p className={`text-xs font-semibold uppercase ${i === 0 ? 'text-orange-600' : i === 1 ? 'text-blue-600' : 'text-purple-600'}`}>{metric.label}</p>
                                <p className="text-xl font-bold text-slate-800 mt-1">{metric.value}</p>
                                <p className={`text-xs font-medium mt-1 ${i === 1 ? 'text-slate-500' : 'text-green-600'}`}>{metric.change}</p>
                            </div>
                        ))}
                    </div>

                    {/* Top Performing Stations Table */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-3 text-sm">Top Performing Stations</h4>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Station Name</th>
                                        <th className="px-4 py-3 font-medium">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {(analytics?.topStations || []).map((station: TopStation, i: number) => (
                                        <tr key={i}>
                                            <td className="px-4 py-3 font-medium text-slate-700">{station.name}</td>
                                            <td className="px-4 py-3 text-slate-600">{station.formattedRevenue}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc', gap: 1.5 }}>
                    <button
                        onClick={() => setIsReportOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading || showSuccess}
                        className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm flex items-center gap-2 transition-all ${isDownloading ? 'bg-slate-400 cursor-not-allowed' :
                            showSuccess ? 'bg-green-500 hover:bg-green-600' :
                                'bg-orange-600 hover:bg-orange-700 hover:shadow-md'
                            }`}
                    >
                        {isDownloading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Generating...
                            </>
                        ) : showSuccess ? (
                            <>
                                <FiCheckCircle className="text-lg" />
                                Downloaded!
                            </>
                        ) : (
                            <>
                                <FiDownload className="text-lg" />
                                Download PDF
                            </>
                        )}
                    </button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
