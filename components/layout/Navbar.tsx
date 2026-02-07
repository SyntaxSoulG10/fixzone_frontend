"use client";

import { FiBell, FiMenu, FiSearch, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
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
        <nav className="fixed top-0 left-0 w-full h-16 bg-gradient-to-r from-slate-900 to-orange-900 border-b border-white/10 z-40 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                {/* Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <FiMenu className="text-xl" />
                </button>

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
                </div>
            </div>
        </nav>
    );
}
