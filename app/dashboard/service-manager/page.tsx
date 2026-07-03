"use client";

import { useState, useMemo, useEffect } from "react";
import axios from "@/lib/axios";
import { FiTool, FiClock, FiCalendar, FiCheckCircle, FiPlus, FiMinus, FiLoader } from "react-icons/fi";
import { FaUserCog, FaMoneyBillWave } from "react-icons/fa";
import { useDashboardData } from "../../../context/DashboardDataContext";
import { APP_CONFIG } from "../../../utils/config";

export default function ServiceManagerDashboard() {
    const { bookingsData, invoicesData, hasDataInitialized, refreshBookings, refreshInvoices, managersData } = useDashboardData();
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
    const [todaysInvoices, setTodaysInvoices] = useState<any[]>([]);

    const [hiddenFromActive, setHiddenFromActive] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('hiddenActiveBookings');
        if (saved) setHiddenFromActive(JSON.parse(saved));
    }, []);

    const hideFromActiveList = (id: string) => {
        const updated = [...hiddenFromActive, id];
        setHiddenFromActive(updated);
        localStorage.setItem('hiddenActiveBookings', JSON.stringify(updated));
        setActiveBookings(prev => prev.filter(b => b.bookingId !== id));
    };

    const getBookingDetails = (booking: any) => {
        let customer = booking.customerName || (booking.customerId ? `Customer ${booking.customerId.toString().substring(0,6)}` : 'Unknown');
        let vehicle = booking.vehicleName || (booking.vehicleId ? `Vehicle ${booking.vehicleId.toString().substring(0,6)}` : 'Unknown');
        let service = booking.packageName || 'Standard Service';

        if (booking.specialRequest && booking.specialRequest.startsWith("Customer: ")) {
            try {
                const parts = booking.specialRequest.split(", ");
                customer = parts[0].replace("Customer: ", "");
                vehicle = parts[1].replace("Vehicle: ", "");
                service = parts[2].replace("Service: ", "");
            } catch(e) {}
        }
        return { customer, vehicle, service };
    };

    useEffect(() => {
        if (hasDataInitialized) {
            console.log("[Dashboard] bookingsData received:", bookingsData);
            const today = new Date().toISOString().split('T')[0];
            const upcoming = bookingsData.filter((b: any) =>
                b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED" || b.status === "PENDING"
            );
            
            // Keep IN_PROGRESS, and today's COMPLETED/CANCELLED in active list until hidden
            const active = bookingsData.filter((b: any) => 
                (b.status === "IN_PROGRESS" || 
                ((b.status === "COMPLETED" || b.status === "CANCELLED") && b.bookingDate === today))
                && !hiddenFromActive.includes(b.bookingId)
            );
            
            console.log("[Dashboard] Active:", active.length, "Upcoming:", upcoming.length);
            setUpcomingBookings(upcoming);
            setActiveBookings(active);
            setTodaysInvoices(invoicesData || []);
        }
    }, [hasDataInitialized, bookingsData, invoicesData, hiddenFromActive]);

    const completedCount = useMemo(() => {
        return bookingsData.filter((b: any) => b.status === "COMPLETED").length;
    }, [bookingsData]);

    const inProgressCount = useMemo(() => {
        return activeBookings.filter(b => b.status === "IN_PROGRESS").length;
    }, [activeBookings]);

    const totalIncome = useMemo(() => {
        return todaysInvoices.reduce((sum, invoice) => sum + (Number(invoice.total) || Number(invoice.amount) || 0), 0);
    }, [todaysInvoices]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            if (newStatus === "COMPLETED") {
                await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${id}/complete`);
                
                const booking = activeBookings.find(b => b.bookingId === id);
                if (booking) {
                    try {
                        // Create a real invoice in the database
                        const manager = managersData?.[0] || {};
                        const centerId = booking.centerId || manager.managedCenterId || "00000000-0000-0000-0000-000000000001";
                        const customerId = booking.customerId || "00000000-0000-0000-0000-000000000002";
                        const amount = booking.estimatedCost ? Number(booking.estimatedCost) : (booking.bookingFee ? Number(booking.bookingFee) : 3500);
                        
                        const newInvoice = {
                            companyCode: "FIX001",
                            centerId: centerId,
                            bookingId: booking.bookingId,
                            issuedToCustomerId: customerId,
                            subtotal: amount,
                            tax: 0,
                            discount: 0,
                            total: amount,
                            status: "PAID",
                            issuedAt: new Date().toISOString(),
                            dueAt: new Date().toISOString()
                        };
                        const invRes = await axios.post(APP_CONFIG.api.invoices, newInvoice);
                        setTodaysInvoices(prev => [...prev, invRes.data]);
                        if (refreshInvoices) refreshInvoices();
                    } catch (invErr) {
                        console.error("Failed to create real invoice in database", invErr);
                    }
                }
            } else if (newStatus === "IN_PROGRESS") {
                await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${id}/start-service`);
            } else if (newStatus === "CANCELLED") {
                await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${id}/cancel`);
            }
            
            // We just let the global refresh happen. The new filter logic will keep it in activeBookings.
            if (refreshBookings) refreshBookings();
        } catch (error) {
            console.error("Failed to update booking status", error);
            alert("Error updating booking status. Please try again.");
        }
    };

    const activateBooking = async (booking: any) => {
        try {
            await axios.put(`${APP_CONFIG.api.baseUrl}/bookings/${booking.bookingId}/start-service`);
            if (refreshBookings) refreshBookings();
        } catch (error) {
            console.error("Failed to activate booking", error);
            alert("Error moving booking to active. Please try again.");
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
                                    <th className="px-6 py-4 w-1/4">Service</th>
                                    <th className="px-6 py-4 w-1/6">Status</th>
                                    <th className="px-6 py-4 w-1/12 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {activeBookings.map((booking) => {
                                    const details = getBookingDetails(booking);
                                    return (
                                    <tr key={booking.bookingId || Math.random()} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{details.customer}</td>
                                        <td className="px-6 py-4">{details.vehicle}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{details.service}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                In Progress
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => hideFromActiveList(booking.bookingId)}
                                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                title="Remove from Dashboard"
                                            >
                                                <FiMinus className="w-4 h-4" />
                                            </button>
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
                                    <th className="px-6 py-4 w-1/4">Service</th>
                                    <th className="px-6 py-4 w-1/4">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {upcomingBookings.map((booking) => {
                                    const details = getBookingDetails(booking);
                                    return (
                                    <tr key={booking.bookingId || Math.random()} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">{details.customer}</td>
                                        <td className="px-6 py-4">{details.vehicle}</td>
                                        <td className="px-6 py-4">{details.service}</td>
                                        <td className="px-6 py-4 text-slate-500">{booking.bookingTime || booking.bookingDate || 'TBD'}</td>
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
