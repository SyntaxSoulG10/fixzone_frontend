"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiBriefcase, FiTool, FiSmile, FiArrowRight } from "react-icons/fi";

export default function SignupPage() {
    const router = useRouter();
    const [role, setRole] = useState("customer");
    const [loading, setLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // MOCK SIGNUP
        setTimeout(() => {
            let routeRole = role;
            if (role === "owner") routeRole = "company-owner";
            if (role === "manager") routeRole = "service-manager";

            localStorage.setItem("userRole", routeRole);
            // Redirect
            router.push(`/dashboard/${routeRole}`);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50">
            {/* Left: Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                <div className="absolute top-24 right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="text-2xl font-bold">FixZone</span>
                    </Link>
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Join the network of top service centers.
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Start managing your business or booking services today.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-slate-500">
                    © 2024 FixZone Platform.
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-8 my-auto">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Create your account</h2>
                        <p className="mt-2 text-slate-500">
                            Already have an account? <Link href="/login" className="text-primary hover:text-primary-hover font-medium">Log in</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("customer")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${role === 'customer' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                >
                                    <FiSmile className="mb-2 text-xl" />
                                    <span className="text-xs font-medium">Customer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("manager")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${role === 'manager' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                >
                                    <FiTool className="mb-2 text-xl" />
                                    <span className="text-xs font-medium">Manager</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("owner")}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${role === 'owner' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                >
                                    <FiBriefcase className="mb-2 text-xl" />
                                    <span className="text-xs font-medium">Owner</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FiUser />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <FiMail />
                                    </div>
                                    <input
                                        type="email"
                                        required
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
                                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors bg-slate-50 focus:bg-white"
                                        placeholder="••••••••"
                                    />
                                </div>
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
                                <>Create Account <FiArrowRight /></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
