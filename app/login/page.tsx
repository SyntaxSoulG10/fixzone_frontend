"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // MOCK LOGIN LOGIC
        // In a real app, this would hit an API.
        setTimeout(() => {
            let role = "customer";
            if (email.includes("admin")) role = "super_admin";
            else if (email.includes("owner")) role = "company_owner";
            else if (email.includes("manager")) role = "service_manager";

            // Save to localStorage (Simulating session)
            localStorage.setItem("userRole", role);
            localStorage.setItem("tenantId", "tenant-123");

            // Redirect based on role
            router.push(`/dashboard/${role.replace('_', '-')}`);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
            {/* Left: Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="text-2xl font-bold">FixZone</span>
                    </Link>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Welcome back to the future of service management.
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Manage your service center with ease and efficiency.
                    </p>
                </div>

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiMail className="text-sm" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <FiLock className="text-sm" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-[#FF8C42] focus:ring-[#FF8C42] border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-gray-600">
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#" className="font-medium text-[#FF8C42] hover:text-[#F97316]">
                                        Forgot password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-200 text-white bg-[#FF8C42] hover:bg-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Sign In <FiArrowRight /></>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Don't have an account? <Link href="/signup" className="text-[#FF8C42] hover:underline font-bold">Sign up</Link>
                                </p>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
