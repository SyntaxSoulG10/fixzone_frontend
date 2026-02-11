"use client";

import { useState } from "react";
import Link from "next/link";
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
        <div
            className="min-h-screen relative flex justify-center overflow-auto font-sans bg-cover bg-center bg-no-repeat py-10"
            style={{ backgroundImage: "url('/loginBg.png')" }}
        >
            {/* Main Glass Card */}
            <div className="relative z-10 w-full max-w-3xl mx-4">
                <div className="bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-[2.5rem] p-4 md:p-8 transition-all duration-500">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl w-full">
                        {step === 1 ? (
                            /* STEP 1: Role Selection */
                            <div className="flex flex-col items-center animate-fade-in">
                                <h1 className="text-2xl md:text-3xl font-bold text-[#FF8C42] mb-8 text-center">Who are you?</h1>

                                <div className="flex flex-col md:flex-row gap-6 mb-8 w-full justify-center">
                                    {/* Vehicle Owner Card */}
                                    <button
                                        type="button"
                                        id="role-vehicle-owner"
                                        onClick={() => setRole("vehicle-owner")}
                                        className={`group flex flex-col items-center justify-center p-4 w-full md:w-56 h-56 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl bg-white
                                            ${role === "vehicle-owner"
                                                ? "border-[#FF8C42] shadow-orange-100 ring-4 ring-[#FF8C42]/10 scale-105"
                                                : "border-gray-200 hover:border-[#FF8C42] hover:scale-105"}`}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300
                                            ${role === "vehicle-owner" ? "bg-[#FF8C42] text-white" : "bg-[#FF8C42] text-white"}`}>
                                            <FiUser className="text-3xl" />
                                        </div>
                                        <span className="text-xl font-bold text-gray-800 text-center">Vehicle Owner</span>
                                    </button>

                                    {/* Service Center Owner Card */}
                                    <button
                                        type="button"
                                        id="role-service-center"
                                        onClick={() => setRole("service-center")}
                                        className={`group flex flex-col items-center justify-center p-4 w-full md:w-56 h-56 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl bg-white
                                            ${role === "service-center"
                                                ? "border-[#FF8C42] shadow-orange-100 ring-4 ring-[#FF8C42]/10 scale-105"
                                                : "border-gray-200 hover:border-[#FF8C42] hover:scale-105"}`}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300
                                            ${role === "service-center" ? "bg-[#FF8C42] text-white" : "bg-[#FF8C42] text-white"}`}>
                                            <FiBriefcase className="text-2xl" />
                                        </div>
                                        <span className="text-lg font-bold text-gray-800 text-center">Service Center<br />Owner</span>
                                    </button>
                                </div>

                                <div className="flex w-full justify-between items-center max-w-md mt-4 px-2">
                                    <Link id="btn-back" href="/" className="px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-bold">
                                        &lt; Back
                                    </Link>
                                    <button
                                        type="button"
                                        id="btn-next"
                                        onClick={() => role && setStep(2)}
                                        disabled={!role}
                                        className="px-6 py-2.5 bg-[#FF8C42] text-white rounded-xl hover:bg-[#F97316] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-200"
                                    >
                                        Next &gt;
                                    </button>
                                </div>
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

