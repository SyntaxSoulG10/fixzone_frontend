"use client";

import Button from "@/components/UI/Button";
import { FiTool, FiClock, FiCalendar, FiCheckCircle } from "react-icons/fi";

export default function ServiceManagerDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Service Center Dashboard</h1>
                <div className="flex gap-2">
                    <Button>
                        + New Job Card
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Jobs in Progress"
                    value="12"
                    change="Busy"
                    icon={<FiTool />}
                    color="blue"
                />
                <StatCard
                    title="Pending Bookings"
                    value="5"
                    change="+2"
                    icon={<FiCalendar />}
                    color="orange"
                />
                <StatCard
                    title="Completed Today"
                    value="8"
                    change="On Target"
                    icon={<FiCheckCircle />}
                    color="green"
                />
                <StatCard
                    title="Avg Service Time"
                    value="45m"
                    change="-5m"
                    icon={<FiClock />}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Active Jobs</h2>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span> <span className="text-xs text-slate-500">On Track</span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500 ml-2"></span> <span className="text-xs text-slate-500">Delayed</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Job ID</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Technician</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-slate-900">#jb-9921</td>
                                <td className="px-6 py-4">Toyota Camry (ABC-1234)</td>
                                <td className="px-6 py-4">Sarah Connor</td>
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
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:text-primary-hover font-medium">Update</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-slate-900">#jb-9922</td>
                                <td className="px-6 py-4">Honda Civic (XYZ-9876)</td>
                                <td className="px-6 py-4">John Wick</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                        <span>Jane Doe</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Waiting Parts
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:text-primary-hover font-medium">Update</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
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
