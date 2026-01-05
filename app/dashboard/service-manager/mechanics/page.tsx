"use client";

import { FiUser, FiTruck, FiClock, FiSettings } from "react-icons/fi";

const MECHANICS_DATA = [
    { id: 1, name: "Mike Ross", status: "Busy", vehicle: "Toyota Camry", task: "General Service", start: "09:00 AM" },
    { id: 2, name: "Rachel Zane", status: "Available", vehicle: "-", task: "-", start: "-" },
    { id: 3, name: "Harvey Specter", status: "Busy", vehicle: "Ford F-150", task: "Engine Repair", start: "10:30 AM" },
    { id: 4, name: "Louis Litt", status: "Break", vehicle: "-", task: "-", start: "-" },
    { id: 5, name: "Donna Paulsen", status: "Busy", vehicle: "BMW X5", task: "Brake Flush", start: "02:00 PM" },
];

export default function MechanicsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Mechanics Management</h1>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Total Mechanics</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Busy</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">8</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Available</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">3</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500 text-sm font-medium">Avg Service Time</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">54m</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Mechanics Status</h2>
                    <button className="text-sm font-medium text-primary hover:text-primary-hover">Manage Sections</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Mechanic</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Working Vehicle</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Start Time</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MECHANICS_DATA.map((mechanic) => (
                                <tr key={mechanic.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {mechanic.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900">{mechanic.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${mechanic.status === 'Busy' ? 'bg-orange-100 text-orange-800' :
                                                mechanic.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {mechanic.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{mechanic.vehicle}</td>
                                    <td className="px-6 py-4">{mechanic.task}</td>
                                    <td className="px-6 py-4 font-mono">{mechanic.start}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary transition-colors">
                                            <FiSettings className="text-lg" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Service Sections Allocation Mock */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Service Sections</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((section) => (
                        <div key={section} className={`p-4 rounded-lg border text-center ${section % 2 === 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="text-xs font-semibold text-slate-500 mb-1">SECTION {section}</div>
                            <div className={`font-bold ${section % 2 === 0 ? 'text-blue-700' : 'text-slate-400'}`}>
                                {section % 2 === 0 ? 'Occupied' : 'Empty'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
