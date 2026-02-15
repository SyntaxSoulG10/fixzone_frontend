"use client";

import { useState } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiList, FiPlus } from "react-icons/fi";

const BOOKINGS_DATA = [
    { id: "BK-1001", customer: "Amila Silva", vehicle: "Toyota Camry", variety: "Sedan", category: "Full Service", time: "09:00" },
    { id: "BK-1002", customer: "John Alponsu", vehicle: "Ford Mustang", variety: "Crossover SUV", category: "Engine Repair", time: "10:00" },
    { id: "BK-1003", customer: "Sarath Gunawardana", vehicle: "Nissan Sunny", variety: "Sedan", category: "Oil Change", time: "11:00" },
    { id: "BK-1004", customer: "Amara Alwis", vehicle: "Toyota Vagon", variety: "Crossover", category: "Battery Check", time: "11:00" },
    { id: "BK-1005", customer: "Ishara Sewwandi", vehicle: "Micro Panda", variety: "SUV", category: "Brake Repair", time: "11:30" },
    { id: "BK-1006", customer: "Sundun Perera", vehicle: "Toyota Land Cruiser Prado", variety: "SUV", category: "Full Service", time: "12:00" },
    { id: "BK-1007", customer: "Supun Alahakon", vehicle: "Honda Civic", variety: "Sedan", category: "Brake Repair", time: "13:30" },
    { id: "BK-1008", customer: "Charlie Rubbert", vehicle: "BMW i8", variety: "SUV", category: "Full Diagnostic Scan", time: "15:30" },
    { id: "BK-1009", customer: "Somasiri Perera", vehicle: "Toyota Vagon", variety: "SUV", category: "Oil Change", time: "16:00" },
    { id: "BK-1010", customer: "Ajith Amarathunga", vehicle: "Toyota Yaris", variety: "Sedan", category: "Oil Change", time: "16:30" },
];

export default function BookingsPage() {
    const [view, setView] = useState<"list" | "new-booking">("list");
    const [formData, setFormData] = useState({
        date: "",
        time: "",
        customer: "",
        vehicle: "",
        service: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("New Booking Data:", formData);
        // Here you would typically send the data to your backend
        alert("Booking Created! (Check console for data)");
        setView("list");
        setFormData({ date: "", time: "", customer: "", vehicle: "", service: "" });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">
                    {view === "list" ? "Booking Management" : "New Booking"}
                </h1>
                <div className="flex gap-2">
                    {view === "list" ? (
                        <button
                            onClick={() => setView("new-booking")}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                        >
                            <FiPlus /> New Booking
                        </button>
                    ) : (
                        <button
                            onClick={() => setView("list")}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <FiList /> Back to List
                        </button>
                    )}
                </div>
            </div>

            {view === "list" ? (
                <>
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryCard title="Total Today" value="10" icon={<FiCalendar />} color="blue" />
                        <SummaryCard title="Completed" value="3" icon={<FiCheckCircle />} color="green" />
                        <SummaryCard title="In Progress" value="2" icon={<FiClock />} color="orange" />
                    </div>

                    {/* Calendar & Table Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Visual Calendar (Mock) */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Schedule</h3>
                            <div className="border border-slate-100 rounded-lg p-4">
                                {/* Mock Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                                    <div>January</div>
                                </div>
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
                                    {[...BOOKINGS_DATA]
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map((booking, index) => {
                                            const colors = [
                                                "bg-blue-50 text-blue-700 border-blue-500",
                                                "bg-orange-50 text-orange-700 border-orange-500",
                                                "bg-green-50 text-green-700 border-green-500",
                                                "bg-purple-50 text-purple-700 border-purple-500",
                                            ];
                                            const colorClass = colors[index % colors.length];

                                            return (
                                                <div key={booking.id} className="flex items-center gap-3 text-sm">
                                                    <span className="text-slate-500 w-12 text-right">{booking.time}</span>
                                                    <div className={`flex-1 p-2 rounded text-xs font-medium border-l-2 ${colorClass}`}>
                                                        {booking.category} - {booking.vehicle.split(" ")[0]}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                                            <th className="px-6 py-4 w-1/5">ID</th>
                                            <th className="px-6 py-4 w-1/5">Customer</th>
                                            <th className="px-6 py-4">Vehicle</th>
                                            <th className="px-6 py-4">Service</th>
                                            <th className="px-6 py-4">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {BOOKINGS_DATA.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs">{booking.id}</td>
                                                <td className="px-6 py-4 font-medium text-slate-900">{booking.customer}</td>
                                                <td className="px-6 py-4">
                                                    <div>{booking.vehicle}</div>
                                                    <div className="text-xs text-slate-400">{booking.variety}</div>
                                                </td>
                                                <td className="px-6 py-4">{booking.category}</td>
                                                <td className="px-6 py-4">{booking.time}</td>
                                                <td className="px-6 py-4">
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-900">Create New Booking</h2>
                        <p className="text-slate-500 text-sm mt-1">Enter the details for the new service appointment.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    required
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Customer Name</label>
                            <input
                                type="text"
                                name="customer"
                                placeholder="e.g. John Doe"
                                required
                                value={formData.customer}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Vehicle</label>
                            <input
                                type="text"
                                name="vehicle"
                                placeholder="e.g. Toyota Camry"
                                required
                                value={formData.vehicle}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Service Required</label>
                            <input
                                type="text"
                                name="service"
                                placeholder="e.g. General Service, Oil Change"
                                required
                                value={formData.service}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        <div className="pt-4 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setView("list")}
                                className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors shadow-sm"
                            >
                                Create Booking
                            </button>
                        </div>
                    </form>
                </div>
            )}
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


