"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiClock, FiAlertCircle, FiLogOut, FiArrowRight, FiFileText, FiMail } from "react-icons/fi";
import Link from "next/link";
import axios from "axios";
import { APP_CONFIG } from "@/utils/config";

export default function VerificationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [submittedDate, setSubmittedDate] = useState<string | null>(null);
    const [showSupportModal, setShowSupportModal] = useState(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await axios.get(`${APP_CONFIG.api.serviceCenters}/current`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data && response.data.length > 0) {
                    const center = response.data[0];
                    setStatus(center.status);
                    setRejectionReason(center.rejectionReason);
                    
                    // Mock date if createdAt is missing, usually you'd format center.createdAt
                    setSubmittedDate(new Date().toLocaleDateString());

                    if (center.status === "APPROVED" || center.status === "Active") {
                        // Do not auto-redirect; show approved state with a button.
                        setStatus("APPROVED");
                    }
                } else {
                    // No service center found? Unexpected state, but wait.
                    setStatus("PENDING");
                }
            } catch (error) {
                console.error("Error fetching verification status", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userId");
        localStorage.removeItem("fullName");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <img src="/Logo-Light.png" alt="FixZone Logo" className="h-16 sm:h-20 w-auto object-contain" />
                </div>
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors"
                >
                    <FiLogOut /> Sign Out
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    {status === "PENDING" && (
                        <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border border-orange-100 animate-fade-in text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>
                            
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-4 flex items-center justify-center gap-3 shadow-sm">
                                <FiCheckCircle className="text-2xl text-green-500" />
                                <span className="text-green-800 font-bold text-base md:text-lg">Document Submission Successful!</span>
                            </div>

                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                                <FiClock className="text-3xl text-orange-500" />
                            </div>

                            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Pending Verification</h1>
                            <p className="text-slate-600 text-base mb-4 max-w-lg mx-auto">
                                Your registration is currently under review by our admin team.
                            </p>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-4 text-left border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FiFileText className="text-orange-500" /> Submission Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                                        <span className="text-slate-500 text-sm font-semibold">Status</span>
                                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Under Review</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                                        <span className="text-slate-500 text-sm font-semibold">Submitted Date</span>
                                        <span className="text-slate-800 text-sm font-bold">{submittedDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-slate-500 text-sm font-semibold">Estimated Time</span>
                                        <span className="text-slate-800 text-sm font-bold">2–3 Working Days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-slate-500 text-sm">
                                We will notify you via email once your account has been approved.
                            </div>
                        </div>
                    )}

                    {status === "REJECTED" && (
                        <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-8 border border-red-100 animate-fade-in text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600"></div>
                            
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiAlertCircle className="text-4xl text-red-500" />
                            </div>

                            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Action Required</h1>
                            <p className="text-slate-600 mb-4 max-w-lg mx-auto">
                                Unfortunately, we could not approve your registration with the provided documents.
                            </p>

                            <div className="bg-red-50 rounded-2xl p-5 mb-4 text-left border border-red-100">
                                <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2"><FiAlertCircle /> Rejection Reason</h3>
                                <p className="text-red-700 font-medium text-sm">
                                    "{rejectionReason || "Documents are unclear or missing information."}"
                                </p>
                            </div>

                            <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-5 border border-red-100 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl -ml-8 -mb-8 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                                        <FiMail className="text-xl text-red-500 animate-pulse" />
                                    </div>
                                    <h4 className="text-md font-bold text-slate-800 mb-1">Need to proceed?</h4>
                                    <p className="text-slate-600 font-medium mb-4 text-sm text-center max-w-sm">
                                        Please contact the admin team directly to resolve your verification issues.
                                    </p>
                                    <button 
                                        onClick={() => setShowSupportModal(true)} 
                                        className="w-full sm:w-auto px-6 py-2.5 bg-red-500 text-white font-extrabold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200/50 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                                    >
                                        Contact Admin
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {status === "APPROVED" && (
                        <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 border border-green-100 animate-fade-in text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-500"></div>
                            
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                                <FiCheckCircle className="text-5xl text-green-500" />
                            </div>

                            <h1 className="text-3xl font-extrabold text-slate-800 mb-4">Verification Approved!</h1>
                            <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto">
                                Congratulations! Your Service Center registration has been verified and approved by our admin team. You are now officially a registered Owner on FixZone.
                            </p>

                            <div className="flex justify-center gap-4">
                                <Link href="/dashboard/company-owner" className="px-8 py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200 flex items-center gap-2">
                                    Go to Dashboard <FiArrowRight />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Support Modal */}
            {showSupportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative border border-slate-100">
                        <button 
                            onClick={() => setShowSupportModal(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Contact Admin</h2>
                        <p className="text-slate-500 text-sm mb-8">
                            Please contact admin for verification. Reach out to our team if you need help with your registration or documents.
                        </p>
                        
                        <div className="space-y-6">
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                                <span className="block text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Email Support</span>
                                <a href="mailto:admin2@fixzone.lk" className="text-slate-800 font-medium hover:text-orange-600 transition-colors flex items-center gap-2">
                                    <FiMail className="text-orange-500" /> admin2@fixzone.lk
                                </a>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Numbers</span>
                                <div className="text-slate-800 font-medium space-y-1">
                                    <div>+94 11 234 5678 (Hotline)</div>
                                    <div>+94 77 123 4567 (Mobile)</div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Head Office</span>
                                <address className="text-slate-800 font-medium not-italic leading-relaxed">
                                    FixZone Technologies,<br />
                                    No 123, Galle Road,<br />
                                    Colombo 03, Sri Lanka
                                </address>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowSupportModal(false)}
                            className="w-full mt-8 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
