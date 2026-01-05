"use client";

import { FiBarChart2, FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
    { name: 'Mon', revenue: 4000, bookings: 24 },
    { name: 'Tue', revenue: 3000, bookings: 18 },
    { name: 'Wed', revenue: 2000, bookings: 12 },
    { name: 'Thu', revenue: 2780, bookings: 20 },
    { name: 'Fri', revenue: 1890, bookings: 15 },
    { name: 'Sat', revenue: 2390, bookings: 22 },
    { name: 'Sun', revenue: 3490, bookings: 30 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Performance Analytics</h1>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Revenue"
                    value="$24,500"
                    change="+15%"
                    trend="up"
                    icon={<FiDollarSign />}
                    color="green"
                />
                <MetricCard
                    title="Total Bookings"
                    value="142"
                    change="+8%"
                    trend="up"
                    icon={<FiBarChart2 />}
                    color="blue"
                />
                <MetricCard
                    title="Avg Service Time"
                    value="1h 15m"
                    change="-5%"
                    trend="down"
                    icon={<FiTrendingDown />}
                    color="purple"
                    goodTrend={true} // Lower time is good
                />
                <MetricCard
                    title="Customer Satisfaction"
                    value="4.8/5"
                    change="+0.2"
                    trend="up"
                    icon={<FiTrendingUp />}
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Trend (Weekly)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Booking Volume</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                                <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, trend, icon, color, goodTrend = false }: any) {
    const isPositive = trend === 'up';
    // If goodTrend is true, then "down" is actually good (green). E.g. service time.
    // If undefined, default logic applies (up is green).

    // Logic: 
    // If trending UP: Green usually, unless UP is bad (not handled here simplified).
    // If trending DOWN: Red usually, unless DOWN is good (goodTrend=true).

    let trendColor = "text-green-600";
    if (trend === 'down' && !goodTrend) trendColor = "text-red-600";
    if (trend === 'up' && goodTrend === 'false') trendColor = "text-red-600"; // not used logic yet

    // Simplified visual logic for this prototype
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
