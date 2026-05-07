"use client";

import { useState, useEffect } from "react";
import { FiCheck, FiEdit2, FiPlus, FiTrash, FiX, FiLoader } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "@/lib/api";
import { toast } from "react-hot-toast";

interface ServicePlan {
    id: string; // Changed from number to string for UUIDs
    name: string;
    price: number;
    features: string[];
    isPopular?: boolean; // Changed from highlight to isPopular
    description?: string;
    durationMonths?: number;
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<ServicePlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        features: [""],
        isPopular: false
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const data = await getSubscriptionPlans();
            setPlans(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load subscription plans");
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setFormData({
            name: "",
            price: "",
            features: [""],
            isPopular: false
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: ServicePlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            features: plan.features?.length > 0 ? [...plan.features] : [""],
            isPopular: plan.isPopular || false
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const planData = {
            name: formData.name,
            price: parseFloat(formData.price),
            features: formData.features.filter(f => f.trim() !== ""),
            isPopular: formData.isPopular,
            durationMonths: 1, // Default to monthly
            isActive: true
        };

        try {
            if (editingPlan) {
                await updateSubscriptionPlan(editingPlan.id, planData);
                toast.success("Plan updated successfully");
            } else {
                await createSubscriptionPlan(planData);
                toast.success("Plan created successfully");
            }
            setIsModalOpen(false);
            fetchPlans(); // Refresh the list
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this plan?")) {
            try {
                await deleteSubscriptionPlan(id);
                toast.success("Plan deleted successfully");
                fetchPlans();
            } catch (error: any) {
                toast.error(error.message || "Failed to delete plan");
            }
        }
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, ""]
        }));
    };

    const updateFeature = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((f, i) => i === index ? value : f)
        }));
    };

    const removeFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    if (isLoading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
                <FiLoader className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-slate-500 font-medium">Loading subscription plans...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
                    <p className="text-slate-500 mt-1">Manage the pricing tiers available to service centers.</p>
                </div>
                <Button onClick={openCreateModal}>
                    <span className="flex items-center gap-2"><FiPlus /> Create New Plan</span>
                </Button>
            </div>

            {plans.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
                    <p className="text-slate-500 mb-4">No subscription plans found.</p>
                    <Button onClick={openCreateModal} variant="secondary">Create your first plan</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`relative bg-white rounded-2xl shadow-sm border p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-md ${plan.isPopular ? 'border-orange-200 shadow-orange-100 ring-4 ring-orange-50' : 'border-slate-200'}`}>
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                                    Popular
                                </div>
                            )}

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-800">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold text-slate-900">Rs. {plan.price.toLocaleString()}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8 flex-1">
                                {plan.features && plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                                        <div className="mt-0.5 min-w-4 text-green-500">
                                            <FiCheck />
                                        </div>
                                        <span className="font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => openEditModal(plan)}
                                    className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                                >
                                    <FiEdit2 className="w-3.5 h-3.5" /> Edit Plan
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                    title="Delete Plan"
                                >
                                    <FiTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {editingPlan ? "Edit Plan" : "Create New Plan"}
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {editingPlan ? "Update plan details and features" : "Add a new subscription tier"}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Plan Name */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all"
                                    placeholder="e.g., Premium"
                                    required
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Price (Rs./month)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all"
                                    placeholder="e.g., 15000"
                                    required
                                />
                            </div>

                            {/* Highlight Toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isPopular"
                                    checked={formData.isPopular}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                                    className="w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500"
                                />
                                <label htmlFor="isPopular" className="text-sm font-semibold text-slate-700">
                                    Mark as Popular Plan
                                </label>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Features</label>
                                <div className="space-y-2">
                                    {formData.features.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all"
                                                placeholder="e.g., Unlimited Managers"
                                            />
                                            {formData.features.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <FiX />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-2"
                                    >
                                        <FiPlus /> Add Feature
                                    </button>
                                </div>
                            </div>
                        </form>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
                            >
                                {editingPlan ? "Update Plan" : "Create Plan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
