"use client";

import { ActivityLog, PlatformStat, SystemMetric } from "@/types";
import { FiCheckCircle, FiActivity, FiServer, FiDatabase, FiGlobe, FiShield, FiCpu, FiAlertCircle } from "react-icons/fi";

const MOCK_METRICS: SystemMetric[] = [
    { title: "Server Status", status: "Online", subtext: "Uptime: 99.9%" },
    { title: "Database", status: "Healthy", subtext: "Response: 45ms" },
    { title: "API Gateway", status: "Operational", subtext: "1.2M requests/day" },
    { title: "Security", status: "Secure", subtext: "No threats detected" },
];

const MOCK_ACTIVITY: ActivityLog[] = [
    { id: 1, title: "[INFO] New service station registered successfully", time: "10:42:23 AM", type: "info" },
    { id: 2, title: "[SUCCESS] Hourly database backup completed", time: "10:00:00 AM", type: "success" },
    { id: 3, title: "[WARN] High latency detected in region US-East", time: "09:15:30 AM", type: "warning" },
    { id: 4, title: "[ERROR] Failed login attempt from IP 192.168.1.1", time: "04:30:15 AM", type: "error" },
    { id: 5, title: "[INFO] System maintenance scheduled for tonight", time: "01:00:00 AM", type: "info" },
];

const MOCK_STATS: PlatformStat[] = [
    { title: "API Calls", value: "1.2M" },
    { title: "New Bookings", value: "3,847" },
    { title: "Active Sessions", value: "2,156" },
    { title: "Avg Response Time", value: "245ms" },
];

export default function SystemHealthPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">System Health</h1>
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="font-bold">Systems Normal</span>
                </div>
            </div>

            {/* Top Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative overflow-hidden p-6 bg-white rounded-xl shadow-sm border border-slate-200 group hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 group-hover:h-1.5 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                            <FiServer className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-200">99.9%</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Server Status</h3>
                    <p className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Online</p>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Last check: 2s ago
                    </p>
                </div>

                <div className="relative overflow-hidden p-6 bg-white rounded-xl shadow-sm border border-slate-200 group hover:border-orange-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                    <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 group-hover:h-1.5 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                            <FiDatabase className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-200">Healthy</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Database</h3>
                    <p className="text-xl font-bold text-slate-800 group-hover:text-orange-600 transition-colors">Operational</p>
                    <p className="text-xs text-slate-400 mt-2">Response time: 45ms</p>
                </div>

                <div className="relative overflow-hidden p-6 bg-white rounded-xl shadow-sm border border-slate-200 group hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 group-hover:h-1.5 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                            <FiGlobe className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">High Load</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">API Gateway</h3>
                    <p className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors">1.2M Req/Day</p>
                    <p className="text-xs text-slate-400 mt-2">Latency: 120ms</p>
                </div>

                <div className="relative overflow-hidden p-6 bg-white rounded-xl shadow-sm border border-slate-200 group hover:border-green-400 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500 group-hover:h-1.5 transition-all"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                            <FiShield className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full border border-green-200">Secure</span>
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">Security</h3>
                    <p className="text-xl font-bold text-slate-800 group-hover:text-green-600 transition-colors">No Threats</p>
                    <p className="text-xs text-slate-400 mt-2">Last scan: 10m ago</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl shadow-slate-200/50 text-slate-300 font-mono text-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <FiActivity className="w-32 h-32 text-white rotate-12" />
                    </div>
                    <div className="flex justify-between items-center mb-6 relative z-10 border-b border-slate-800 pb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                             <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                             </div>
                             Live System Log
                        </h2>
                        <button className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition-colors border border-slate-700">View Full Log</button>
                    </div>
                    <div className="space-y-1 relative z-10 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {MOCK_ACTIVITY.map((act) => (
                            <div key={act.id} className="flex gap-4 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-default group/item">
                                <span className="text-slate-500 whitespace-nowrap text-xs pt-0.5 font-bold">{act.time}</span>
                                <div className={`${
                                    act.type === 'success' ? 'text-green-400' :
                                    act.type === 'error' ? 'text-red-400' :
                                    act.type === 'warning' ? 'text-yellow-400' :
                                    'text-blue-400'
                                } flex-1`}>
                                    <p className="group-hover/item:text-white transition-colors">{act.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Platform Analytics */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                <FiCpu className="w-5 h-5" />
                            </div>
                            Platform Analytics
                        </h2>
                        <span className="text-xs font-bold bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100 animate-pulse">Live</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {MOCK_STATS.map((stat, idx) => (
                            <div key={idx} className="p-5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-default bg-slate-50/50 hover:bg-white group">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-hover:text-slate-600 transition-colors">{stat.title}</h3>
                                <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 ${
                                        idx === 0 ? 'w-[80%] bg-blue-500' :
                                        idx === 1 ? 'w-[65%] bg-orange-500' :
                                        idx === 2 ? 'w-[45%] bg-green-500' :
                                        'w-[90%] bg-purple-500'
                                    }`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
