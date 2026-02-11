"use client";

import { useState } from "react";
import { FiCheck, FiEdit2, FiPlus, FiTrash } from "react-icons/fi";
import Button from "@/components/UI/Button";

interface ServicePlan {
    id: number;
    name: string;
    price: number;
    features: string[];
    highlight?: boolean;
}

const INITIAL_PLANS: ServicePlan[] = [
    {
        id: 1,
        name: "Basic",
        price: 5000,
        features: ["Basic Service Center Profile", "Up to 5 Managers", "Basic Analytics", "Email Support"],
        highlight: false
    },
    {
        id: 2,
        name: "Standard",
        price: 15000,
        features: ["Advanced Customization", "Unlimited Managers", "Financial Reports", "Priority Support", "Featured Listing"],
        highlight: true
    },
    {
        id: 3,
        name: "Premium",
        price: 35000,
        features: ["Multiple Locations", "API Access", "Dedicated Account Manager", "Custom Integrations"],
        highlight: false
    }
];

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<ServicePlan[]>(INITIAL_PLANS);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-500 mt-1">Manage the pricing tiers available to service centers.</p>
                </div>
                <Button>
                    <span className="flex items-center gap-2"><FiPlus /> Create New Plan</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className={`relative bg-white rounded-2xl shadow-sm border p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-md ${plan.highlight ? 'border-orange-200 shadow-orange-100 ring-4 ring-orange-50' : 'border-slate-200'}`}>
                        {plan.highlight && (
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                                Popular
                            </div>
                        )}
                        
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-bold text-slate-900">Rs. {plan.price}</span>
                                <span className="text-slate-500 font-medium">/mo</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                    <div className="mt-0.5 min-w-4 text-green-500">
                                        <FiCheck />
                                    </div>
                                    <span className="font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex gap-3">
                            <button className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all">
                                <FiEdit2 className="w-3.5 h-3.5" /> Edit Plan
                            </button>
                            <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all" title="Delete Plan">
                                <FiTrash className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
