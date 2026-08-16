"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Table from "@/components/UI/Table";
import StatCard from "@/components/dashboard/StatCard";
import { FiActivity, FiClock, FiSearch, FiFilter, FiDownload, FiCreditCard, FiBell, FiSlash, FiFileText, FiCheckCircle, FiTrendingUp, FiX, FiExternalLink, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useDashboardData } from "@/context/DashboardDataContext";
import { updateSubscriptionStatus, getSubscriptionBillingHistory } from "@/lib/api";
import { toast } from "react-hot-toast";
import Button from "@/components/UI/Button";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton } from "@mui/material";

interface BillingRecord {
    id: string;
    date: string;
    amount: string;
    status: 'Paid' | 'Failed' | 'Pending';
    method: string;
}



export default function SubscriptionsPage() {
    const { subscriptionsData, analyticsData, refreshAll } = useDashboardData();
    const [selectedSub, setSelectedSub] = useState<any | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
    const [isBillingLoading, setIsBillingLoading] = useState(false);
    const [totalPaid, setTotalPaid] = useState(0);
    const [lastPaymentDate, setLastPaymentDate] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredSubs = (subscriptionsData || []).filter((sub: any) => {
        const q = searchQuery.toLowerCase();
        return (
            (sub.companyName || "").toLowerCase().includes(q) ||
            (sub.id || "").toLowerCase().includes(q) ||
            (sub.ownerName || "").toLowerCase().includes(q) ||
            (sub.plan?.name || "").toLowerCase().includes(q) ||
            (sub.planType || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.ceil(filteredSubs.length / pageSize);
    const paginatedSubs = filteredSubs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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





    const openBillingHistory = async (sub: any) => {
        setSelectedSub(sub);
        setIsHistoryModalOpen(true);
        setIsBillingLoading(true);
        setBillingHistory([]);
        try {
            const data = await getSubscriptionBillingHistory(sub.id);
            const formattedData = data.map((item: any) => ({
                id: item.invoiceId,
                date: new Date(item.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                amount: `Rs. ${item.amount.toLocaleString()}`,
                status: item.status,
                method: item.method
            }));
            setBillingHistory(formattedData);
            
            const total = data.reduce((sum: number, item: any) => sum + item.amount, 0);
            setTotalPaid(total);
            
            if (data.length > 0) {
                setLastPaymentDate(new Date(data[0].paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
            } else {
                setLastPaymentDate(null);
            }
        } catch (error) {
            toast.error("Failed to load billing history");
        } finally {
            setIsBillingLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!billingHistory || billingHistory.length === 0) {
            toast.error("No billing data to export");
            return;
        }
        
        const headers = ["Invoice ID", "Date", "Amount", "Status", "Payment Method"];
        
        const csvRows = [
            headers.join(","),
            ...billingHistory.map(row => 
                [row.id, `"${row.date}"`, `"${row.amount}"`, row.status, `"${row.method}"`].join(",")
            )
        ];
        
        const csvContent = csvRows.join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `billing-history-${selectedSub?.companyName?.replace(/\s+/g, '-').toLowerCase() || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("CSV exported successfully");
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
            accessor: (row: any) => {
                const isActive = row.status === 'PREMIUM_ACTIVE' || row.status === 'TRIAL_ACTIVE' || row.status === 'ACTIVE';
                const displayStatus = (row.status || 'UNKNOWN').replace('_', ' ');
                return (
                    <div className="flex items-center h-full">
                        <span className={`inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full text-xs font-bold border min-w-28 ${
                            isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {displayStatus}
                        </span>
                    </div>
                );
            },
            cellClassName: "align-middle text-center"
        },
        {
            header: "Auto-Renew",
            accessor: (row: any) => {
                const isActive = row.status === 'PREMIUM_ACTIVE' || row.status === 'TRIAL_ACTIVE' || row.status === 'ACTIVE';
                return (
                    <div className="flex items-center justify-center h-full">
                        {isActive ?
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 min-w-20">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span>On</span>
                            </div> :
                            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 min-w-20">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                <span>Off</span>
                            </div>}
                    </div>
                );
            },
            cellClassName: "align-middle text-center"
        },
        {
            header: "Actions",
            accessor: (row: any) => (
                <div className="flex items-center justify-center h-full">
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    data={paginatedSubs}
                    keyField="id"
                />
            </div>

            {/* Pagination Controls */}
            {filteredSubs.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4">
                    <div className="text-xs font-bold text-slate-500">
                        Showing {Math.min(filteredSubs.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filteredSubs.length, currentPage * pageSize)} of {filteredSubs.length} subscriptions
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                        >
                            <FiChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-bold text-slate-700">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                        >
                            <FiChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            </div>

            {/* Billing History MUI Dialog */}
            <Dialog 
                open={Boolean(isHistoryModalOpen && selectedSub)} 
                onClose={() => setIsHistoryModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '1.5rem', overflow: 'hidden' } }}
            >
                {selectedSub && (
                    <>
                        <DialogTitle sx={{ p: 3, px: 4, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <FiFileText className="text-2xl" />
                                </div>
                                <div>
                                    <Typography variant="h6" fontWeight="bold" color="#0f172a">Billing History</Typography>
                                    <Typography variant="caption" color="text.secondary">{selectedSub.companyName} • {selectedSub.plan?.name || selectedSub.planType} Plan</Typography>
                                </div>
                            </div>
                            <IconButton onClick={() => setIsHistoryModalOpen(false)} size="small">
                                <FiX className="text-xl" />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                                    <p className={`text-sm font-bold flex items-center gap-1.5 ${
                                        selectedSub.status === 'PREMIUM_ACTIVE' || selectedSub.status === 'ACTIVE' 
                                            ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        <span className={`w-2 h-2 rounded-full ${
                                            selectedSub.status === 'PREMIUM_ACTIVE' || selectedSub.status === 'ACTIVE'
                                                ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                        }`}></span>
                                        {(selectedSub.status || 'UNKNOWN').replace('_', ' ')}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {totalPaid > 0 ? `Rs. ${totalPaid.toLocaleString()}` : 'Rs. 0'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Payment</p>
                                    <p className="text-sm font-bold text-slate-800">
                                        {lastPaymentDate || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                {isBillingLoading ? (
                                    <div className="p-8 text-center text-slate-500 font-medium">Loading billing history...</div>
                                ) : billingHistory.length > 0 ? (
                                    <Table
                                        columns={billingColumns}
                                        data={billingHistory}
                                        keyField="id"
                                    />
                                ) : (
                                    <div className="p-8 text-center text-slate-500 font-medium">No billing history available.</div>
                                )}
                            </div>
                        </DialogContent>

                        <DialogActions sx={{ p: 3, px: 4, bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">Showing last 12 months record.</Typography>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={handleExportCSV} className="px-4 py-2">
                                    Export CSV
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsHistoryModalOpen(false)}
                                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800"
                                >
                                    Done
                                </Button>
                            </div>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
}
