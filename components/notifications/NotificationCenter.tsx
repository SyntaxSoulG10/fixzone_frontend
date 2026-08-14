"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FiCheck,
    FiCheckCircle,
    FiInfo,
    FiAlertTriangle,
    FiTrash,
    FiSearch,
    FiBell,
    FiLoader,
    FiArrowRight
} from "react-icons/fi";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from "@/lib/api";
import { toast } from "react-hot-toast";

export default function NotificationCenter() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error("Failed to load notifications:", error);
            toast.error("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            toast.success("Marked as read");
            fetchNotifications();
            // Notify Navbar to update badge
            window.dispatchEvent(new CustomEvent("forceUpdateNotifications"));
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this notification?")) {
            try {
                await deleteNotification(id);
                toast.success("Notification deleted");
                fetchNotifications();
                window.dispatchEvent(new CustomEvent("forceUpdateNotifications"));
            } catch (error) {
                toast.error("Failed to delete notification");
            }
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            toast.success("All notifications marked as read");
            fetchNotifications();
            window.dispatchEvent(new CustomEvent("forceUpdateNotifications"));
        } catch (error) {
            toast.error("Failed to update notifications");
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString();
        } catch (e) {
            return dateStr;
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        const isRead = n.read !== undefined ? n.read : n.isRead;
        
        // Tab Filter
        if (activeTab === "UNREAD" && isRead) return false;
        if (activeTab === "READ" && !isRead) return false;

        // Search Filter
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const titleMatch = n.title?.toLowerCase().includes(query);
            const messageMatch = n.message?.toLowerCase().includes(query);
            return titleMatch || messageMatch;
        }

        return true;
    });

    const unreadCount = notifications.filter((n) => !(n.read !== undefined ? n.read : n.isRead)).length;

    const getSeverityStyles = (type: string) => {
        switch (type?.toUpperCase()) {
            case "SUCCESS":
                return {
                    bg: "bg-green-50 text-green-700 border-green-100",
                    iconBg: "bg-green-100 text-green-600",
                    icon: FiCheckCircle
                };
            case "WARNING":
                return {
                    bg: "bg-amber-50 text-amber-700 border-amber-100",
                    iconBg: "bg-amber-100 text-amber-600",
                    icon: FiAlertTriangle
                };
            default:
                return {
                    bg: "bg-blue-50 text-blue-700 border-blue-100",
                    iconBg: "bg-blue-100 text-blue-600",
                    icon: FiInfo
                };
        }
    };

    const handleCardClick = async (n: any) => {
        const isRead = n.read !== undefined ? n.read : n.isRead;
        if (!isRead) {
            try {
                await markNotificationAsRead(n.id);
                window.dispatchEvent(new CustomEvent("forceUpdateNotifications"));
            } catch (error) {
                console.error(error);
            }
        }
        const pathname = window.location.pathname;
        const parts = pathname.split('/');
        const dashboardIndex = parts.indexOf('dashboard');
        const rolePart = dashboardIndex !== -1 && parts.length > dashboardIndex + 1 ? parts[dashboardIndex + 1] : "customer";

        if (n.targetUrl) {
            router.push(n.targetUrl);
        } else {
            router.push(`/dashboard/${rolePart}/notifications/${n.id}`);
        }
    };

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <FiLoader className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-slate-500 font-medium">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <FiBell className="text-orange-500" /> Notification Center
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Stay updated with platform alerts, plans, and system status changes.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="self-start sm:self-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FiCheck className="w-4 h-4" /> Mark all as read
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
                    {(["ALL", "UNREAD", "READ"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                activeTab === tab
                                    ? "bg-white text-orange-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {tab === "ALL" ? "All" : tab === "UNREAD" ? `Unread (${unreadCount})` : "Read"}
                        </button>
                    ))}
                </div>

                {/* Search input */}
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all"
                    />
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 border-dashed p-16 text-center">
                        <FiBell className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No notifications found.</p>
                        <p className="text-slate-400 text-sm mt-1">
                            {searchQuery ? "Try refining your search terms." : "You're all caught up!"}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((n) => {
                        const isRead = n.read !== undefined ? n.read : n.isRead;
                        const styles = getSeverityStyles(n.type);
                        const Icon = styles.icon;

                        return (
                            <div
                                key={n.id}
                                className={`group relative bg-white p-5 rounded-xl border shadow-sm transition-all hover:shadow-md flex gap-4 ${
                                    isRead ? "border-slate-200" : "border-orange-200 bg-orange-50/5 ring-1 ring-orange-50"
                                }`}
                            >
                                {/* Left Icon */}
                                <div className={`w-10 h-10 rounded-lg shrink-0 flex items-center justify-center ${styles.iconBg}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pr-12">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                                        <h3 className={`text-sm truncate ${!isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                                            {n.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {formatTime(n.createdAt)}
                                        </span>
                                    </div>
                                    <div 
                                        className="text-xs text-slate-500 leading-relaxed font-medium prose prose-slate max-w-none [&_img]:max-h-60 [&_img]:rounded-lg [&_img]:mt-2 [&_img]:object-cover"
                                        dangerouslySetInnerHTML={{ __html: n.message }}
                                    />

                                    {/* Link indicator */}
                                    {n.targetUrl && (
                                        <button
                                            onClick={() => handleCardClick(n)}
                                            className="mt-3 text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-all"
                                        >
                                            View details <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    )}
                                </div>

                                {/* Right Actions */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-lg border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    {!isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(n.id)}
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-50"
                                            title="Mark as Read"
                                        >
                                            <FiCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(n.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-50"
                                        title="Delete Notification"
                                    >
                                        <FiTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
