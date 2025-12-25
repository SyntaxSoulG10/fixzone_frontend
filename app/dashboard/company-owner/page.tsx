"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import Tabs from "@/components/UI/Tabs";
import {
    FiBriefcase,
    FiDollarSign,
    FiUsers,
    FiCheckCircle,
    FiGrid,
    FiBarChart2,
    FiClock,
    FiPlus,
    FiFileText,
    FiCalendar,
    FiArrowRight
} from "react-icons/fi";

export default function CompanyOwnerDashboard() {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiGrid /> },
        { id: 'performance', label: 'Performance', icon: <FiBarChart2 /> },
        { id: 'activity', label: 'Recent Activity', icon: <FiClock /> },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Company Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Welcome back! Here's what's happening across your service centers today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/company-owner/centers">
                        <Button variant="secondary" className="h-11">
                            Manage Centers
                        </Button>
                    </Link>
                    <Link href="/dashboard/company-owner/bookings">
                        <Button className="h-11 shadow-primary/25 shadow-lg">
                            <FiPlus className="mr-2" /> New Booking
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="$124,500"
                    change="+12.5%"
                    trend="up"
                    icon={<FiDollarSign />}
                    color="green"
                    description="vs. last month"
                />
                <StatCard
                    title="Active Centers"
                    value="8"
                    change="+1"
                    trend="up"
                    icon={<FiBriefcase />}
                    color="blue"
                    description="New branch opened"
                />
                <StatCard
                    title="Total Customers"
                    value="1,240"
                    change="+8.2%"
                    trend="up"
                    icon={<FiUsers />}
                    color="orange"
                    description="vs. last month"
                />
                <StatCard
                    title="Pending Jobs"
                    value="42"
                    change="-5%"
                    trend="down"
                    icon={<FiClock />}
                    color="purple"
                    description="vs. yesterday"
                />
            </div>

            {/* Main Content Area with Tabs */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        className="bg-transparent p-0 gap-6"
                    />
                    <span className="text-sm text-slate-400 hidden sm:block">
                        Last updated: Just now
                    </span>
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'performance' && <PerformanceTab />}
                    {activeTab === 'activity' && <ActivityTab />}
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                <QuickActionCard
                    title="Service Reports"
                    desc="View detailed analytical reports."
                    icon={<FiFileText />}
                    href="/dashboard/company-owner/reports"
                />
                <QuickActionCard
                    title="Team Management"
                    desc="Manage staff and mechanics."
                    icon={<FiUsers />}
                    href="/dashboard/company-owner/profile"
                />
                <QuickActionCard
                    title="Booking Calendar"
                    desc="Check upcoming appointments."
                    icon={<FiCalendar />}
                    href="/dashboard/company-owner/bookings"
                />
            </div>
        </div>
    );
}

// --- Sub Components ---

function OverviewTab() {
    return (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Revenue / Performance */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
                        <div className="flex gap-2">
                            <select className="text-sm border-slate-200 rounded-lg py-1 px-3 text-slate-600 focus:ring-0">
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                    </div>

                    {/* Placeholder for Chart */}
                    <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                        <div className="text-center text-slate-400">
                            <FiBarChart2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Revenue Chart Visualization</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Top Performing Centers</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100/50 text-blue-600 flex items-center justify-center font-bold">
                                        {i}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Downtown Service Hub</p>
                                        <p className="text-xs text-slate-500">New York, NY</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">$45,200</p>
                                    <p className="text-xs text-green-600 font-medium">+12% vs avg</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Recent Activity / Notifications */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Live Activity</h3>
                    <div className="relative border-l-2 border-slate-100 ml-3.5 space-y-8">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="pl-8 relative">
                                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-blue-500 ring-2 ring-blue-50"></span>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-800">
                                        <span className="font-semibold">New Booking</span> confirmed at Downtown Hub
                                    </p>
                                    <p className="text-xs text-slate-400">Just now</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 text-sm text-slate-500">
                        View All Activity
                    </Button>
                </div>
            </div>
        </div>
    );
}

function PerformanceTab() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-in fade-in duration-500">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <FiBarChart2 />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Performance Analytics</h3>
                <p className="text-slate-500 mt-2 mb-6">Detailed performance metrics per service center will be available here.</p>
                <Link href="/dashboard/company-owner/analytics">
                    <Button>Go to Analytics</Button>
                </Link>
            </div>
        </div>
    );
}

function ActivityTab() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Full Activity Log</h3>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <FiClock />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">System Notification {i}</p>
                            <p className="text-xs text-slate-500">Details about the activity log entry goes here.</p>
                        </div>
                        <span className="text-xs text-slate-400">2h ago</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Component Props & Styles ---

function StatCard({ title, value, change, trend, icon, color, description }: any) {
    const bgColors: any = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-xl ${bgColors[color]} transition-transform duration-300 group-hover:scale-105`}>
                    <span className="text-xl">{icon}</span>
                </div>
                {change && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {change}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
                {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
            </div>
        </div>
    );
}

function QuickActionCard({ title, desc, icon, href }: any) {
    return (
        <Link href={href} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center text-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <FiArrowRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </Link>
    );
}
