"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getNotifications, markNotificationAsRead } from "@/lib/api";
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

export default function ServiceManagerNotificationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [notification, setNotification] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                const data = await getNotifications();
                const found = data.find((n: any) => String(n.id) === String(params.id));
                if (found) {
                    setNotification(found);
                    const isRead = found.read !== undefined ? found.read : found.isRead;
                    if (!isRead) {
                        await markNotificationAsRead(found.id);
                        window.dispatchEvent(new CustomEvent("forceUpdateNotifications"));
                    }
                } else {
                    setError("Notification not found");
                }
            } catch (err) {
                setError("Failed to load notification details");
            } finally {
                setLoading(false);
            }
        };
        fetchNotification();
    }, [params.id]);

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500 animate-pulse">
                Loading notification...
            </div>
        );
    }

    if (error || !notification) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => router.push("/dashboard/service-manager/notifications")}
                    className="text-orange-600 hover:text-orange-700 font-medium inline-flex items-center gap-2"
                >
                    <FiArrowLeft /> Back to Notifications
                </button>
            </div>
        );
    }

    const getIcon = () => {
        switch (notification.type?.toUpperCase()) {
            case "SUCCESS": return <FiCheckCircle className="w-8 h-8 text-green-500" />;
            case "WARNING": return <FiAlertTriangle className="w-8 h-8 text-amber-500" />;
            default: return <FiInfo className="w-8 h-8 text-blue-500" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
            <button
                onClick={() => router.push("/dashboard/service-manager/notifications")}
                className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-2 mb-2 transition-colors"
            >
                <FiArrowLeft /> Back to Notifications
            </button>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {getIcon()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            {notification.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <FiClock className="w-4 h-4" />
                            {new Date(notification.createdAt).toLocaleString(undefined, {
                                dateStyle: "full",
                                timeStyle: "short"
                            })}
                        </div>
                    </div>
                </div>

                <div 
                    className="prose prose-slate max-w-none text-slate-700 leading-relaxed [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-4"
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                />

                {notification.targetUrl && (
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={() => router.push(notification.targetUrl)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-orange-500/20 transition-all active:scale-95"
                        >
                            View Action Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
