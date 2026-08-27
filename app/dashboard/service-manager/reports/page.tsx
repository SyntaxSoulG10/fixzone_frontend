"use client";

import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { useState, useEffect, Suspense, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FiPlus, FiList, FiFileText, FiTrash2, FiSearch, FiPrinter, FiCheckCircle, FiAlertCircle, FiClock, FiX, FiCheck } from "react-icons/fi";
import APP_CONFIG from "@/config";
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography } from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import { useDashboardData } from "@/context/DashboardDataContext";
import InvoiceDocument from "@/components/invoices/InvoiceDocument";
import { printInvoiceElement } from "@/utils/printInvoice";

// DTO Interfaces based on backend
interface BookingResponseDTO {
    bookingId: string;
    centerId: string;
    customerId: string;
    estimatedCost: number;
    bookingFee?: number;
    bookingFeePaid?: boolean;
    serviceCenterName?: string;
    centerAddress?: string;
    contactPhone?: string;
    packageName?: string;
    bookingDate?: string;
    status?: string;
    customerName?: string;
    vehicleName?: string;
    plateNumber?: string;
    specialRequest?: string;
    vehicleLabel?: string;
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
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Loading reports...</div>}>
            <ServiceReportsContent />
        </Suspense>
    );
}

function ServiceReportsContent() {
    const { centersData, bookingsData, customersData, refreshBookings, refreshInvoices } = useDashboardData();
    const searchParams = useSearchParams();
    const [view, setView] = useState<"list" | "create-report" | "generate-invoice">("list");
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const currentCenter = centersData && centersData.length > 0 ? centersData[0] : null;
    const managerCenterId = currentCenter?.centerId || currentCenter?.id;
    const managerCompanyCode = currentCenter?.companyCode || currentCenter?.ownerCode || "FIX001";

    const getInvoiceCustomerName = useCallback((inv: any) => {
        if (inv.customerName) return inv.customerName;
        const b = bookingsData?.find((b: any) => b.bookingId === inv.bookingId || b.id === inv.bookingId);
        if (b && (b.customerName || b.customer)) return b.customerName || b.customer;
        const c = customersData?.find((c: any) => c.userId === inv.issuedToCustomerId || c.id === inv.issuedToCustomerId);
        if (c && (c.fullName || c.name)) return c.fullName || c.name;
        return "Customer " + (inv.issuedToCustomerId ? inv.issuedToCustomerId.substring(0, 6) : "");
    }, [bookingsData, customersData]);

    const completedBookings = useMemo(() => {
        if (!bookingsData) return [];
        return bookingsData.filter((b: any) => b.status === "COMPLETED");
    }, [bookingsData]);

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
    const [savedInvoiceModal, setSavedInvoiceModal] = useState<{ open: boolean; invoiceId: string; customer: string; total: number; bookingId: string } | null>(null);
    
    const [invoiceItems, setInvoiceItems] = useState<{ name: string; price: string }[]>([
        { name: "", price: "" }
    ]);
    const [customBasePrice, setCustomBasePrice] = useState<string>("");
    const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
    const [discountValue, setDiscountValue] = useState<string>("");

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
            const targetUrl = managerCenterId 
                ? `${APP_CONFIG.API_BASE_URL}/api/invoices/center/${managerCenterId}`
                : `${APP_CONFIG.API_BASE_URL}/api/invoices`;
            const res = await fetch(targetUrl, {
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
        if (view === "list" || view === "generate-invoice") {
            fetchRecentInvoices();
        }
        if (view === "list") {
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

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const reportPayload = {
                revenue: Number(formData.revenue) || 0,
                incompleteServices: Number(formData.incompleteServices) || 0,
                vehiclesServiced: Number(formData.vehiclesServiced) || 0,
                summary: formData.summary || ""
            };

            const payload = {
                name: `Daily Operations Report - ${formData.date}`,
                type: "DAILY_OPERATIONS",
                format: "JSON",
                fileContentBase64: JSON.stringify(reportPayload)
            };

            const token = localStorage.getItem("token");
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

    const getBookingMeta = (b: any) => {
        if (!b) return { customer: 'Customer', vehicle: 'Vehicle', vehicleNumber: '', service: 'Service' };
        let customer = b.customerName || (b.customerId ? `Customer ${b.customerId.toString().substring(0, 6)}` : 'Customer');
        let vehicle = b.vehicleName || (b.vehicleLabel ? b.vehicleLabel.split(" - ")[0] : (b.vehicleId ? `Vehicle ${b.vehicleId.toString().substring(0, 6)}` : 'Vehicle'));
        let vehicleNumber = b.plateNumber || (b.vehicleLabel && b.vehicleLabel.includes(" - ") ? b.vehicleLabel.split(" - ")[1] : "");
        let service = b.packageName || 'Standard Service';

        if (b.specialRequest && b.specialRequest.startsWith("Customer: ")) {
            try {
                const cMatch = b.specialRequest.match(/Customer:\s*([^,]+)/);
                if (cMatch && cMatch[1].trim()) customer = cMatch[1].trim();
                const vMatch = b.specialRequest.match(/Vehicle:\s*([^,]+)/);
                if (vMatch && vMatch[1].trim()) vehicle = vMatch[1].trim();
                const vnMatch = b.specialRequest.match(/Vehicle Number:\s*([^,]+)/);
                if (vnMatch && vnMatch[1].trim()) vehicleNumber = vnMatch[1].trim();
                const sMatch = b.specialRequest.match(/Service:\s*([^,]+)/);
                if (sMatch && sMatch[1].trim()) service = sMatch[1].trim();
            } catch(e) {}
        }
        return { customer, vehicle, vehicleNumber, service };
    };

    // Invoice handlers
    const fetchBookingDetails = useCallback(async (targetId?: string) => {
        const id = (targetId || invoiceBookingId || "").trim();
        if (!id) {
            setFetchError("Please enter a Booking ID.");
            return;
        }
        if (id.length < 6) {
            setFetchError("Please enter a valid Booking Reference or UUID.");
            return;
        }
        setIsFetchingBooking(true);
        setFetchError("");
        setBookingDetails(null);
        
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/bookings/${id}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (!res.ok) {
                if (res.status === 404) throw new Error(`No booking found matching reference "${id}".`);
                if (res.status === 400) throw new Error("Invalid Booking ID format. Please enter a valid UUID reference.");
                throw new Error("Failed to fetch booking details from database.");
            }
            const data: BookingResponseDTO = await res.json();
            setBookingDetails(data);
            setCustomBasePrice(data.estimatedCost ? data.estimatedCost.toString() : "0");
            setInvoiceBookingId(id);
        } catch (err: any) {
            setFetchError(err.message || "An error occurred while retrieving booking details.");
        } finally {
            setIsFetchingBooking(false);
        }
    }, [invoiceBookingId]);

    // Listen to URL search parameters for direct navigation from dashboard
    useEffect(() => {
        const action = searchParams?.get("action");
        const bookingId = searchParams?.get("bookingId");
        if (action === "generate-invoice" || bookingId) {
            setView("generate-invoice");
            if (bookingId) {
                setInvoiceBookingId(bookingId);
                fetchBookingDetails(bookingId);
            }
        }
    }, [searchParams, fetchBookingDetails]);

    const addInvoiceItem = () => {
        setInvoiceItems(prev => [...prev, { name: "", price: "" }]);
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateInvoiceItem = (index: number, field: "name" | "price", value: string) => {
        setInvoiceItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    // Robust QA calculations
    const rawBasePriceNum = parseFloat(customBasePrice);
    const isBasePriceNegative = customBasePrice.trim().startsWith("-") || rawBasePriceNum < 0;
    const effectiveBasePrice = (isNaN(rawBasePriceNum) || isBasePriceNegative) ? 0 : rawBasePriceNum;
    const isBasePriceModified = bookingDetails ? (effectiveBasePrice !== (bookingDetails.estimatedCost || 0)) : false;

    const hasNegativeItemPrice = useMemo(() => {
        return invoiceItems.some(item => item.price.trim() !== "" && (parseFloat(item.price) < 0 || item.price.trim().startsWith("-")));
    }, [invoiceItems]);

    const validAdditionalItems = useMemo(() => 
        invoiceItems.filter(item => item.name.trim() !== "" && !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0),
        [invoiceItems]
    );
    const additionalItemsTotal = useMemo(() => 
        validAdditionalItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
        [validAdditionalItems]
    );
    const subtotal = effectiveBasePrice + additionalItemsTotal;

    const rawDiscountNum = parseFloat(discountValue) || 0;
    const isDiscountNegative = discountValue.trim().startsWith("-") || rawDiscountNum < 0;
    const isDiscountPercentExceeded = discountType === "percentage" && rawDiscountNum > 100;
    const isDiscountAmountExceeded = discountType === "fixed" && rawDiscountNum > subtotal;
    const isDiscountInvalid = isDiscountNegative || isDiscountPercentExceeded || isDiscountAmountExceeded;

    const safeDiscountAmount = useMemo(() => {
        if (isDiscountNegative || !discountValue.trim()) return 0;
        if (discountType === "percentage") {
            const pct = Math.min(Math.max(0, rawDiscountNum), 100);
            return (subtotal * pct) / 100;
        } else {
            return Math.min(Math.max(0, rawDiscountNum), subtotal);
        }
    }, [discountType, rawDiscountNum, discountValue, subtotal, isDiscountNegative]);

    const safeDiscount = safeDiscountAmount;
    const totalAfterDiscount = Math.max(0, subtotal - safeDiscount);
    const advancePaid = (bookingDetails?.bookingFeePaid && bookingDetails?.bookingFee) ? bookingDetails.bookingFee : 0;
    const balanceDue = Math.max(0, totalAfterDiscount - advancePaid);
    const taxAmount = 0; // Tax 0%

    // Stable preview number (no impure random on re-render)
    const previewInvoiceNo = useMemo(() => {
        if (!bookingDetails?.bookingId) return 'INV-DRAFT';
        return `INV-${bookingDetails.bookingId.substring(0, 8).toUpperCase()}`;
    }, [bookingDetails?.bookingId]);

    // Check duplicate invoice
    const existingInvoice = useMemo(() => {
        if (!bookingDetails?.bookingId) return null;
        return recentInvoices.find(inv => inv.bookingId === bookingDetails.bookingId);
    }, [bookingDetails?.bookingId, recentInvoices]);

    // Direct, reliable print mechanism without popup blocker
    const handlePrint = () => {
        const printed = printInvoiceElement("printable-invoice", `Invoice - ${bookingDetails?.bookingId?.substring(0, 8) || 'Draft'}`);
        if (!printed) {
            showSnackbar("Invoice content not found.", "warning");
        }
    };

    const handleGenerateInvoice = async () => {
        if (!bookingDetails) {
            showSnackbar("Please fetch booking details first.", "warning");
            return;
        }

        if (isBasePriceNegative) {
            showSnackbar("Base service package price cannot be negative.", "warning");
            return;
        }

        if (hasNegativeItemPrice) {
            showSnackbar("Item prices cannot be negative.", "warning");
            return;
        }

        if (isDiscountInvalid) {
            showSnackbar("Please correct the discount before saving.", "warning");
            return;
        }

        setIsSubmitting(true);
        
        const invoicePayload: InvoiceRequestDTO = {
            companyCode: managerCompanyCode || "FIX001",
            centerId: bookingDetails.centerId || managerCenterId,
            bookingId: bookingDetails.bookingId,
            issuedToCustomerId: bookingDetails.customerId,
            subtotal: Number(subtotal.toFixed(2)),
            tax: Number(taxAmount.toFixed(2)),
            discount: Number(safeDiscount.toFixed(2)),
            total: Number(balanceDue.toFixed(2)),
            status: "ISSUED"
        };

        try {
            const token = localStorage.getItem("token");
            const existingId = existingInvoice?.invoiceId || existingInvoice?.id;
            const targetUrl = existingId 
                ? `${APP_CONFIG.API_BASE_URL}/api/invoices/${existingId}`
                : `${APP_CONFIG.API_BASE_URL}/api/invoices`;
            const method = existingId ? "PUT" : "POST";

            const res = await fetch(targetUrl, {
                method: method,
                headers: { 
                    "Content-Type": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {})
                },
                body: JSON.stringify(invoicePayload)
            });

            if (!res.ok) {
                throw new Error("Failed to generate invoice");
            }
            
            const savedData = await res.json();
            const meta = getBookingMeta(bookingDetails);

            showSnackbar("Invoice successfully generated and issued!", "success");
            fetchRecentInvoices();
            if (refreshInvoices) await refreshInvoices();
            if (refreshBookings) await refreshBookings();
            setSavedInvoiceModal({
                open: true,
                invoiceId: savedData.invoiceId || previewInvoiceNo,
                customer: meta.customer,
                total: balanceDue,
                bookingId: bookingDetails.bookingId
            });
        } catch (error) {
            console.error("Error generating invoice:", error);
            showSnackbar("Failed to generate invoice. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkAsPaid = async (inv: any) => {
        const targetId = inv.invoiceId || inv.id;
        if (!targetId) return;
        try {
            const token = localStorage.getItem("token");
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            };

            // 1. Try dedicated endpoint
            let res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/invoices/${targetId}/status?status=PAID`, {
                method: "PUT",
                headers
            });

            // 2. Fallback to standard PUT /api/invoices/{targetId} if dedicated endpoint not reloaded
            if (!res.ok) {
                const updatedPayload = {
                    companyCode: inv.companyCode || managerCompanyCode || "FIX001",
                    centerId: inv.centerId || managerCenterId,
                    bookingId: inv.bookingId,
                    issuedToCustomerId: inv.issuedToCustomerId,
                    subtotal: inv.subtotal,
                    tax: inv.tax,
                    discount: inv.discount,
                    total: inv.total,
                    status: "PAID"
                };
                res = await fetch(`${APP_CONFIG.API_BASE_URL}/api/invoices/${targetId}`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify(updatedPayload)
                });
            }

            // 3. Update associated booking status to PAID
            if (inv.bookingId) {
                await fetch(`${APP_CONFIG.API_BASE_URL}/api/bookings/${inv.bookingId}/status?status=PAID`, {
                    method: "PUT",
                    headers
                }).catch((err) => console.warn("Booking status update failed", err));
            }

            if (res.ok) {
                showSnackbar("Invoice marked as PAID successfully!", "success");
                fetchRecentInvoices();
                if (refreshInvoices) await refreshInvoices();
                if (refreshBookings) await refreshBookings();
            } else {
                showSnackbar("Failed to mark invoice as paid.", "error");
            }
        } catch (error) {
            console.error("Error marking invoice as paid:", error);
            showSnackbar("Failed to mark invoice as paid.", "error");
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
                    const custName = getInvoiceCustomerName(inv).toLowerCase();
                    const matchesSearch = (
                        (inv.invoiceId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                        (inv.bookingId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                        custName.includes(searchQuery.toLowerCase())
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
                    <div className="grid grid-cols-1 gap-6">
                        {/* Report Action */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg flex-shrink-0">
                                    <FiList className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl text-slate-900 font-bold mb-1">Daily Operations Report</h2>
                                    <p className="text-sm text-slate-500">Submit the end-of-day summary, including revenue and completed services.</p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full md:w-auto flex justify-center items-center gap-2 !bg-orange-600 !hover:bg-orange-700 !text-white border-0 px-6 py-2.5"
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
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[420px] justify-between">
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
                                    <div className="flex-1">
                                        <table className="w-full text-left border-collapse relative">
                                            <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                                                <tr>
                                                    <th className="py-3 px-4 font-medium">Customer & Invoice</th>
                                                    <th className="py-3 px-4 font-medium">Status</th>
                                                    <th className="py-3 px-4 font-medium text-right">Amount</th>
                                                    <th className="py-3 px-4 font-medium text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-700 text-sm divide-y divide-slate-100">
                                                {currentInvoices.map((inv: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                        <td className="py-3.5 px-4">
                                                            <span className="font-bold text-slate-900 block text-sm">
                                                                {getInvoiceCustomerName(inv)}
                                                            </span>
                                                            <span className="text-[11px] font-mono text-slate-500">
                                                                ID: {inv.invoiceId?.substring(0, 8).toUpperCase() || "N/A"} • Booking: {inv.bookingId?.substring(0, 8)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3.5 px-4">
                                                            {String(inv.status).toUpperCase() === 'PAID' ? (
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                                                                    <FiCheckCircle className="w-3 h-3 text-emerald-600" /> Paid
                                                                </span>
                                                            ) : (
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 inline-flex items-center gap-1">
                                                                    <FiClock className="w-3 h-3 text-amber-600" /> Issued
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                                                            Rs {inv.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3.5 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {String(inv.status).toUpperCase() === 'PAID' ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            setInvoiceBookingId(inv.bookingId);
                                                                            fetchBookingDetails(inv.bookingId);
                                                                            setView("generate-invoice");
                                                                        }}
                                                                        className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 rounded-lg font-semibold text-xs transition-all inline-flex items-center gap-1.5 shadow-xs"
                                                                        title="View & Edit Invoice"
                                                                    >
                                                                        <FiPrinter className="w-3.5 h-3.5 text-slate-500" /> View Invoice
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleMarkAsPaid(inv)}
                                                                            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                                                                            title="Mark this invoice as PAID"
                                                                        >
                                                                            <FiCheck className="w-3.5 h-3.5" /> Mark Paid
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setInvoiceBookingId(inv.bookingId);
                                                                                fetchBookingDetails(inv.bookingId);
                                                                                setView("generate-invoice");
                                                                            }}
                                                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                                                            title="View & Edit Invoice"
                                                                        >
                                                                            <FiPrinter className="w-4 h-4" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
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
                                                    className={`px-2 py-1 text-xs rounded border ${currentPage === number ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'border-slate-300 text-slate-700 hover:bg-white bg-white shadow-sm'}`}
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
                            <div className="space-y-4">
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
                            <form onSubmit={handleReportSubmit} className="p-6 space-y-6">
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
                                        className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm"
                                    >
                                        Create Report
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Generate Invoice View */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:grid-cols-1 items-start">
                            
                            {/* LEFT SIDE: Form Controls (Hidden when printing) */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden flex flex-col">
                                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
                                    <div className="p-2.5 bg-orange-100 text-orange-600 rounded-lg shadow-sm">
                                        <FiFileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">Invoice Configuration</h2>
                                        <p className="text-slate-500 text-sm mt-0.5">Fetch booking details and configure the final bill.</p>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-8 bg-white">
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
                                                    onClick={() => fetchBookingDetails()}
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

                                            {!bookingDetails && completedBookings.length > 0 && (
                                                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
                                                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                                                        <span>Quick Select: Completed Bookings</span>
                                                        <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                                            {completedBookings.length} available
                                                        </span>
                                                    </p>
                                                    <div className="space-y-2">
                                                        {completedBookings.slice(0, 5).map((b: any) => (
                                                            <button
                                                                key={b.bookingId || b.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    const targetId = b.bookingId || b.id;
                                                                    setInvoiceBookingId(targetId);
                                                                    fetchBookingDetails(targetId);
                                                                }}
                                                                className="w-full p-2.5 bg-white hover:bg-orange-50/80 border border-slate-200 hover:border-orange-400 rounded-lg text-left text-xs flex items-center justify-between transition-all shadow-xs group"
                                                            >
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-slate-900 group-hover:text-orange-950 text-sm">
                                                                        {b.customerName || `Customer ${(b.customerId || '').substring(0,6)}`}
                                                                    </span>
                                                                    <span className="text-xs text-slate-600 font-medium">{b.packageName || 'Service Package'}</span>
                                                                    <span className="text-[11px] text-slate-400 font-mono">Ref: {(b.bookingId || b.id).substring(0, 8)} • Date: {b.bookingDate || 'Today'}</span>
                                                                </div>
                                                                <span className="text-orange-600 group-hover:text-orange-700 font-bold text-xs shrink-0 pl-3 flex items-center gap-1">
                                                                    Select & Fill →
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {existingInvoice && (
                                                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
                                                    <div className="flex items-center gap-2">
                                                        <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                                        <span>Invoice <strong>{existingInvoice.invoiceId?.substring(0, 8).toUpperCase()}</strong> issued. Adjusting details below will update this existing invoice.</span>
                                                    </div>
                                                    <button 
                                                        onClick={handlePrint}
                                                        className="px-3 py-1.5 bg-amber-700 text-white font-semibold text-xs rounded-lg hover:bg-amber-800 transition-colors shadow-xs shrink-0 flex items-center gap-1"
                                                    >
                                                        <FiPrinter className="w-3.5 h-3.5" /> Print Receipt
                                                    </button>
                                                </div>
                                            )}

                                            {bookingDetails && (() => {
                                                const meta = getBookingMeta(bookingDetails);
                                                return (
                                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm transition-all animate-fade-in relative overflow-hidden space-y-3">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                                            <FiCheckCircle className="w-5 h-5 text-emerald-600" /> Booking Verified
                                                        </div>
                                                        <span className="text-xs font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-200">
                                                            {bookingDetails.bookingId?.substring(0, 8)}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm pt-1 border-t border-emerald-100">
                                                        <div>
                                                            <p className="text-emerald-700/80 text-xs font-semibold">Customer</p>
                                                            <p className="text-emerald-950 font-bold mt-0.5">{meta.customer}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-emerald-700/80 text-xs font-semibold">Vehicle</p>
                                                            <p className="text-emerald-950 font-bold mt-0.5">{meta.vehicle} {meta.vehicleNumber ? `(${meta.vehicleNumber})` : ''}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-emerald-700/80 text-xs font-semibold">Service Package</p>
                                                            <p className="text-emerald-950 font-semibold mt-0.5">{meta.service}</p>
                                                        </div>
                                                        <div className="col-span-2 pt-2 border-t border-emerald-200/60">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                                                                    <span>Base Service Package Price</span>
                                                                    {isBasePriceModified && (
                                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-extrabold rounded-full border border-orange-200">
                                                                            Customized for Vehicle Specs
                                                                        </span>
                                                                    )}
                                                                </label>
                                                                <span className="text-[11px] text-slate-500">Booked Base: Rs {(bookingDetails.estimatedCost || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={customBasePrice}
                                                                    onChange={(e) => setCustomBasePrice(e.target.value)}
                                                                    className={`w-full pl-9 pr-3 py-1.5 bg-white border text-sm font-bold rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                                                        isBasePriceNegative ? "border-red-400 focus:ring-red-500/20 text-red-700" : "border-emerald-300 focus:ring-emerald-500/20 text-slate-900"
                                                                    }`}
                                                                />
                                                            </div>
                                                            {isBasePriceNegative && (
                                                                <p className="text-[11px] font-semibold text-red-600 mt-1">Base service price cannot be negative.</p>
                                                            )}
                                                        </div>
                                                        {bookingDetails.bookingFeePaid && (
                                                            <div className="col-span-2 pt-1 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                                                                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                                                                    <FiCheck className="w-3.5 h-3.5 text-emerald-600" /> Prepaid Advance Booking Fee
                                                                </span>
                                                                <span className="font-mono font-bold text-emerald-900">- Rs {(bookingDetails.bookingFee || 0).toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                );
                                            })()}
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
                                                {invoiceItems.map((item, index) => {
                                                    const isItemNegative = item.price.trim().startsWith("-") || parseFloat(item.price) < 0;
                                                    return (
                                                    <div key={index} className="space-y-1">
                                                        <div className={`flex items-center gap-3 bg-white p-2 border rounded-lg shadow-sm transition-colors ${
                                                            isItemNegative ? "border-red-400 bg-red-50/20" : "border-slate-200 hover:border-orange-300"
                                                        }`}>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Brake Pads, Oil Filter"
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
                                                        {isItemNegative && (
                                                            <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 pl-1">
                                                                <FiAlertCircle className="w-3 h-3" /> Price cannot be negative.
                                                            </p>
                                                        )}
                                                    </div>
                                                    );
                                                })}
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
                                            Adjustments & Discount
                                        </h3>
                                        <div className="pl-10">
                                            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label className="text-sm font-bold text-slate-800 block">Apply Discount</label>
                                                        <p className="text-xs text-slate-500 mt-0.5">Deduct percentage or fixed amount from total.</p>
                                                    </div>
                                                    {/* Discount Mode Switcher */}
                                                    <div className="flex items-center bg-slate-200/80 p-1 rounded-lg">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDiscountType("percentage")}
                                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                                                discountType === "percentage" 
                                                                    ? "bg-white text-orange-600 shadow-xs" 
                                                                    : "text-slate-600 hover:text-slate-900"
                                                            }`}
                                                        >
                                                            % Percentage
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDiscountType("fixed")}
                                                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                                                                discountType === "fixed" 
                                                                    ? "bg-white text-orange-600 shadow-xs" 
                                                                    : "text-slate-600 hover:text-slate-900"
                                                            }`}
                                                        >
                                                            Rs Fixed
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Preset chips for Percentage */}
                                                {discountType === "percentage" && (
                                                    <div className="flex items-center gap-1.5 pt-1">
                                                        <span className="text-[11px] font-medium text-slate-400 mr-1">Quick Presets:</span>
                                                        {[0, 5, 10, 15, 20].map((pct) => (
                                                            <button
                                                                key={pct}
                                                                type="button"
                                                                onClick={() => setDiscountValue(pct === 0 ? "" : pct.toString())}
                                                                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
                                                                    discountValue === pct.toString() || (pct === 0 && !discountValue)
                                                                        ? "bg-orange-100 border-orange-300 text-orange-700 font-bold"
                                                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                                                }`}
                                                            >
                                                                {pct}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                                            {discountType === "percentage" ? "%" : "Rs"}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={discountType === "percentage" ? "100" : undefined}
                                                            placeholder={discountType === "percentage" ? "e.g. 10" : "0.00"}
                                                            value={discountValue}
                                                            onChange={(e) => setDiscountValue(e.target.value)}
                                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all shadow-sm font-semibold text-slate-800 ${
                                                                isDiscountInvalid ? "border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/30" : "border-slate-200 focus:ring-orange-500/20 focus:border-orange-500"
                                                            }`}
                                                        />
                                                    </div>

                                                    {/* Calculations & Error detection */}
                                                    {isDiscountNegative && (
                                                        <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1 animate-fade-in">
                                                            <FiAlertCircle className="w-3.5 h-3.5" /> Discount cannot be negative.
                                                        </p>
                                                    )}
                                                    {isDiscountPercentExceeded && (
                                                        <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1 animate-fade-in">
                                                            <FiAlertCircle className="w-3.5 h-3.5" /> Discount percentage cannot exceed 100%.
                                                        </p>
                                                    )}
                                                    {isDiscountAmountExceeded && (
                                                        <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1 animate-fade-in">
                                                            <FiAlertCircle className="w-3.5 h-3.5" /> Discount cannot exceed subtotal (Rs {subtotal.toLocaleString()}).
                                                        </p>
                                                    )}

                                                    {/* Helper text showing calculated Rs amount */}
                                                    {!isDiscountInvalid && safeDiscount > 0 && (
                                                        <div className="pt-2 flex items-center justify-between text-xs text-orange-700 font-medium">
                                                            <span>Discount Applied:</span>
                                                            <span className="font-bold font-mono">- Rs {safeDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE: Live Invoice Preview */}
                            <div className="flex flex-col gap-4 sticky top-6">
                                {/* Actions */}
                                <div className="flex justify-end gap-3 print:hidden">
                                    <Button variant="secondary" className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50" onClick={handlePrint}>
                                        <FiPrinter /> Print
                                    </Button>
                                    <button 
                                        onClick={handleGenerateInvoice}
                                        disabled={isSubmitting || !bookingDetails || isDiscountInvalid || hasNegativeItemPrice || isBasePriceNegative}
                                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                        <FiFileText /> {isSubmitting ? "Saving..." : existingInvoice ? "Update Invoice" : "Save Invoice"}
                                    </button>
                                </div>

                                {/* Printable Invoice Card */}
                                {(() => {
                                    const meta = getBookingMeta(bookingDetails);
                                    const lineItems = [
                                        {
                                            name: bookingDetails?.packageName || 'Custom Service Package',
                                            description: `Base maintenance and labor cost ${isBasePriceModified ? '(Customized for vehicle specifications)' : ''}`.trim(),
                                            price: effectiveBasePrice,
                                        },
                                        ...validAdditionalItems.map(item => ({
                                            name: item.name,
                                            description: "Additional part / service",
                                            price: parseFloat(item.price || "0"),
                                        }))
                                    ];

                                    return (
                                        <InvoiceDocument
                                            id="printable-invoice"
                                            invoiceNumber={previewInvoiceNo}
                                            issuedDate={new Date()}
                                            status={existingInvoice?.status || "ISSUED"}
                                            serviceCenter={{
                                                name: bookingDetails?.serviceCenterName || "FIXZONE AUTO",
                                                address: bookingDetails?.centerAddress || "123 Service Road, Auto City",
                                                email: "contact@fixzone.lk",
                                                phone: bookingDetails?.contactPhone || "+94 (11) 234-5678",
                                            }}
                                            billTo={{
                                                customerName: meta.customer,
                                                vehicle: meta.vehicle,
                                                vehicleNumber: meta.vehicleNumber,
                                                customerId: bookingDetails?.customerId,
                                            }}
                                            serviceDetails={{
                                                centerName: bookingDetails?.serviceCenterName || 'FixZone Auto Center',
                                                bookingRef: bookingDetails?.bookingId,
                                            }}
                                            lineItems={lineItems}
                                            subtotal={subtotal}
                                            discount={safeDiscount}
                                            discountLabel={discountType === "percentage" && rawDiscountNum > 0 ? `Special Discount (${rawDiscountNum}%)` : "Special Discount"}
                                            advancePaid={advancePaid}
                                            tax={taxAmount}
                                            total={balanceDue}
                                        />
                                    );
                                })()}
                            </div>
                        </div>

                    )}
                </>
            )}

            {/* Success Modal after Generating Invoice */}
            <Dialog
                open={Boolean(savedInvoiceModal?.open)}
                onClose={() => setSavedInvoiceModal(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: '1.25rem', p: 1 } }}
            >
                <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiCheckCircle className="w-8 h-8" />
                    </div>
                    <Typography variant="h6" fontWeight="bold" color="#0f172a">Invoice Generated!</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {savedInvoiceModal?.invoiceId} successfully created for {savedInvoiceModal?.customer}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 2 }}>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Amount Due</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">Rs {savedInvoiceModal?.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <button
                        onClick={() => {
                            setSavedInvoiceModal(null);
                            handlePrint();
                        }}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                        <FiPrinter className="w-4 h-4" /> Print Customer Receipt
                    </button>
                    <button
                        onClick={() => {
                            setSavedInvoiceModal(null);
                            setView("list");
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <FiList className="w-4 h-4" /> View All Invoices
                    </button>
                </DialogActions>
            </Dialog>

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
