"use client";

import Button from "@/components/UI/Button";
import { FiCalendar, FiClock, FiAward, FiAlertCircle } from "react-icons/fi";

export default function CustomerDashboard() {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back, Alex!</h1>
                    <p className="text-slate-300">Your vehicle is in good hands.</p>

                    <div className="mt-8 flex gap-4">
                        <Button className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold transition-all">
                            Book a Service
                        </Button>
                        <Button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all">
                            View History
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg text-xl shadow-lg shadow-orange-500/40"><FiCalendar /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Next Service</p>
                            <p className="font-bold text-slate-900">Dec 28, 2024</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 pl-1">For <span className="font-semibold">Toyota Camry</span> at Downtown Branch.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg text-xl shadow-lg shadow-orange-500/40"><FiAward /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Loyalty Points</p>
                            <p className="font-bold text-slate-900">1,250 Pts</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 pl-1">You are a <span className="text-yellow-600 font-semibold">Gold Member</span>.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg text-xl shadow-lg shadow-orange-500/40"><FiCheckCircle /></div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium uppercase">Vehicle Status</p>
                            <p className="font-bold text-slate-900">All Good</p>
                        </div>
                    </div>
                    <p className="text-sm text-slate-600 pl-1">Last checkup was 2 months ago.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">My Vehicles</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 flex gap-4 hover:border-primary/50 transition-colors cursor-pointer ring-1 ring-primary/5">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                            <FiTruck className="text-2xl" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-slate-900">Toyota Camry</h3>
                                    <p className="text-sm text-slate-500">ABC-1234</p>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Healthy</span>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button className="text-xs font-bold text-primary hover:underline">Service History</button>
                                <span className="text-slate-300">|</span>
                                <button className="text-xs font-bold text-slate-600 hover:text-slate-900">View Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { FiTruck, FiCheckCircle } from "react-icons/fi";
