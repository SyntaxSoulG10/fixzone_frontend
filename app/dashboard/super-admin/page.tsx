"use client";

import Button from "@/components/UI/Button";
import { FiUsers, FiBriefcase, FiActivity, FiDollarSign } from "react-icons/fi";

export default function SuperAdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
                <div className="flex gap-2">
                    <Button variant="secondary">
                        Download Report
                    </Button>
                    <Button>
                        + New Tenant
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tenants"
                    value="124"
                    change="+12%"
                    icon={<FiBriefcase />}
                    color="blue"
                />
                <StatCard
                    title="Active Users"
                    value="8,540"
                    change="+5.4%"
                    icon={<FiUsers />}
                    color="orange"
                />
                <StatCard
                    title="Total Jobs"
                    value="45.2k"
                    change="+23%"
                    icon={<FiActivity />}
                    color="green"
                />
                <StatCard
                    title="Platform Revenue"
                    value="$1.2M"
                    change="+18%"
                    icon={<FiDollarSign />}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Recent Tenants</h2>
                    <a href="#" className="text-sm text-primary font-medium hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">AutoFix Pro {i}</td>
                                    <td className="px-6 py-4">John Doe {i}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">Dec 24, 2024</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" className="text-slate-400 hover:text-primary font-medium p-0">Manage</Button>
                                    </td>
                                </tr>
                            ))}
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
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {change}
                </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}
