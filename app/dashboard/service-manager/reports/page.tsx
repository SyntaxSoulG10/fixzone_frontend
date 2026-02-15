"use client";

import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { useState } from "react";
import { FiPlus, FiList, FiFileText, FiTrash2 } from "react-icons/fi";

export default function ServiceReportsPage() {
    const [view, setView] = useState<"list" | "create-report" | "generate-invoice">("list");
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        revenue: "",
        incompleteServices: "",
        vehiclesServiced: "",
        summary: ""
    });

    // Invoice state
    const [invoiceBookingId, setInvoiceBookingId] = useState("");
    const [invoiceItems, setInvoiceItems] = useState<{ name: string; price: string }[]>([
        { name: "", price: "" }
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("New Report Data:", formData);
        alert("Report Created! (Check console for data)");
        setView("list");
        setFormData({
            date: new Date().toISOString().split('T')[0],
            revenue: "",
            incompleteServices: "",
            vehiclesServiced: "",
            summary: ""
        });
    };

    // Invoice handlers
    const addInvoiceItem = () => {
        setInvoiceItems(prev => [...prev, { name: "", price: "" }]);
    };

    const removeInvoiceItem = (index: number) => {
        setInvoiceItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateInvoiceItem = (index: number, field: "name" | "price", value: string) => {
        setInvoiceItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const invoiceTotal = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

    const handleGenerateInvoice = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Invoice Data:", { bookingId: invoiceBookingId, items: invoiceItems, total: invoiceTotal });
        alert("Invoice Generated! (Check console for data)");
        setView("list");
        setInvoiceBookingId("");
        setInvoiceItems([{ name: "", price: "" }]);
    };

    // Mock data for last 3 days
    const DAILY_REPORTS = [
        {
            id: 1,
            date: "jan 14, 2026",
            incompleteServices: 0,
            metrics: {
                vehiclesServiced: 12,
                revenue: 93500.00,
            },
            summary: "Busy day with high volume of routine maintenance."
        },
        {
            id: 2,
            date: "jan 13, 2026",
            incompleteServices: 2,
            metrics: {
                vehiclesServiced: 6,
                revenue: 52100.00,
            },
            summary: "Moderate traffic. Two major repairs completed."
        },
        {
            id: 3,
            date: "jan 12, 2026",
            incompleteServices: 0,
            metrics: {
                vehiclesServiced: 10,
                revenue: 82800.00,
            },
            summary: "Steady flow of customers. All lanes operational."
        }
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Reports Management</h1>

            {/* Customer Invoice Report - always visible in list view */}
            {view === "list" && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
                    <h2 className="text-lg  text-slate-900">Customer Invoice Report</h2>
                    <Button
                        variant="primary"
                        className="flex items-center gap-2"
                        onClick={() => setView("generate-invoice")}
                    >
                        <FiFileText /> Generate Invoice
                    </Button>
                </div>
            )}

            {/* Daily Final Reports - same style card, only in list view */}
            {view === "list" ? (
                <>
                    <div className="flex justify-between items-center bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
                        <h2 className="text-lg text-slate-900">Daily Final Report</h2>
                        <Button
                            variant="primary"
                            className="flex items-center gap-1"
                            onClick={() => setView("create-report")}
                        >
                            <FiPlus /> Create Today Report
                        </Button>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Last 3 Days Reports</h3>
                    <div className="space-y-6">
                        {DAILY_REPORTS.map((report) => (
                            <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{report.date}</h3>
                                        <p className="text-sm text-slate-500">
                                            Incomplete Services: <span className={`font-medium ${report.incompleteServices > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {report.incompleteServices}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-center px-6 border-l border-r border-slate-100">
                                        <span className="block text-xl font-bold text-slate-800">{report.metrics.vehiclesServiced}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Vehicles</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold text-slate-900">Rs {report.metrics.revenue.toLocaleString()}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wide">Total Revenue</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-1">Daily Summary</h4>
                                    <p className="text-slate-600 text-sm">{report.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
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
                        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h2 className="text-lg font-bold text-slate-900">Generate Invoice</h2>
                                <p className="text-slate-500 text-sm mt-1">Enter the booking ID and any additional parts or services.</p>
                            </div>
                            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-6">
                                {/* Booking ID */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Booking ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. BK-1001"
                                        required
                                        value={invoiceBookingId}
                                        onChange={(e) => setInvoiceBookingId(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                {/* Additional Parts / Services */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-700">Additional Parts & Services</label>
                                    {invoiceItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                placeholder="Part / Service name"
                                                required
                                                value={item.name}
                                                onChange={(e) => updateInvoiceItem(index, "name", e.target.value)}
                                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price (Rs)"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={item.price}
                                                onChange={(e) => updateInvoiceItem(index, "price", e.target.value)}
                                                className="w-36 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            {invoiceItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeInvoiceItem(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addInvoiceItem}
                                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                                    >
                                        <FiPlus /> Add Item
                                    </button>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Total</span>
                                    <span className="text-2xl font-bold text-slate-900">Rs {invoiceTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                {/* Actions */}
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
                                        Generate Invoice
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
