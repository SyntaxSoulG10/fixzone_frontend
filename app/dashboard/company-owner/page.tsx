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
    FiArrowRight,
    FiTrendingUp
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
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Company Dashboard</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Welcome back! Manage your service centers and track performance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/company-owner/centers">
                        <Button variant="secondary" className="h-11 hover:border-orange-200 hover:text-orange-600">
                            Manage Centers
                        </Button>
                    </Link>
                    <Link href="/dashboard/company-owner/bookings">
                        <Button className="h-11 bg-gradient-to-tr from-orange-600 to-orange-400 border-none shadow-orange-200 hover:shadow-orange-300">
                            <FiPlus className="mr-2" /> New Booking
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Row - Styled like the images (Floating Icons) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 pt-4">
                <StatCard
                    title="Total Revenue"
                    value="$124,500"
                    change="+12.5%"
                    trend="up"
                    icon={<FiDollarSign className="text-white text-xl" />}
                    color="bg-gradient-to-tr from-orange-600 to-orange-500" // Main Orange
                    footerText="vs. last month"
                />
                <StatCard
                    title="Active Centers"
                    value="8"
                    change="+1"
                    trend="up"
                    icon={<FiBriefcase className="text-white text-xl" />}
                    color="bg-slate-800" // Dark for contrast
                    footerText="New branch opened"
                />
                <StatCard
                    title="Total Customers"
                    value="1,240"
                    change="+8.2%"
                    trend="up"
                    icon={<FiUsers className="text-white text-xl" />}
                    color="bg-slate-700" // Darker slate
                    footerText="vs. last month"
                />
                <StatCard
                    title="Pending Jobs"
                    value="42"
                    change="-5%"
                    trend="down"
                    icon={<FiClock className="text-white text-xl" />}
                    color="bg-orange-400" // Lighter Orange
                    footerText="vs. yesterday"
                />
            </div>

            {/* Main Content Area with Tabs */}
            <div className="space-y-6 mt-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        className="bg-transparent p-0 gap-4"
                    />
                </div>

                <div className="min-h-[400px]">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'performance' && <PerformanceTab />}
                    {activeTab === 'activity' && <ActivityTab />}
                </div>
            </div>

            {/* Quick Actions Footer - Styled like 'Quick Actions' in image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                <QuickActionBtn
                    title="Service Reports"
                    icon={<FiFileText />}
                    href="/dashboard/company-owner/reports"
                    color="bg-orange-50 text-orange-900 border-orange-100"
                    iconColor="text-orange-600"
                />
                <QuickActionBtn
                    title="Team Management"
                    icon={<FiUsers />}
                    href="/dashboard/company-owner/profile"
                    color="bg-slate-50 text-slate-800 hover:bg-orange-50 hover:text-orange-900"
                    iconColor="text-slate-500 group-hover:text-orange-600"
                />
                <QuickActionBtn
                    title="Booking Calendar"
                    icon={<FiCalendar />}
                    href="/dashboard/company-owner/bookings"
                    color="bg-slate-50 text-slate-800 hover:bg-orange-50 hover:text-orange-900"
                    iconColor="text-slate-500 group-hover:text-orange-600"
                />
            </div>
        </div>
    );
}

// --- Sub Components ---

function OverviewTab() {
    return (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Revenue Chart Placeholder (Styled like 'Website Views' card) */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 pt-8 relative mt-6">
                    <div className="bg-gradient-to-tr from-orange-600 to-orange-400 -mt-12 mb-4 mx-4 rounded-xl shadow-lg h-48 flex items-center justify-center shadow-orange-200">
                        <FiBarChart2 className="text-white text-5xl opacity-80" />
                    </div>
                    <div className="px-2">
                        <h3 className="text-lg font-bold text-slate-800">Revenue Analytics</h3>
                        <p className="text-sm text-slate-500">Monthly breakdown of service revenue.</p>
                        <div className="border-t border-slate-100 mt-4 pt-4 text-slate-500 text-sm flex items-center gap-2">
                            <FiClock /> updated 4 min ago
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Top Performing Centers</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-orange-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold group-hover:bg-orange-200 transition-colors">
                                        #{i}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">Downtown Service Hub</p>
                                        <p className="text-xs text-slate-500">New York, NY</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900">$45,200</p>
                                    <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-2 ml-auto">
                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Live Activity (Styled like 'Upcoming Today') */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start gap-4">
                                <span className="w-2 h-2 rounded-full bg-orange-500 mt-2 ring-4 ring-orange-100"></span>
                                <div className="flex-1 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                                    <p className="text-sm font-semibold text-slate-800">New Job Created</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Downtown Branch started a new tire service.</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">10:42 AM</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-sm text-slate-500 hover:text-orange-600">
                        View Full History
                    </Button>
                </div>
            </div>
        </div>
    );
}

function PerformanceTab() {
    return (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center animate-in fade-in duration-500 shadow-sm">
            <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-orange-400 text-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-6 text-3xl shadow-orange-200">
                    <FiBarChart2 />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Performance Analytics</h3>
                <p className="text-slate-500 mt-2 mb-6">Detailed performance metrics per service center will be available here.</p>
                <Link href="/dashboard/company-owner/analytics">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200">Go to Analytics</Button>
                </Link>
            </div>
        </div>
    );
}

function ActivityTab() {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 animate-in fade-in duration-500">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Full Activity Log</h3>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border border-slate-50 bg-slate-50/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
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

// --- Component Props & Styles matching Image UI ---

function StatCard({ title, value, change, trend, icon, color, footerText }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 relative p-4 pt-8">
            {/* Floating Icon */}
            <div className={`absolute -top-4 left-4 w-12 h-12 rounded-lg shadow-lg flex items-center justify-center ${color}`}>
                {icon}
            </div>

            {/* Content right-aligned */}
            <div className="text-right mb-4">
                <p className="text-slate-500 text-sm font-light">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>

            {/* Footer with separator */}
            <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className={`font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {change}
                    </span>
                    {footerText}
                </p>
            </div>
        </div>
    );
}

function QuickActionBtn({ title, icon, href, color, iconColor }: any) {
    return (
        <Link href={href} className={`flex items-center gap-4 p-4 rounded-xl shadow-sm transition-all hover:scale-[1.02] border border-transparent hover:border-slate-200 ${color}`}>
            <div className={`text-2xl ${iconColor}`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800">{title}</h4>
                <p className="text-xs opacity-80">Click to view details</p>
            </div>
            <FiArrowRight className={`opacity-50 ${iconColor}`} />
        </Link>
    );
}
