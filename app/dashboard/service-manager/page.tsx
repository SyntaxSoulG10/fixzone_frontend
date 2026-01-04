"use client";

import { FiTool, FiClock, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { FaUserCog, FaMoneyBillWave } from "react-icons/fa";

export default function ServiceManagerDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Service Center Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today Bookings"
                    value="18"
                    change="+3"
                    icon={<FiCalendar />}
                    color="blue"
                />
                <StatCard
                    title="Active Mechanics"
                    value="6"
                    change="2 Available"
                    icon={<FaUserCog />}
                    color="orange"
                />
                <StatCard
                    title="Today Revenue"
                    value="$1,250"
                    change="+12%"
                    icon={<FaMoneyBillWave />}
                    color="green"
                />
                <StatCard
                    title="Service in Progress"
                    value="8"
                    change="Busy"
                    icon={<FiTool />}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Bookings - 2/3 width */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Active Bookings</h2>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Ongoing</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Ref</th>
                                    <th className="px-6 py-4">Mechanic</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">Sarah Connor</td>
                                    <td className="px-6 py-4">Toyota Camry</td>
                                    <td className="px-6 py-4 font-mono text-xs">#BK-9921</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                            <span>Mike Ross</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            In Progress
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">John Wick</td>
                                    <td className="px-6 py-4">Ford Mustang</td>
                                    <td className="px-6 py-4 font-mono text-xs">#BK-9925</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                            <span>Jane Doe</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Done
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Bookings - 1/3 width */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Upcoming Bookings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Service</th>
                                    <th className="px-4 py-3">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">Alice Smith</td>
                                    <td className="px-4 py-3">Oil Change</td>
                                    <td className="px-4 py-3 text-slate-500">14:00</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">Bob Martin</td>
                                    <td className="px-4 py-3">Brake Check</td>
                                    <td className="px-4 py-3 text-slate-500">15:30</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">Charlie Day</td>
                                    <td className="px-4 py-3">Inspection</td>
                                    <td className="px-4 py-3 text-slate-500">16:15</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600",
        orange: "bg-orange-100 text-orange-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-xl">{icon}</div>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                    {change}
                </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}
