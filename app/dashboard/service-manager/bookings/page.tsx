"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FiCalendar, FiCheckCircle, FiClock, FiList, FiPlus, FiChevronLeft, FiChevronRight, FiEdit2, FiX, FiFileText } from "react-icons/fi";
import { createBooking, editExistingBooking, completeBooking, startService } from "@/services/bookingService";
import { useDashboardData } from "@/context/DashboardDataContext";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";

// Helper to format date to YYYY-MM-DD in local time
const formatYMD = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function BookingsPage() {
    const { bookingsData, isLoading, refreshBookings, managersData, centersData, customersData, invoicesData } = useDashboardData();
    const [view, setView] = useState<"list" | "new-booking">("list");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

    const issuedBookingIds = useMemo(() => {
        if (!invoicesData || invoicesData.length === 0) return new Set<string>();
        return new Set<string>(invoicesData.map((inv: any) => inv.bookingId));
    }, [invoicesData]);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({ date: "", time: "", customer: "", vehicle: "", vehicleNumber: "", service: "" });

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        customer: "",
        vehicle: "",
        vehicleNumber: "",
        service: "",
    });

    const mappedBookings = useMemo(() => {
        if (!bookingsData) return [];
        return bookingsData.map((b: any) => {
            let customer = b.customerName || (b.customerId ? `Customer ${b.customerId.substring(0,6)}` : 'Customer');
            let vehicle = b.vehicleName || (b.vehicleLabel ? b.vehicleLabel.split(" - ")[0] : (b.vehicleId ? `Vehicle ${b.vehicleId.substring(0,6)}` : 'Vehicle'));
            let vehicleNumber = b.plateNumber || (b.vehicleLabel && b.vehicleLabel.includes(" - ") ? b.vehicleLabel.split(" - ")[1] : "");
            let category = b.packageName || "General Service";

            // Calculate start-to-end time range
            let startTimeStr = b.bookingTime ? (b.bookingTime.length >= 5 ? b.bookingTime.substring(0, 5) : b.bookingTime) : "09:00";
            let endTimeStr = "";
            if (b.endTime) {
                endTimeStr = b.endTime.length >= 5 ? b.endTime.substring(0, 5) : b.endTime;
            } else if (b.bookingTime) {
                try {
                    const [h, m] = b.bookingTime.split(":").map(Number);
                    const duration = b.estimatedDurationMins || 60;
                    const endMinutes = h * 60 + m + duration;
                    const endH = Math.floor(endMinutes / 60) % 24;
                    const endM = endMinutes % 60;
                    endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
                } catch(e) {
                    endTimeStr = "";
                }
            }
            let timeRange = endTimeStr ? `${startTimeStr} - ${endTimeStr}` : startTimeStr;

            let isManagerAdded = false;

            if (b.specialRequest && b.specialRequest.startsWith("Customer: ")) {
                isManagerAdded = true;
                try {
                    const cMatch = b.specialRequest.match(/Customer:\s*([^,]+)/);
                    if (cMatch && cMatch[1].trim()) customer = cMatch[1].trim();
                    const vMatch = b.specialRequest.match(/Vehicle:\s*([^,]+)/);
                    if (vMatch && vMatch[1].trim()) vehicle = vMatch[1].trim();
                    const vnMatch = b.specialRequest.match(/Vehicle Number:\s*([^,]+)/);
                    if (vnMatch && vnMatch[1].trim()) vehicleNumber = vnMatch[1].trim();
                    const sMatch = b.specialRequest.match(/Service:\s*([^,]+)/);
                    if (sMatch && sMatch[1].trim()) category = sMatch[1].trim();
                } catch(e) {}
            }

            return {
                id: b.bookingId ? b.bookingId.substring(0, 8) : "N/A",
                originalId: b.bookingId,
                customer,
                vehicle,
                isManagerAdded,
                variety: vehicleNumber, 
                category,
                time: timeRange,
                rawTime: startTimeStr,
                date: b.bookingDate, 
                status: b.status || "PENDING"
            };
        });
    }, [bookingsData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Find centerId and customerId dynamically from context
            const currentCenter = centersData?.[0];
            const centerId = currentCenter?.centerId || currentCenter?.id || managersData?.[0]?.managedCenterId;
            const currentCustomer = customersData?.[0];
            const customerId = currentCustomer?.userId || currentCustomer?.id || managersData?.[0]?.userId;
            
            const newBookingRequest = {
                centerId: centerId,
                customerId: customerId,
                bookingDate: formData.date,
                bookingTime: formData.time,
                specialRequest: `Customer: ${formData.customer}, Vehicle: ${formData.vehicle}, Vehicle Number: ${formData.vehicleNumber}, Service: ${formData.service}`,
            };

            await createBooking(newBookingRequest);
            showSnackbar("Booking Created successfully!", "success");
            
            // Refresh global context data so the dashboard and other components update immediately
            if (refreshBookings) {
                await refreshBookings();
            }

            setView("list");
            setFormData({ date: "", time: "", customer: "", vehicle: "", vehicleNumber: "", service: "" });
        } catch (error) {
            console.error("Failed to create booking:", error);
            showSnackbar("Failed to create booking. (DB Quota exceeded or invalid data)", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (booking: any) => {
        setEditingBookingId(booking.originalId);
        setEditFormData({
            date: booking.date || "",
            time: booking.time || "",
            customer: booking.customer || "",
            vehicle: booking.vehicle || "",
            vehicleNumber: booking.variety || "",
            service: booking.category || ""
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBookingId) return;
        setIsSubmitting(true);
        try {
            const updatePayload = {
                bookingDate: editFormData.date,
                bookingTime: editFormData.time,
                specialRequest: `Customer: ${editFormData.customer}, Vehicle: ${editFormData.vehicle}, Vehicle Number: ${editFormData.vehicleNumber}, Service: ${editFormData.service}`
            };
            await editExistingBooking(editingBookingId, updatePayload);
            showSnackbar("Booking updated successfully!", "success");
            if (refreshBookings) {
                await refreshBookings();
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update booking:", error);
            showSnackbar("Failed to update booking.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Mon-Sun

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    };

    const isSelected = (day: number) => {
        return selectedDate.getDate() === day &&
               selectedDate.getMonth() === currentMonth.getMonth() &&
               selectedDate.getFullYear() === currentMonth.getFullYear();
    };

    const handleStartService = async (bookingId: string) => {
        try {
            await startService(bookingId);
            showSnackbar("Service started successfully!", "success");
            if (refreshBookings) await refreshBookings();
            window.dispatchEvent(new Event("bookingsUpdated"));
        } catch (error) {
            console.error("Failed to start service:", error);
            showSnackbar("Failed to start service.", "error");
        }
    };

    const handleCompleteService = async (bookingId: string) => {
        try {
            await completeBooking(bookingId);
            showSnackbar("Service marked as completed! You can now generate an invoice.", "success");
            if (refreshBookings) await refreshBookings();
            window.dispatchEvent(new Event("bookingsUpdated"));
        } catch (error) {
            console.error("Failed to complete service:", error);
            showSnackbar("Failed to complete service.", "error");
        }
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day &&
               today.getMonth() === currentMonth.getMonth() &&
               today.getFullYear() === currentMonth.getFullYear();
    };

    const selectedYMD = formatYMD(selectedDate);
    const filteredBookings = mappedBookings.filter((b: any) => b.date === selectedYMD);

    const isSelectedDateToday = 
        selectedDate.getDate() === new Date().getDate() && 
        selectedDate.getMonth() === new Date().getMonth() &&
        selectedDate.getFullYear() === new Date().getFullYear();
        
    let dateTitle = "Today's";
    if (!isSelectedDateToday) {
        dateTitle = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    const completedCount = filteredBookings.filter((b: any) => b.status === "COMPLETED").length;
    const inProgressCount = filteredBookings.filter((b: any) => b.status === "IN_PROGRESS").length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">
                    {view === "list" ? "Booking Management" : "New Booking"}
                </h1>
                <div className="flex gap-2">
                    {view === "list" ? (
                        <button
                            onClick={() => setView("new-booking")}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                        >
                            <FiPlus /> New Booking
                        </button>
                    ) : (
                        <button
                            onClick={() => setView("list")}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            <FiList /> Back to List
                        </button>
                    )}
                </div>
            </div>

            {view === "list" ? (
                <>
                    {/* Summary Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SummaryCard title={`Total on ${dateTitle}`} value={filteredBookings.length} icon={<FiCalendar />} color="blue" />
                        <SummaryCard title="Completed" value={completedCount} icon={<FiCheckCircle />} color="green" />
                        <SummaryCard title="In Progress" value={inProgressCount} icon={<FiClock />} color="orange" />
                    </div>

                    {/* Calendar & Table Section */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* Functional Calendar */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col max-h-[700px] h-full">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Schedule</h3>
                            <div className="border border-slate-100 rounded-lg p-4 mb-4">
                                {/* Calendar Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded transition-colors">
                                        <FiChevronLeft className="text-slate-600" />
                                    </button>
                                    <div className="text-sm font-bold text-slate-700">
                                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </div>
                                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded transition-colors">
                                        <FiChevronRight className="text-slate-600" />
                                    </button>
                                </div>
                                {/* Calendar Grid */}
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
                                    <div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div><div>Su</div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-sm">
                                    {[...Array(startOffset)].map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square"></div>
                                    ))}
                                    {[...Array(daysInMonth)].map((_, i) => {
                                        const day = i + 1;
                                        const selected = isSelected(day);
                                        const today = isToday(day);
                                        return (
                                            <button
                                                key={day}
                                                onClick={() => handleDateSelect(day)}
                                                className={`aspect-square flex items-center justify-center rounded-md transition-colors 
                                                    ${selected ? 'bg-orange-600 text-white font-bold shadow-sm' : 
                                                      today ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200' : 
                                                      'hover:bg-slate-100 text-slate-600'}`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* Timeline */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="text-xs font-semibold text-slate-400 uppercase mb-3 sticky top-0 bg-white z-10 pb-1 border-b border-slate-100 flex-shrink-0">
                                    {dateTitle} Timeline
                                </div>
                                <div className="overflow-y-auto pr-2 space-y-2 flex-1">
                                    {isLoading ? (
                                        <div className="text-center text-slate-400 text-sm py-4">Loading timeline...</div>
                                    ) : filteredBookings.length > 0 ? (
                                        [...filteredBookings]
                                            .sort((a, b) => (a.rawTime || a.time).localeCompare(b.rawTime || b.time))
                                            .map((booking, index) => {
                                                const colors = [
                                                    "bg-blue-50 text-blue-700 border-blue-500",
                                                    "bg-orange-50 text-orange-700 border-orange-500",
                                                    "bg-green-50 text-green-700 border-green-500",
                                                    "bg-purple-50 text-purple-700 border-purple-500",
                                                ];
                                                const colorClass = colors[index % colors.length];

                                                return (
                                                    <div key={booking.id} className="flex items-center gap-3 text-sm">
                                                        <span className="text-slate-500 w-12 text-right">{booking.time}</span>
                                                        <div className={`flex-1 p-2 rounded text-xs font-medium border-l-2 ${colorClass}`}>
                                                            {booking.category} - {booking.vehicle.split(" ")[0]}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    ) : (
                                        <div className="text-center text-slate-400 text-sm py-8">
                                            No bookings found for {dateTitle}.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* All Bookings Table */}
                        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col max-h-[700px] h-[700px]">
                            <div className="p-6 border-b border-slate-100 flex-shrink-0">
                                <h2 className="text-lg font-bold text-slate-900">{dateTitle} Bookings</h2>
                            </div>
                            <div className="overflow-auto flex-1 relative">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs sticky top-0 z-10 shadow-sm">
                                        <tr>
                                            <th className="px-6 py-4 w-1/6">Booking ID</th>
                                            <th className="px-6 py-4 w-1/4">Customer</th>
                                            <th className="px-6 py-4 w-1/4">Vehicle</th>
                                            <th className="px-6 py-4 w-1/5">Service</th>
                                            <th className="px-6 py-4 w-1/6">Time</th>
                                            <th className="px-6 py-4 w-1/6">Status</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                    Loading bookings from database...
                                                </td>
                                            </tr>
                                        ) : filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking: any) => (
                                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                                                {booking.id}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(booking.originalId || booking.id);
                                                                    showSnackbar("Booking ID copied to clipboard!", "info");
                                                                }}
                                                                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                                                title="Copy Full Booking ID"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{booking.customer}</td>
                                                    <td className="px-6 py-4">
                                                        <div>{booking.vehicle}</div>
                                                        {booking.variety && <div className="text-xs text-slate-400">{booking.variety}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">{booking.category}</td>
                                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{booking.time}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                            booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                            booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                            booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                            booking.status === 'PAID' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-slate-100 text-slate-800'
                                                        }`}>
                                                            {booking.status === 'IN_PROGRESS' ? 'In Progress' :
                                                             booking.status === 'COMPLETED' ? 'Completed' :
                                                             booking.status === 'CONFIRMED' ? 'Confirmed' :
                                                             booking.status === 'CANCELLED' ? 'Cancelled' :
                                                             booking.status === 'PAID' ? 'Paid' : booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {booking.status === 'COMPLETED' ? (() => {
                                                                const targetId = booking.originalId || booking.id;
                                                                const isIssued = issuedBookingIds.has(targetId);
                                                                return (
                                                                    <Link
                                                                        href={`/dashboard/service-manager/reports?action=generate-invoice&bookingId=${targetId}`}
                                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap ${
                                                                            isIssued ? "bg-amber-600 hover:bg-amber-700" : "bg-orange-600 hover:bg-orange-700"
                                                                        }`}
                                                                        title={isIssued ? "Update existing invoice for this booking" : "Generate Invoice for this booking"}
                                                                    >
                                                                        <FiFileText className="w-3.5 h-3.5" /> {isIssued ? "Update Invoice" : "Generate Invoice"}
                                                                    </Link>
                                                                );
                                                            })() : (
                                                                <button
                                                                    disabled
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-lg shadow-sm border border-slate-200 opacity-60 cursor-not-allowed whitespace-nowrap pointer-events-none"
                                                                    title={booking.status === 'PAID' ? 'Invoice already generated and paid' : 'Service status must be Completed to generate invoice'}
                                                                >
                                                                    <FiFileText className="w-3.5 h-3.5" /> {booking.status === 'PAID' ? 'Invoice Paid' : 'Generate Invoice'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                    No bookings found for {dateTitle}.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-900">Create New Booking</h2>
                        <p className="text-slate-500 text-sm mt-1">Enter the details for the new service appointment.</p>
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
                                <label className="text-sm font-medium text-slate-700">Time</label>
                                <input
                                    type="time"
                                    name="time"
                                    required
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Customer Name</label>
                            <input
                                type="text"
                                name="customer"
                                placeholder="e.g. John Doe"
                                required
                                value={formData.customer}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Vehicle</label>
                                <input
                                    type="text"
                                    name="vehicle"
                                    placeholder="e.g. Toyota Camry"
                                    required
                                    value={formData.vehicle}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    placeholder="e.g. WP ABC-1234"
                                    value={formData.vehicleNumber}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Service Required</label>
                            <input
                                type="text"
                                name="service"
                                placeholder="e.g. General Service, Oil Change"
                                required
                                value={formData.service}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
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
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? "Creating..." : "Create Booking"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Booking MUI Dialog */}
            <Dialog 
                open={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: '1.25rem', overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold' }}>
                    Edit Booking Details
                    <IconButton onClick={() => setIsEditModalOpen(false)} size="small">
                        <FiX />
                    </IconButton>
                </DialogTitle>
                
                <form onSubmit={handleEditSubmit}>
                    <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase">Date</label>
                                <input 
                                    type="date" required
                                    value={editFormData.date}
                                    onChange={e => setEditFormData({...editFormData, date: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase">Time</label>
                                <input 
                                    type="time" required
                                    value={editFormData.time}
                                    onChange={e => setEditFormData({...editFormData, time: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Customer Name</label>
                            <input 
                                type="text" required
                                value={editFormData.customer}
                                onChange={e => setEditFormData({...editFormData, customer: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase">Vehicle</label>
                                <input 
                                    type="text" required
                                    value={editFormData.vehicle}
                                    onChange={e => setEditFormData({...editFormData, vehicle: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-600 uppercase">Vehicle No.</label>
                                <input 
                                    type="text"
                                    value={editFormData.vehicleNumber}
                                    onChange={e => setEditFormData({...editFormData, vehicleNumber: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase">Service</label>
                            <input 
                                type="text" required
                                value={editFormData.service}
                                onChange={e => setEditFormData({...editFormData, service: e.target.value})}
                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </DialogContent>
                    
                    <div className="p-3 px-4 flex justify-end gap-2 border-t border-slate-100 bg-slate-50">
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-lg shadow-sm transition-colors disabled:opacity-50">
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
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

function SummaryCard({ title, value, icon, color }: any) {
    const colors: any = {
        blue: "bg-blue-100 text-blue-600",
        green: "bg-green-100 text-green-600",
        orange: "bg-orange-100 text-orange-600",
        slate: "bg-slate-100 text-slate-600",
    };
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-xl">{icon}</div>
                </div>
            </div>
        </div>
    );
}
