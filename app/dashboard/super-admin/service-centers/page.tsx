"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiFilter, FiMapPin } from "react-icons/fi";

const DUMMY_CENTERS = [
    { id: 1, name: "Downtown Branch", company: "AutoFix Pro", location: "New York, NY", manager: "Mike Ross", status: "Active" },
    { id: 2, name: "Westside Hub", company: "AutoFix Pro", location: "Los Angeles, CA", manager: "Rachel Zane", status: "Active" },
    { id: 3, name: "Speedy HQ", company: "Speedy Service", location: "Chicago, IL", manager: "Harvey Specter", status: "Active" },
    { id: 4, name: "Luxury East", company: "Luxury Cars Hub", location: "Miami, FL", manager: "Louis Litt", status: "Maintenance" },
    { id: 5, name: "North Garage", company: "MotoMenders", location: "Seattle, WA", manager: "Donna Paulsen", status: "Active" },
];

export default function ServiceCentersPage() {
    return (
        <div>
            <PageHeader
                title="Service Centers"
                description="View global service center locations and statuses."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search centers..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <Button variant="secondary" className="flex items-center gap-2">
                        <FiFilter /> Filter
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Center Name</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Manager</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DUMMY_CENTERS.map((center) => (
                                <tr key={center.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{center.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                                            {center.company}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                                        <FiMapPin /> {center.location}
                                    </td>
                                    <td className="px-6 py-4">{center.manager}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${center.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                'bg-orange-50 text-orange-700'
                                            }`}>
                                            {center.status}
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
            </div>
        </div>
    );
}
