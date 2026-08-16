"use client";

import { useState, useEffect } from "react";
import { FiCheck, FiEdit2, FiPlus, FiTrash, FiX, FiLoader } from "react-icons/fi";
import Button from "@/components/UI/Button";
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "@/lib/api";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, IconButton } from "@mui/material";
import FeedbackSnackbar from "@/components/UI/FeedbackSnackbar";
import ConfirmDialog from "@/components/UI/ConfirmDialog";

interface ServicePlan {
    id: string; // Changed from number to string for UUIDs
    name: string;
    price: number;
    features: string[];
    isPopular?: boolean; // Changed from highlight to isPopular
    description?: string;
    durationMonths?: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<ServicePlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, name: string }>({ isOpen: false, id: '', name: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        features: [""],
        isPopular: false,
        durationMonths: 1
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const data = await getSubscriptionPlans();
            setPlans(data);
        } catch (error: any) {
            showSnackbar(error.message || "Failed to load subscription plans", "error");
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
            isPopular: false,
            durationMonths: 1
        });
        setIsModalOpen(true);
    };

    const openEditModal = (plan: ServicePlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            features: plan.features?.length > 0 ? [...plan.features] : [""],
            isPopular: plan.isPopular || false,
            durationMonths: plan.durationMonths || 1
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.price) {
            showSnackbar("Please fill in all required fields", "warning");
            return;
        }

        const validFeatures = formData.features.filter(f => f.trim() !== "");
        if (validFeatures.length === 0) {
            showSnackbar("Please add at least one feature", "warning");
            return;
        }

        const planData = {
            name: formData.name,
            price: parseFloat(formData.price),
            features: validFeatures,
            isPopular: formData.isPopular,
            durationMonths: formData.durationMonths,
            isActive: true
        };

        setIsSubmitting(true);
        try {
            if (editingPlan) {
                await updateSubscriptionPlan(editingPlan.id, planData);
                showSnackbar("Plan updated successfully", "success");
            } else {
                await createSubscriptionPlan(planData);
                showSnackbar("Plan created successfully", "success");
            }
            setIsModalOpen(false);
            fetchPlans(); // Refresh the list
        } catch (error: any) {
            showSnackbar(error.message || "Operation failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteSubscriptionPlan(id);
            showSnackbar("Plan deleted successfully", "success");
            fetchPlans();
            setDeleteModal({ isOpen: false, id: '', name: '' });
        } catch (error: any) {
            showSnackbar(error.message || "Failed to delete plan", "error");
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

    const getDurationLabel = (months?: number) => {
        switch (months) {
            case 1: return "/mo";
            case 3: return "/quarter";
            case 6: return "/half-year";
            case 12: return "/year";
            default: return "/mo";
        }
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
                                    <span className="text-slate-500 font-medium">{getDurationLabel(plan.durationMonths)}</span>
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

                            {plan.updatedAt && (
                                <div className="text-[10px] text-slate-400 font-semibold mb-2">
                                    Last updated: {new Date(plan.updatedAt).toLocaleString()}
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-100 flex gap-3">
                                <button
                                    onClick={() => openEditModal(plan)}
                                    className="flex-1 h-9 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all"
                                >
                                    <FiEdit2 className="w-3.5 h-3.5" /> Edit Plan
                                </button>
                                <button
                                    onClick={() => setDeleteModal({ isOpen: true, id: plan.id, name: plan.name })}
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

            {/* Create/Edit MUI Dialog */}
            <Dialog
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: '1.25rem', overflow: 'hidden' } }}
            >
                <DialogTitle sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography variant="h6" fontWeight="bold" color="#0f172a">
                            {editingPlan ? "Edit Plan" : "Create New Plan"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {editingPlan ? "Update plan details and features" : "Add a new subscription tier"}
                        </Typography>
                    </div>
                    <IconButton onClick={() => setIsModalOpen(false)} size="small">
                        <FiX />
                    </IconButton>
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-2 mt-1"
                                >
                                    <FiPlus /> Add Feature
                                </button>
                            </div>
                        </div>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc', gap: 1.5 }}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Saving..." : (editingPlan ? "Update Plan" : "Create Plan")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Plan Confirmation Dialog */}
            <ConfirmDialog 
                open={deleteModal.isOpen} 
                onClose={() => setDeleteModal({ isOpen: false, id: '', name: '' })}
                title="Delete Subscription Plan?"
                message={<>Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{deleteModal.name}</strong>? Existing subscribers might be affected.</>}
                confirmText="Delete Plan"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() => handleDelete(deleteModal.id)}
            />

            <FeedbackSnackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                severity={snackbar.severity}
                message={snackbar.message}
                onClose={() => setSnackbar({ ...snackbar, open: false })} 
            />
        </div>
    );
}
