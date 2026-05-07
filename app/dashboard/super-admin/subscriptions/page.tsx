"use client";

import { useState } from "react";
import Link from "next/link";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiActivity, FiClock, FiSearch, FiFilter, FiDownload, FiCreditCard, FiBell, FiSlash, FiFileText, FiCheckCircle, FiTrendingUp, FiX, FiExternalLink } from "react-icons/fi";
import { useDashboardData } from "@/context/DashboardDataContext";
import { updateSubscriptionStatus } from "@/lib/api";
import { toast } from "react-hot-toast";
import Button from "@/components/UI/Button";

interface BillingRecord {
    id: string;
    date: string;
    amount: string;
    status: 'Paid' | 'Failed' | 'Pending';
    method: string;
}

const MOCK_BILLING_HISTORY: Record<string, BillingRecord[]> = {
    "SUB-001": [
        { id: "INV-2024-001", date: "Jan 15, 2024", amount: "Rs. 19,900", status: "Paid", method: "Visa **** 4242" },
        { id: "INV-2023-012", date: "Dec 15, 2023", amount: "Rs. 19,900", status: "Paid", method: "Visa **** 4242" },
        { id: "INV-2023-011", date: "Nov 15, 2023", amount: "Rs. 19,900", status: "Paid", method: "Visa **** 4242" },
    ],
    "SUB-002": [
        { id: "INV-2024-002", date: "Feb 01, 2024", amount: "Rs. 9,900", status: "Paid", method: "MasterCard **** 8888" },
        { id: "INV-2024-001", date: "Jan 01, 2024", amount: "Rs. 9,900", status: "Paid", method: "MasterCard **** 8888" },
    ],
    "SUB-003": [
        { id: "INV-2024-001", date: "Dec 10, 2023", amount: "Rs. 19,900", status: "Paid", method: "Visa **** 1111" },
    ]
};

