"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { APP_CONFIG } from "@/utils/config";

export default function StatsSection() {
    const [stats, setStats] = useState({
        activeUsers: "25+",
        registeredCenters: "3+",
        servicesCompleted: "50+",
        totalPackages: "12+"
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${APP_CONFIG.api.baseUrl}/public/stats`);
                if (res.data) {
                    setStats({
                        activeUsers: res.data.activeUsers ? `${res.data.activeUsers}+` : "25+",
                        registeredCenters: res.data.registeredCenters ? `${res.data.registeredCenters}` : "3+",
                        servicesCompleted: res.data.servicesCompleted ? `${res.data.servicesCompleted}+` : "50+",
                        totalPackages: res.data.totalPackages ? `${res.data.totalPackages}+` : "12+"
                    });
                }
            } catch (err) {
                // Keep smooth fallback if backend is offline
                console.debug("Landing stats loaded with default metrics", err);
            }
        };

        fetchStats();
    }, []);

    return (
        <>
            <div className="relative w-full h-auto md:h-32 bg-black z-30">
                <div className="w-full px-4 py-8 md:p-0 md:absolute md:top-full md:left-0 md:right-0 md:-translate-y-1/2">
                    <div className="max-w-6xl mx-auto bg-white rounded-[1.5rem] shadow-2xl py-8 px-6 flex flex-col md:flex-row justify-around text-center border border-slate-100">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-[#E65100]">{stats.activeUsers}</h3>
                            <p className="text-slate-700 font-bold text-lg">Active Users</p>
                            <p className="text-slate-500 text-sm max-w-[180px] mx-auto leading-relaxed">Customers & managers using our platform every day.</p>
                        </div>

                        <div className="hidden md:block w-px bg-slate-200"></div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-[#E65100]">{stats.registeredCenters}</h3>
                            <p className="text-slate-700 font-bold text-lg">Registered<br />Service Centers</p>
                            <p className="text-slate-500 text-sm max-w-[180px] mx-auto leading-relaxed">Certified multi-branch service centers across Sri Lanka.</p>
                        </div>

                        <div className="hidden md:block w-px bg-slate-200"></div>

                        <div className="space-y-2">
                            <h3 className="text-3xl font-extrabold text-[#E65100]">{stats.servicesCompleted}</h3>
                            <p className="text-slate-700 font-bold text-lg">Services<br />Completed</p>
                            <p className="text-slate-500 text-sm max-w-[180px] mx-auto leading-relaxed">Bookings scheduled and serviced through FixZone.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buffer to push About Section down */}
            <div className="w-full h-20 bg-black"></div>
        </>
    );
}
