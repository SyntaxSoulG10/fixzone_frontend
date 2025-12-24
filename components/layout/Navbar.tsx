"use client";

import { FiBell, FiMenu, FiSearch, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("tenantId");
        router.push("/login");
    };

    return (
        <nav className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button - Visible on small screens */}
                <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <FiMenu className="text-xl" />
                </button>

                <Link href="/" className="flex items-center gap-2">
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
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <span className="text-xs font-medium text-slate-600">Tenant: <span className="text-slate-900 font-bold">AutoFix Pro</span></span>
                </div>

                <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                    <FiBell className="text-xl" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                    title="Logout"
                >
                    <FiLogOut className="text-xl" />
                </button>
            </div>
        </nav>
    );
}