export default function SubscriptionsPage() {
    const { subscriptionsData, analyticsData, refreshAll } = useDashboardData();
    const [selectedSub, setSelectedSub] = useState<any | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    console.log("Subscriptions Page Data:", { subscriptionsData, analyticsData });

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setIsUpdating(true);
        try {
            await updateSubscriptionStatus(id, newStatus);
            toast.success(`Subscription ${newStatus.toLowerCase()} successfully`);
            refreshAll(); // Refresh data to show changes
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };




    const handleNotify = (id: string) => {
        // Feature to be implemented later
        toast(`Notification feature coming soon for ${id}`);
    };





    const openBillingHistory = (sub: any) => {
        setSelectedSub(sub);
        setIsHistoryModalOpen(true);
    };

    const columns = [
        {
            header: "Plan Details",
            accessor: (row: any) => (
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${row.plan?.name === 'Premium' ? 'bg-orange-50 border-orange-100 text-orange-600' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                        <FiActivity className="text-lg" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-800 text-sm leading-snug">{row.companyName}</div>
                            {row.plan?.isPopular && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase rounded-full tracking-wide">PRO</span>}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">#{row.id?.substring(0, 8)}</div>
                    </div>
                </div>
            ),
            cellClassName: "align-middle"
        },
        {
            header: "Billing Cycle",
            accessor: (row: any) => (
                <div className="flex flex-col gap-1">
                    <span className={`text-sm font-bold ${row.plan?.name === 'Premium' ? 'text-slate-800' : 'text-slate-600'}`}>
                        {row.plan?.name || row.planType} Plan
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
            header: "Owner",
            accessor: (row: any) => <span className="font-medium text-slate-700 text-sm">{row.ownerName}</span>,
            cellClassName: "align-middle"
        },
        {
            header: "Price",
            accessor: (row: any) => (
                <span className="font-bold text-slate-800 text-sm tracking-tight">
                    {row.plan?.price ? `Rs. ${row.plan.price.toLocaleString()}` : `Rs. ${row.price?.toLocaleString() || '0'}`}
                </span>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Next Invoice",
            accessor: (row: any) => (
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
            accessor: (row: any) => (
                <div className="flex items-center h-full">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border min-w-24 ${row.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${row.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        {row.status}
                    </span>
                </div>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Auto-Renew",
            accessor: (row: any) => (
                <div className="flex items-center h-full">
                    {row.status === 'ACTIVE' ?
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
            accessor: (row: any) => (
                <div className="flex items-center gap-2 h-full">
                    <button
                        onClick={() => handleNotify(row.ownerId)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 bg-slate-50"
                        title="Notify Owner"
                    >
                        <FiBell className="w-4 h-4" />
                    </button>

                    {row.status === 'ACTIVE' ? (
                        <button
                            onClick={() => {alert("Are you sure you want to suspend this plan?");
                                handleStatusUpdate(row.id, 'SUSPENDED')}}
                            disabled={isUpdating}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 bg-slate-50 disabled:opacity-50"
                            title="Suspend Plan"
                        >
                            <FiSlash className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={() => {alert("Are you sure you want to reactivate this plan?");
                                handleStatusUpdate(row.id, 'ACTIVE')}}
                            disabled={isUpdating}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100 bg-slate-50 disabled:opacity-50"
                            title="Reactivate Plan"
                        >
                            <FiCheckCircle className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={() => openBillingHistory(row)}
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

    const billingColumns = [
        {
            header: "Invoice ID",
            accessor: (row: BillingRecord) => <span className="font-mono text-xs font-bold text-slate-700">{row.id}</span>,
            cellClassName: "align-middle"
        },
        {
            header: "Date",
            accessor: (row: BillingRecord) => <span className="text-slate-600">{row.date}</span>,
            cellClassName: "align-middle"
        },
        {
            header: "Amount",
            accessor: (row: BillingRecord) => <span className="font-bold text-slate-900">{row.amount}</span>,
            cellClassName: "align-middle"
        },
        {
            header: "Status",
            accessor: (row: BillingRecord) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${row.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' :
                        row.status === 'Failed' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                    {row.status}
                </span>
            ),
            cellClassName: "align-middle text-center"
        },
        {
            header: "Action",
            accessor: (row: BillingRecord) => (
                <button className="text-slate-400 hover:text-orange-500 transition-colors p-1" title="Download Invoice">
                    <FiDownload className="w-4 h-4" />
                </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Active Subscriptions"
                    count={analyticsData?.activeSubscriptions || "0"}
                    icon={<FiActivity />}
                    color="success"
                    percentage={{
                        color: (analyticsData?.subscriptionChange || "").startsWith("+") ? "success" : "danger",
                        amount: analyticsData?.subscriptionChange || "0%",
                        label: "vs last month"
                    }}
                />
                <StatCard
                    title="Platform Revenue"
                    count={`Rs. ${analyticsData?.totalPlatformRevenue?.toLocaleString() || "0"}`}
                    icon={<FiTrendingUp />}
                    color="primary"
                    percentage={{
                        color: (analyticsData?.revenueChange || "").startsWith("+") ? "success" : "danger",
                        amount: analyticsData?.revenueChange || "0%",
                        label: "vs last month"
                    }}
                />
            </div>

            <div className="space-y-4">
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
                        data={subscriptionsData}
                        keyField="id"
                    />
                </div>
            </div>

            {/* Billing History Modal */}
            {isHistoryModalOpen && selectedSub && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FiFileText className="text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Billing History</h3>
                                    <p className="text-sm text-slate-500">{selectedSub.stationName} • {selectedSub.plan} Plan</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="mb-6 grid grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                    <p className="text-sm font-bold text-green-600 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Active
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                                    <p className="text-sm font-bold text-slate-800">Rs. 59,700</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Payment</p>
                                    <p className="text-sm font-bold text-slate-800">Jan 15, 2024</p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <Table
                                    columns={billingColumns}
                                    data={MOCK_BILLING_HISTORY[selectedSub.id] || []}
                                    keyField="id"
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                            <p className="text-xs text-slate-400 italic">Showing last 12 months record.</p>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-all">
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => setIsHistoryModalOpen(false)}
                                    className="px-6 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-md"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
