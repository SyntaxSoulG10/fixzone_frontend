"use client";

import { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { FiPlus, FiUser, FiTool, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useDashboardData } from "../../../../context/DashboardDataContext";
import * as bookingService from "../../../../services/bookingService";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";

// Type for a lane
interface LaneVehicle {
    bookingId: string;
    model: string;
    vehicleNumber?: string;
    owner: string;
    action: string;
}

interface Lane {
    id: number;
    status: "filled" | "empty";
    vehicle?: LaneVehicle;
}

export default function ServiceLaneManagePage() {
    const { bookingsData, refreshBookings, refreshInvoices, managersData } = useDashboardData();
    
    const [lanes, setLanes] = useState<Lane[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const managerCenterId = (managersData as any)?.[0]?.managedCenterId || (managersData as any)?.managedCenterId;

    const extractBookingDetails = (booking: any) => {
        let customer = booking?.customerName || (booking?.customerId ? `Customer ${String(booking.customerId).substring(0,6)}` : 'Customer');
        let vehicle = booking?.vehicleName || (booking?.vehicleLabel ? booking.vehicleLabel.split(" - ")[0] : (booking?.vehicleId ? `Vehicle ${String(booking.vehicleId).substring(0,6)}` : 'Vehicle'));
        let vehicleNumber = booking?.plateNumber || (booking?.vehicleLabel && booking.vehicleLabel.includes(" - ") ? booking.vehicleLabel.split(" - ")[1] : "");
        let service = booking?.packageName || 'Standard Service';

        // Calculate time range (start - end)
        let startTimeStr = booking?.bookingTime ? (booking.bookingTime.length >= 5 ? booking.bookingTime.substring(0, 5) : booking.bookingTime) : "09:00";
        let endTimeStr = "";
        if (booking?.endTime) {
            endTimeStr = booking.endTime.length >= 5 ? booking.endTime.substring(0, 5) : booking.endTime;
        } else if (booking?.bookingTime) {
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

        if (booking?.specialRequest?.startsWith("Customer: ")) {
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

    // Initialize or sync lanes with real IN_PROGRESS bookings
    useEffect(() => {
        setIsClient(true);
        const storageKey = managerCenterId ? `serviceLanes_${managerCenterId}` : "serviceLanes";
        const savedLanesStr = localStorage.getItem(storageKey);
        let currentLanes: Lane[] = savedLanesStr ? JSON.parse(savedLanesStr) : Array.from({ length: 5 }, (_, i) => ({ id: i + 1, status: "empty" }));

        // Current real IN_PROGRESS bookings for this center
        const inProgressBookings = (bookingsData || []).filter((b: any) => 
            b.status === "IN_PROGRESS" && (!managerCenterId || b.centerId === managerCenterId)
        );

        // 1. Remove vehicles from lanes if they are no longer IN_PROGRESS in the database
        const inProgressIds = new Set(inProgressBookings.map((b: any) => b.bookingId));
        currentLanes = currentLanes.map(lane => {
            if (lane.status === "filled" && lane.vehicle && !inProgressIds.has(lane.vehicle.bookingId)) {
                return { id: lane.id, status: "empty" };
            }
            return lane;
        });

        // 2. Place any IN_PROGRESS booking that is not yet assigned into an empty lane
        const assignedBookingIds = new Set(
            currentLanes.filter(l => l.status === "filled" && l.vehicle).map(l => l.vehicle!.bookingId)
        );

        const unassignedInProgress = inProgressBookings.filter((b: any) => !assignedBookingIds.has(b.bookingId));

        unassignedInProgress.forEach(booking => {
            const details = extractBookingDetails(booking);
            const emptyLaneIndex = currentLanes.findIndex(l => l.status === "empty");
            const newVehicle: LaneVehicle = {
                bookingId: booking.bookingId,
                model: details.vehicle,
                vehicleNumber: details.vehicleNumber,
                owner: details.customer,
                action: details.service
            };

            if (emptyLaneIndex !== -1) {
                currentLanes[emptyLaneIndex] = {
                    ...currentLanes[emptyLaneIndex],
                    status: "filled",
                    vehicle: newVehicle
                };
            } else {
                const nextId = currentLanes.length > 0 ? Math.max(...currentLanes.map(l => l.id)) + 1 : 1;
                currentLanes.push({
                    id: nextId,
                    status: "filled",
                    vehicle: newVehicle
                });
            }
        });

        setLanes(currentLanes);
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(currentLanes));
        }
    }, [bookingsData, managerCenterId]);

    // Save lanes to localStorage whenever they change
    useEffect(() => {
        if (isClient && lanes.length > 0) {
            const storageKey = managerCenterId ? `serviceLanes_${managerCenterId}` : "serviceLanes";
            localStorage.setItem(storageKey, JSON.stringify(lanes));
        }
    }, [lanes, isClient, managerCenterId]);

    const [openLaneId, setOpenLaneId] = useState<number | null>(null);
    const [manageLaneId, setManageLaneId] = useState<number | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState("");

    // Get today's upcoming bookings for this center
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const upcomingBookings = (bookingsData || []).filter((b: any) => 
        (b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED" || b.status === "PENDING") && 
        b.bookingDate === todayStr &&
        (!managerCenterId || b.centerId === managerCenterId)
    );

    const handleAddLane = () => {
        const nextId = lanes.length > 0 ? Math.max(...lanes.map(l => l.id)) + 1 : 1;
        setLanes([...lanes, { id: nextId, status: "empty" }]);
    };

    const handleRemoveLane = (laneId: number) => {
        setLanes(lanes.filter(l => l.id !== laneId));
    };

    const handleAddToService = async (laneId: number) => {
        if (!selectedBookingId) return;
        
        try {
            await bookingService.startService(selectedBookingId);
            
            const booking = upcomingBookings.find((b: any) => b.bookingId === selectedBookingId);
            const details = extractBookingDetails(booking);

            const updatedLanes = lanes.map(l => l.id === laneId ? {
                ...l,
                status: "filled" as const,
                vehicle: {
                    bookingId: selectedBookingId,
                    model: details.vehicle,
                    vehicleNumber: details.vehicleNumber,
                    owner: details.customer,
                    action: details.service
                }
            } : l);

            setLanes(updatedLanes);
            setOpenLaneId(null);
            setSelectedBookingId("");
            showSnackbar("Vehicle assigned to lane. Service started!", "success");
            
            if (refreshBookings) await refreshBookings();
            window.dispatchEvent(new Event("bookingsUpdated"));
            
        } catch (error) {
            console.error("Failed to start service", error);
            showSnackbar("Error starting service.", "error");
        }
    };

    const handleComplete = async (laneId: number, bookingId: string) => {
        try {
            await bookingService.completeBooking(bookingId);
            emptyLane(laneId);
            showSnackbar("Service completed successfully!", "success");
            if (refreshBookings) await refreshBookings();
            if (refreshInvoices) await refreshInvoices();
            window.dispatchEvent(new Event("bookingsUpdated"));
        } catch (error) {
            console.error("Failed to complete booking", error);
            showSnackbar("Error completing service.", "error");
        }
    };

    const handleCancel = async (laneId: number, bookingId: string) => {
        try {
            await bookingService.cancelBooking(bookingId);
            emptyLane(laneId);
            showSnackbar("Service cancelled.", "info");
            if (refreshBookings) await refreshBookings();
            window.dispatchEvent(new Event("bookingsUpdated"));
        } catch (error) {
            console.error("Failed to cancel booking", error);
            showSnackbar("Error cancelling service.", "error");
        }
    };

    const emptyLane = (laneId: number) => {
        const updated = lanes.map(l => l.id === laneId ? { id: laneId, status: "empty" as const } : l);
        setLanes(updated);
        setManageLaneId(null);
    };

    if (!isClient) return null;

    return (
        <div>
            <PageHeader
                title="Service Lane Manage"
                description="Monitor and manage active service lanes."
            />

            <div className="flex justify-end mb-6">
                <Button className="flex items-center gap-2 !bg-orange-600 !text-white !hover:bg-orange-700" onClick={handleAddLane}>
                    <FiPlus /> Add Lane
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {lanes.map((lane) => (
                    <div
                        key={lane.id}
                        className={`relative rounded-xl border shadow-sm flex flex-col h-full transition-all ${lane.status === 'filled'
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-50 border-dashed border-slate-300'
                            }`}
                    >
                        {/* Remove button for empty lanes only */}
                        {lane.status === 'empty' && (
                            <button
                                onClick={() => handleRemoveLane(lane.id)}
                                className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-700 transition-colors shadow-sm"
                                title="Remove lane"
                            >
                                <FiX size={14} />
                            </button>
                        )}

                        {/* Lane Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                            <h3 className="font-semibold text-slate-700">Lane {lane.id}</h3>
                            {lane.status === 'filled' && (
                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">
                                    In Progress
                                </span>
                            )}
                        </div>

                        {/* Lane Content */}
                        <div className="p-4 flex-1 flex flex-col justify-center">
                            {lane.status === 'filled' && lane.vehicle ? (
                                <div className="space-y-4 relative">
                                    <div className="text-center pb-4 border-b border-slate-100">
                                        <div className="font-mono text-sm font-bold text-slate-800 bg-slate-100 py-1 px-2 rounded inline-block mb-2">
                                            {lane.vehicle.bookingId.substring(0,8)}...
                                        </div>
                                        <div className="font-medium text-slate-600">{lane.vehicle.model}</div>
                                        {lane.vehicle.vehicleNumber && <div className="text-xs text-slate-400 mt-1">{lane.vehicle.vehicleNumber}</div>}
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-slate-400" />
                                            <span className="truncate">{lane.vehicle.owner}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiTool className="text-slate-400" />
                                            <span className="truncate">{lane.vehicle.action}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto relative">
                                        <Button 
                                            variant="secondary" 
                                            className="w-full"
                                            onClick={() => setManageLaneId(manageLaneId === lane.id ? null : lane.id)}
                                        >
                                            Manage
                                        </Button>

                                        {manageLaneId === lane.id && (
                                            <div className="absolute bottom-12 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 flex flex-col gap-2">
                                                <button 
                                                    onClick={() => handleComplete(lane.id, lane.vehicle!.bookingId)}
                                                    className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded hover:bg-green-100 transition-colors text-sm font-medium"
                                                >
                                                    <FiCheckCircle /> Completed Service
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(lane.id, lane.vehicle!.bookingId)}
                                                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                                                >
                                                    <FiXCircle /> Cancelled service
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full min-h-[200px] flex flex-col items-center justify-center">
                                    {/* Empty lane button */}
                                    <button
                                        onClick={() => {
                                            setOpenLaneId(openLaneId === lane.id ? null : lane.id);
                                            setSelectedBookingId("");
                                        }}
                                        className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary hover:bg-slate-100/50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-orange-600/10 group-hover:text-orange-600 transition-colors">
                                            <FiPlus className="text-2xl" />
                                        </div>
                                        <span className="font-medium">+ Add to service</span>
                                    </button>

                                    {/* Dropdown popup for Booking ID */}
                                    {openLaneId === lane.id && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white border border-slate-200 rounded-lg shadow-xl p-4 w-[280px]">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-slate-700">Assign Upcoming Booking</span>
                                                <button
                                                    onClick={() => { setOpenLaneId(null); setSelectedBookingId(""); }}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="max-h-48 overflow-y-auto mb-3 border border-slate-200 rounded-md">
                                                {upcomingBookings.length === 0 ? (
                                                    <div className="p-3 text-sm text-slate-500 text-center">No upcoming bookings today.</div>
                                                ) : (
                                                    upcomingBookings.map((b: any) => {
                                                        const isSelected = selectedBookingId === b.bookingId;
                                                        const details = extractBookingDetails(b);
                                                        return (
                                                            <div 
                                                                key={b.bookingId}
                                                                onClick={() => setSelectedBookingId(b.bookingId)}
                                                                className={`p-2.5 border-b border-slate-100 last:border-0 cursor-pointer transition-colors text-sm ${isSelected ? 'bg-orange-600/10 border-orange-600/20' : 'hover:bg-slate-50'}`}
                                                            >
                                                                <div className="font-medium text-slate-800 flex justify-between items-center">
                                                                    <span>{details.customer}</span>
                                                                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{details.timeRange}</span>
                                                                </div>
                                                                <div className="text-slate-500 text-xs mt-1">
                                                                    {details.vehicle} {details.vehicleNumber ? `(${details.vehicleNumber})` : ''} - <span className="text-orange-600 font-medium">{details.service}</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddToService(lane.id)}
                                                    disabled={!selectedBookingId}
                                                    className="flex-1 bg-orange-600 text-white text-sm font-medium py-1.5 rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Assign
                                                </button>
                                                <button
                                                    onClick={() => { setOpenLaneId(null); setSelectedBookingId(""); }}
                                                    className="flex-1 bg-slate-100 text-slate-600 text-sm font-medium py-1.5 rounded-md hover:bg-slate-200 transition-colors"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
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
