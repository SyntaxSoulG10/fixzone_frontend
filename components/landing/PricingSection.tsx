"use client";

import React, { useState } from 'react';
import { FiCheck, FiX, FiArrowRight } from 'react-icons/fi';

const PricingSection = () => {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Starter",
            price: isYearly ? 190 : 19, // simple x10 logic for yearly
            period: isYearly ? "/ year" : "/ month",
            description: "billed " + (isYearly ? "yearly" : "monthly"),
            features: [
                { name: "Single User Access", included: true },
                { name: "Up to 50 Bookings/mo", included: true },
                { name: "Basic Customer Support", included: true },
                { name: "SMS Notifications", included: false },
                { name: "Advanced Analytics", included: false },
                { name: "Multi-branch Management", included: false },
            ],
            highlight: false,
            buttonStyle: "bg-orange-50 text-orange-600 hover:bg-orange-100",
        },
        {
            name: "Standard",
            price: isYearly ? 490 : 49,
            period: isYearly ? "/ year" : "/ month",
            description: "billed " + (isYearly ? "yearly" : "monthly"),
            features: [
                { name: "Up to 5 Users", included: true },
                { name: "Unlimited Bookings", included: true },
                { name: "Priority Email Support", included: true },
                { name: "SMS & Email Notifications", included: true },
                { name: "Advanced Analytics", included: true },
                { name: "Multi-branch Management", included: false },
            ],
            highlight: true,
            buttonStyle: "bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50",
        },
        {
            name: "Premium",
            price: isYearly ? 990 : 99,
            period: isYearly ? "/ year" : "/ month",
            description: "billed " + (isYearly ? "yearly" : "monthly"),
            features: [
                { name: "Unlimited Users", included: true },
                { name: "Unlimited Bookings", included: true },
                { name: "24/7 Dedicated Support", included: true },
                { name: "Custom Branding", included: true },
                { name: "Advanced Analytics & Export", included: true },
                { name: "Multi-branch Management", included: true },
            ],
            highlight: false,
            buttonStyle: "bg-orange-50 text-orange-600 hover:bg-orange-100",
        },
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-orange-50/50 to-orange-100">
            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">Pricing & Plans</h2>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-14 h-8 bg-slate-200 rounded-full p-1 transition-colors duration-300 focus:outline-none"
                        >
                            <div
                                className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>Yearly</span>
                            <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Save 25%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-8 rounded-2xl transition-all duration-300 ${plan.highlight
                                    ? 'bg-white shadow-2xl ring-2 ring-orange-500/20 scale-105 z-10'
                                    : 'bg-white shadow-xl hover:shadow-2xl border border-slate-100'
                                }`}
                        >
                            <h3 className="text-orange-500 font-bold text-sm uppercase tracking-wider mb-4">{plan.name}</h3>

                            <div className="flex items-baseline mb-2">
                                <span className="text-5xl font-extrabold text-slate-900">${plan.price}</span>
                                <span className="text-slate-500 ml-2">{plan.period}</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-8">{plan.description}</p>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <div className="mt-1 text-green-500 flex-shrink-0">
                                                <FiCheck size={18} />
                                            </div>
                                        ) : (
                                            <div className="mt-1 text-slate-300 flex-shrink-0">
                                                <FiX size={18} />
                                            </div>
                                        )}
                                        <span className={`text-sm ${feature.included ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                                            {feature.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${plan.buttonStyle}`}>
                                Start Free Trial
                                <FiArrowRight />
                            </button>

                            <p className="text-center text-xs text-slate-400 mt-4">No credit card required</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default PricingSection;
