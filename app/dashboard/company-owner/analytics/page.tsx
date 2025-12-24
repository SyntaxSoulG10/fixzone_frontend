"use client";

import PageHeader from "@/components/UI/PageHeader";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { FiArrowUp, FiArrowDown } from "react-icons/fi";

// Mock Data
const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 2780 },
    { name: 'May', revenue: 6890 },
    { name: 'Jun', revenue: 2390 },
    { name: 'Jul', revenue: 3490 },
];

const customerGrowthData = [
    { name: 'Jan', new: 20, active: 40 },
    { name: 'Feb', new: 30, active: 60 },
    { name: 'Mar', new: 45, active: 90 },
    { name: 'Apr', new: 25, active: 100 },
    { name: 'May', new: 60, active: 150 },
    { name: 'Jun', new: 80, active: 210 },
];

const serviceTypeData = [
    { name: 'Oil Change', value: 400 },
    { name: 'Tire Service', value: 300 },
    { name: 'Engine Repair', value: 300 },
    { name: 'Car Wash', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Business Analytics"
                description="Deep dive into your company performance metrics."
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Total Revenue (YTD)</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">$124,500</span>
                        <span className="text-sm font-medium text-green-600 flex items-center">
                            <FiArrowUp className="mr-1" /> 12%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Total Jobs</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">1,204</span>
                        <span className="text-sm font-medium text-green-600 flex items-center">
                            <FiArrowUp className="mr-1" /> 8.5%
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Avg. Job Value</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">$103.40</span>
                        <span className="text-sm font-medium text-red-600 flex items-center">
                            <FiArrowDown className="mr-1" /> 2%
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Overview</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChartComponent />
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Growth */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Customer Growth</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={customerGrowthData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="new" name="New Customers" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="active" name="Active Customers" fill="#1E293B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Service Type Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Services Breakdown</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {serviceTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Centers Table */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Top Performing Centers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="border-b border-slate-100">
                                <tr>
                                    <th className="py-2">Center Name</th>
                                    <th className="py-2">Jobs</th>
                                    <th className="py-2 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-3 font-medium">Downtown Branch</td>
                                    <td className="py-3">450</td>
                                    <td className="py-3 text-right font-bold text-slate-900">$45,200</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium">Westside Hub</td>
                                    <td className="py-3">320</td>
                                    <td className="py-3 text-right font-bold text-slate-900">$32,100</td>
                                </tr>
                                <tr>
                                    <td className="py-3 font-medium">North Garage</td>
                                    <td className="py-3">180</td>
                                    <td className="py-3 text-right font-bold text-slate-900">$18,400</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AreaChartComponent() {
    return (
        <LineChart
            data={revenueData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF6B00"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
            />
        </LineChart>
    )
}
