"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { APP_CONFIG } from "@/utils/config";

interface SubscriptionPlan {
    id?: string;
    planName?: string;
    name?: string;
    price?: number;
    billingCycle?: string;
    description?: string;
    maxServiceCenters?: number;
    maxManagers?: number;
    features?: string[] | string;
    isActive?: boolean;
}

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);
    const [dbPlans, setDbPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await axios.get(`${APP_CONFIG.api.baseUrl}/public/plans`);
                if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                    setDbPlans(res.data);
                }
            } catch (err) {
                console.debug("Default pricing fallback used", err);
            }
        };

        fetchPlans();
    }, []);

    // Fallback plans if database plans not yet configured
    const defaultPlans = [
        {
            name: "Starter (Trial)",
            price: 0,
            period: "/ 14 days",
            description: "Free 14-day trial for new workshop owners",
            features: [
                { name: "1 Service Center Branch", included: true },
                { name: "Up to 50 Customer Bookings", included: true },
                { name: "Digital Job Cards & Invoicing", included: true },
                { name: "SMS Notifications", included: false },
                { name: "Multi-Branch Analytics", included: false },
                { name: "Unlimited Technicians", included: false },
            ],
            highlight: false,
            buttonStyle: "bg-orange-50 text-orange-600 hover:bg-orange-100",
            buttonText: "Start 14-Day Free Trial"
        },
        {
            name: "Professional Plan",
            price: isYearly ? 45000 : 4500,
            period: isYearly ? "/ year" : "/ month",
            description: "billed " + (isYearly ? "annually (Save 15%)" : "monthly"),
            features: [
                { name: "Up to 3 Service Center Branches", included: true },
                { name: "Unlimited Customer Bookings", included: true },
                { name: "Real-time Slot Scheduling", included: true },
                { name: "Automated Invoicing & Stripe", included: true },
                { name: "Executive Finance Dashboard", included: true },
                { name: "Multi-Branch Management", included: true },
            ],
            highlight: true,
            buttonStyle: "bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50",
            buttonText: "Subscribe Now"
        },
        {
            name: "Enterprise Multi-Branch",
            price: isYearly ? 95000 : 9500,
            period: isYearly ? "/ year" : "/ month",
            description: "billed " + (isYearly ? "annually" : "monthly"),
            features: [
                { name: "Unlimited Service Center Branches", included: true },
                { name: "Unlimited Managers & Technicians", included: true },
                { name: "Priority 24/7 Dedicated Support", included: true },
                { name: "Custom Vehicle Service Packages", included: true },
                { name: "Exportable Tax & Audit Logs", included: true },
                { name: "Full Platform API Access", included: true },
            ],
            highlight: false,
            buttonStyle: "bg-orange-50 text-orange-600 hover:bg-orange-100",
            buttonText: "Contact Sales"
        },
    ];

    // If we have DB plans, enrich them
    const displayPlans = dbPlans.length >= 2 ? dbPlans.map((p, idx) => {
        const rawPrice = Number(p.price || (idx === 0 ? 0 : idx === 1 ? 4500 : 9500));
        const effectivePrice = isYearly ? rawPrice * 10 : rawPrice;
        const isHighlight = (p.planName || p.name || "").toLowerCase().includes("pro") || idx === 1;

        return {
            name: p.planName || p.name || `Tier ${idx + 1}`,
            price: effectivePrice,
            period: effectivePrice === 0 ? "/ free" : (isYearly ? "/ year" : "/ month"),
            description: p.description || (isYearly ? "billed annually" : "billed monthly"),
            features: [
                { name: `${p.maxServiceCenters || (idx + 1)} Service Center Branch(es)`, included: true },
                { name: `${p.maxManagers || (idx * 2 + 1)} Service Manager Accounts`, included: true },
                { name: "Automated Invoicing & Stripe Payments", included: true },
                { name: "Digital Job Cards & History", included: true },
                { name: "Executive Finance & Analytics", included: idx > 0 },
                { name: "Custom Package Management", included: idx > 1 },
            ],
            highlight: isHighlight,
            buttonStyle: isHighlight
                ? "bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50"
                : "bg-orange-50 text-orange-600 hover:bg-orange-100",
            buttonText: effectivePrice === 0 ? "Start Free Trial" : "Subscribe Now"
        };
    }) : defaultPlans;

    return (
        <section id="pricing" className="py-20 relative overflow-hidden bg-gradient-to-b from-white via-orange-50/50 to-orange-100">
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-[#EA580C] font-bold text-sm uppercase tracking-wider mb-2 block">
                        Transparent Pricing
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                        Plans for Workshops of Any Size
                    </h2>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-12 h-7 bg-slate-200 rounded-full p-1 transition-colors duration-300 focus:outline-none"
                            aria-label="Toggle annual pricing"
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isYearly ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>Yearly</span>
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Save 15%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
                    {displayPlans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-6 md:p-8 rounded-2xl transition-all duration-300 ${plan.highlight
                                ? 'bg-white shadow-2xl ring-2 ring-orange-500/30 scale-105 z-10'
                                : 'bg-white shadow-xl hover:shadow-2xl border border-slate-100'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#EA580C] text-white text-[11px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">{plan.name}</h3>

                            <div className="flex items-baseline mb-2">
                                <span className="text-3xl md:text-4xl font-extrabold text-slate-900">
                                    {plan.price === 0 ? "Free" : `Rs. ${plan.price.toLocaleString()}`}
                                </span>
                                <span className="text-slate-500 text-sm ml-2">{plan.period}</span>
                            </div>
                            <p className="text-slate-400 text-xs mb-6">{plan.description}</p>

                            <ul className="space-y-3.5 mb-8 flex-grow">
                                {plan.features.map((feature: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <div className="mt-0.5 text-green-500 flex-shrink-0">
                                                <FiCheck size={17} />
                                            </div>
                                        ) : (
                                            <div className="mt-0.5 text-slate-300 flex-shrink-0">
                                                <FiX size={17} />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feature.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${plan.buttonStyle}`}
                            >
                                {plan.buttonText}
                                <FiArrowRight />
                            </Link>

                            <p className="text-center text-[11px] text-slate-400 mt-3">Cancel or upgrade anytime</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default PricingSection;
