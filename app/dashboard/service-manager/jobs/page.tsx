"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiFilter } from "react-icons/fi";

const DUMMY_JOBS = [
    { id: "JB-001", customer: "David Wilson", vehicle: "Toyota Camry", technician: "John Doe", status: "In Progress", due: "Today, 4:00 PM" },
    { id: "JB-002", customer: "Grace Lee", vehicle: "Honda Civic", technician: "Jane Smith", status: "Waiting Parts", due: "Dec 26, 2024" },
    { id: "JB-004", customer: "Jane Roe", vehicle: "Tesla Model 3", technician: "Mike Ross", status: "Completed", due: "Yesterday" },
];

export default function ServiceJobsPage() {
    return (
        <div>
            <PageHeader
                title="Job Management"
                description="Track and update active service jobs at your branch."
                action={
                    <Button>
                        + Create Job Card
                    </Button>
                }
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
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
                                <th className="px-6 py-4">Job ID</th>
                                <th className="px-6 py-4">Vehicle</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Technician</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DUMMY_JOBS.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{job.id}</td>
                                    <td className="px-6 py-4">{job.vehicle}</td>
                                    <td className="px-6 py-4">{job.customer}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                        {job.technician}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{job.due}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${job.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                job.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {job.status}
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
