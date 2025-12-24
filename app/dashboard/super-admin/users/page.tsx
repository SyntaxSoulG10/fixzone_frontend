"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiFilter } from "react-icons/fi";
import { MOCK_USERS } from "@/data/mockData";

export default function UsersPage() {
    return (
        <div>
            <PageHeader
                title="User Management"
                description="Manage access and roles for all users across the platform."
                action={
                    <Button>
                        + Add User
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
                            placeholder="Search users..."
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
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Last Login</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_USERS.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${user.role === 'Super Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            user.role === 'Company Owner' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                user.role === 'Service Manager' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-50 text-green-700' :
                                            user.status === 'Inactive' ? 'bg-slate-100 text-slate-600' :
                                                'bg-red-50 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' :
                                                user.status === 'Inactive' ? 'bg-slate-400' :
                                                    'bg-red-500'
                                                }`}></span>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{user.lastLogin}</td>
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

                {/* Pagination Mock */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 1 to 7 of 24 entries</span>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="px-3 py-1" disabled>Previous</Button>
                        <Button variant="secondary" className="px-3 py-1">Next</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
