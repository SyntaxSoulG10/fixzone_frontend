"use client";

import StatCard from "@/components/dashboard/StatCard";
import { FiUsers, FiBriefcase, FiDollarSign, FiUserCheck, FiSearch } from "react-icons/fi";

export default function SuperAdminDashboard() {
    return (
        <div className="space-y-8">
            {/* Friendly Welcome Banner (Gradient) */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 to-orange-900 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, Super Admin!</h1>
                        <p className="text-orange-100/80">Here's what's happening with your network today.</p>
                    </div>

                    {/* Integrated Search */}
                    <div className="w-full md:max-w-md relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-white/50" />
                        </div>
                        <input 
                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all backdrop-blur-sm"
                            placeholder="Search users, stations, or subscriptions..." 
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <kbd className="hidden md:inline-block px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/50 border border-white/10">⌘K</kbd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiUsers className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Total Users</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-slate-900">12,847</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+12.5% this month</span>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiBriefcase className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Service Stations</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">248</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+8.2% this month</span>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiDollarSign className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Monthly Revenue</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">$ 89,420</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+15.3% this month</span>
                </div>

                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiUserCheck className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Active Subscriptions</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">234</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+5.7% this month</span>
                </div>
            </div>

            {/* Main Graph Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="mb-6 flex justify-between items-end">
                     <div>
                        <h3 className="text-lg font-bold text-slate-800">Performance Overview</h3>
                        <p className="text-sm text-slate-500">Track your weekly network growth</p>
                     </div>
                     <button className="text-sm font-semibold text-orange-600 hover:text-orange-700">View Report</button>
                </div>
                
                {/* The Graph Card */}
                <div className="bg-linear-to-br from-[#FF8C60] to-[#E86C4A] rounded-2xl p-8 text-white shadow-xl shadow-orange-200 relative overflow-hidden group">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">Total Revenue</p>
                            <h2 className="text-4xl font-bold font-mono tracking-tight">$89,420.50</h2>
                        </div>
                        <div className="flex bg-black/10 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                             <button className="px-4 py-1.5 text-xs font-bold bg-white text-orange-600 rounded-md shadow-sm">Weekly</button>
                             <button className="px-4 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors">Monthly</button>
                        </div>
                    </div>

                    <div className="relative h-48 flex items-end justify-between gap-4 px-2 z-10">
                         {/* Bars */}
                         {[35, 62, 45, 85, 55, 95, 68].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 group/bar w-full h-full justify-end">
                                <div className="relative w-full h-full flex items-end justify-center">
                                    <div 
                                        className="w-full max-w-3 md:max-w-10 bg-white/30 hover:bg-white rounded-t-lg transition-all duration-300 ease-out cursor-pointer relative group-hover/bar:scale-y-105 origin-bottom"
                                        style={{ height: `${h}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl transition-all transform translate-y-2 group-hover/bar:translate-y-0 pointer-events-none whitespace-nowrap z-20">
                                            ${h * 1240}
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                            </div>
                         ))}
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                     <div className="p-5 rounded-2xl bg-orange-50 border border-orange-100 hover:border-orange-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
                                <FiDollarSign className="w-5 h-5"/>
                            </div>
                            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Sales</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">$12,450</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Total sales today</p>
                     </div>

                     <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                             <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                                <FiBriefcase className="w-5 h-5"/>
                            </div>
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Bookings</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">84</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Booked slots today</p>
                     </div>

                     <div className="p-5 rounded-2xl bg-green-50 border border-green-100 hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                             <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                                <FiUsers className="w-5 h-5"/>
                            </div>
                            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Visits</span>
                        </div>
                        <p className="text-2xl font-black text-slate-800">1,205</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Platform visits today</p>
                     </div>
                </div>
            </div>
        </div>
    );
}
