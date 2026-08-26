"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import APP_CONFIG from "@/config";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            setError("No email address provided.");
            return;
        }
        
        if (!otpCode || otpCode.length < 4) {
            setError("Please enter a valid code.");
            return;
        }
        
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/auth/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otpCode }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || errorData?.details || "Incorrect OTP. Please try again.");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/dashboard/customer");
            }, 2000);
            
        } catch (error: any) {
            console.error("Verification error:", error);
            setError(error.message || "Incorrect OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-4">
            <div className="bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-[2.5rem] p-4 md:p-8 transition-all duration-500">
                <div className="bg-white rounded-4xl p-6 md:p-10 shadow-xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-[#FF8C42] mb-2 tracking-tight">Verify Email</h1>
                        <p className="text-gray-500 font-medium text-sm">
                            We've sent a 6-digit code to <br/> <span className="text-gray-800 font-bold">{email || "your email"}</span>
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiCheckCircle className="text-3xl text-green-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Email Verified!</h2>
                            <p className="text-sm text-gray-500 mb-6">Your account is ready. Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
                                    <FiAlertCircle className="text-red-500 text-xl shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.trim())}
                                    className="block w-full px-4 py-3.5 text-center tracking-[0.5em] text-2xl font-bold border border-gray-200 rounded-xl focus:ring-4 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-all bg-gray-50/50"
                                    placeholder="••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otpCode.length < 4}
                                className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-[#FF8C42] hover:bg-[#F97316] shadow-lg shadow-orange-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Verify & Continue"
                                )}
                            </button>
                            
                            <div className="text-center mt-6">
                                <p className="text-sm text-gray-500 font-medium">
                                    Didn't receive the code?{" "}
                                    <Link href="/signup" className="text-[#FF8C42] hover:text-[#F97316] font-bold">
                                        Back to Sign up
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div 
            className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/loginBg.png')" }}
        >
            <Suspense fallback={<div className="p-8 text-white font-bold">Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
