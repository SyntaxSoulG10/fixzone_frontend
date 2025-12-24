"use client";

import { useState } from "react";
import Link from "next/link";
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

                <div className="relative z-10 text-sm text-slate-500">
                    © 2024 FixZone Platform.
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Sign in to your account</h2>
                        <p className="mt-2 text-slate-500">
                            Or <Link href="/signup" className="text-primary hover:text-primary-hover font-medium">create a new account</Link>
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FiMail />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FiLock />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary-hover">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <FiArrowRight /></>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Demo Credentials</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-center text-slate-500">
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                            <span className="font-bold block text-slate-700">Admin</span>admin@fixzone.com
                        </div>
                        <div className="p-2 bg-slate-50 rounded border border-slate-100">
                            <span className="font-bold block text-slate-700">Owner</span>owner@fixzone.com
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
