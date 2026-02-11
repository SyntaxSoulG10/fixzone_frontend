"use client";

import { useState, useEffect, useRef } from "react";
import { FiBell, FiMenu, FiMoon, FiUser, FiSettings, FiLogOut, FiX } from "react-icons/fi";
import Link from "next/link";
<<<<<<< HEAD
import { useRouter, usePathname } from "next/navigation";
=======
import Image from "next/image";
import { useRouter } from "next/navigation";
>>>>>>> origin/feature/super-admin-updates

interface NavbarProps {
    onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);

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
        <nav className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-slate-900 to-orange-900 border-b border-white/10 z-40 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <FiMenu className="text-xl" />
                </button>

<<<<<<< HEAD
                {/* Logo */}
                <Link href="/" className="flex items-center">
                    <img src="/Logo-Light.png" alt="FixZone" className="h-20 w-auto object-contain" />
                </Link>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle (Moon) */}
                <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
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
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                            <img src="https://ui-avatars.com/api/?name=Charlie+Brown&background=5f5f5f&color=fff" alt="User" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-slate-100">
                                <p className="text-sm font-semibold text-slate-800">Charlie Brown</p>
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
=======
                {/* Logo - Light Version for Dark Navbar */}
                <div className="flex items-center gap-2">
                    <Image 
                        src="/Logo-Light.png" 
                        alt="FixZone Logo" 
                        width={240} 
                        height={60} 
                        className="h-[60px] w-auto object-contain"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    <span className="text-xs font-medium text-slate-400">Tenant: <span className="text-slate-200 font-bold">AutoFix Pro</span></span>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-4">
                    <div className="hidden md:block">
                        <span className="text-sm font-bold text-white leading-none">Charlie Brown</span>
                    </div>
                    <div className="relative group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700/50 group-hover:border-orange-500/50 transition-colors overflow-hidden">
                            <img src="https://ui-avatars.com/api/?name=Charlie+Brown&background=0f172a&color=cbd5e1" alt="User" />
                        </div>
                        {/* Notification Dot */}
                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse"></div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all ml-1"
                        title="Sign Out"
                    >
                        <FiLogOut className="w-5 h-5" />
                    </button>
>>>>>>> origin/feature/super-admin-updates
                </div>
            </div>
        </nav>
    );
}
