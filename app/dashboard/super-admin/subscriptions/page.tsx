"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_SUBSCRIPTIONS } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiActivity, FiClock, FiSearch, FiFilter, FiDownload, FiCreditCard, FiBell, FiSlash, FiFileText, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { Subscription } from "@/types";
import Button from "@/components/UI/Button";

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS.slice(0, 3)); // Keep only 3 sample data

    const handleCancelPlan = (id: string) => {
        setSubscriptions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, status: 'Cancelled', autoRenew: false } : sub
        ));
    };

    const handleActivatePlan = (id: string) => {
        setSubscriptions(prev => prev.map(sub =>
            sub.id === id ? { ...sub, status: 'Active', autoRenew: true } : sub
        ));
    };

    const handleNotify = (id: string) => {
        alert(`Notification sent to subscriber ${id}`);
    };

    const columns = [
        {
            header: "Plan Details",
            accessor: (row: Subscription) => (
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${row.plan === 'Premium' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                        <FiActivity className="text-lg" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-800 text-sm leading-snug">{row.stationName}</div>
                            {row.plan === 'Premium' && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded-full tracking-wide">PRO</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">#{row.id.substring(0, 8)}</div>
                    </div>
                </div>
            ),
            cellClassName: "align-middle"
        },
        {
            header: "Billing Cycle",
            accessor: (row: Subscription) => (
                <div className="flex flex-col gap-1">
                    <span className={`text-sm font-bold ${row.plan === 'Premium' ? 'text-slate-800' : 'text-slate-600'}`}>
                        {row.plan} Plan
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FiCreditCard className="text-slate-400" />
                        <span>Monthly billing</span>
                    </div>
                </div>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Revenue",
            accessor: (row: Subscription) => <span className="font-bold text-slate-800 text-sm tracking-tight">{row.price}</span>,
            cellClassName: "align-middle text-center"
        },
        {
            header: "Next Invoice",
            accessor: (row: Subscription) => (
                <div className="text-xs group cursor-help">
                    <div className="flex items-center gap-1.5 mb-1">
                        <FiClock className="text-orange-500" />
                        <span className="font-semibold text-slate-700">{row.nextBilling}</span>
                    </div>
                    <div className="text-slate-400 pl-4">Started {row.startDate}</div>
                </div>
            ),
            cellClassName: "align-middle"
        },
        {
            header: "Status",
            accessor: (row: Subscription) => (
                <div className="flex items-center h-full">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border min-w-24 ${row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${row.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        {row.status}
                    </span>
                </div>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Auto-Renew",
            accessor: (row: Subscription) => (
                <div className="flex items-center h-full">
                    {row.autoRenew ?
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 min-w-20">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span>On</span>
                        </div> :
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 min-w-20">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                            <span>Off</span>
                        </div>}
                </div>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Actions",
            accessor: (row: Subscription) => (
                <div className="flex items-center gap-2 h-full">
                    {/* Notify User */}
                    <button
                        onClick={() => handleNotify(row.id)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 bg-slate-50"
                        title="Notify User"
                    >
                        <FiBell className="w-4 h-4" />
                    </button>

                    {/* Cancel/Activate Plan */}
                    {row.status === 'Active' ? (
                        <button
                            onClick={() => handleCancelPlan(row.id)}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 bg-slate-50"
                            title="Cancel Plan"
                        >
                            <FiSlash className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => handleActivatePlan(row.id)}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100 bg-slate-50"
                            title="Reactivate Plan"
                        >
                            <FiCheckCircle className="w-4 h-4" />
                        </button>
                    )}

                    {/* Billing History */}
                    <button
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200 bg-slate-50"
                        title="See Billing History"
                    >
                        <FiFileText className="w-4 h-4" />
                    </button>
                </div>
            ),
            cellClassName: "align-middle text-center"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscriptions</h1>
                <p className="text-slate-500 mt-1">Track current subscribers and billing history.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Active Subscriptions"
                    count="234"
                    icon={<FiActivity />}
                    color="success"
                />
                <StatCard
                    title="Total Revenue"
                    count="Rs. 1,245,890"
                    icon={<FiTrendingUp />}
                    color="primary"
                />
            </div>

            {/* Table Section */}
            <div className="space-y-4">
                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between gap-4 items-end md:items-center">
                    <div className="w-full md:w-auto flex-1 flex gap-2">
                        <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:shadow-sm hover:border-orange-300 transition-all bg-white hover:-translate-y-0.5">
                            <FiFilter />
                        </button>
                        <div className="relative flex-1 md:max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiSearch className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by station or plan ID..."
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:-translate-y-0.5">
                            <FiDownload /> Export
                        </button>
                        <Link href="/dashboard/super-admin/subscription-plans">
                            <Button className="shadow-lg shadow-orange-200">
                                Create Plan
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Table
                        columns={columns}
                        data={subscriptions}
                        keyField="id"
                    />
                </div>
            </div>
        </div>
    );
}
