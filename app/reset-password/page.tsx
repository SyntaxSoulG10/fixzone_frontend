"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiCheckCircle } from "react-icons/fi";
import APP_CONFIG from "@/config";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token.");
        }
    }, [token]);

    useEffect(() => {
        setValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        });
    }, [password]);

    const isPasswordStrong = Object.values(validations).every(Boolean);
    const doPasswordsMatch = password === confirmPassword && password.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setError("Invalid reset token.");
            return;
        }

        if (!isPasswordStrong) {
            setError("Please ensure your password meets all requirements.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data?.details || data?.message || "Failed to reset password.");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
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
                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-[#FF8C42] mb-2">
                                    Set New Password
                                </h1>
                                <p className="text-gray-500 text-sm">Please create a strong password for your account.</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {success ? (
                                <div className="text-center">
                                    <div className="mb-4 flex justify-center text-green-500">
                                        <FiCheckCircle size={48} />
                                    </div>
                                    <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm text-center font-semibold">
                                        Password reset successfully!
                                    </div>
                                    <p className="text-sm text-gray-500">Redirecting you to login page...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiLock className="text-sm" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${password.length > 0 && !isPasswordStrong ? 'border-red-300' : 'border-gray-200'}`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    <div className="bg-gray-50 p-3 rounded-lg space-y-1 mt-1 border border-gray-100">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Password must contain:</p>
                                        <div className="grid grid-cols-1 gap-1 text-xs">
                                            <div className={`flex items-center ${validations.length ? 'text-green-600' : 'text-gray-400'}`}>
                                                {validations.length ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />} At least 8 characters
                                            </div>
                                            <div className={`flex items-center ${validations.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                {validations.uppercase ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />} One uppercase letter
                                            </div>
                                            <div className={`flex items-center ${validations.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                                                {validations.lowercase ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />} One lowercase letter
                                            </div>
                                            <div className={`flex items-center ${validations.number ? 'text-green-600' : 'text-gray-400'}`}>
                                                {validations.number ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />} One number
                                            </div>
                                            <div className={`flex items-center ${validations.special ? 'text-green-600' : 'text-gray-400'}`}>
                                                {validations.special ? <FiCheck className="mr-1" /> : <FiX className="mr-1" />} One special character
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1 mt-4">Confirm New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiLock className="text-sm" />
                                            </div>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${confirmPassword.length > 0 && !doPasswordsMatch ? 'border-red-300' : (confirmPassword.length > 0 && doPasswordsMatch ? 'border-green-300' : 'border-gray-200')}`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                            </button>
                                        </div>
                                        {confirmPassword.length > 0 && !doPasswordsMatch && (
                                            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                                        )}
                                        {confirmPassword.length > 0 && doPasswordsMatch && (
                                            <p className="mt-1 text-xs text-green-600 flex items-center"><FiCheck className="mr-1" /> Passwords match</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !token || !isPasswordStrong || !doPasswordsMatch}
                                        className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-200 text-white bg-[#FF8C42] hover:bg-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            "Reset Password"
                                        )}
                                    </button>
                                </form>
                            )}

                            <div className="mt-6 text-center">
                                <Link href="/login" className="text-gray-500 text-sm hover:text-[#FF8C42] transition-colors">
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
