"use client";

import { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { FiPlus, FiUser, FiTool, FiX, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useDashboardData } from "../../../../context/DashboardDataContext";
import * as bookingService from "../../../../services/bookingService";

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
    const { bookingsData, refreshBookings } = useDashboardData();
    
    const [lanes, setLanes] = useState<Lane[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const savedLanes = localStorage.getItem("serviceLanes");
        if (savedLanes) {
            setLanes(JSON.parse(savedLanes));
        } else {
            setLanes(Array.from({ length: 5 }, (_, i) => ({ id: i + 1, status: "empty" })));
        }
    }, []);

    // Save lanes to localStorage whenever they change
    useEffect(() => {
        if (isClient && lanes.length > 0) {
            localStorage.setItem("serviceLanes", JSON.stringify(lanes));
        }
    }, [lanes, isClient]);

    const [openLaneId, setOpenLaneId] = useState<number | null>(null);
    const [manageLaneId, setManageLaneId] = useState<number | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState("");

    // Get today's upcoming bookings
    const d = new Date();
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const upcomingBookings = (bookingsData || []).filter((b: any) => 
        (b.status === "PENDING_PAYMENT" || b.status === "CONFIRMED") && 
        b.bookingDate === todayStr
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
            
            // Find the booking details to populate the lane
            const booking = upcomingBookings.find((b: any) => b.bookingId === selectedBookingId);
            
            let customer = booking?.customerName || (booking?.customerId ? `Cust ${booking.customerId.substring(0,6)}` : 'Unknown');
            let vehicle = booking?.vehicleName || (booking?.vehicleId ? `Veh ${booking.vehicleId.substring(0,6)}` : 'Unknown');
            let vehicleNumber = "";
            let service = booking?.packageName || 'Standard Service';

            if (booking?.specialRequest?.startsWith("Customer: ")) {
                try {
                    const cMatch = booking.specialRequest.match(/Customer:\s*([^,]+)/);
                    if (cMatch) customer = cMatch[1].trim();
                    const vMatch = booking.specialRequest.match(/Vehicle:\s*([^,]+)/);
                    if (vMatch) vehicle = vMatch[1].trim();
                    const vnMatch = booking.specialRequest.match(/Vehicle Number:\s*([^,]+)/);
                    if (vnMatch) vehicleNumber = vnMatch[1].trim();
                    const sMatch = booking.specialRequest.match(/Service:\s*([^,]+)/);
                    if (sMatch) service = sMatch[1].trim();
                } catch(e) {}
            }

            setLanes(lanes.map(l => l.id === laneId ? {
                ...l,
                status: "filled",
                vehicle: {
                    bookingId: selectedBookingId,
                    model: vehicle,
                    vehicleNumber: vehicleNumber,
                    owner: customer,
                    action: service
                }
            } : l));
            
            setOpenLaneId(null);
            setSelectedBookingId("");
            if (refreshBookings) refreshBookings();
            
        } catch (error) {
            console.error("Failed to start service", error);
            alert("Error starting service.");
        }
    };

    const handleComplete = async (laneId: number, bookingId: string) => {
        try {
            await bookingService.completeBooking(bookingId);
            emptyLane(laneId);
            if (refreshBookings) refreshBookings();
        } catch (error) {
            console.error("Failed to complete booking", error);
            alert("Error completing service.");
        }
    };

    const handleCancel = async (laneId: number, bookingId: string) => {
        try {
            await bookingService.cancelBooking(bookingId);
            emptyLane(laneId);
            if (refreshBookings) refreshBookings();
        } catch (error) {
            console.error("Failed to cancel booking", error);
            alert("Error cancelling service.");
        }
    };

    const emptyLane = (laneId: number) => {
        setLanes(lanes.map(l => l.id === laneId ? { id: laneId, status: "empty" } : l));
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
                <Button className="flex items-center gap-2" onClick={handleAddLane}>
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
                                                    <FiCheckCircle /> Complete Service
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(lane.id, lane.vehicle!.bookingId)}
                                                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 py-2 rounded hover:bg-red-100 transition-colors text-sm font-medium"
                                                >
                                                    <FiXCircle /> Cancel Booking
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
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
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
                                                        return (
                                                            <div 
                                                                key={b.bookingId}
                                                                onClick={() => setSelectedBookingId(b.bookingId)}
                                                                className={`p-2 border-b border-slate-100 last:border-0 cursor-pointer transition-colors text-sm ${isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-slate-50'}`}
                                                            >
                                                                <div className="font-medium text-slate-800">{b.customerName || `Cust ${b.customerId?.substring(0,6)}`}</div>
                                                                <div className="text-slate-500 text-xs mt-0.5">{b.bookingTime} - {b.packageName}</div>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAddToService(lane.id)}
                                                    disabled={!selectedBookingId}
                                                    className="flex-1 bg-primary text-white text-sm font-medium py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
    );
}
