"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiArrowRight, FiArrowLeft, FiPhone, FiBriefcase } from "react-icons/fi";

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"vehicle-owner" | "service-center" | null>(null);
    const [loading, setLoading] = useState(false);

    // Form inputs
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!role) return;

        setLoading(true);

        // MOCK SIGNUP LOGIC
        setTimeout(() => {
            let routeRole = "customer"; // Default vehicle owner
            if (role === "service-center") routeRole = "company-owner";

            // In a real app, you'd send data to backend here
            localStorage.setItem("userRole", routeRole);

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
                        ) : (
                            /* STEP 2: Sign Up Form */
                            <div className="w-full max-w-md mx-auto animate-fade-in">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-[#FF8C42] mb-2">
                                        {role === "vehicle-owner" ? "Vehicle Owner" : "Service Partner"}
                                    </h1>
                                    <p className="text-gray-500 text-sm">Create your account to get started.</p>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    {role === "service-center" && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                        <FiBriefcase className="text-sm" />
                                                    </div>
                                                    <input
                                                        id="input-company-name"
                                                        type="text"
                                                        value={companyName}
                                                        onChange={(e) => setCompanyName(e.target.value)}
                                                        required
                                                        className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                                        placeholder="FixZone Main Branch"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Phone Number</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                        <FiPhone className="text-sm" />
                                                    </div>
                                                    <input
                                                        id="input-phone"
                                                        type="tel"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        required
                                                        className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiUser className="text-sm" />
                                            </div>
                                            <input
                                                id="input-fullname"
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiMail className="text-sm" />
                                            </div>
                                            <input
                                                id="input-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
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
                                                id="input-password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiLock className="text-sm" />
                                            </div>
                                            <input
                                                id="input-confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            id="btn-form-back"
                                            onClick={() => setStep(1)}
                                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            id="btn-submit"
                                            disabled={loading}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-200 text-white bg-[#FF8C42] hover:bg-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Create Account <FiArrowRight /></>
                                            )}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-6 text-center">
                                    <p className="text-gray-500 text-sm">
                                        Already have an account? <Link href="/login" className="text-[#FF8C42] hover:underline font-bold">Log in</Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

