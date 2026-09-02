"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import axios from "@/lib/axios";
import { FiTool, FiClock, FiCalendar, FiCheckCircle, FiPlus, FiMinus, FiLoader, FiFileText, FiCheck, FiPlay } from "react-icons/fi";
import { FaUserCog, FaMoneyBillWave } from "react-icons/fa";
import { useDashboardData } from "../../../context/DashboardDataContext";
import * as bookingService from "../../../services/bookingService";
import { APP_CONFIG } from "../../../utils/config";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";

const normalizeStatus = (s: any) => String(s || "").toUpperCase().trim().replace(/[\s-]+/g, "_");

const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const isDateToday = (dStr: any) => {
    if (!dStr) return false;
    try {
        const today = getTodayStr();
        const str = String(dStr).split("T")[0].trim();
        if (str === today) return true;
        const dateObj = new Date(dStr);
        if (!isNaN(dateObj.getTime())) {
            const localStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            return localStr === today;
        }
        return false;
    } catch {
        return false;
    }
};

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

    useEffect(() => {
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

    const handleRevertToUpcoming = async (id: string) => {
        // Optimistic UI update: immediately move from active to upcoming
        const targetBooking = activeBookings.find(b => b.bookingId === id);
        if (targetBooking) {
            const revertedBooking = { ...targetBooking, status: "CONFIRMED" };
            setActiveBookings(prev => prev.filter(b => b.bookingId !== id));
            setUpcomingBookings(prev => {
                const exists = prev.some(b => b.bookingId === id);
                return exists ? prev : [revertedBooking, ...prev];
            });
        }

        try {
            await bookingService.updateBookingStatus(id, "CONFIRMED");

            // Also clean from serviceLanes in localStorage if assigned
            const savedLanes = localStorage.getItem('serviceLanes');
            if (savedLanes) {
                try {
                    const parsed = JSON.parse(savedLanes);
                    const updatedLanes = parsed.map((l: any) => 
                        l.vehicle?.bookingId === id ? { id: l.id, status: "empty" } : l
                    );
                    localStorage.setItem('serviceLanes', JSON.stringify(updatedLanes));
                } catch(e) {}
            }

            showSnackbar("Service moved back to Upcoming Bookings successfully!", "success");
            if (refreshBookings) await refreshBookings();
            window.dispatchEvent(new Event("bookingsUpdated"));
        } catch (error) {
            console.error("Failed to move service back to upcoming", error);
            showSnackbar("Error moving service back to upcoming. Please try again.", "error");
            // Rollback on error
            if (refreshBookings) refreshBookings();
        }
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
            const managerCenterId = managersData?.[0]?.managedCenterId;
            
            // Strictly isolate to manager's center if present
            const centerBookings = (bookingsData || []).filter((b: any) => !managerCenterId || b.centerId === managerCenterId);

            // Upcoming bookings for today strictly based on scheduled booking date
            const upcoming = centerBookings.filter((b: any) => {
                const s = normalizeStatus(b.status);
                const isUpcomingStatus = s === "PENDING_PAYMENT" || s === "CONFIRMED" || s === "PENDING";
                return isUpcomingStatus && isDateToday(b.bookingDate);
            });
            
            // Map of paid booking IDs from invoicesData
            const paidInvoiceBookingIds = new Set<string>();
            (invoicesData || []).forEach((inv: any) => {
                if (String(inv.status || "").toUpperCase() === "PAID" && inv.bookingId) {
                    paidInvoiceBookingIds.add(String(inv.bookingId));
                }
            });

            // Keep all IN_PROGRESS, and today's COMPLETED, PAID, and CANCELLED in active list
            const active = centerBookings
                .filter((b: any) => {
                    const s = normalizeStatus(b.status);
                    const isPaidByInvoice = b.bookingId && paidInvoiceBookingIds.has(String(b.bookingId));
                    if (s === "IN_PROGRESS") return true;
                    
                    if (s === "COMPLETED" || s === "CANCELLED" || s === "PAID" || isPaidByInvoice) {
                        return isDateToday(b.updatedAt) || isDateToday(b.bookingDate);
                    }
                    return false;
                })
                .map((b: any) => {
                    const isPaidByInvoice = b.bookingId && paidInvoiceBookingIds.has(String(b.bookingId));
                    if (isPaidByInvoice && normalizeStatus(b.status) !== "CANCELLED") {
                        return { ...b, status: "PAID" };
                    }
                    return b;
                });

            // Filter invoices issued today for this center
            const centerInvoices = (invoicesData || []).filter((inv: any) => {
                const invDate = inv.issuedAt ? inv.issuedAt.split("T")[0] : (inv.createdDate || inv.createdAt ? String(inv.createdDate || inv.createdAt).split("T")[0] : null);
                const matchesDate = isDateToday(invDate) || isDateToday(inv.issuedAt) || isDateToday(inv.updatedAt);
                const matchesCenter = !managerCenterId || inv.centerId === managerCenterId;
                return matchesDate && matchesCenter;
            });
            
            console.log("[Dashboard] Active:", active.length, "Upcoming:", upcoming.length, "Today's Invoices:", centerInvoices.length);
            setUpcomingBookings(upcoming);
            setActiveBookings(active);
            setTodaysInvoices(centerInvoices);
        }
    }, [hasDataInitialized, bookingsData, invoicesData, managersData]);

    const completedCount = useMemo(() => {
        const managerCenterId = managersData?.[0]?.managedCenterId;

        return (bookingsData || []).filter((b: any) => {
            const s = normalizeStatus(b.status);
            if (s !== "COMPLETED" && s !== "PAID") return false;
            if (managerCenterId && b.centerId !== managerCenterId) return false;
            return isDateToday(b.updatedAt) || isDateToday(b.bookingDate);
        }).length;
    }, [bookingsData, managersData]);

    const inProgressCount = useMemo(() => {
        const managerCenterId = managersData?.[0]?.managedCenterId;
        return (bookingsData || []).filter((b: any) => 
            b.status === "IN_PROGRESS" &&
            (!managerCenterId || b.centerId === managerCenterId)
        ).length;
    }, [bookingsData, managersData]);

    // Income Today: Total of all services that have PAID status belonging to current date
    const totalIncome = useMemo(() => {
        const managerCenterId = managersData?.[0]?.managedCenterId;
        const countedBookingIds = new Set<string>();
        let income = 0;

        // 1. Sum from paid invoices issued/updated today for this center
        (invoicesData || []).forEach((inv: any) => {
            if (managerCenterId && inv.centerId && inv.centerId !== managerCenterId) return;
            const isPaid = String(inv.status || "").toUpperCase() === "PAID";
            if (!isPaid) return;

            const isToday = isDateToday(inv.updatedAt) || isDateToday(inv.issuedAt) || isDateToday(inv.createdDate);
            if (isToday) {
                const amt = Number(inv.total) || Number(inv.amount) || Number(inv.subtotal) || 0;
                income += amt;
                if (inv.bookingId) countedBookingIds.add(String(inv.bookingId));
            }
        });

        // 2. Add from paid bookings for today that might not have a separate invoice record
        (bookingsData || []).forEach((b: any) => {
            if (managerCenterId && b.centerId && b.centerId !== managerCenterId) return;
            const isPaid = normalizeStatus(b.status) === "PAID";
            if (!isPaid) return;
            if (b.bookingId && countedBookingIds.has(String(b.bookingId))) return;

            const isToday = isDateToday(b.updatedAt) || isDateToday(b.bookingDate);
            if (isToday) {
                const cost = Number(b.estimatedCost) || Number(b.totalAmount) || Number(b.bookingFee) || 0;
                income += cost;
                if (b.bookingId) countedBookingIds.add(String(b.bookingId));
            }
        });

        return income;
    }, [invoicesData, bookingsData, managersData]);

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
                <FiLoader className="w-8 h-8 text-orange-600 animate-spin" />
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
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeBookings.map((booking, idx) => {
                                    const details = getBookingDetails(booking);
                                    const statusNorm = normalizeStatus(booking.status);
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
                                                statusNorm === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                statusNorm === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                statusNorm === 'PAID' ? 'bg-purple-100 text-purple-800' :
                                                statusNorm === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {statusNorm === 'IN_PROGRESS' ? 'In Progress' : 
                                                 statusNorm === 'COMPLETED' ? 'Completed' :
                                                 statusNorm === 'PAID' ? 'Paid' :
                                                 statusNorm === 'CANCELLED' ? 'Cancelled' : (booking.status || 'Pending')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {statusNorm === 'IN_PROGRESS' ? (
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleRevertToUpcoming(booking.bookingId)}
                                                        className="p-1.5 rounded-md text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                                        title="Move back to Upcoming Bookings"
                                                    >
                                                        <FiMinus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 font-bold">-</span>
                                            )}
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
                                    <th className="px-6 py-4 w-1/3">Service</th>
                                    <th className="px-6 py-4 w-1/6">Time</th>
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
                                    </tr>
                                )})}
                                {upcomingBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
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
