"use client";

import React from 'react';
import Link from 'next/link';

const CTASection = () => {
    return (
        <section className="w-full flex flex-col md:flex-row">
            {/* Left: Image */}
            <div className="w-full md:w-1/2 h-[400px] md:h-auto relative min-h-[500px]">
                {/* Using standard img tag for simplicity with the existing setup, or Next.js Image if preferred given recent edits */}
                <img
                    src="/CTA_Pic.jpeg"
                    alt="Mechanic and customer shaking hands"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Right: Content */}
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center text-center px-8 md:px-20 py-20">
                <span className="text-[#EA580C] font-bold text-lg mb-6 uppercase tracking-wider">CTA</span>

                <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
                    Ready to Make Your Vehicle <br className="hidden md:block" />
                    Service Center Smarter?
                </h2>

                <p className="text-slate-400 text-lg mb-12 max-w-lg leading-relaxed font-medium">
                    Manage bookings, customers, vehicles, and services all in one easy place. Save time, reduce mistakes, and grow your service center with confidence.
                </p>

                <Link
                    href="/signup"
                    className="px-10 py-4 bg-gradient-to-b from-[#FF8A00] to-[#E65100] text-white rounded-lg font-bold text-lg hover:from-[#E65100] hover:to-[#E65100] transition-all shadow-xl shadow-orange-900/10 transform hover:-translate-y-1"
                >
                    Get Started
                </Link>
            </div>
        </section>
    );
};

export default CTASection;
