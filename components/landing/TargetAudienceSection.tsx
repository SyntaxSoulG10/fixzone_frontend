"use client";

import React from "react";
import { FiUser, FiCheck, FiHome } from "react-icons/fi";

const AudienceCard = ({ icon, title, features }: { icon: React.ReactNode, title: string, features: string[] }) => (
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center flex-1 min-w-[300px] border border-slate-100 transition-transform hover:-translate-y-2 duration-300">
        <div className="w-16 h-16 bg-[#FF6B00] rounded-full flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-orange-500/30">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">{title}</h3>
        <ul className="space-y-4 w-full">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-600">
                    <div className="mt-1 text-[#FF6B00] min-w-[20px]">
                        <FiCheck className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function TargetAudienceSection() {
    const vehicleOwnerFeatures = [
        "Book services anytime",
        "Track vehicle progress",
        "Receive reminders & updates",
        "Keep digital records"
    ];

    const serviceCenterFeatures = [
        "Manage bookings easily",
        "Update service status",
        "Store job details",
        "Boost business with analytics"
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Gradient Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    background: "linear-gradient(180deg, #FFF5EB 0%, #FFD6B8 30%, #FF9F66 65%, #EA580C 100%)"
                }}
            ></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-slate-600 font-bold text-3xl md:text-4xl mb-4">Who Is It For?</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
                    <AudienceCard
                        icon={<FiUser />}
                        title="Vehicle Owners"
                        features={vehicleOwnerFeatures}
                    />
                    <AudienceCard
                        icon={<FiHome />}
                        title="Service Center Owners"
                        features={serviceCenterFeatures}
                    />
                </div>
            </div>
        </section>
    );
}
