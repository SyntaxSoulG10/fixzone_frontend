"use client";

import { MOCK_SUBSCRIPTIONS } from "@/data/mockData";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiActivity, FiClock, FiDollarSign, FiSearch, FiFilter, FiDownload, FiCreditCard, FiAlertCircle } from "react-icons/fi";
import { Subscription } from "@/types";
import { HiDotsVertical } from "react-icons/hi";
import Button from "@/components/UI/Button";

export default function SubscriptionsPage() {
    const columns = [
        {
            header: "Plan Details",
            accessor: (row: Subscription) => (
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                        row.plan === 'Premium' ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : 
                        'bg-white border border-slate-200 text-slate-500'
                    }`}>
                        <FiActivity className="text-xl" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <div className="font-bold text-slate-900">{row.stationName}</div>
                             {row.plan === 'Premium' && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded tracking-wide">PRO</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">#{row.id.substring(0, 8)}</div>
                    </div>
                </div>
            )
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
            )
        },
        {
            header: "Revenue",
            accessor: (row: Subscription) => <span className="font-bold text-slate-900 text-base tracking-tight">{row.price}</span>
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
            )
        },
        {
            header: "Status",
            accessor: (row: Subscription) => (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    row.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                    'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {row.status}
                </span>
            )
        },
        {
            header: "Auto-Renew",
            accessor: (row: Subscription) => (
                 row.autoRenew ? 
                 <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>On</span>
                 </div> : 
                 <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    <span>Off</span>
                 </div>
            )
        },
        {
            header: "More",
            accessor: () => <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><HiDotsVertical /></button>
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Subscriptions"
                    count="234"
                    icon={<FiActivity />}
                    color="success"
                />
                <StatCard
                    title="Expiring Soon"
                    count="12"
                    icon={<FiAlertCircle />}
                    color="warning" 
                />
                <StatCard
                    title="Monthly Revenue"
                    count="$46,566.00"
                    icon={<FiDollarSign />}
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
                        <Button className="shadow-lg shadow-orange-200">
                            Create Plan
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <Table
                        columns={columns}
                        data={MOCK_SUBSCRIPTIONS}
                        keyField="id"
                    />
                </div>
            </div>
        </div>
    );
}
