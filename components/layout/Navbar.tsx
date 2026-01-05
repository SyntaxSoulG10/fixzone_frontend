"use client";

import { FiBell, FiMenu, FiSearch, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface NavbarProps {
    onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("tenantId");
        router.push("/login");
    };

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

                <Link href="/" className="flex items-center gap-2">
                    {/* Placeholder for Logo if not found, or use Next Image if found later */}
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        F
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600 hidden sm:block">
                        FixZone
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    <span className="text-xs font-medium text-slate-600">Tenant: <span className="text-slate-900 font-bold">AutoFix Pro</span></span>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="flex flex-col items-end hidden sm:block">
                        <span className="text-sm font-semibold text-slate-900">Charlie Brown</span>
                        <span className="text-xs text-slate-500">Service Manager</span>
                    </div>
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                            {/* Placeholder for user image */}
                            <img src="https://ui-avatars.com/api/?name=Charlie+Brown&background=0D8ABC&color=fff" alt="User" />
                        </div>
                        {/* Notification Dot */}
                        <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                    </div>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
