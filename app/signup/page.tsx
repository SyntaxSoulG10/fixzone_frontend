"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiUser, FiMail, FiLock, FiArrowRight, FiArrowLeft, FiPhone, FiBriefcase, FiCheck, FiX, FiUpload } from "react-icons/fi";
import { APP_CONFIG } from "@/utils/config";

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState<"vehicle-owner" | "service-center" | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form inputs
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    // Document state
    const [documents, setDocuments] = useState({
        brDocument: { file: null as File | null, base64: "", name: "", error: "" },
        taxDocument: { file: null as File | null, base64: "", name: "", error: "" },
        nicDocument: { file: null as File | null, base64: "", name: "", error: "" }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'brDocument' | 'taxDocument' | 'nicDocument') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], error: "Invalid file type. Please upload PDF, JPG, or PNG." } }));
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], error: "File too large. Maximum size is 50MB." } }));
            return;
        }

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setDocuments(prev => ({
                    ...prev,
                    [docType]: { file, base64: reader.result as string, name: file.name, error: "" }
                }));
            };
            reader.onerror = () => {
                setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], error: "Failed to read file." } }));
            };
        } catch (err) {
            setDocuments(prev => ({ ...prev, [docType]: { ...prev[docType], error: "Error uploading file." } }));
        }
    };

    const removeFile = (docType: 'brDocument' | 'taxDocument' | 'nicDocument') => {
        setDocuments(prev => ({
            ...prev,
            [docType]: { file: null, base64: "", name: "", error: "" }
        }));
    };


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

    const proceedToDocuments = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPasswordStrong || !doPasswordsMatch) return;
        setStep(3);
    };

    const handleSignup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!role) return;

        if (!isPasswordStrong) {
            setError("Please ensure your password meets all requirements.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (role === "service-center") {
            if (!documents.brDocument.base64 || !documents.taxDocument.base64 || !documents.nicDocument.base64) {
                setError("Please upload all required documents to proceed.");
                return;
            }
        }

        setLoading(true);

        try {
            const endpoint = role === "vehicle-owner"
                ? `${APP_CONFIG.api.auth}/register/customer`
                : `${APP_CONFIG.api.auth}/register/owner`;

            const payload = role === "vehicle-owner" 
                ? { fullName, email, password }
                : { 
                    fullName, email, password, companyName, companyNumber: phoneNumber,
                    businessRegUrl: documents.brDocument.base64,
                    taxIdUrl: documents.taxDocument.base64,
                    nicUrl: documents.nicDocument.base64
                };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (response.status === 409) {
                    throw new Error("Email already taken. Please use a different email.");
                }
                if (response.status === 401) {
                    throw new Error("Invalid credentials.");
                }
                throw new Error(errorData?.message || "Registration failed");
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
                // For new owners, they must wait for approval, so redirect to verification page
                router.push("/verification");
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            setError(error.message || "Failed to register");
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
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                            {error}
                                        </div>
                                    )}
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
                                                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${password.length > 0 && !isPasswordStrong ? 'border-red-300' : 'border-gray-200'}`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    <div className="mt-2 space-y-3">
                                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${metConditionsCount === 5 ? 'bg-green-500' : (metConditionsCount >= 3 ? 'bg-orange-500' : 'bg-red-500')}`}
                                                style={{ width: `${(metConditionsCount / 5) * 100}%` }}
                                            ></div>
                                        </div>
                                        <ul className="text-sm space-y-1 pl-1">
                                            <li className={`flex items-center gap-2 ${validations.length ? 'text-green-600' : 'text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.length ? 'bg-green-600' : 'bg-red-500'}`}></div> At least 8 characters
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.uppercase ? 'bg-green-600' : 'bg-red-500'}`}></div> Contains an uppercase letter
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.lowercase ? 'bg-green-600' : 'bg-red-500'}`}></div> Contains a lowercase letter
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.number ? 'text-green-600' : 'text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.number ? 'bg-green-600' : 'bg-red-500'}`}></div> Contains a number
                                            </li>
                                            <li className={`flex items-center gap-2 ${validations.special ? 'text-green-600' : 'text-red-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${validations.special ? 'bg-green-600' : 'bg-red-500'}`}></div> Contains a special character
                                            </li>
                                        </ul>
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
                                                className={`block w-full pl-9 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FF8C42]/20 focus:border-[#FF8C42] transition-colors bg-gray-50/50 text-sm ${confirmPassword.length > 0 && !doPasswordsMatch ? 'border-red-300' : (confirmPassword.length > 0 && doPasswordsMatch ? 'border-green-300' : 'border-gray-200')}`}
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        {confirmPassword.length > 0 && !doPasswordsMatch && (
                                            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                                        )}
                                        {confirmPassword.length > 0 && doPasswordsMatch && (
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
                                            type={role === "service-center" ? "button" : "submit"}
                                            onClick={role === "service-center" ? proceedToDocuments : undefined}
                                            id="btn-submit"
                                            disabled={loading || !isPasswordStrong || !doPasswordsMatch}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-200 text-white bg-[#FF8C42] hover:bg-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>{role === "service-center" ? "Continue" : "Create Account"} <FiArrowRight /></>
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
                        {step === 3 && role === "service-center" && (
                            <div className="w-full max-w-md mx-auto animate-fade-in">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-[#FF8C42] mb-2">Required Documents</h1>
                                    <p className="text-gray-500 text-sm">Please upload your business verification documents to complete registration.</p>
                                </div>
                                {error && (
                                    <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-5">
                                    {/* BR Document */}
                                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-800">Business Registration <span className="text-red-500">*</span></h3>
                                                <p className="text-xs text-gray-500">Official company registration certificate</p>
                                            </div>
                                            {documents.brDocument.base64 && <FiCheck className="text-green-500 text-xl" />}
                                        </div>
                                        {!documents.brDocument.base64 ? (
                                            <div>
                                                <input type="file" id="brDoc" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={(e) => handleFileUpload(e, 'brDocument')} />
                                                <label htmlFor="brDoc" className="flex items-center justify-center w-full py-2 border-2 border-dashed border-[#FF8C42]/50 rounded-lg text-[#FF8C42] cursor-pointer hover:bg-[#FF8C42]/5 transition-colors text-xs font-bold">
                                                    Click to Upload
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                                                <span className="text-xs text-gray-700 truncate max-w-[200px]">{documents.brDocument.name}</span>
                                                <button type="button" onClick={() => removeFile('brDocument')} className="text-red-500 hover:text-red-700"><FiX /></button>
                                            </div>
                                        )}
                                        {documents.brDocument.error && <p className="text-red-500 text-xs mt-1">{documents.brDocument.error}</p>}
                                    </div>

                                    {/* Tax Document */}
                                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-800">Tax Identification <span className="text-red-500">*</span></h3>
                                                <p className="text-xs text-gray-500">TIN or equivalent tax document</p>
                                            </div>
                                            {documents.taxDocument.base64 && <FiCheck className="text-green-500 text-xl" />}
                                        </div>
                                        {!documents.taxDocument.base64 ? (
                                            <div>
                                                <input type="file" id="taxDoc" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={(e) => handleFileUpload(e, 'taxDocument')} />
                                                <label htmlFor="taxDoc" className="flex items-center justify-center w-full py-2 border-2 border-dashed border-[#FF8C42]/50 rounded-lg text-[#FF8C42] cursor-pointer hover:bg-[#FF8C42]/5 transition-colors text-xs font-bold">
                                                    Click to Upload
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                                                <span className="text-xs text-gray-700 truncate max-w-[200px]">{documents.taxDocument.name}</span>
                                                <button type="button" onClick={() => removeFile('taxDocument')} className="text-red-500 hover:text-red-700"><FiX /></button>
                                            </div>
                                        )}
                                        {documents.taxDocument.error && <p className="text-red-500 text-xs mt-1">{documents.taxDocument.error}</p>}
                                    </div>

                                    {/* NIC Document */}
                                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-800">NIC / Passport <span className="text-red-500">*</span></h3>
                                                <p className="text-xs text-gray-500">Owner's personal identity document</p>
                                            </div>
                                            {documents.nicDocument.base64 && <FiCheck className="text-green-500 text-xl" />}
                                        </div>
                                        {!documents.nicDocument.base64 ? (
                                            <div>
                                                <input type="file" id="nicDoc" className="hidden" accept=".pdf,image/jpeg,image/png" onChange={(e) => handleFileUpload(e, 'nicDocument')} />
                                                <label htmlFor="nicDoc" className="flex items-center justify-center w-full py-2 border-2 border-dashed border-[#FF8C42]/50 rounded-lg text-[#FF8C42] cursor-pointer hover:bg-[#FF8C42]/5 transition-colors text-xs font-bold">
                                                    Click to Upload
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-lg">
                                                <span className="text-xs text-gray-700 truncate max-w-[200px]">{documents.nicDocument.name}</span>
                                                <button type="button" onClick={() => removeFile('nicDocument')} className="text-red-500 hover:text-red-700"><FiX /></button>
                                            </div>
                                        )}
                                        {documents.nicDocument.error && <p className="text-red-500 text-xs mt-1">{documents.nicDocument.error}</p>}
                                    </div>
                                    
                                    <div className="pt-4 flex items-center justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(2)}
                                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSignup()}
                                            disabled={loading || !documents.brDocument.base64 || !documents.taxDocument.base64 || !documents.nicDocument.base64}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-orange-200 text-white bg-[#FF8C42] hover:bg-[#F97316] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C42] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-sm"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Submit Registration <FiCheck /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
