"use client";

import { useState, useEffect, useMemo } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiList, FiPlus, FiChevronLeft, FiChevronRight, FiEdit2, FiX } from "react-icons/fi";
import { createBooking, editExistingBooking } from "@/services/bookingService";
import { useDashboardData } from "@/context/DashboardDataContext";

// Helper to format date to YYYY-MM-DD in local time
const formatYMD = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function BookingsPage() {
    const { bookingsData, isLoading, refreshBookings, managersData } = useDashboardData();
    const [view, setView] = useState<"list" | "new-booking">("list");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState({ date: "", time: "", customer: "", vehicle: "", service: "" });

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        customer: "",
        vehicle: "",
        service: "",
    });

    const mappedBookings = useMemo(() => {
        if (!bookingsData) return [];
        return bookingsData.map((b: any) => {
            let customer = b.customerName || `Customer ${b.customerId?.substring(0,4) || ''}`;
            let vehicle = b.vehicleName || `Vehicle ${b.vehicleId?.substring(0,4) || ''}`;
            let category = b.packageName || "General Service";

            let isManagerAdded = false;

            if (b.specialRequest && b.specialRequest.startsWith("Customer: ")) {
                isManagerAdded = true;
                try {
                    const parts = b.specialRequest.split(", ");
                    customer = parts[0].replace("Customer: ", "");
                    vehicle = parts[1].replace("Vehicle: ", "");
                    category = parts[2].replace("Service: ", "");
                } catch(e) {}
            }

            return {
                id: b.bookingId ? b.bookingId.substring(0, 8) : "N/A",
                originalId: b.bookingId,
                customer,
                vehicle,
                isManagerAdded,
                variety: "", 
                category,
                time: b.bookingTime ? b.bookingTime.substring(0, 5) : "00:00",
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
            // Find centerId from context or use fallback
            const manager = managersData?.[0] || {};
            const centerId = manager.managedCenterId || "00000000-0000-0000-0000-000000000001";
            
            const newBookingRequest = {
                centerId: centerId,
                customerId: "00000000-0000-0000-0000-000000000001", // Fallback Mock Charlie ID
                packageId: "00000000-0000-0000-0000-000000000002", // Fallback Mock ID
                vehicleId: "00000000-0000-0000-0000-000000000003", // Fallback Mock ID
                bookingDate: formData.date,
                bookingTime: formData.time,
                specialRequest: `Customer: ${formData.customer}, Vehicle: ${formData.vehicle}, Service: ${formData.service}`,
            };

            await createBooking(newBookingRequest);
            alert("Booking Created successfully!");
            
            // Refresh global context data so the dashboard and other components update immediately
            if (refreshBookings) {
                await refreshBookings();
            }

            setView("list");
            setFormData({ date: "", time: "", customer: "", vehicle: "", service: "" });
        } catch (error) {
            console.error("Failed to create booking:", error);
            alert("Failed to create booking. (DB Quota exceeded or invalid data)");
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
                specialRequest: `Customer: ${editFormData.customer}, Vehicle: ${editFormData.vehicle}, Service: ${editFormData.service}`
            };
            await editExistingBooking(editingBookingId, updatePayload);
            alert("Booking updated successfully!");
            if (refreshBookings) {
                await refreshBookings();
            }
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update booking:", error);
            alert("Failed to update booking.");
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

    const completedCount = filteredBookings.filter((b: any) => b.status === "COMPLETED" || b.status === "CONFIRMED").length;
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
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
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
                        <SummaryCard title="Confirmed / Completed" value={completedCount} icon={<FiCheckCircle />} color="green" />
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
                                                    ${selected ? 'bg-primary text-white font-bold shadow-sm' : 
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
                                            .sort((a, b) => a.time.localeCompare(b.time))
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
                                            <th className="px-6 py-4 w-1/5">ID</th>
                                            <th className="px-6 py-4 w-1/5">Customer</th>
                                            <th className="px-6 py-4">Vehicle</th>
                                            <th className="px-6 py-4">Service</th>
                                            <th className="px-6 py-4">Time</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                    Loading bookings from database...
                                                </td>
                                            </tr>
                                        ) : filteredBookings.length > 0 ? (
                                            filteredBookings.map((booking: any) => (
                                                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs uppercase">{booking.id}</td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{booking.customer}</td>
                                                    <td className="px-6 py-4">
                                                        <div>{booking.vehicle}</div>
                                                        <div className="text-xs text-slate-400">{booking.variety}</div>
                                                    </td>
                                                    <td className="px-6 py-4">{booking.category}</td>
                                                    <td className="px-6 py-4">{booking.time}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        {booking.isManagerAdded ? (
                                                            <button
                                                                onClick={() => openEditModal(booking)}
                                                                className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors inline-flex items-center justify-center shadow-sm"
                                                                title="Edit Booking"
                                                            >
                                                                <FiEdit2 size={16} />
                                                            </button>
                                                        ) : (
                                                            <span className="text-slate-300 text-xs">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
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
                                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSubmitting ? "Creating..." : "Create Booking"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Booking Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                            <h3 className="font-bold text-slate-900 text-lg">Edit Booking Details</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
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
                                <label className="text-xs font-semibold text-slate-600 uppercase">Service</label>
                                <input 
                                    type="text" required
                                    value={editFormData.service}
                                    onChange={e => setEditFormData({...editFormData, service: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 mt-5">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-hover rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
