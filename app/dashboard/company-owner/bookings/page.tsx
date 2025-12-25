"use client";

import { useState } from "react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import Tabs from "@/components/UI/Tabs";
import { FiList, FiCalendar, FiFilter, FiSearch, FiMoreVertical } from "react-icons/fi";

const DUMMY_BOOKINGS = [
    { id: "BK-0001", customer: "Nike Fernando", vehicle: "Honda Civic 2020", service: "Standard Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "Quality Check", date: "Aug 17, 2025" },
    { id: "BK-0002", customer: "Emma Thomsan", vehicle: "Toyota Camry 2021", service: "Oil Changing", mechanic: "Mike Johnson", time: "8.00 AM", status: "Quality Check", date: "Aug 17, 2025" },
    { id: "BK-0003", customer: "Rolf David", vehicle: "Ford F-150", service: "Standard Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "Aug 17, 2025" },
    { id: "BK-0004", customer: "Eric Brown", vehicle: "Tesla Model 3", service: "Brake Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "In Progress", date: "Aug 17, 2025" },
    { id: "BK-0005", customer: "Oliver Tuwin", vehicle: "BMW X5", service: "Full Service", mechanic: "Mike Johnson", time: "8.00 AM", status: "Pending", date: "Aug 18, 2025" },
];

export default function BookingsPage() {
    const [activeTab, setActiveTab] = useState('list');

    const tabs = [
        { id: 'list', label: 'All Bookings', icon: <FiList /> },
        { id: 'calendar', label: 'Schedule Calendar', icon: <FiCalendar /> },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Booking Management"
                description="Manage and Track all Service Booking."
                action={
                    <Button>
                        + New Booking
                    </Button>
                }
            />

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                className="bg-white border border-slate-200 shadow-sm"
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                {activeTab === 'list' && (
                    <>
                        {/* Filters */}
                        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="relative flex-1 w-full max-w-md">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Bookings..."
                                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <Button variant="secondary" className="flex items-center gap-2 w-full sm:w-auto">
                                <FiFilter /> Filter
                            </Button>
                        </div>

                        {/* List View */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Booking ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Vehicle</th>
                                        <th className="px-6 py-4">Service</th>
                                        <th className="px-6 py-4">Mechanic</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {DUMMY_BOOKINGS.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-slate-900">{booking.id}</td>
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {booking.customer.charAt(0)}
                                                </div>
                                                <div className="font-medium text-slate-900">
                                                    {booking.customer}
                                                    <span className="block text-xs text-slate-500 font-normal">0713114270</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-slate-900">{booking.vehicle}</span>
                                                <span className="block text-xs text-slate-500">ABC-1234</span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{booking.service}</td>
                                            <td className="px-6 py-4">{booking.mechanic}</td>
                                            <td className="px-6 py-4">{booking.time}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${booking.status === 'Quality Check' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'In Progress' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-slate-100 text-slate-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" className="p-2 rounded-full">
                                                    <FiMoreVertical />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'calendar' && (
                    <div className="p-8 text-center animate-in fade-in duration-300">
                        <div className="max-w-md mx-auto">
                            <div className="bg-slate-50 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center text-3xl text-slate-400">
                                <FiCalendar />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Schedule Calendar</h3>
                            <p className="text-slate-500 mt-2">
                                Calendar view functionality coming soon. Implement FullCalendar or bespoke grid here.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
