"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiFilter, FiExternalLink } from "react-icons/fi";

const DUMMY_COMPANIES = [
    { id: 1, name: "AutoFix Pro", owner: "Bob Smith", domain: "autofix.fixzone.com", plan: "Enterprise", centers: 12, status: "Active" },
    { id: 2, name: "Speedy Service", owner: "Charlie Brown", domain: "speedy.fixzone.com", plan: "Pro", centers: 5, status: "Active" },
    { id: 3, name: "Luxury Cars Hub", owner: "Eve Davis", domain: "luxury.fixzone.com", plan: "Basic", centers: 1, status: "Trial" },
    { id: 4, name: "MotoMenders", owner: "George Harris", domain: "moto.fixzone.com", plan: "Pro", centers: 3, status: "Active" },
    { id: 5, name: "QuickFix Garage", owner: "Ivy Jones", domain: "quickfix.fixzone.com", plan: "Basic", centers: 1, status: "Suspended" },
];

export default function CompaniesPage() {
    return (
        <div>
            <PageHeader
                title="Companies (Tenants)"
                description="Manage registered service center companies and their subscriptions."
                action={
                    <Button>
                        + Onboard Company
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
                            placeholder="Search companies..."
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
                                <th className="px-6 py-4">Company Name</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Domain</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Centers</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DUMMY_COMPANIES.map((company) => (
                                <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                                                {company.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-slate-900">{company.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-200"></div>
                                        {company.owner}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href="#" className="flex items-center gap-1 text-primary hover:underline">
                                            {company.domain} <FiExternalLink className="text-xs" />
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${company.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                company.plan === 'Pro' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}>
                                            {company.plan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{company.centers}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${company.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                company.status === 'Trial' ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-red-50 text-red-700'
                                            }`}>
                                            {company.status}
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
