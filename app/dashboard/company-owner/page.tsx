"use client";

import Button from "@/components/UI/Button";
import { FiBriefcase, FiDollarSign, FiUsers, FiCheckCircle } from "react-icons/fi";

export default function CompanyOwnerDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Company Overview</h1>
                <div className="flex gap-2">
                    <Button>
                        + Add Service Center
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="$124,500"
                    change="+8.2%"
                    icon={<FiDollarSign />}
                    color="green"
                />
                <StatCard
                    title="Service Centers"
                    value="8"
                    change="0%"
                    icon={<FiBriefcase />}
                    color="blue"
                />
                <StatCard
                    title="Total Customers"
                    value="1,240"
                    change="+12%"
                    icon={<FiUsers />}
                    color="orange"
                />
                <StatCard
                    title="Completed Jobs"
                    value="342"
                    change="+24%"
                    icon={<FiCheckCircle />}
                    color="purple"
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Centers Performance */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Service Center Performance</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                                        #{i}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Downtown Branch</p>
                                        <p className="text-xs text-slate-500">Manager: Mike Smith</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">$12,400</p>
                                    <p className="text-xs text-green-600">+12%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
                    <div className="relative border-l border-slate-200 ml-3 space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="pl-6 relative">
                                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white"></div>
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900">New Job Created</span> by Downtown Branch
                                </p>
                                <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                            </div>
                        ))}
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
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {change}
                </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}
