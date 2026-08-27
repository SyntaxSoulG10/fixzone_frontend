"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FiCheckCircle, FiClock, FiArrowRight, FiTool } from "react-icons/fi";
import { APP_CONFIG } from "@/utils/config";

interface ServicePackage {
    packageId: string;
    name: string;
    description: string;
    basePrice: number;
    estimatedDurationMins: number;
    vehicleType?: string;
    type?: string;
    serviceCenter?: {
        name: string;
        location?: string;
    };
}

export default function FeaturedPackagesSection() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await axios.get(`${APP_CONFIG.api.baseUrl}/public/packages`);
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setPackages(res.data);
                } else {
                    // Fallback default packages if none yet created in DB
                    setPackages([
                        {
                            packageId: "pkg-1",
                            name: "Full Engine Tune-Up",
                            description: "Complete computerized diagnostic, spark plugs check, ignition system calibration and throttle body cleaning.",
                            basePrice: 8500,
                            estimatedDurationMins: 90,
                            vehicleType: "CAR,SUV",
                            type: "Engine,Diagnostic"
                        },
                        {
                            packageId: "pkg-2",
                            name: "Periodic Lube & Filter Care",
                            description: "Premium synthetic engine oil replacement, oil filter change, fluid top-up and comprehensive 25-point vehicle inspection.",
                            basePrice: 6500,
                            estimatedDurationMins: 60,
                            vehicleType: "ALL",
                            type: "Maintenance,Lube"
                        },
                        {
                            packageId: "pkg-3",
                            name: "Brake System Overhaul",
                            description: "Brake pad replacement, disc rotor inspection and skimming check, caliper lubrication and brake fluid flush.",
                            basePrice: 5500,
                            estimatedDurationMins: 75,
                            vehicleType: "CAR,VAN,SUV",
                            type: "Brakes,Safety"
                        }
                    ]);
                }
            } catch (err) {
                console.debug("Packages loaded with fallback catalog", err);
                setPackages([
                    {
                        packageId: "pkg-1",
                        name: "Full Engine Tune-Up",
                        description: "Complete computerized diagnostic, spark plugs check, ignition system calibration and throttle body cleaning.",
                        basePrice: 8500,
                        estimatedDurationMins: 90,
                        vehicleType: "CAR,SUV",
                        type: "Engine,Diagnostic"
                    },
                    {
                        packageId: "pkg-2",
                        name: "Periodic Lube & Filter Care",
                        description: "Premium synthetic engine oil replacement, oil filter change, fluid top-up and comprehensive 25-point vehicle inspection.",
                        basePrice: 6500,
                        estimatedDurationMins: 60,
                        vehicleType: "ALL",
                        type: "Maintenance,Lube"
                    },
                    {
                        packageId: "pkg-3",
                        name: "Brake System Overhaul",
                        description: "Brake pad replacement, disc rotor inspection and skimming check, caliper lubrication and brake fluid flush.",
                        basePrice: 5500,
                        estimatedDurationMins: 75,
                        vehicleType: "CAR,VAN,SUV",
                        type: "Brakes,Safety"
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackages();
    }, []);

    return (
        <section id="packages" className="py-20 bg-slate-50 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-14">
                    <span className="text-[#EA580C] font-bold text-sm uppercase tracking-wider mb-2 block">
                        Live Service Catalog
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Popular Vehicle Service Packages
                    </h2>
                    <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-base">
                        Browse real verified service packages available at certified FixZone service centers with transparent, standardized pricing.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.packageId}
                            className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#EA580C] border border-orange-100">
                                        <FiTool className="w-3.5 h-3.5" />
                                        {pkg.vehicleType ? pkg.vehicleType.replace(/,/g, " / ") : "Universal"}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                                        <FiClock className="w-3.5 h-3.5 text-slate-400" />
                                        {pkg.estimatedDurationMins || 60} mins
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#EA580C] transition-colors">
                                    {pkg.name}
                                </h3>

                                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                    {pkg.description}
                                </p>
                            </div>

                            <div className="pt-5 border-t border-slate-100 mt-2 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate-400 font-medium block">Starting from</span>
                                    <span className="text-2xl font-extrabold text-slate-900">
                                        Rs. {Number(pkg.basePrice || 0).toLocaleString()}
                                    </span>
                                </div>

                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#c2410c] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all hover:gap-3"
                                >
                                    Book Now
                                    <FiArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 font-bold text-[#EA580C] hover:text-[#c2410c] text-sm group"
                    >
                        View all service centers & packages in customer portal
                        <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
