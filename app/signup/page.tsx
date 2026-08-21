"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    FiUser, 
    FiMail, 
    FiLock, 
    FiArrowRight, 
    FiArrowLeft, 
    FiPhone, 
    FiBriefcase, 
    FiCheck, 
    FiX, 
    FiEye, 
    FiEyeOff, 
    FiAlertCircle 
} from "react-icons/fi";
import { APP_CONFIG } from "@/utils/config";
import { isValidEmail } from "@/utils/helpers";

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"vehicle-owner" | "service-center" | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Form inputs
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Visibility toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

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
    const metConditionsCount = Object.values(validations).filter(Boolean).length;
    const doPasswordsMatch = password === confirmPassword && password.length > 0;

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (role === "service-center") {
            if (!companyName.trim()) {
                errors.companyName = "Company name is required";
            } else if (companyName.trim().length < 3) {
                errors.companyName = "Company name must be at least 3 characters";
            }

            const phoneClean = phoneNumber.replace(/\s/g, '');
            if (!phoneClean) {
                errors.phoneNumber = "Business phone number is required";
            } else if (!/^[0-9+]{10,15}$/.test(phoneClean)) {
                errors.phoneNumber = "Please enter a valid phone number (10 to 15 digits)";
            }
        }

        if (!fullName.trim()) {
            errors.fullName = "Full name is required";
        } else if (fullName.trim().length < 2) {
            errors.fullName = "Full name must be at least 2 characters";
        }

        if (!email.trim()) {
            errors.email = "Email address is required";
        } else if (!isValidEmail(email.trim())) {
            errors.email = "Please enter a valid email address";
        }

        if (!password) {
            errors.password = "Password is required";
        } else if (!isPasswordStrong) {
            errors.password = "Password must satisfy all 5 requirements listed below";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Confirm password is required";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        setFieldErrors(errors);
        return errors;
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!role) {
            setError("Please select your account type first.");
            setStep(1);
            return;
        }

        const errors = validateForm();
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            setError(errors[errorKeys[0]]);
            return;
        }

        setLoading(true);

        try {
            const endpoint = role === "vehicle-owner"
                ? `${APP_CONFIG.api.auth}/register/customer`
                : `${APP_CONFIG.api.auth}/register/owner`;

            const payload = role === "vehicle-owner" 
                ? { fullName: fullName.trim(), email: email.trim(), password }
                : { 
                    fullName: fullName.trim(), 
                    email: email.trim(), 
                    password, 
                    companyName: companyName.trim(), 
                    companyNumber: phoneNumber.trim() 
                  };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (response.status === 409) {
                    throw new Error("This email is already registered. Please log in or use a different email.");
                }
                if (response.status === 401) {
                    throw new Error("Invalid credentials. Please verify your details.");
                }
                const serverMsg = errorData?.details || errorData?.message || errorData?.error || "Registration failed. Please check your information.";
                throw new Error(serverMsg);
            }

            const data = await response.json();
            
            if (data.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);
                localStorage.setItem("userRole", data.role);
                localStorage.setItem("userId", data.userId);
                if (data.fullName) localStorage.setItem("fullName", data.fullName);
            }

            // Redirect based on role
            if (data.role === "ROLE_CUSTOMER") {
                router.push("/dashboard/customer");
            } else {
                router.push("/dashboard/company-owner");
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            setError(error.message || "Failed to register. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative flex justify-center overflow-auto font-sans bg-cover bg-center bg-no-repeat py-10"
            style={{ backgroundImage: "url('/loginBg.png')" }}
        >
            {/* Main Glass Card */}
            <div className="relative z-10 w-full max-w-3xl mx-4">
                <div className="bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-[2.5rem] p-4 md:p-8 transition-all duration-500">
                    <div className="bg-white rounded-4xl p-6 md:p-8 shadow-xl w-full">
                        {step === 1 ? (
                            /* STEP 1: Role Selection */
                            <div className="flex flex-col items-center animate-fade-in">
                                <h1 className="text-2xl md:text-3xl font-bold text-[#FF8C42] mb-8 text-center">Who are you?</h1>

                                <div className="flex flex-col md:flex-row gap-6 mb-8 w-full justify-center">
                                    {/* Vehicle Owner Card */}
                                    <button
                                        type="button"
                                        id="role-vehicle-owner"
                                        onClick={() => {
                                            setRole("vehicle-owner");
                                            setError("");
                                            setFieldErrors({});
                                        }}
                                        className={`group flex flex-col items-center justify-center p-4 w-full md:w-56 h-56 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl bg-white
                                            ${role === "vehicle-owner"
                                                ? "border-[#FF8C42] shadow-orange-100 ring-4 ring-[#FF8C42]/10 scale-105"
                                                : "border-gray-200 hover:border-[#FF8C42] hover:scale-105"}`}
                                    >
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#FF8C42] text-white">
                                            <FiUser className="text-3xl" />
                                        </div>
                                        <span className="text-xl font-bold text-gray-800 text-center">Vehicle Owner</span>
                                    </button>

                                    {/* Service Center Owner Card */}
                                    <button
                                        type="button"
                                        id="role-service-center"
                                        onClick={() => {
                                            setRole("service-center");
                                            setError("");
                                            setFieldErrors({});
                                        }}
                                        className={`group flex flex-col items-center justify-center p-4 w-full md:w-56 h-56 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl bg-white
                                            ${role === "service-center"
                                                ? "border-[#FF8C42] shadow-orange-100 ring-4 ring-[#FF8C42]/10 scale-105"
                                                : "border-gray-200 hover:border-[#FF8C42] hover:scale-105"}`}
                                    >
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#FF8C42] text-white">
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

                                <form onSubmit={handleSignup} noValidate className="space-y-4">
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                                            <FiAlertCircle className="text-lg shrink-0 text-red-500" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {role === "service-center" && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name *</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                        <FiBriefcase className="text-sm" />
                                                    </div>
                                                    <input
                                                        id="input-company-name"
                                                        type="text"
                                                        value={companyName}
                                                        onChange={(e) => {
                                                            setCompanyName(e.target.value);
                                                            if (fieldErrors.companyName) setFieldErrors(prev => ({ ...prev, companyName: "" }));
                                                            if (error) setError("");
                                                        }}
                                                        className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${fieldErrors.companyName ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'}`}
                                                        placeholder="FixZone Main Branch"
                                                    />
                                                </div>
                                                {fieldErrors.companyName && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.companyName}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Phone Number *</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                        <FiPhone className="text-sm" />
                                                    </div>
                                                    <input
                                                        id="input-phone"
                                                        type="tel"
                                                        value={phoneNumber}
                                                        onChange={(e) => {
                                                            setPhoneNumber(e.target.value);
                                                            if (fieldErrors.phoneNumber) setFieldErrors(prev => ({ ...prev, phoneNumber: "" }));
                                                            if (error) setError("");
                                                        }}
                                                        className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${fieldErrors.phoneNumber ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'}`}
                                                        placeholder="0771234567 or +94771234567"
                                                    />
                                                </div>
                                                {fieldErrors.phoneNumber && (
                                                    <p className="mt-1 text-xs text-red-500">{fieldErrors.phoneNumber}</p>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiUser className="text-sm" />
                                            </div>
                                            <input
                                                id="input-fullname"
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => {
                                                    setFullName(e.target.value);
                                                    if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: "" }));
                                                    if (error) setError("");
                                                }}
                                                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${fieldErrors.fullName ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'}`}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        {fieldErrors.fullName && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiMail className="text-sm" />
                                            </div>
                                            <input
                                                id="input-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                                                    if (error) setError("");
                                                }}
                                                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${fieldErrors.email ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'}`}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        {fieldErrors.email && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiLock className="text-sm" />
                                            </div>
                                            <input
                                                id="input-password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                                                    if (error) setError("");
                                                }}
                                                className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${fieldErrors.password || (password.length > 0 && !isPasswordStrong) ? 'border-red-300' : 'border-gray-200'}`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? <FiEyeOff className="text-base text-[#FF8C42]" /> : <FiEye className="text-base" />}
                                            </button>
                                        </div>
                                        {fieldErrors.password && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
                                        )}
                                    </div>

                                    {/* Password Strength Indicator */}
                                    <div className="mt-2 space-y-3">
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${metConditionsCount === 5 ? 'bg-green-500' : (metConditionsCount >= 3 ? 'bg-orange-500' : 'bg-red-500')}`}
                                                style={{ width: `${(metConditionsCount / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <ul className="text-xs space-y-1 pl-1">
                                            <li className={`flex items-center gap-2 ${validations.length ? 'text-green-600' : 'text-gray-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.length ? 'bg-green-600' : 'bg-gray-400'}`}></div> At least 8 characters
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.uppercase ? 'bg-green-600' : 'bg-gray-400'}`}></div> Contains an uppercase letter
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.lowercase ? 'bg-green-600' : 'bg-gray-400'}`}></div> Contains a lowercase letter
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.number ? 'text-green-600' : 'text-gray-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.number ? 'bg-green-600' : 'bg-gray-400'}`}></div> Contains a number
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.special ? 'text-green-600' : 'text-gray-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.special ? 'bg-green-600' : 'bg-gray-400'}`}></div> Contains a special character
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password *</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                                <FiLock className="text-sm" />
                                            </div>
                                            <input
                                                id="input-confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => {
                                                    setConfirmPassword(e.target.value);
                                                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: "" }));
                                                    if (error) setError("");
                                                }}
                                                className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${fieldErrors.confirmPassword || (confirmPassword.length > 0 && !doPasswordsMatch) ? 'border-red-300' : (confirmPassword.length > 0 && doPasswordsMatch ? 'border-green-300' : 'border-gray-200')}`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                            >
                                                {showConfirmPassword ? <FiEyeOff className="text-base text-[#FF8C42]" /> : <FiEye className="text-base" />}
                                            </button>
                                        </div>
                                        {fieldErrors.confirmPassword && (
                                            <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                                        )}
                                        {!fieldErrors.confirmPassword && confirmPassword.length > 0 && !doPasswordsMatch && (
                                            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                                        )}
                                        {!fieldErrors.confirmPassword && confirmPassword.length > 0 && doPasswordsMatch && (
                                            <p className="mt-1 text-xs text-green-600 flex items-center"><FiCheck className="mr-1" /> Passwords match</p>
                                        )}
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
