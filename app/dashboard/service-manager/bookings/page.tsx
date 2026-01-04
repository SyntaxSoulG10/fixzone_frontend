"use client";

import { useState } from "react";
import { FiCalendar, FiFilter, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

const BOOKINGS_DATA = [
    { id: "BK-1001", customer: "Alice Johnson", vehicle: "Toyota Camry", variety: "Sedan", category: "General Service", mechanic: "Mike Ross", time: "09:00 AM", status: "In Progress" },
    { id: "BK-1002", customer: "Bob Smith", vehicle: "Ford F-150", variety: "Truck", category: "Engine Repair", mechanic: "Harvey Specter", time: "10:30 AM", status: "Quality Check" },
    { id: "BK-1003", customer: "Charlie Davis", vehicle: "Honda Civic", variety: "Sedan", category: "Oil Change", mechanic: "Rachel Zane", time: "11:00 AM", status: "Done" },
    { id: "BK-1004", customer: "Diana Prince", vehicle: "Tesla Model 3", variety: "Electric", category: "Battery Check", mechanic: "Louis Litt", time: "01:00 PM", status: "In Progress" },
    { id: "BK-1005", customer: "Evan Wright", vehicle: "BMW X5", variety: "SUV", category: "Brake Service", mechanic: "Donna Paulsen", time: "02:30 PM", status: "Pending" },
];

export default function BookingsPage() {
    const [filter, setFilter] = useState("All");

    const filteredData = filter === "All"
        ? BOOKINGS_DATA
        : BOOKINGS_DATA.filter(b => b.status === filter || b.mechanic.includes(filter) || b.customer.includes(filter));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Booking Management</h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
                        <FiFilter /> Filter
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                        + New Booking
                    </button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SummaryCard title="Total Today" value="15" icon={<FiCalendar />} color="blue" />
                <SummaryCard title="Completed" value="5" icon={<FiCheckCircle />} color="green" />
                <SummaryCard title="In Progress" value="6" icon={<FiClock />} color="orange" />
                <SummaryCard title="Pending" value="4" icon={<FiAlertCircle />} color="slate" />
            </div>

            {/* Calendar & Table Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Visual Calendar (Mock) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Schedule</h3>
                    <div className="border border-slate-100 rounded-lg p-4">
                        {/* Mock Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                            <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-sm">
                            {[...Array(30)].map((_, i) => (
                                <div key={i} className={`aspect-square flex items-center justify-center rounded-md ${i === 14 ? 'bg-primary text-white font-bold' : 'hover:bg-slate-50 text-slate-600'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="text-xs font-semibold text-slate-400 uppercase">Today's Timeline</div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500 w-12 text-right">09:00</span>
                                <div className="flex-1 p-2 bg-blue-50 text-blue-700 rounded text-xs font-medium border-l-2 border-blue-500">
                                    General Service - Toyota
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500 w-12 text-right">10:30</span>
                                <div className="flex-1 p-2 bg-orange-50 text-orange-700 rounded text-xs font-medium border-l-2 border-orange-500">
                                    Engine Repair - Ford
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500 w-12 text-right">11:00</span>
                                <div className="flex-1 p-2 bg-green-50 text-green-700 rounded text-xs font-medium border-l-2 border-green-500">
                                    Oil Change - Honda
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Bookings Table */}
                <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">All Bookings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Vehicle</th>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Mechanic</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs">{booking.id}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{booking.customer}</td>
                                        <td className="px-6 py-4">
                                            <div>{booking.vehicle}</div>
                                            <div className="text-xs text-slate-400">{booking.variety}</div>
                                        </td>
                                        <td className="px-6 py-4">{booking.category}</td>
                                        <td className="px-6 py-4">{booking.mechanic}</td>
                                        <td className="px-6 py-4">{booking.time}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        orange: "bg-orange-100 text-orange-600",
        slate: "bg-slate-100 text-slate-600",
    };
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colors[color]}`}>
                <div className="text-xl">{icon}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        "In Progress": "bg-blue-100 text-blue-800",
        "Done": "bg-green-100 text-green-800",
        "Quality Check": "bg-purple-100 text-purple-800",
        "Pending": "bg-yellow-100 text-yellow-800",
    };
    const s = styles[status] || "bg-slate-100 text-slate-800";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s}`}>
            {status}
        </span>
    );
}
