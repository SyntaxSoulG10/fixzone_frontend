"use client";

import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { useState, useEffect } from "react";
import { FiPlus, FiList, FiFileText, FiTrash2, FiSearch, FiPrinter, FiCheckCircle, FiAlertCircle, FiClock, FiX } from "react-icons/fi";
import APP_CONFIG from "@/config";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";

// DTO Interfaces based on backend
interface BookingResponseDTO {
    bookingId: string;
    centerId: string;
    customerId: string;
    estimatedCost: number;
    serviceCenterName: string;
    packageName: string;
    bookingDate: string;
    status: string;
}

interface InvoiceRequestDTO {
    companyCode: string;
    centerId: string;
    bookingId: string;
    issuedToCustomerId: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: string;
}

export default function ServiceReportsPage() {
    const [view, setView] = useState<"list" | "create-report" | "generate-invoice">("list");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        revenue: "",
        incompleteServices: "",
        vehiclesServiced: "",
        summary: ""
    });

    // Invoice state
    const [invoiceBookingId, setInvoiceBookingId] = useState("");
    const [bookingDetails, setBookingDetails] = useState<BookingResponseDTO | null>(null);
    const [isFetchingBooking, setIsFetchingBooking] = useState(false);
    const [fetchError, setFetchError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [invoiceItems, setInvoiceItems] = useState<{ name: string; price: string }[]>([
        { name: "", price: "" }
    ]);
    const [discount, setDiscount] = useState(0);

    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const invoicesPerPage = 5;
    
    // Rich filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [recentReports, setRecentReports] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const fetchRecentInvoices = async () => {
        setIsLoadingInvoices(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/invoices`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                // Sort by newest first
                setRecentInvoices(data.reverse());
            }
        } catch (error) {
            console.error("Error fetching recent invoices:", error);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    const fetchRecentReports = async () => {
        setIsLoadingReports(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/reports`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                const parsedReports = data.map((r: any) => {
                    let metrics = { revenue: 0, vehiclesServiced: 0, incompleteServices: 0, summary: "" };
                    try {
                        if (r.fileContentBase64) {
                            metrics = JSON.parse(r.fileContentBase64);
                        }
                    } catch(e) {}
                    return { ...r, metrics };
                });
                setRecentReports(parsedReports.reverse());
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setIsLoadingReports(false);
        }
    };

    useEffect(() => {
        if (view === "list") {
            fetchRecentInvoices();
            fetchRecentReports();
        }
    }, [view]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const metrics = {
                revenue: parseFloat(formData.revenue),
                vehiclesServiced: parseInt(formData.vehiclesServiced, 10),
                incompleteServices: parseInt(formData.incompleteServices, 10),
                summary: formData.summary
            };
            const payload = {
                name: "Daily Operations Report",
                type: "OPERATIONS",
                date: formData.date,
                size: "0",
                downloadUrl: "",
                fileContentBase64: JSON.stringify(metrics)
            };
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/reports`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showSnackbar("Report Created successfully!", "success");
                setView("list");
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    revenue: "",
                    incompleteServices: "",
                    vehiclesServiced: "",
                    summary: ""
                });
                // Fetch reports again to show the newly added report
                fetchRecentReports();
            } else {
                showSnackbar("Failed to create report.", "error");
            }
        } catch (err) {
            console.error("Error submitting report:", err);
            showSnackbar("Error creating report", "error");
        }
    };

    // Invoice handlers
    const fetchBookingDetails = async () => {
        if (!invoiceBookingId) return;
        setIsFetchingBooking(true);
        setFetchError("");
        setBookingDetails(null);
        
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/bookings/${invoiceBookingId}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!res.ok) {
                throw new Error(res.status === 404 ? "Booking not found" : "Failed to fetch booking details");
            }
            const data: BookingResponseDTO = await res.json();
            setBookingDetails(data);
        } catch (err: any) {
            setFetchError(err.message || "An error occurred");
        } finally {
            setIsFetchingBooking(false);
        }
    };

    const addInvoiceItem = () => {
        setInvoiceItems(prev => [...prev, { name: "", price: "" }]);
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateInvoiceItem = (index: number, field: "name" | "price", value: string) => {
        setInvoiceItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const estimatedCost = bookingDetails?.estimatedCost || 0;
    const additionalItemsTotal = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const subtotal = estimatedCost + additionalItemsTotal;
    const taxAmount = 0; // Tax removed
    const invoiceTotal = subtotal - discount;

    const handlePrint = () => {
        const printContent = document.getElementById("printable-invoice");
        if (!printContent) {
            showSnackbar("Invoice content not found.", "warning");
            return;
        }
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice - ${bookingDetails?.bookingId || 'Draft'}</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            @page { 
                                margin: 0; 
                                size: A4 portrait; 
                            }
                            html, body {
                                width: 210mm;
                                height: 297mm;
                                margin: 0;
                                padding: 0;
                                background: white;
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                                font-family: ui-sans-serif, system-ui, sans-serif;
                            }
                            #printable-invoice {
                                width: 100% !important;
                                height: 100% !important;
                                box-sizing: border-box;
                                padding: 15mm 20mm !important;
                                margin: 0 !important;
                                box-shadow: none !important;
                                border-radius: 0 !important;
                                border-top-width: 8px !important;
                                /* Scale down slightly to ensure it fits perfectly */
                                transform: scale(0.95);
                                transform-origin: top center;
                            }
                            /* Prevent page breaks */
                            * {
                                page-break-inside: avoid;
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent.outerHTML}
                        <script>
                            setTimeout(() => {
                                window.print();
                                window.close();
                            }, 800);
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            showSnackbar("Please allow pop-ups to print the invoice.", "warning");
        }
    };

    const handleGenerateInvoice = async () => {
        if (!bookingDetails) {
            showSnackbar("Please fetch booking details first.", "warning");
            return;
        }

        setIsSubmitting(true);
        
        const invoicePayload: InvoiceRequestDTO = {
            companyCode: "FIX001", // Hardcoded or fetch from context
            centerId: bookingDetails.centerId,
            bookingId: bookingDetails.bookingId,
            issuedToCustomerId: bookingDetails.customerId,
            subtotal: subtotal,
            tax: taxAmount,
            discount: discount,
            total: invoiceTotal,
            status: "ISSUED"
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/invoices`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(invoicePayload)
            });

            if (!res.ok) {
                throw new Error("Failed to generate invoice");
            }
            
            showSnackbar("Invoice successfully generated and saved!", "success");
            setView("list"); // Return to list view to see it
        } catch (error) {
            console.error("Error generating invoice:", error);
            showSnackbar("Failed to generate invoice. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Removed Mock DAILY_REPORTS

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Reports Management</h1>

            {/* Customer Invoice Report - always visible in list view */}
            {view === "list" && (() => {
                // 1. Filter the invoices
                const filteredInvoices = recentInvoices.filter(inv => {
                    const matchesSearch = (
                        (inv.invoiceId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                        (inv.bookingId?.toLowerCase() || "").includes(searchQuery.toLowerCase())
                    );
                    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
                    return matchesSearch && matchesStatus;
                });

                // 2. Paginate the filtered results
                const indexOfLastInvoice = currentPage * invoicesPerPage;
                const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
                const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);
                const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);
                
                return (
                <div className="space-y-8">
                    {/* Top Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Invoice Action */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-start space-y-4 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <FiFileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl text-slate-900 font-bold mb-1">Customer Invoices</h2>
                                <p className="text-sm text-slate-500">Generate a new professional invoice for a completed vehicle service.</p>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full flex justify-center items-center gap-2 mt-auto"
                                onClick={() => setView("generate-invoice")}
                            >
                                <FiPlus /> Generate Invoice
                            </Button>
                        </div>

                        {/* Report Action */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-start space-y-4 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                                <FiList className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl text-slate-900 font-bold mb-1">Daily Operations Report</h2>
                                <p className="text-sm text-slate-500">Submit the end-of-day summary, including revenue and completed services.</p>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full flex justify-center items-center gap-2 mt-auto"
                                onClick={() => setView("create-report")}
                            >
                                <FiPlus /> Create Today Report
                            </Button>
                        </div>
                    </div>

                    {/* Side-by-Side History Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Left: Recent Invoices */}
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FiClock className="text-primary" /> Recent Invoices
                            </h3>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col h-[500px]">
                                {/* Rich Filters UI */}
                                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by Invoice or Booking ID..." 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        />
                                    </div>
                                    <select 
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white text-slate-700 font-medium shadow-sm cursor-pointer"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="ISSUED">Issued</option>
                                        <option value="PAID">Paid</option>
                                        <option value="PENDING">Pending</option>
                                    </select>
                                </div>

                                {isLoadingInvoices ? (
                                    <div className="p-8 text-center text-slate-500 my-auto">Loading invoices...</div>
                                ) : filteredInvoices.length > 0 ? (
                                    <div className="overflow-y-auto flex-1">
                                        <table className="w-full text-left border-collapse relative">
                                            <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4 font-medium">Invoice ID</th>
                                                    <th className="py-3 px-4 font-medium">Status</th>
                                                    <th className="py-3 px-4 font-medium text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                                                {currentInvoices.map((inv: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <span className="font-medium text-slate-900 block">
                                                                {inv.invoiceId?.substring(0, 8).toUpperCase() || "N/A"}
                                                            </span>
                                                            <span className="text-xs text-slate-500">Booking: {inv.bookingId?.substring(0, 8)}</span>
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${
                                                                inv.status === 'ISSUED' ? 'bg-blue-100 text-blue-700' :
                                                                inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {inv.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right font-bold text-slate-800">
                                                            Rs {inv.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 my-auto">
                                        {recentInvoices.length === 0 ? "No invoices generated yet." : "No invoices match your filters."}
                                    </div>
                                )}

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 bg-slate-50 mt-auto">
                                        <span className="text-xs text-slate-500">
                                            Showing {indexOfFirstInvoice + 1} to {Math.min(indexOfLastInvoice, filteredInvoices.length)} of {filteredInvoices.length}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className={`px-2 py-1 text-xs rounded border ${currentPage === 1 ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50' : 'border-slate-300 text-slate-700 hover:bg-white bg-white shadow-sm'}`}
                                            >
                                                Prev
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                                <button
                                                    key={number}
                                                    onClick={() => setCurrentPage(number)}
                                                    className={`px-2 py-1 text-xs rounded border ${currentPage === number ? 'bg-primary text-white border-primary shadow-sm' : 'border-slate-300 text-slate-700 hover:bg-white bg-white shadow-sm'}`}
                                                >
                                                    {number}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className={`px-2 py-1 text-xs rounded border ${currentPage === totalPages ? 'border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50' : 'border-slate-300 text-slate-700 hover:bg-white bg-white shadow-sm'}`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Last 3 Days Reports */}
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FiList className="text-emerald-600" /> Past Operations Reports
                            </h3>
                            <div className="space-y-4 overflow-y-auto pr-2 h-[500px]">
                                {isLoadingReports ? (
                                    <div className="text-center text-slate-500 my-auto p-8">Loading reports...</div>
                                ) : recentReports.length > 0 ? recentReports.map((report) => (
                                    <div 
                                        key={report.id} 
                                        onClick={() => setSelectedReport(report)}
                                        className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">{report.date}</h3>
                                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                                    Incomplete: <span className={`font-semibold ${report.metrics.incompleteServices > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {report.metrics.incompleteServices}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-xl font-bold text-emerald-600">Rs {(report.metrics.revenue || 0).toLocaleString()}</span>
                                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{report.metrics.vehiclesServiced} Vehicles</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Daily Summary</h4>
                                            <p className="text-slate-600 text-sm leading-relaxed">{report.metrics.summary}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-slate-500 my-auto p-8">No reports generated yet.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )})()}

            {/* Form Views */}
            {view !== "list" && (
                <>
                    <div className="flex justify-between items-start mb-6">
                        <PageHeader
                            title={view === "create-report" ? "Create Daily Report" : "Generate Invoice"}
                            description={view === "create-report" ? "Submit the daily summary and metrics." : "Create an invoice for a completed service."}
                        />
                        <Button
                            variant="secondary"
                            className="flex items-center gap-2"
                            onClick={() => setView("list")}
                        >
                            <FiList /> Back to Reports
                        </Button>
                    </div>
                    {view === "create-report" ? (
                        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h2 className="text-lg font-bold text-slate-900">New Daily Report</h2>
                                <p className="text-slate-500 text-sm mt-1">Enter today's operational metrics and summary.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            required
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Number of Incomplete Services</label>
                                        <input
                                            type="number"
                                            name="incompleteServices"
                                            placeholder="0"
                                            required
                                            min="0"
                                            value={formData.incompleteServices}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Total Revenue (Rs)</label>
                                        <input
                                            type="text"
                                            name="revenue"
                                            placeholder="0.00"
                                            required
                                            value={formData.revenue}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Total Vehicles Serviced</label>
                                        <input
                                            type="number"
                                            name="vehiclesServiced"
                                            placeholder="0"
                                            required
                                            min="0"
                                            value={formData.vehiclesServiced}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Daily Summary Note</label>
                                    <textarea
                                        name="summary"
                                        rows={4}
                                        placeholder="Brief summary of the day..."
                                        required
                                        value={formData.summary}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setView("list")}
                                        className="px-6 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors shadow-sm"
                                    >
                                        Create Report
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Generate Invoice View */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:grid-cols-1">
                            
                            {/* LEFT SIDE: Form Controls (Hidden when printing) */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden flex flex-col h-[750px]">
                                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
                                    <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg shadow-sm">
                                        <FiFileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Invoice Configuration</h2>
                                        <p className="text-slate-500 text-sm mt-0.5">Fetch booking details and configure the final bill.</p>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-8 flex-1 overflow-y-auto bg-white">
                                    {/* Section 1: Link Booking */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm shadow-sm border border-orange-200">1</span>
                                            Link Booking
                                        </h3>
                                        <div className="pl-10 space-y-4">
                                            <div className="flex gap-3 items-end">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-sm font-medium text-slate-700">Booking ID</label>
                                                    <div className="relative">
                                                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Enter UUID (e.g. 123e4567...)"
                                                            required
                                                            value={invoiceBookingId}
                                                            onChange={(e) => setInvoiceBookingId(e.target.value)}
                                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="secondary" 
                                                    onClick={fetchBookingDetails}
                                                    disabled={isFetchingBooking || !invoiceBookingId}
                                                    className="mb-[2px] flex items-center gap-2 h-[42px]"
                                                >
                                                    {isFetchingBooking ? "Fetching..." : "Fetch Data"}
                                                </Button>
                                            </div>

                                            {fetchError && (
                                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2 shadow-sm animate-fade-in">
                                                    <FiAlertCircle className="mt-0.5 shrink-0" />
                                                    <span>{fetchError}</span>
                                                </div>
                                            )}

                                            {bookingDetails && (
                                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm transition-all animate-fade-in relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                                    <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                                                        <FiCheckCircle className="w-5 h-5 text-emerald-600" /> Booking Verified
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-emerald-700/70 text-xs uppercase font-bold tracking-wide">Service Package</p>
                                                            <p className="text-emerald-950 font-semibold mt-0.5">{bookingDetails.packageName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-emerald-700/70 text-xs uppercase font-bold tracking-wide">Base Cost</p>
                                                            <p className="text-emerald-950 font-semibold mt-0.5">Rs {bookingDetails.estimatedCost.toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-slate-100" />

                                    {/* Section 2: Additional Parts */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm shadow-sm border border-orange-200">2</span>
                                            Additional Parts & Services
                                        </h3>
                                        <div className="pl-10 space-y-3">
                                            <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner">
                                                {invoiceItems.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-3 bg-white p-2 border border-slate-200 rounded-lg shadow-sm hover:border-orange-300 transition-colors">
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Brake Pads, Oil Filter"
                                                            required
                                                            value={item.name}
                                                            onChange={(e) => updateInvoiceItem(index, "name", e.target.value)}
                                                            className="flex-1 px-3 py-1.5 border-none focus:ring-0 focus:outline-none text-sm placeholder-slate-400 font-medium text-slate-700"
                                                        />
                                                        <div className="w-[1px] h-6 bg-slate-200"></div>
                                                        <div className="flex items-center gap-1 w-28 shrink-0">
                                                            <span className="text-slate-400 text-sm font-bold pl-2">Rs</span>
                                                            <input
                                                                type="number"
                                                                placeholder="0.00"
                                                                required
                                                                min="0"
                                                                step="0.01"
                                                                value={item.price}
                                                                onChange={(e) => updateInvoiceItem(index, "price", e.target.value)}
                                                                className="w-full px-2 py-1.5 border-none focus:ring-0 focus:outline-none text-sm font-bold text-slate-800"
                                                            />
                                                        </div>
                                                        {invoiceItems.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeInvoiceItem(index)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
                                                                title="Remove item"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addInvoiceItem}
                                                    className="w-full py-3 flex justify-center items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 hover:border-orange-300 border border-dashed border-slate-300 rounded-lg font-bold transition-all shadow-sm bg-white mt-2"
                                                >
                                                    <FiPlus className="w-4 h-4" /> Add Another Item
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100" />

                                    {/* Section 3: Discount */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-3">
                                            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm shadow-sm border border-orange-200">3</span>
                                            Adjustments
                                        </h3>
                                        <div className="pl-10">
                                            <div className="space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                                <label className="text-sm font-bold text-slate-700">Apply Special Discount</label>
                                                <p className="text-xs text-slate-500 mb-3">Deduct an amount from the final total if applicable.</p>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="0.00"
                                                        value={discount || ""}
                                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm font-semibold text-slate-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE: Live Invoice Preview */}
                            <div className="flex flex-col gap-4">
                                {/* Actions */}
                                <div className="flex justify-end gap-3 print:hidden">
                                    <Button variant="secondary" className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50" onClick={handlePrint}>
                                        <FiPrinter /> Print
                                    </Button>
                                    <button 
                                        onClick={handleGenerateInvoice}
                                        disabled={isSubmitting || !bookingDetails}
                                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                        <FiFileText /> {isSubmitting ? "Saving..." : "Save Invoice"}
                                    </button>
                                </div>

                                {/* Printable Invoice Card */}
                                <div id="printable-invoice" className="bg-white shadow-xl overflow-hidden flex-1 print:shadow-none print:border-none p-8 sm:p-12 relative border-t-8 border-slate-900">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-16 mt-4">
                                        <div className="space-y-1">
                                            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4">Invoice</h1>
                                            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                                <span className="text-slate-500 font-medium">Invoice No.</span>
                                                <span className="text-slate-900 font-bold">INV-{Math.floor(Math.random() * 100000)}</span>
                                                <span className="text-slate-500 font-medium">Date</span>
                                                <span className="text-slate-900 font-bold">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">FIXZONE<span className="text-slate-400 font-normal">AUTO</span></h2>
                                            <p className="text-slate-500 text-sm leading-relaxed">
                                                123 Service Road, Auto City<br/>
                                                contact@fixzone.com<br/>
                                                +1 (555) 123-4567
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bill To */}
                                    <div className="mb-12 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-slate-900 font-bold text-lg mb-1">Customer Details</p>
                                                <p className="text-slate-600 text-sm">ID: <span className="font-medium text-slate-800">{bookingDetails?.customerId?.substring(0, 8) || 'N/A'}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-slate-900 font-bold text-lg mb-1">Service Details</p>
                                                <p className="text-slate-600 text-sm">Center: <span className="font-medium text-slate-800">{bookingDetails?.serviceCenterName || 'N/A'}</span></p>
                                                <p className="text-slate-600 text-sm mt-0.5">Booking Ref: <span className="font-medium text-slate-800">{bookingDetails?.bookingId?.substring(0,8) || 'N/A'}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-900 w-full">Description</th>
                                                    <th className="py-4 px-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b-2 border-slate-900 text-right whitespace-nowrap">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {/* Base Service */}
                                                <tr>
                                                    <td className="py-5 px-2">
                                                        <p className="text-base text-slate-900 font-bold">{bookingDetails?.packageName || 'Custom Service Package'}</p>
                                                        <p className="text-sm text-slate-500 mt-1">Base maintenance and labor cost</p>
                                                    </td>
                                                    <td className="py-5 px-2 text-base text-slate-900 text-right font-bold">
                                                        Rs {(bookingDetails?.estimatedCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                                {/* Additional Items */}
                                                {invoiceItems.filter(i => i.name.trim()).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="py-5 px-2">
                                                            <p className="text-base text-slate-700 font-medium">{item.name}</p>
                                                            <p className="text-sm text-slate-400 mt-0.5">Additional part / service</p>
                                                        </td>
                                                        <td className="py-5 px-2 text-base text-slate-700 text-right font-medium">
                                                            Rs {parseFloat(item.price || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-full max-w-md">
                                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500 font-medium">Subtotal</span>
                                                    <span className="text-slate-800 font-bold">Rs {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                {discount > 0 && (
                                                    <div className="flex justify-between text-sm text-orange-600">
                                                        <span className="font-medium">Special Discount</span>
                                                        <span className="font-bold">- Rs {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                )}
                                                <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between items-center">
                                                    <span className="text-sm font-bold text-slate-900 uppercase tracking-widest">Total Due</span>
                                                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                                                        Rs {invoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Footer */}
                                    <div className="mt-16 pt-8 border-t border-slate-100 text-center">
                                        <p className="text-slate-400 text-sm font-medium">Thank you for choosing FixZone Auto. We appreciate your business!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            {/* Selected Report MUI Dialog */}
            <Dialog
                open={Boolean(selectedReport)}
                onClose={() => setSelectedReport(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '1.25rem', overflow: 'hidden' } }}
            >
                {selectedReport && (
                    <>
                        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, borderBottom: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <div>
                                <Typography variant="h6" fontWeight="bold" color="#0f172a">Operations Report Details</Typography>
                                <Typography variant="caption" color="text.secondary">{selectedReport.name} - {selectedReport.date}</Typography>
                            </div>
                            <IconButton onClick={() => setSelectedReport(null)} size="small">
                                <FiX className="w-5 h-5" />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Total Revenue</p>
                                    <p className="text-2xl font-bold text-emerald-900">Rs {(selectedReport.metrics?.revenue || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Vehicles Serviced</p>
                                    <p className="text-2xl font-bold text-blue-900">{selectedReport.metrics?.vehiclesServiced || 0}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Incomplete Services</p>
                                <p className="text-2xl font-bold text-red-900">{selectedReport.metrics?.incompleteServices || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Daily Summary</p>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap">
                                    {selectedReport.metrics?.summary || "No summary provided."}
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
                            <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <FeedbackSnackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                severity={snackbar.severity}
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
            />
        </div>
    );
}
