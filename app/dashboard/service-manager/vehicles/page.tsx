"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { 
    FiPlus, 
    FiMinus, 
    FiUser, 
    FiTool, 
    FiX, 
    FiCheckCircle, 
    FiXCircle, 
    FiSliders, 
    FiClock
} from "react-icons/fi";
import { useDashboardData } from "../../../../context/DashboardDataContext";
import * as bookingService from "../../../../services/bookingService";
import * as serviceCenterService from "../../../../services/serviceCenterService";
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
    const [centerInfo, setCenterInfo] = useState<any>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isRemoveSelectOpen, setIsRemoveSelectOpen] = useState(false);
    const [selectedLaneToRemove, setSelectedLaneToRemove] = useState<number | null>(null);
    const [isUpdatingLanes, setIsUpdatingLanes] = useState(false);
    const [openLaneId, setOpenLaneId] = useState<number | null>(null);
    const [manageLaneId, setManageLaneId] = useState<number | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ 
        open: false, 
        message: '', 
        severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
    });

    const emptyLanes = lanes.filter(l => l.status === "empty");

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

    // Fetch center information and initialize lanes from DB
    const fetchCenterAndSyncLanes = useCallback(async () => {
        try {
            let center = null;
            if (managerCenterId) {
                center = await serviceCenterService.getServiceCenterById(managerCenterId);
            } else {
                const centers = await serviceCenterService.getCurrentServiceCenters();
                if (Array.isArray(centers) && centers.length > 0) {
                    center = centers[0];
                }
            }

            if (center) {
                setCenterInfo(center);
                const dbLanesCount = Math.max(1, center.serviceLanesCount || 1);
                
                // Construct lane array matching DB count
                const newLanes: Lane[] = Array.from({ length: dbLanesCount }, (_, i) => ({
                    id: i + 1,
                    status: "empty"
                }));

                // Synchronize with active IN_PROGRESS bookings
                const inProgressBookings = (bookingsData || []).filter((b: any) => 
                    b.status === "IN_PROGRESS" && (!managerCenterId || b.centerId === managerCenterId)
                );

                // 1. Assign bookings that have an explicitly assigned lane
                const unassignedBookings: any[] = [];
                inProgressBookings.forEach((b: any) => {
                    const assignedLaneNum = b.assignedLane;
                    if (assignedLaneNum && assignedLaneNum >= 1 && assignedLaneNum <= dbLanesCount) {
                        const details = extractBookingDetails(b);
                        newLanes[assignedLaneNum - 1] = {
                            id: assignedLaneNum,
                            status: "filled",
                            vehicle: {
                                bookingId: b.bookingId,
                                model: details.vehicle,
                                vehicleNumber: details.vehicleNumber,
                                owner: details.customer,
                                action: details.service
                            }
                        };
                    } else {
                        unassignedBookings.push(b);
                    }
                });

                // 2. Place remaining in-progress bookings into empty lanes
                unassignedBookings.forEach((b: any) => {
                    const emptyIdx = newLanes.findIndex(l => l.status === "empty");
                    if (emptyIdx !== -1) {
                        const details = extractBookingDetails(b);
                        newLanes[emptyIdx] = {
                            id: emptyIdx + 1,
                            status: "filled",
                            vehicle: {
                                bookingId: b.bookingId,
                                model: details.vehicle,
                                vehicleNumber: details.vehicleNumber,
                                owner: details.customer,
                                action: details.service
                            }
                        };
                    }
                });

                setLanes(newLanes);
            }
        } catch (error) {
            console.error("Failed to fetch service center details:", error);
        }
    }, [managerCenterId, bookingsData]);

    useEffect(() => {
        setIsClient(true);
        fetchCenterAndSyncLanes();
    }, [fetchCenterAndSyncLanes]);

    // Get currently occupied booking IDs in lanes
    const occupiedBookingIds = new Set(
        lanes.filter(l => l.status === "filled" && l.vehicle?.bookingId).map(l => l.vehicle!.bookingId)
    );

    // Get today's upcoming bookings for this center that are not already assigned to any lane
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const upcomingBookings = (bookingsData || []).filter((b: any) => 
        (b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED" || b.status === "PENDING") && 
        b.bookingDate === todayStr &&
        (!managerCenterId || b.centerId === managerCenterId) &&
        !occupiedBookingIds.has(b.bookingId)
    );

    // ADD LANE: Updates DB instantly
    const handleAddLane = async () => {
        const targetCenterId = managerCenterId || centerInfo?.centerId;
        if (!targetCenterId) {
            showSnackbar("Service center ID not found.", "error");
            return;
        }

        const newLanesCount = lanes.length + 1;
        setIsUpdatingLanes(true);
        try {
            const updatedCenter = await serviceCenterService.updateServiceLanesCount(targetCenterId, newLanesCount);
            setCenterInfo(updatedCenter);
            setLanes(prev => [...prev, { id: newLanesCount, status: "empty" }]);
            showSnackbar(`Lane ${newLanesCount} added successfully! Updated in database.`, "success");
        } catch (error: any) {
            console.error("Failed to add lane in DB:", error);
            showSnackbar(error?.response?.data?.message || "Failed to add lane in database.", "error");
        } finally {
            setIsUpdatingLanes(false);
        }
    };

    // REMOVE LANE: Checks occupancy, then updates DB instantly
    const handleRemoveLane = async (laneIdToRemove?: number) => {
        const targetCenterId = managerCenterId || centerInfo?.centerId;
        if (!targetCenterId) {
            showSnackbar("Service center ID not found.", "error");
            return;
        }

        if (lanes.length <= 1) {
            showSnackbar("A service center must have at least 1 operational lane.", "warning");
            return;
        }

        // Determine which lane to remove (default to the last lane if not specified)
        const targetLaneId = laneIdToRemove || lanes[lanes.length - 1].id;
        const targetLane = lanes.find(l => l.id === targetLaneId);

        if (targetLane && targetLane.status === "filled") {
            showSnackbar(`Cannot remove Lane ${targetLaneId} because a vehicle is currently in service.`, "warning");
            return;
        }

        // If removing the highest lane
        const newLanesCount = lanes.length - 1;
        setIsUpdatingLanes(true);
        try {
            const updatedCenter = await serviceCenterService.updateServiceLanesCount(targetCenterId, newLanesCount);
            setCenterInfo(updatedCenter);
            
            // Filter out target lane and re-index
            const remainingLanes = lanes.filter(l => l.id !== targetLaneId).map((l, index) => ({
                ...l,
                id: index + 1
            }));
            setLanes(remainingLanes);
            setSelectedLaneToRemove(null);
            setIsRemoveSelectOpen(false);
            showSnackbar(`Lane removed successfully! Database updated to ${newLanesCount} lanes.`, "success");
        } catch (error: any) {
            console.error("Failed to remove lane in DB:", error);
            showSnackbar(error?.response?.data?.message || "Failed to remove lane in database.", "error");
        } finally {
            setIsUpdatingLanes(false);
        }
    };

    const handleAddToService = async (laneId: number) => {
        if (!selectedBookingId) return;
        
        try {
            // Start service and assign lane in database
            await bookingService.startService(selectedBookingId);
            try {
                await bookingService.assignLane(selectedBookingId, laneId);
            } catch (laneErr) {
                console.warn("Assign lane DB call note:", laneErr);
            }
            
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
        <div className="space-y-6">
            {/* Top Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <PageHeader
                    title="Service Lane Manage"
                    description="Monitor and manage active operational service lanes."
                />

                {/* Manage Lanes Button */}
                <div className="flex items-center gap-3">
                    <Button 
                        className="flex items-center gap-2 !bg-orange-600 !text-white !hover:bg-orange-700 shadow-md font-medium px-4 py-2 rounded-xl transition-all"
                        onClick={() => setIsManageModalOpen(true)}
                    >
                        <FiSliders className="text-lg" /> Manage Lanes
                    </Button>
                </div>
            </div>

            {/* Service Lanes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {lanes.map((lane) => (
                    <div
                        key={lane.id}
                        className={`relative rounded-2xl border shadow-sm flex flex-col h-full transition-all duration-200 ${lane.status === 'filled'
                            ? 'bg-white border-slate-200 ring-1 ring-slate-100 shadow-slate-100'
                            : 'bg-slate-50/80 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50/20'
                            }`}
                    >
                        {/* Lane Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/60 rounded-t-2xl">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                <h3 className="font-bold text-slate-800 text-base">Lane {lane.id}</h3>
                            </div>
                            {lane.status === 'filled' ? (
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-700 animate-pulse">
                                    In Progress
                                </span>
                            ) : (
                                <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Available
                                </span>
                            )}
                        </div>

                        {/* Lane Content */}
                        <div className="p-5 flex-1 flex flex-col justify-center">
                            {lane.status === 'filled' && lane.vehicle ? (
                                <div className="space-y-4 relative">
                                    <div className="text-center pb-4 border-b border-slate-100">
                                        <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded-md inline-block mb-2 border border-slate-200">
                                            #{lane.vehicle.bookingId.substring(0,8).toUpperCase()}
                                        </div>
                                        <div className="font-bold text-slate-800 text-base">{lane.vehicle.model}</div>
                                        {lane.vehicle.vehicleNumber && (
                                            <div className="text-xs font-mono font-medium text-orange-600 bg-orange-50 py-0.5 px-2 rounded inline-block mt-1">
                                                {lane.vehicle.vehicleNumber}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2.5 text-sm text-slate-600">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                                                <FiUser size={13} />
                                            </div>
                                            <span className="truncate font-medium">{lane.vehicle.owner}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center text-orange-600">
                                                <FiTool size={13} />
                                            </div>
                                            <span className="truncate font-medium text-slate-700">{lane.vehicle.action}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto relative">
                                        <Button 
                                            variant="secondary" 
                                            className="w-full !rounded-xl !py-2 font-medium"
                                            onClick={() => setManageLaneId(manageLaneId === lane.id ? null : lane.id)}
                                        >
                                            Actions
                                        </Button>

                                        {manageLaneId === lane.id && (
                                            <div className="absolute bottom-12 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20 flex flex-col gap-1.5 animate-in fade-in zoom-in-95">
                                                <button 
                                                    onClick={() => handleComplete(lane.id, lane.vehicle!.bookingId)}
                                                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold"
                                                >
                                                    <FiCheckCircle /> Mark Completed
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(lane.id, lane.vehicle!.bookingId)}
                                                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                                                >
                                                    <FiXCircle /> Cancel Service
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full min-h-[220px] flex flex-col items-center justify-center">
                                    {/* Empty lane button */}
                                    <button
                                        onClick={() => {
                                            setOpenLaneId(openLaneId === lane.id ? null : lane.id);
                                            setSelectedBookingId("");
                                        }}
                                        className="w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-orange-600 rounded-xl transition-colors group"
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all duration-200">
                                            <FiPlus className="text-2xl" />
                                        </div>
                                        <span className="font-semibold text-sm">+ Add to service</span>
                                    </button>

                                    {/* Dropdown popup for Booking ID */}
                                    {openLaneId === lane.id && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-[300px] animate-in fade-in zoom-in-95">
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800">Assign Booking</span>
                                                    <p className="text-xs text-slate-400">Lane {lane.id}</p>
                                                </div>
                                                <button
                                                    onClick={() => { setOpenLaneId(null); setSelectedBookingId(""); }}
                                                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                            
                                            <div className="max-h-52 overflow-y-auto mb-3 border border-slate-100 rounded-xl space-y-1 p-1">
                                                {upcomingBookings.length === 0 ? (
                                                    <div className="p-4 text-xs text-slate-500 text-center">
                                                        No upcoming bookings today for this center.
                                                    </div>
                                                ) : (
                                                    upcomingBookings.map((b: any) => {
                                                        const isSelected = selectedBookingId === b.bookingId;
                                                        const details = extractBookingDetails(b);
                                                        return (
                                                            <div 
                                                                key={b.bookingId}
                                                                onClick={() => setSelectedBookingId(b.bookingId)}
                                                                className={`p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${isSelected ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-400' : 'border-transparent hover:bg-slate-50'}`}
                                                            >
                                                                <div className="font-semibold text-slate-800 flex justify-between items-center">
                                                                    <span>{details.customer}</span>
                                                                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                        <FiClock size={10} /> {details.timeRange}
                                                                    </span>
                                                                </div>
                                                                <div className="text-slate-500 mt-1">
                                                                    {details.vehicle} {details.vehicleNumber ? `(${details.vehicleNumber})` : ''}
                                                                </div>
                                                                <div className="text-orange-600 font-semibold mt-0.5">
                                                                    {details.service}
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
                                                    className="flex-1 bg-orange-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    Assign & Start
                                                </button>
                                                <button
                                                    onClick={() => { setOpenLaneId(null); setSelectedBookingId(""); }}
                                                    className="flex-1 bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-xl hover:bg-slate-200 transition-colors"
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

            {/* Manage Lanes Modal */}
            {isManageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FiSliders className="text-orange-600" /> Manage Service Lanes
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Add new operational lanes or select an empty lane to remove.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsManageModalOpen(false);
                                    setIsRemoveSelectOpen(false);
                                    setSelectedLaneToRemove(null);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5">
                            {/* Lanes Overview List */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        Current Lanes ({lanes.length})
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {emptyLanes.length} available to remove
                                    </span>
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                                    {lanes.map((lane) => {
                                        const isFilled = lane.status === 'filled';
                                        const isSelectedForRemoval = selectedLaneToRemove === lane.id;
                                        return (
                                            <div 
                                                key={lane.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isSelectedForRemoval ? 'bg-red-50/80 border-red-200 ring-1 ring-red-300' : 'bg-white border-slate-200/80'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ${isFilled ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        L{lane.id}
                                                    </span>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-800">Lane {lane.id}</div>
                                                        <div className="text-xs text-slate-500">
                                                            {isFilled && lane.vehicle 
                                                                ? `${lane.vehicle.model} (${lane.vehicle.owner})` 
                                                                : "Available / Empty"}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isFilled ? (
                                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                                                            In-Service
                                                        </span>
                                                    ) : (
                                                        <>
                                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                                Available
                                                            </span>
                                                            {lanes.length > 1 && (
                                                                <button
                                                                    onClick={() => handleRemoveLane(lane.id)}
                                                                    disabled={isUpdatingLanes}
                                                                    className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                                                    title={`Remove Lane ${lane.id}`}
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Remove Lane Selector Drawer */}
                            {isRemoveSelectOpen && (
                                <div className="p-4 bg-red-50/60 border border-red-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                                            Select Lane to Remove:
                                        </span>
                                        <button 
                                            onClick={() => { setIsRemoveSelectOpen(false); setSelectedLaneToRemove(null); }}
                                            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    {emptyLanes.length === 0 ? (
                                        <div className="text-xs text-red-600 p-2 text-center bg-white/60 rounded-xl">
                                            All lanes are currently occupied with in-service vehicles. Complete or cancel active service before removing a lane.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {emptyLanes.map((lane) => (
                                                <button
                                                    key={lane.id}
                                                    type="button"
                                                    onClick={() => setSelectedLaneToRemove(lane.id)}
                                                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${selectedLaneToRemove === lane.id ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'}`}
                                                >
                                                    Lane {lane.id}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {emptyLanes.length > 0 && (
                                        <button
                                            onClick={() => selectedLaneToRemove && handleRemoveLane(selectedLaneToRemove)}
                                            disabled={!selectedLaneToRemove || isUpdatingLanes}
                                            className="w-full bg-red-600 text-white font-bold py-2.5 rounded-xl hover:bg-red-700 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            Confirm Remove {selectedLaneToRemove ? `Lane ${selectedLaneToRemove}` : "Selected Lane"}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Main Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <button
                                    onClick={handleAddLane}
                                    disabled={isUpdatingLanes}
                                    className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-3 px-4 rounded-2xl hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 disabled:opacity-50"
                                >
                                    <FiPlus size={18} /> Add Lane
                                </button>

                                <button
                                    onClick={() => {
                                        if (lanes.length <= 1) {
                                            showSnackbar("A service center must have at least 1 operational lane.", "warning");
                                            return;
                                        }
                                        setIsRemoveSelectOpen(!isRemoveSelectOpen);
                                    }}
                                    disabled={isUpdatingLanes || lanes.length <= 1}
                                    className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-2xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${isRemoveSelectOpen ? 'bg-red-600 text-white border-red-600' : 'bg-slate-100 text-red-600 hover:bg-red-50 hover:text-red-700 border-slate-200'}`}
                                    title={lanes.length <= 1 ? "At least 1 lane required" : "Remove lane"}
                                >
                                    <FiMinus size={18} /> Remove Lane
                                </button>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => {
                                    setIsManageModalOpen(false);
                                    setIsRemoveSelectOpen(false);
                                    setSelectedLaneToRemove(null);
                                }}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Snackbar */}
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

