"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import { getUserRole, isTokenExpired } from "../../utils/authUtils";
import APP_CONFIG from "@/config";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (response.status === 401) {
                    throw new Error("Invalid email or password");
                }
                throw new Error(errorData?.details || errorData?.message || "Login failed. Please try again.");
            }

            const data = await response.json();
            
            // The Next.js API route sets the HttpOnly cookie for the token.
            // We just need to handle the user data and redirect.
            if (data.role) localStorage.setItem("role", data.role);
            if (data.role) localStorage.setItem("userRole", data.role);
            if (data.userId) localStorage.setItem("userId", data.userId);
            if (data.fullName) localStorage.setItem("fullName", data.fullName);

            const role = data.role || data.userRole;
            
            if (role) {
                switch (role) {
                    case "ROLE_SERVICE_MANAGER":
                        router.push("/dashboard/service-manager");
                        break;
                    case "ROLE_SUPER_ADMIN":
                        router.push("/dashboard/super-admin");
                        break;
                    case "ROLE_COMPANY_OWNER":
                    case "OWNER":
                        router.push("/dashboard/company-owner");
                        break;
                    case "ROLE_CUSTOMER":
                    case "CUSTOMER":
                        router.push("/dashboard/customer");
                        break;
                    default:
                        router.push("/dashboard/customer"); // fallback
                }
            } else {
                // If role isn't returned, fallback
                router.push("/dashboard");
            }
            
        } catch (err: any) {
            setError(err.message || "Failed to connect to the server.");
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex justify-center items-center overflow-auto font-sans bg-cover bg-center bg-no-repeat py-10"
            style={{ backgroundImage: "url('/loginBg.png')" }}
        >
            {/* Main Glass Card */}
            <div className="relative z-10 w-full max-w-3xl mx-4">
                <div className="bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-[2.5rem] p-4 md:p-8 transition-all duration-500">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl w-full">
                        <div className="w-full max-w-md mx-auto animate-fade-in">
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-[#FF8C42] mb-2">
                                    Welcome Back
                                </h1>
                                <p className="text-gray-500 text-sm">Sign in to your account to continue.</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

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
