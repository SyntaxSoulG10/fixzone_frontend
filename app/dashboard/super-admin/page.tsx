"use client";

import { useState } from "react";
import { FiUsers, FiBriefcase, FiDollarSign, FiUserCheck, FiSearch, FiX, FiDownload, FiCheckCircle } from "react-icons/fi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Mock Data
const DATA = {
    weekly: {
        total: 26826150,
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [35, 62, 45, 85, 55, 95, 68], // Percentages
        amounts: [130200, 230640, 167400, 316200, 204600, 353400, 252960] // Actual amounts
    },
    monthly: {
        total: 104520300,
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        values: [65, 45, 80, 55],
        amounts: [26826150, 18571000, 33012000, 22698000]
    }
};

const SUMMARY_METRICS = [
    { label: "Total Revenue", value: "Rs 26.8M", change: "+15.3% growth" },
    { label: "New Stations", value: "12", change: "Last 30 days" },
    { label: "Active Subs", value: "234", change: "+5.7% growth" },
];

const TOP_STATIONS = [
    { name: "Colombo Central Hub", revenue: "Rs 4.2M", rating: "4.9 ★" },
    { name: "Kandy Express Service", revenue: "Rs 3.8M", rating: "4.8 ★" },
    { name: "Galle Motors", revenue: "Rs 3.1M", rating: "4.7 ★" },
];

