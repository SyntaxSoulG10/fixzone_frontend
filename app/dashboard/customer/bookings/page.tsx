"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiCalendar, FiClock, FiMapPin, FiTool } from "react-icons/fi";

const DUMMY_BOOKINGS = [
    { id: 1, service: "General Service", date: "Dec 28, 2024", time: "10:00 AM", center: "Downtown Branch", status: "Confirmed", vehicle: "Toyota Camry" },
    { id: 2, service: "Oil Change", date: "Jan 05, 2025", time: "02:30 PM", center: "Westside Hub", status: "Pending", vehicle: "Toyota Camry" },
];

export default function MyBookingsPage() {
    return (
        <div>
            <PageHeader
                title="My Bookings"
                description="Manage your upcoming service appointments."
                action={
                    <Button>
                        + Book New Service
                    </Button>
                }
            />

            <div className="space-y-4">
                {DUMMY_BOOKINGS.map((booking) => (
                    <div key={booking.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                                <FiCalendar />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{booking.service}</h3>
                                <p className="text-slate-500 text-sm mb-2">{booking.vehicle}</p>
                                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                        <FiClock /> {booking.date} at {booking.time}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                        <FiMapPin /> {booking.center}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {booking.status}
                            </span>
                            <Button variant="secondary" className="text-xs">Reschedule</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
