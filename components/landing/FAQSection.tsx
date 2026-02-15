"use client";

import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const faqs = [
    {
        question: "How do I book a vehicle service?",
        answer: "You can book a service through our website or mobile app by selecting your vehicle type, service type, and preferred time slot."
    },
    {
        question: "What types of vehicles do you service?",
        answer: "We support a wide range of vehicles including compact cars, sedans, SUVs, vans, and motorcycles. Our partner centers are equipped to handle various makes and models."
    },
    {
        question: "How can I track the progress of my service?",
        answer: "Once your vehicle is checked in, you can track its status in real-time via your personal dashboard. You will see updates as it moves from inspection to repair and final completion."
    },
    {
        question: "Can I reschedule or cancel a booking?",
        answer: "Yes, you can reschedule or cancel your booking directly from your account. We recommend doing so at least 24 hours in advance to avoid any cancellation fees."
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept major credit and debit cards, as well as digital wallets. Some service centers may also offer pay-on-arrival options."
    }
];

const FAQSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="bg-[#140802] py-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-orange-900/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-12 space-y-3">
                    <span className="text-[#EA580C] font-bold text-base uppercase tracking-wide">FAQ</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-100 leading-tight">
                        Find answers to common <br />
                        questions about our services
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={index}
                                className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen
                                    ? 'bg-white/10 border-orange-500/50'
                                    : 'bg-white/5 border-white/10 hover:bg-white/[0.07]'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                                >
                                    <span className="text-base md:text-lg font-medium text-slate-100 pr-8">
                                        {faq.question}
                                    </span>
                                    <div className={`p-1.5 rounded-full ${isOpen ? 'bg-white text-[#EA580C]' : 'bg-transparent text-white'}`}>
                                        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                                    </div>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="px-5 pb-5 text-slate-300 leading-relaxed border-t border-white/5 pt-3 mx-5 mt-0 text-sm md:text-base">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;
