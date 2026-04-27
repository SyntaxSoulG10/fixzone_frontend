"use client";

import { useState, useEffect, useRef } from "react";
import { FiBell, FiMenu, FiMoon, FiUser, FiSettings, FiLogOut, FiX } from "react-icons/fi";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { APP_CONFIG } from "@/utils/config";

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

        // Fetch user data based on role
        const fetchUserData = async () => {
            try {
                // Determine true role from token
                const token = localStorage.getItem("token");
                const currentRole = localStorage.getItem("userRole");
                
                let endpoint = "";
                if (currentRole === "ROLE_COMPANY_OWNER" || currentRole === "OWNER") {
                    endpoint = APP_CONFIG.api.owners + "/current";
                } else if (currentRole === "ROLE_SERVICE_MANAGER") {
                    endpoint = APP_CONFIG.api.managers + "/me";
                } else if (currentRole === "ROLE_CUSTOMER") {
                    endpoint = "http://localhost:8081/api/customer/profile";
                } else if (currentRole === "ROLE_SUPER_ADMIN") {
                    endpoint = APP_CONFIG.api.superAdmins + "/me";
                }

                if (endpoint && token) {
                    const response = await axios.get(endpoint, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data) {
                        const data = response.data;
                        setUserData({
                            fullName: data.fullName || data.companyName || (data.firstName ? `${data.firstName} ${data.secondName}` : 'User'),
                            profilePictureUrl: data.profilePictureUrl
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch user data for Navbar:", error);
            }
        };

        fetchUserData();
    }, [pathname]);

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
        return `/dashboard/${role.replace('_', '-')}/profile`;
    };

    const notifications = [
        { id: 1, title: "New Booking Request", desc: "John Doe requested a tire service.", time: "5 min ago", unread: true },
        { id: 2, title: "System Update", desc: "Maintenance scheduled for tonight.", time: "1 hr ago", unread: false },
        { id: 3, title: "Payment Received", desc: "Invoice #1023 was paid.", time: "3 hrs ago", unread: false },
    ];

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

                {/* Notifications (Bell) */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${isNotificationsOpen ? "bg-orange-50 text-orange-600 border-orange-200" : "border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        <FiBell className="text-lg" />
                        {/* Dot */}
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></span>
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                            <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">1 New</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map((n) => (
                                    <div key={n.id} className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${n.unread ? 'bg-orange-50/30' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm ${n.unread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>{n.title}</p>
                                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{n.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2">{n.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 text-center border-t border-slate-100">
                                <button className="text-xs font-medium text-orange-600 hover:text-orange-700 transition-colors">
                                    Mark all as read
                                </button>
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
