"use client";

import { FiBell, FiMenu, FiMoon } from "react-icons/fi";
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
                <div className="relative">
                    <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                        <FiBell className="text-lg" />
                    </button>
                    {/* Orange Dot */}
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-orange-500 border-2 border-white rounded-full"></span>
                </div>

                {/* User Avatar */}
                <div className="cursor-pointer ml-1" onClick={handleLogout} title="Logout">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                        <img src="https://ui-avatars.com/api/?name=Charlie+Brown&background=5f5f5f&color=fff" alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </nav>
    );
}
