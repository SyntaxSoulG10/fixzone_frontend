"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiInfo, FiAlertCircle, FiCheck } from "react-icons/fi";

const DUMMY_NOTIFICATIONS = [
    { id: 1, title: "Booking Confirmed", message: "Your service appointment for Dec 28 has been confirmed.", time: "2 hours ago", type: "success" },
    { id: 2, title: "Vehicle Ready", message: "Your Toyota Camry is ready for pickup at Downtown Branch.", time: "Yesterday", type: "info" },
    { id: 3, title: "Payment Receipt", message: "Payment of $150.00 was successful.", time: "Nov 15, 2024", type: "success" },
    { id: 4, title: "Maintenance Reminder", message: "It's been 6 months since your last oil change.", time: "Nov 01, 2024", type: "warning" },
];

export default function NotificationsPage() {
    return (
        <div>
            <PageHeader
                title="Notifications"
                description="Updates on your vehicle status and bookings."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                {DUMMY_NOTIFICATIONS.map((notif) => (
                    <div key={notif.id} className="p-4 flex gap-4 hover:bg-slate-50 transition-colors relative">
                        <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                    'bg-blue-100 text-blue-600'
                            }`}>
                            {notif.type === 'success' ? <FiCheck /> : notif.type === 'warning' ? <FiAlertCircle /> : <FiInfo />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{notif.title}</h4>
                            <p className="text-slate-600 text-sm mt-0.5">{notif.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{notif.time}</p>
                        </div>
                        {notif.id === 1 && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
