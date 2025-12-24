"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiMail, FiPhone } from "react-icons/fi";

const DUMMY_CUSTOMERS = [
    { id: 1, name: "David Wilson", email: "david@gmail.com", phone: "+1 555-0101", visits: 12, lastVisit: "Dec 10, 2024" },
    { id: 2, name: "Grace Lee", email: "grace@gmail.com", phone: "+1 555-0102", visits: 5, lastVisit: "Nov 22, 2024" },
];

export default function ServiceCustomersPage() {
    return (
        <div>
            <PageHeader
                title="Customer Database"
                description="View customer details and history."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Total Visits</th>
                                <th className="px-6 py-4">Last Visit</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DUMMY_CUSTOMERS.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs space-y-1">
                                            <span className="flex items-center gap-1"><FiMail className="text-slate-400" /> {customer.email}</span>
                                            <span className="flex items-center gap-1"><FiPhone className="text-slate-400" /> {customer.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{customer.visits}</td>
                                    <td className="px-6 py-4 text-slate-500">{customer.lastVisit}</td>
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
