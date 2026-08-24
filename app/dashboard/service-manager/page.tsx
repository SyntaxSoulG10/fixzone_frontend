"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import { FiTool, FiClock, FiCalendar, FiCheckCircle, FiPlus, FiMinus, FiLoader, FiFileText, FiCheck, FiPlay } from "react-icons/fi";
import { FaUserCog, FaMoneyBillWave } from "react-icons/fa";
import { useDashboardData } from "../../../context/DashboardDataContext";
import { APP_CONFIG } from "../../../utils/config";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";

export default function ServiceManagerDashboard() {
    const { bookingsData, invoicesData, hasDataInitialized, refreshBookings, refreshInvoices, managersData, refreshAll } = useDashboardData();
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [todaysInvoices, setTodaysInvoices] = useState<any[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);
    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const [hiddenFromActive, setHiddenFromActive] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('hiddenActiveBookings');
        if (saved) setHiddenFromActive(JSON.parse(saved));

        const handleSync = () => {
            if (refreshBookings) refreshBookings();
            if (refreshInvoices) refreshInvoices();
        };

        window.addEventListener("bookingsUpdated", handleSync);
        window.addEventListener("storage", handleSync);
        return () => {
            window.removeEventListener("bookingsUpdated", handleSync);
            window.removeEventListener("storage", handleSync);
        };
    }, [refreshBookings, refreshInvoices]);

    const hideFromActiveList = (id: string) => {
        const updated = [...hiddenFromActive, id];
        setHiddenFromActive(updated);
        localStorage.setItem('hiddenActiveBookings', JSON.stringify(updated));
        setActiveBookings(prev => prev.filter(b => b.bookingId !== id));
    };

    const getBookingDetails = (booking: any) => {
        let customer = booking.customerName || (booking.customerId ? `Customer ${booking.customerId.toString().substring(0,6)}` : 'Customer');
        let vehicle = booking.vehicleName || (booking.vehicleLabel ? booking.vehicleLabel.split(" - ")[0] : (booking.vehicleId ? `Vehicle ${booking.vehicleId.toString().substring(0,6)}` : 'Vehicle'));
        let vehicleNumber = booking.plateNumber || (booking.vehicleLabel && booking.vehicleLabel.includes(" - ") ? booking.vehicleLabel.split(" - ")[1] : "");
        let service = booking.packageName || 'Standard Service';

        // Calculate time range (start - end)
        let startTimeStr = booking.bookingTime ? (booking.bookingTime.length >= 5 ? booking.bookingTime.substring(0, 5) : booking.bookingTime) : "09:00";
        let endTimeStr = "";
        if (booking.endTime) {
            endTimeStr = booking.endTime.length >= 5 ? booking.endTime.substring(0, 5) : booking.endTime;
        } else if (booking.bookingTime) {
            try {
                const [h, m] = booking.bookingTime.split(":").map(Number);
                const duration = booking.estimatedDurationMins || 60;
                const endMinutes = h * 60 + m + duration;
                const endH = Math.floor(endMinutes / 60) % 24;
                const endM = endMinutes % 60;
                endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            } catch(e) {
                endTimeStr = "";
            }
        }
        let timeRange = endTimeStr ? `${startTimeStr} - ${endTimeStr}` : startTimeStr;

        if (booking.specialRequest && booking.specialRequest.startsWith("Customer: ")) {
            try {
                const cMatch = booking.specialRequest.match(/Customer:\s*([^,]+)/);
                if (cMatch && cMatch[1].trim()) customer = cMatch[1].trim();
                const vMatch = booking.specialRequest.match(/Vehicle:\s*([^,]+)/);
                if (vMatch && vMatch[1].trim()) vehicle = vMatch[1].trim();
                const vnMatch = booking.specialRequest.match(/Vehicle Number:\s*([^,]+)/);
                if (vnMatch && vnMatch[1].trim()) vehicleNumber = vnMatch[1].trim();
                const sMatch = booking.specialRequest.match(/Service:\s*([^,]+)/);
                if (sMatch && sMatch[1].trim()) service = sMatch[1].trim();
            } catch(e) {}
        }
        return { customer, vehicle, vehicleNumber, service, timeRange };
    };

    useEffect(() => {
        if (hasDataInitialized) {
            console.log("[Dashboard] bookingsData received:", bookingsData);
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const managerCenterId = managersData?.[0]?.managedCenterId;
            
            // Strictly isolate to manager's center if present
            const centerBookings = (bookingsData || []).filter((b: any) => !managerCenterId || b.centerId === managerCenterId);

            const upcoming = centerBookings.filter((b: any) =>
                (b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED" || b.status === "PENDING") &&
                b.bookingDate === today
            );
            
            // Keep all IN_PROGRESS, and today's COMPLETED/CANCELLED in active list
            const active = centerBookings.filter((b: any) => {
                if (hiddenFromActive.includes(b.bookingId)) return false;
                if (b.status === "IN_PROGRESS") return true;
                
                const bDate = b.bookingDate || (b.createdAt ? String(b.createdAt).split("T")[0] : null) || (b.updatedAt ? String(b.updatedAt).split("T")[0] : null);
                return (b.status === "COMPLETED" || b.status === "CANCELLED") && (!bDate || bDate === today);
            });

            // Filter invoices issued today for this center
            const centerInvoices = (invoicesData || []).filter((inv: any) => {
                const invDate = inv.issuedAt ? inv.issuedAt.split("T")[0] : (inv.createdDate || inv.createdAt ? String(inv.createdDate || inv.createdAt).split("T")[0] : null);
                const matchesDate = invDate === today;
                const matchesCenter = !managerCenterId || inv.centerId === managerCenterId;
                return matchesDate && matchesCenter;
            });
            
            console.log("[Dashboard] Active:", active.length, "Upcoming:", upcoming.length, "Today's Invoices:", centerInvoices.length);
            setUpcomingBookings(upcoming);
            setActiveBookings(active);
            setTodaysInvoices(centerInvoices);
        }
    }, [hasDataInitialized, bookingsData, invoicesData, managersData, hiddenFromActive]);

    const completedCount = useMemo(() => {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const managerCenterId = managersData?.[0]?.managedCenterId;

        return (bookingsData || []).filter((b: any) => 
            b.status === "COMPLETED" && 
            b.bookingDate === today &&
            (!managerCenterId || b.centerId === managerCenterId)
        ).length;
    }, [bookingsData, managersData]);

    const inProgressCount = useMemo(() => {
        const managerCenterId = managersData?.[0]?.managedCenterId;
        return (bookingsData || []).filter((b: any) => 
            b.status === "IN_PROGRESS" &&
            (!managerCenterId || b.centerId === managerCenterId)
        ).length;
    }, [bookingsData, managersData]);

    const totalIncome = useMemo(() => {
        return todaysInvoices.reduce((sum, invoice) => sum + (Number(invoice.total) || Number(invoice.amount) || 0), 0);
    }, [todaysInvoices]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            if (newStatus === "COMPLETED") {
                await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${id}/complete`);
                showSnackbar("Booking marked as completed! You can now generate an invoice.", "success");
            } else if (newStatus === "IN_PROGRESS") {
                await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${id}/start-service`);
                showSnackbar("Service started successfully!", "success");
            } else if (newStatus === "CANCELLED") {
                await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${id}/cancel`);
                showSnackbar("Booking cancelled.", "info");
            }
            
            if (refreshBookings) refreshBookings();
            if (refreshInvoices) refreshInvoices();
        } catch (error) {
            console.error("Failed to update booking status", error);
            showSnackbar("Error updating booking status. Please try again.", "error");
        }
    };

    const activateBooking = async (booking: any) => {
        try {
            await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${booking.bookingId}/start-service`);
            showSnackbar("Service started successfully!", "success");
            if (refreshBookings) refreshBookings();
        } catch (error) {
            console.error("Failed to activate booking", error);
            showSnackbar("Error moving booking to active. Please try again.", "error");
        }
    };

    if (!hasDataInitialized) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Loading Dashboard Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Service Center Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Complete Repairs Today"
                    value={completedCount.toString()}
                    icon={<FiCalendar />}
                    color="blue"
                />
                <StatCard
                    title="Income Today"
                    value={`Rs. ${totalIncome.toLocaleString()}`}
                    icon={<FaMoneyBillWave />}
                    color="green"
                />
                <StatCard
                    title="Service in Progress"
                    value={inProgressCount.toString()}
                    icon={<FiTool />}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                {/* Activated Bookings */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">Activated Bookings</h2>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Ongoing</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 w-1/4">Customer</th>
                                    <th className="px-6 py-4 w-1/4">Vehicle</th>
                                    <th className="px-6 py-4 w-1/5">Service</th>
                                    <th className="px-6 py-4 w-1/6">Status</th>
                                    <th className="px-6 py-4 text-center">Invoice / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeBookings.map((booking, idx) => {
                                    const details = getBookingDetails(booking);
                                    return (
                                    <tr key={booking.bookingId || `active-booking-${idx}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{details.customer}</td>
                                        <td className="px-6 py-4">
                                            <div>{details.vehicle}</div>
                                            {details.vehicleNumber && <div className="text-xs text-slate-400">{details.vehicleNumber}</div>}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{details.service}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {booking.status === 'IN_PROGRESS' ? 'In Progress' : 
                                                 booking.status === 'COMPLETED' ? 'Completed' :
                                                 booking.status === 'CANCELLED' ? 'Cancelled' : booking.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => hideFromActiveList(booking.bookingId)}
                                                    className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Remove from Dashboard"
                                                >
                                                    <FiMinus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                                {activeBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No active bookings.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Bookings */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Upcoming Bookings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 w-1/4">Customer</th>
                                    <th className="px-6 py-4 w-1/4">Vehicle</th>
                                    <th className="px-6 py-4 w-1/5">Service</th>
                                    <th className="px-6 py-4 w-1/6">Time</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {upcomingBookings.map((booking, idx) => {
                                    const details = getBookingDetails(booking);
                                    return (
                                    <tr key={booking.bookingId || `upcoming-booking-${idx}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{details.customer}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{details.vehicle}</div>
                                            {details.vehicleNumber && <div className="text-xs text-slate-500 font-mono mt-0.5">{details.vehicleNumber}</div>}
                                        </td>
                                        <td className="px-6 py-4">{details.service}</td>
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs font-medium">{details.timeRange}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => activateBooking(booking)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                                                title="Start servicing this vehicle"
                                            >
                                                <FiPlay className="w-3 h-3" /> Start Service
                                            </button>
                                        </td>
                                    </tr>
                                )})}
                                {upcomingBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No upcoming bookings.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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

function StatCard({ title, value, change, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600",
        orange: "bg-orange-100 text-orange-600",
        green: "bg-green-100 text-green-600",
        purple: "bg-purple-100 text-purple-600",
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-xl">{icon}</div>
                </div>
                {change && (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        {change}
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
    );
}