export default function SuperAdminDashboard() {
    const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const currentData = DATA[view];

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // 1. Title Section
        doc.setFillColor(234, 88, 12); // Orange header bar
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("System Performance Report", 20, 25);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 20, 25, { align: "right" });

        // 2. Summary Metrics Section
        let yPos = 60;
        doc.setTextColor(51, 65, 85); // Slate-700
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Key Metrics Summary", 20, yPos);

        yPos += 15;
        const boxWidth = (pageWidth - 40 - 10) / 3; // 40 margin, 10 gap

        SUMMARY_METRICS.forEach((metric, i) => {
            const x = 20 + (boxWidth + 5) * i;

            // Box
            doc.setDrawColor(226, 232, 240); // Slate-200 border
            doc.setFillColor(248, 250, 252); // Slate-50 bg
            doc.roundedRect(x, yPos, boxWidth, 35, 3, 3, 'FD');

            // Metric Text
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139); // Slate-500
            doc.text(metric.label.toUpperCase(), x + 10, yPos + 10);

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 41, 59); // Slate-800
            doc.text(metric.value, x + 10, yPos + 20);

            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(22, 163, 74); // Green-600
            doc.text(metric.change, x + 10, yPos + 28);
        });

        // 3. Top Stations Table
        yPos += 55;
        doc.setFontSize(14);
        doc.setTextColor(51, 65, 85);
        doc.text("Top Performing Stations", 20, yPos);

        autoTable(doc, {
            startY: yPos + 10,
            head: [['Station Name', 'Revenue', 'Rating']],
            body: TOP_STATIONS.map(s => [s.name, s.revenue, s.rating]),
            theme: 'grid',
            headStyles: { fillColor: [234, 88, 12], textColor: 255 }, // Orange header
            styles: { fontSize: 10, cellPadding: 5 },
            alternateRowStyles: { fillColor: [249, 250, 251] }, // Light gray alternate
        });

        // 4. Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page 1 of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

        doc.save(`${new Date().toISOString().split('T')[0]}_System_Performance_Report.pdf`);
    };

    const handleDownload = () => {
        setIsDownloading(true);
        // Simulate processing delay for better UX
        setTimeout(() => {
            try {
                generatePDF();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (error) {
                console.error("PDF Generation failed:", error);
                alert("Failed to generate PDF. Please try again.");
            } finally {
                setIsDownloading(false);
            }
        }, 1000);
    };

    return (
        <div className="space-y-8 relative">
            {/* Friendly Welcome Banner (Gradient) */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 to-orange-900 p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome back, Super Admin!</h1>
                        <p className="text-orange-100/80">Here&apos;s what&apos;s happening with your network today.</p>
                    </div>

                    {/* Integrated Search */}
                    <div className="w-full md:max-w-md relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FiSearch className="text-white/50" />
                        </div>
                        <input
                            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all backdrop-blur-sm"
                            placeholder="Search users, stations, or subscriptions..."
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <kbd className="hidden md:inline-block px-2 py-0.5 bg-white/10 rounded text-[10px] text-white/50 border border-white/10">⌘K</kbd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiBriefcase className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Service Stations</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">248</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+8.2% this month</span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiDollarSign className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Monthly Revenue</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">Rs 26,826,000</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+15.3% this month</span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-orange-100 group cursor-pointer text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-600 transition-colors duration-300 rounded-full flex items-center justify-center text-orange-600 group-hover:text-white mb-3">
                        <FiUserCheck className="text-xl" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-500 group-hover:text-slate-700">Active Subscriptions</h3>
                    <div className="mt-2 mb-1 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">234</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+5.7% this month</span>
                </div>
            </div>

            {/* Main Graph Area */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Subscription Revenue Performance</h3>
                        <p className="text-sm text-slate-500">Track your {view} subscription revenue</p>
                    </div>
                    <button
                        onClick={() => setIsReportOpen(true)}
                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 border border-orange-200 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        View Report
                    </button>
                </div>

                {/* The Graph Card */}
                <div className="bg-linear-to-br from-[#FF8C60] to-[#E86C4A] rounded-2xl p-8 text-white shadow-xl shadow-orange-200 relative overflow-hidden group">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">Subscription Revenue</p>
                            <h2 className="text-4xl font-bold font-mono tracking-tight">Rs {currentData.total.toLocaleString()}</h2>
                        </div>
                        <div className="flex bg-black/10 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                            <button
                                onClick={() => setView('weekly')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'weekly' ? 'bg-white text-orange-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setView('monthly')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'monthly' ? 'bg-white text-orange-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>

                    <div className="relative h-48 flex items-end justify-between gap-4 px-2 z-10">
                        {/* Bars */}
                        {currentData.values.map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-3 group/bar w-full h-full justify-end">
                                <div className="relative w-full h-full flex items-end justify-center">
                                    <div
                                        className="w-full max-w-3 md:max-w-10 bg-white/30 hover:bg-white rounded-t-lg transition-all duration-300 ease-out cursor-pointer relative group-hover/bar:scale-y-105 origin-bottom"
                                        style={{ height: `${h}%` }}
                                    >
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-xl transition-all transform translate-y-2 group-hover/bar:translate-y-0 pointer-events-none whitespace-nowrap z-20">
                                            Rs {currentData.amounts[i].toLocaleString()}
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">
                                    {currentData.labels[i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {isReportOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">System Performance Report</h3>
                                <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setIsReportOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Key Metrics Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                {SUMMARY_METRICS.map((metric, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'bg-orange-50 border-orange-100' : i === 1 ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                                        <p className={`text-xs font-semibold uppercase ${i === 0 ? 'text-orange-600' : i === 1 ? 'text-blue-600' : 'text-purple-600'}`}>{metric.label}</p>
                                        <p className="text-xl font-bold text-slate-800 mt-1">{metric.value}</p>
                                        <p className={`text-xs font-medium mt-1 ${i === 1 ? 'text-slate-500' : 'text-green-600'}`}>{metric.change}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Top Performing Stations Table */}
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 text-sm">Top Performing Stations</h4>
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Station Name</th>
                                                <th className="px-4 py-3 font-medium">Revenue</th>
                                                <th className="px-4 py-3 font-medium">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {TOP_STATIONS.map((station, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-3 font-medium text-slate-700">{station.name}</td>
                                                    <td className="px-4 py-3 text-slate-600">{station.revenue}</td>
                                                    <td className="px-4 py-3 text-green-600 font-bold">{station.rating}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsReportOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading || showSuccess}
                                className={`px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm flex items-center gap-2 transition-all ${isDownloading ? 'bg-slate-400 cursor-not-allowed' :
                                        showSuccess ? 'bg-green-500 hover:bg-green-600' :
                                            'bg-orange-600 hover:bg-orange-700 hover:shadow-md'
                                    }`}
                            >
                                {isDownloading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Generating...
                                    </>
                                ) : showSuccess ? (
                                    <>
                                        <FiCheckCircle /> Downloaded!
                                    </>
                                ) : (
                                    <>
                                        <FiDownload /> Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
