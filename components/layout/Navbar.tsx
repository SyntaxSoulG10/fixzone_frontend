"use client";

import { useState, useEffect, useRef } from "react";
import { FiBell, FiMenu, FiMoon, FiUser, FiSettings, FiLogOut, FiX, FiCheck, FiTrash } from "react-icons/fi";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/api";

interface NavbarProps {
    onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [userData, setUserData] = useState<{ fullName?: string, profilePictureUrl?: string } | null>(null);

    // Refs for click outside
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    const fetchUserData = async () => {
        try {
            // Determine true role from token
            const token = localStorage.getItem("token");
            const currentRole = localStorage.getItem("userRole");

            let endpoint = "";
            if (currentRole === "ROLE_COMPANY_OWNER" || currentRole === "OWNER") {
                endpoint = APP_CONFIG.api.owners + "/current";
            } else if (currentRole === "ROLE_SERVICE_MANAGER") {
                endpoint = APP_CONFIG.api.managers + "/current";
            } else if (currentRole === "ROLE_CUSTOMER") {
                endpoint = APP_CONFIG.api.customer + "/profile";
            } else if (currentRole === "ROLE_SUPER_ADMIN") {
                endpoint = APP_CONFIG.api.superAdmins + "/me";
            }

            if (endpoint && token) {
                const response = await axios.get(endpoint);
                if (response.data) {
                    const data = response.data;
                    setUserData({
                        fullName: data.fullName || data.companyName || (data.firstName ? `${data.firstName} ${data.secondName || ''}`.trim() : 'User'),
                        profilePictureUrl: data.profilePictureUrl
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch user data for Navbar:", error);
        }
    };

    useEffect(() => {
        // Derive role from path
        if (pathname.includes('/super-admin')) setRole('super_admin');
        else if (pathname.includes('/company-owner')) setRole('company_owner');
        else if (pathname.includes('/service-manager')) setRole('service_manager');
        else if (pathname.includes('/customer')) setRole('customer');
        else {
            const r = localStorage.getItem("userRole");
            setRole(r || "customer");
        }

        // Close dropdowns on path change
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);

        fetchUserData();
    }, [pathname]);

    useEffect(() => {
        const handleProfileUpdate = () => {
            fetchUserData();
        };
        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotificationsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("tenantId");
        router.push("/login");
    };

    const getProfileUrl = () => {
        if (!role) return "/dashboard";

        // Robust mapping for dashboard sub-paths
        const roleToPath: Record<string, string> = {
            "ROLE_COMPANY_OWNER": "company-owner",
            "OWNER": "company-owner",
            "ROLE_SERVICE_MANAGER": "service-manager",
            "ROLE_SUPER_ADMIN": "super-admin",
            "ROLE_CUSTOMER": "customer",
            "CUSTOMER": "customer",
            // Handle derived roles (lowercase/hyphenated) if they already exist
            "company_owner": "company-owner",
            "service_manager": "service-manager",
            "super_admin": "super-admin"
        };

        const path = roleToPath[role] || role.toLowerCase().replace('role_', '').replace(/_/g, '-');
        return `/dashboard/${path}/profile`;
    };

    const [notifications, setNotifications] = useState<any[]>([]);

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const data = await getNotifications();
            setNotifications(data || []);
            // Dispatch custom event for the Sidebar or other components
            window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: data || [] }));
        } catch (error) {
            console.warn("Failed to fetch notifications in Navbar:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Listen to force updates
        const handleForceUpdate = () => fetchNotifications();
        window.addEventListener("forceUpdateNotifications", handleForceUpdate);

        const interval = setInterval(fetchNotifications, 30000); // 30 seconds
        return () => {
            clearInterval(interval);
            window.removeEventListener("forceUpdateNotifications", handleForceUpdate);
        };
    }, [pathname]);

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            if (isNaN(diffMs) || diffMs < 0) return "Just now";
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) return "Just now";
            if (diffMins < 60) return `${diffMins} min ago`;
            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) return "Yesterday";
            if (diffDays < 7) return `${diffDays} days ago`;
            return date.toLocaleDateString();
        } catch (e) {
            return "Recently";
        }
    };

    const handleNotificationClick = async (n: any) => {
        const isNotificationRead = n.read !== undefined ? n.read : n.isRead;
        try {
            if (!isNotificationRead) {
                await markNotificationAsRead(n.id);
                fetchNotifications();
            }
            setIsNotificationsOpen(false);
            if (n.targetUrl) {
                router.push(n.targetUrl);
            }
        } catch (error) {
            console.error("Failed to handle notification click:", error);
        }
    };

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            fetchNotifications();
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead();
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getNotificationsPageUrl = () => {
        if (!role) return "";
        // Super admin and customer don't have a dedicated notifications page tab
        if (role === "ROLE_SUPER_ADMIN" || role === "super_admin") return "";
        if (role === "ROLE_CUSTOMER" || role === "CUSTOMER" || role === "customer") return "";

        const roleToPath: Record<string, string> = {
            "ROLE_COMPANY_OWNER": "company-owner",
            "OWNER": "company-owner",
            "ROLE_SERVICE_MANAGER": "service-manager",
            "company_owner": "company-owner",
            "service_manager": "service-manager",
        };

        const path = roleToPath[role] || role.toLowerCase().replace('role_', '').replace(/_/g, '-');
        return `/dashboard/${path}/notifications`;
    }

    const unreadCount = notifications.filter(n => !(n.read !== undefined ? n.read : n.isRead)).length;

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <FiMenu className="text-xl" />
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img src="/Logo-Light.png" alt="FixZone" className="h-20 w-auto object-contain" />
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle (Static) */}
                <button className="w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <FiMoon className="text-lg" />
                </button>

                {/* Notifications (Bell) */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${isNotificationsOpen ? "bg-orange-50 text-orange-600 border-orange-200" : "border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <FiBell className="text-lg" />
                        {/* Dot */}
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-85 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-200">
                            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                    {unreadCount} New
                                </span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-xs italic">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((n) => {
                                        const isNotificationRead = n.read !== undefined ? n.read : n.isRead;
                                        return (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-2.5 items-start group ${!isNotificationRead ? 'bg-orange-50/20 border-l-2 border-orange-500' : ''
                                                    }`}
                                            >
                                                <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${n.type === 'SUCCESS' ? 'bg-green-500' :
                                                        n.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-0.5">
                                                        <p className={`text-xs truncate ${!isNotificationRead ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                                                            {n.title}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                            {formatTime(n.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="text-xs text-slate-500 line-clamp-2 leading-relaxed [&_img]:hidden [&_.notif-attachment-link]:hidden"
                                                        dangerouslySetInnerHTML={{ __html: n.message }}
                                                    />
                                                    <div className="flex gap-2 mt-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!isNotificationRead && (
                                                            <button
                                                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                                                className="p-1 text-[10px] text-green-600 hover:bg-green-50 rounded border border-green-100 flex items-center justify-center"
                                                                title="Mark as read"
                                                            >
                                                                <FiCheck className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(n.id, e)}
                                                            className="p-1 text-[10px] text-red-500 hover:bg-red-50 rounded border border-red-100 flex items-center justify-center"
                                                            title="Delete"
                                                        >
                                                            <FiTrash className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="p-2.5 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                    Mark all as read
                                </button>
                                {getNotificationsPageUrl() && (
                                    <Link
                                        href={getNotificationsPageUrl()}
                                        onClick={() => setIsNotificationsOpen(false)}
                                        className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                                    >
                                        View all
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Avatar */}
                <div className="relative ml-1" ref={profileRef}>
                    <div
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className={`cursor-pointer transition-all ${isProfileOpen ? 'ring-2 ring-orange-100 rounded-full' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                            {userData?.profilePictureUrl ? (
                                <img src={userData.profilePictureUrl} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <img src={`https://ui-avatars.com/api/?name=${userData?.fullName || 'User'}&background=5f5f5f&color=fff`} alt="User" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-800">{userData?.fullName || "Charlie Brown"}</p>
                                <p className="text-xs text-slate-500 truncate capitalize">{role?.replace('_', ' ') || 'User'}</p>
                            </div>
                            <div className="p-1">
                                <Link
                                    href={getProfileUrl()}
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                                >
                                    <FiUser className="text-slate-400" /> My Profile
                                </Link>
                                <Link
                                    href="/settings"
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                                >
                                    <FiSettings className="text-slate-400" /> Settings
                                </Link>
                            </div>
                            <div className="p-1 border-t border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                >
                                    <FiLogOut className="text-red-400" /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
