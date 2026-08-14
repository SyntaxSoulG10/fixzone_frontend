"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import APP_CONFIG from "@/config";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data?.message || data?.details || "Request failed. Please try again.");
            }

            setMessage(data.message || "If the email is registered, a reset link will be sent.");
        } catch (err: any) {
            setError(err.message || "Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex justify-center items-center overflow-auto font-sans bg-cover bg-center bg-no-repeat py-10"
            style={{ backgroundImage: "url('/loginBg.png')" }}
        >
            <div className="relative z-10 w-full max-w-lg mx-4">
                <div className="bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-[2.5rem] p-4 md:p-8 transition-all duration-500">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-xl w-full">
                        <div className="w-full mx-auto animate-fade-in">
                            <div className="mb-6">
                                <Link href="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-[#FF8C42] transition-colors">
                                    <FiArrowLeft className="mr-2" /> Back to login
                                </Link>
                            </div>
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-[#FF8C42] mb-2">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-500 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {message ? (
                                <div className="text-center">
                                    <div className="mb-4 flex justify-center text-green-500">
                                        <FiCheckCircle size={48} />
                                    </div>
                                    <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                                        {message}
                                    </div>
                                    <p className="text-xs text-gray-500">Please check your inbox (and spam folder) for the reset link.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiMail className="text-sm" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${email.length > 0 && !isValidEmail(email) ? 'border-red-300' : 'border-gray-200'}`}
                                                placeholder="you@example.com"
                                            />
                                            {email.length > 0 && isValidEmail(email) && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                                                    <FiCheckCircle className="text-lg" />
                                                </div>
                                            )}
                                        </div>
                                        {email.length > 0 && !isValidEmail(email) && (
                                            <p className="mt-1 text-xs text-red-500">Please enter a valid email format</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !isValidEmail(email)}
                                        className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-200 text-white bg-[#FF8C42] hover:bg-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "Send Reset Link"
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
