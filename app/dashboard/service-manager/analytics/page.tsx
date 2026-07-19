"use client";

import { useEffect, useState } from "react";
import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import APP_CONFIG from "@/config";

export default function AnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/analytics/current`, {
                    headers: token ? { "Authorization": `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    setAnalyticsData(data);
                }
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    }

    // Use fetched data or fallback to empty state
    const rev = analyticsData?.totalRevenue || 0;
    const jobs = analyticsData?.totalJobs || 0;
    const avg = analyticsData?.avgJobValue || 0;

    const chartData = analyticsData?.revenueOverview || [];
    const breakdownData = analyticsData?.serviceBreakdown || [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Weekly Performance Analytics</h1>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value={`Rs ${rev.toLocaleString()}`}
                    change={analyticsData?.revenueChange || "0%"}
                    trend={analyticsData?.revenueChange?.startsWith('-') ? "down" : "up"}
                    icon={<FiDollarSign />}
                    color="green"
                />
                <MetricCard
                    title="Total Bookings"
                    value={jobs}
                    change={analyticsData?.jobsChange || "0%"}
                    trend={analyticsData?.jobsChange?.startsWith('-') ? "down" : "up"}
                    icon={<FiBarChart2 />}
                    color="blue"
                />
                <MetricCard
                    title="Avg Job Value"
                    value={`Rs ${avg.toLocaleString()}`}
                    change={analyticsData?.avgJobValueChange || "0%"}
                    trend={analyticsData?.avgJobValueChange?.startsWith('-') ? "down" : "up"}
                    icon={<FiTrendingDown />}
                    color="purple"
                    goodTrend={true}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend</h3>
                    <div className="h-80">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} tickFormatter={(val) => `Rs ${val}`} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No chart data available</div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Service Breakdown</h3>
                    <div className="h-80">
                        {breakdownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={breakdownData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <Tooltip cursor={{ fill: '#FFF7ED' }} />
                                    <Bar dataKey="value" fill="#F97316" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">No breakdown data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, trend, icon, color, goodTrend = false }: any) {
    const isPositive = trend === 'up';

    let trendColor = "text-green-600";
    if (trend === 'down' && !goodTrend) trendColor = "text-red-600";
    if (trend === 'up' && goodTrend === 'false') trendColor = "text-red-600";

    const trendIcon = trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />;

    const colors: any = {
        green: "bg-green-100 text-green-600",
        blue: "bg-blue-100 text-blue-600",
        purple: "bg-purple-100 text-purple-600",
        orange: "bg-orange-100 text-orange-600",
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-xl">{icon}</div>
                </div>
                <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-slate-50 ${trendColor}`}>
                    {trendIcon}
                    <span className="ml-1">{change}</span>
                </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}
