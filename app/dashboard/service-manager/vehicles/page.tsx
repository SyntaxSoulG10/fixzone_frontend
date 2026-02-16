"use client";

import { useState } from "react";
import Button from "@/components/UI/Button";
import PageHeader from "@/components/UI/PageHeader";
import { FiPlus, FiMoreVertical, FiClock, FiUser, FiTool, FiX } from "react-icons/fi";

// Type for a lane
interface LaneVehicle {
    ID: string;
    model: string;
    owner: string;
    repairStatus: string;
    action: string;
}

interface Lane {
    id: number;
    status: "filled" | "empty";
    vehicle?: LaneVehicle;
}

// Initial mock data for lanes
const INITIAL_LANES: Lane[] = [
    {
        id: 1,
        status: "filled",
        vehicle: {
            ID: "BK-1001",
            model: "Toyota Camry",
            owner: "Amila Silva",
            repairStatus: "In Progress",
            action: "Full Service"
        }
    },
    { id: 2, status: "empty" },
    {
        id: 3,
        status: "filled",
        vehicle: {
            ID: "BK-1003",
            model: "Nissan Sunny",
            owner: "Sarath Gunawardana",
            repairStatus: "In Progress",
            action: "Engine Repair"
        }
    },
    { id: 4, status: "empty" },
    { id: 5, status: "empty" },
];

export default function ServiceLaneManagePage() {
    const [lanes, setLanes] = useState<Lane[]>(INITIAL_LANES);
    const [openLaneId, setOpenLaneId] = useState<number | null>(null);
    const [bookingId, setBookingId] = useState("");

    // Add a new empty lane with the next lane number
    const handleAddLane = () => {
        const nextId = lanes.length > 0 ? Math.max(...lanes.map(l => l.id)) + 1 : 1;
        setLanes([...lanes, { id: nextId, status: "empty" }]);
    };

    // Remove an empty lane
    const handleRemoveLane = (laneId: number) => {
        setLanes(lanes.filter(l => l.id !== laneId));
    };

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
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${lane.vehicle?.repairStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    lane.vehicle?.repairStatus === 'Waiting for Parts' ? 'bg-amber-100 text-amber-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {lane.vehicle?.repairStatus}
                                </span>
                            )}
                        </div>

                        {/* Lane Content */}
                        <div className="p-4 flex-1 flex flex-col justify-center">
                            {lane.status === 'filled' && lane.vehicle ? (
                                <div className="space-y-4">
                                    <div className="text-center pb-4 border-b border-slate-100">
                                        <div className="font-mono text-lg font-bold text-slate-800 bg-slate-100 py-1 px-3 rounded inline-block mb-2">
                                            {lane.vehicle.ID}
                                        </div>
                                        <div className="font-medium text-slate-600">{lane.vehicle.model}</div>
                                    </div>

                                    <div className="space-y-3 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-slate-400" />
                                            <span>{lane.vehicle.owner}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FiTool className="text-slate-400" />
                                            <span>{lane.vehicle.action}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 mt-auto">
                                        <Button variant="secondary" className="w-full">
                                            Manage
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative w-full min-h-[200px] flex flex-col items-center justify-center">
                                    {/* Empty lane button */}
                                    <button
                                        onClick={() => {
                                            setOpenLaneId(openLaneId === lane.id ? null : lane.id);
                                            setBookingId("");
                                        }}
                                        className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary hover:bg-slate-100/50 rounded-lg transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <FiPlus className="text-2xl" />
                                        </div>
                                        <span className="font-medium">+ Add to service</span>
                                    </button>

                                    {/* Small dropdown popup for Booking ID */}
                                    {openLaneId === lane.id && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-[220px]">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-slate-700">Add Booking ID</span>
                                                <button
                                                    onClick={() => { setOpenLaneId(null); setBookingId(""); }}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    <FiX size={16} />
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={bookingId}
                                                onChange={(e) => setBookingId(e.target.value)}
                                                placeholder="e.g. BK-1005"
                                                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary mb-3"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    className="flex-1 bg-primary text-white text-sm font-medium py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => { setOpenLaneId(null); setBookingId(""); }}
                                                    className="flex-1 bg-slate-100 text-slate-600 text-sm font-medium py-1.5 rounded-md hover:bg-slate-200 transition-colors"
                                                >
                                                    Cancel
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
