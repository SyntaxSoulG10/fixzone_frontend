"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCheck, FiX, FiSave } from "react-icons/fi";
import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";
import { Snackbar, Alert, CircularProgress } from "@mui/material";

/**
 * Validation and default constants for service packages.
 */
const MIN_PACKAGE_NAME_LENGTH = 3;
const MIN_PRICE = 0;
const MAX_PRICE = 1000000;
const MIN_DURATION = 5;
const MAX_DURATION = 1440; // 24 hours
const MIN_DESC_LENGTH = 10;
const DEFAULT_PRICE = 0;
const DEFAULT_DURATION = 30;

/**
 * Interface defining the structure of a service package.
 * Used for maintaining consistency between the frontend and the API.
 */
interface ServicePackage {
    id: string;
    centerId: string;
    name: string;
    type?: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    isActive: boolean;
}

/**
 * CARD COMPONENT: Represents a single service package offering.
 * Separates visual layout from list management logic.
 */
function ServicePackageCard({ pkg, onEdit, onDelete }: { pkg: ServicePackage, onEdit: (pkg: ServicePackage) => void, onDelete: (id: string) => void }) {
    return (
        <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={() => onEdit(pkg)}
                    className="p-2 bg-white text-slate-600 rounded-full shadow-sm hover:text-primary hover:bg-slate-50 border border-slate-100 transition-colors"
                    title="Edit"
                >
                    <FiEdit2 size={16} />
                </button>
                <button
                    onClick={() => onDelete(pkg.id)}
                    className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 border border-slate-100 transition-colors"
                    title="Delete"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>

            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                            {pkg.name}
                        </h3>

                        <div className="flex items-center gap-3 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                                {pkg.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex items-center text-xs text-slate-500">
                                <FiClock className="mr-1" size={12} />
                                {pkg.duration} mins
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-slate-600 text-sm mb-6 line-clamp-2 h-10">
                    {pkg.description}
                </p>

                <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold text-slate-900 tracking-tight">Rs. {Number(pkg.price).toFixed(2)}</span>
                    <span className="text-slate-500 ml-1 text-sm font-medium">/ service</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Features</h4>
                    <ul className="space-y-2">
                        {pkg.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-600">
                                <FiCheck className="mr-2 mt-0.5 text-primary flex-shrink-0" size={14} />
                                <span className="line-clamp-1">{feature}</span>
                            </li>
                        ))}
                    </ul>
                    {pkg.features.length > 3 && (
                        <p className="text-xs text-slate-400 pl-6">+ {pkg.features.length - 3} more</p>
                    )}
                    {pkg.features.length === 0 && (
                        <p className="text-xs text-slate-400 italic">No features listed</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * FORM DIALOG: Standardized input for adding or editing service packages.
 */
function ServicePackageDialog({ 
    isEditing, 
    currentPackage, 
    setCurrentPackage, 
    featuresInput, 
    setFeaturesInput, 
    centers, 
    handleSave, 
    handleCloseModal, 
    isSaving 
}: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEditing ? `Edit ${currentPackage.name}` : "Create New Package"}
                    </h2>
                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Service Center</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                value={currentPackage.centerId}
                                onChange={e => setCurrentPackage({ ...currentPackage, centerId: e.target.value })}
                            >
                                <option value="" disabled>Select a center</option>
                                {centers.map((center: any) => (
                                    <option key={center.id} value={center.id}>{center.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Package Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="e.g. Gold Service"
                                value={currentPackage.name}
                                onChange={e => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Price (Rs.)</label>
                                <input
                                    type="number"
                                    required
                                    min={MIN_PRICE}
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="0.00"
                                    value={currentPackage.price || ""}
                                    onChange={e => {
                                        const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                        setCurrentPackage({ ...currentPackage, price: val });
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Estimated Duration (mins)</label>
                                <input
                                    type="number"
                                    required
                                    min={MIN_DURATION}
                                    step="5"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="30"
                                    value={currentPackage.duration || ""}
                                    onChange={e => {
                                        const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                        setCurrentPackage({ ...currentPackage, duration: val });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                required
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="Brief description of the service package..."
                                value={currentPackage.description}
                                onChange={e => setCurrentPackage({ ...currentPackage, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <div className="flex items-center space-x-4 pt-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        className="text-primary focus:ring-primary"
                                        checked={currentPackage.isActive}
                                        onChange={() => setCurrentPackage({ ...currentPackage, isActive: true })}
                                    />
                                    <span className="text-sm text-slate-600">Active</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        className="text-primary focus:ring-primary"
                                        checked={!currentPackage.isActive}
                                        onChange={() => setCurrentPackage({ ...currentPackage, isActive: false })}
                                    />
                                    <span className="text-sm text-slate-600">Inactive</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-700">Features</label>
                                <span className="text-xs text-slate-400">One feature per line</span>
                            </div>
                            <textarea
                                required
                                rows={5}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                                placeholder="- Oil change&#10;- Filter replacement&#10;- Tire check"
                                value={featuresInput}
                                onChange={e => setFeaturesInput(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleCloseModal}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <CircularProgress size={20} color="inherit" className="mr-2" />
                            ) : (
                                <FiSave className="mr-2" />
                            )}
                            {isEditing ? "Save Changes" : "Create Package"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/**
 * Orchestrates the management of service packages.
 * Allows creating, editing, and deleting available service offerings.
 */
export default function ServicesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [centers, setCenters] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [snackbar, setSnackbar] = useState({ 
        open: false, 
        message: '', 
        severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
    });

    const [currentPackage, setCurrentPackage] = useState<ServicePackage>({
        id: "",
        centerId: "",
        name: "",
        description: "",
        price: DEFAULT_PRICE,
        duration: DEFAULT_DURATION,
        features: [],
        isActive: true
    });

    const [featuresInput, setFeaturesInput] = useState("");

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchPackages(), fetchCenters()]);
            } catch (err) {
                showSnackbar("Failed to initialize data", "error");
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const fetchPackages = async () => {
        try {
            const response = await axios.get(APP_CONFIG.api.baseUrl + "/service-packages/current");
            const mappedData = (response.data || []).map((pkg: any) => ({
                id: pkg.packageId,
                centerId: pkg.centerId,
                name: pkg.name,
                type: pkg.type,
                description: pkg.description,
                price: pkg.basePrice,
                duration: pkg.estimatedDurationMins,
                features: pkg.type ? pkg.type.split(",").filter((f: string) => f.length > 0) : [],
                isActive: pkg.isActive
            }));
            setPackages(mappedData);
        } catch (error: any) {
            console.error("Error fetching service packages:", error);
            showSnackbar(error.response?.data?.message || "Error fetching service packages", "error");
        }
    };

    const fetchCenters = async () => {
        try {
            const response = await axios.get(APP_CONFIG.api.serviceCenters + "/current");
            const mappedCenters = (response.data || []).map((center: any) => ({
                id: center.centerId,
                name: center.name
            }));
            setCenters(mappedCenters);
            if (mappedCenters.length > 0 && !currentPackage.centerId) {
                setCurrentPackage(prev => ({ ...prev, centerId: mappedCenters[0].id }));
            }
        } catch (error: any) {
            console.error("Error fetching centers:", error);
            showSnackbar("Error fetching service centers", "error");
        }
    };

    const handleOpenCreate = () => {
        if (centers.length === 0) {
            showSnackbar("Please create a service center first", "warning");
            return;
        }
        setCurrentPackage({
            id: "",
            centerId: centers[0].id,
            name: "",
            description: "",
            price: DEFAULT_PRICE,
            duration: DEFAULT_DURATION,
            features: [],
            isActive: true
        });
        setFeaturesInput("");
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (pkg: ServicePackage) => {
        setCurrentPackage(pkg);
        setFeaturesInput(pkg.features.join("\n"));
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (!isSaving) setIsModalOpen(false);
    };

    const validateForm = () => {
        if (!currentPackage.name.trim() || currentPackage.name.length < MIN_PACKAGE_NAME_LENGTH) {
            showSnackbar(`Package name must be at least ${MIN_PACKAGE_NAME_LENGTH} characters`, "warning");
            return false;
        }
        if (currentPackage.price <= MIN_PRICE) {
            showSnackbar(`Price must be greater than ${MIN_PRICE}`, "warning");
            return false;
        }
        if (currentPackage.price > MAX_PRICE) {
            showSnackbar(`Price exceeds maximum allowed value`, "warning");
            return false;
        }
        if (currentPackage.duration < MIN_DURATION || currentPackage.duration > MAX_DURATION) {
            showSnackbar(`Duration must be between ${MIN_DURATION} minutes and ${MAX_DURATION / 60} hours`, "warning");
            return false;
        }
        if (!currentPackage.description.trim() || currentPackage.description.length < MIN_DESC_LENGTH) {
            showSnackbar(`Please provide a more detailed description (min ${MIN_DESC_LENGTH} chars)`, "warning");
            return false;
        }
        if (!currentPackage.centerId) {
            showSnackbar("Please select a service center", "warning");
            return false;
        }
        return true;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSaving(true);
        const processedFeatures = featuresInput
            .split("\n")
            .map(f => f.trim())
            .filter(f => f.length > 0);

        const packageData = {
            packageId: isEditing ? currentPackage.id : undefined,
            centerId: currentPackage.centerId,
            name: currentPackage.name,
            type: processedFeatures.join(","),
            description: currentPackage.description,
            basePrice: Number(currentPackage.price),
            estimatedDurationMins: Number(currentPackage.duration),
            isActive: currentPackage.isActive
        };

        try {
            if (isEditing) {
                await axios.put(`${APP_CONFIG.api.baseUrl}/service-packages/${currentPackage.id}`, packageData);
                showSnackbar("Service package updated successfully");
            } else {
                await axios.post(`${APP_CONFIG.api.baseUrl}/service-packages`, packageData);
                showSnackbar("Service package created successfully");
            }
            await fetchPackages();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving service package:", error);
            showSnackbar(error.response?.data?.message || "Failed to save service package", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this service package?")) {
            try {
                await axios.delete(`${APP_CONFIG.api.baseUrl}/service-packages/${id}`);
                showSnackbar("Service package deleted");
                fetchPackages();
            } catch (error: any) {
                console.error("Error deleting service package:", error);
                showSnackbar(error.response?.data?.message || "Failed to delete service package", "error");
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
            <PageHeader
                title="Service Packages"
                description="Create and manage your service offerings and pricing."
                action={
                    <Button onClick={handleOpenCreate}>
                        <FiPlus className="mr-2 h-4 w-4" />
                        Create Package
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <CircularProgress color="primary" sx={{ mb: 2 }} />
                        <p className="text-slate-500">Loading service packages...</p>
                    </div>
                ) : packages.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 mb-4">No service packages found in database.</p>
                        <Button onClick={handleOpenCreate} variant="secondary">
                            <FiPlus className="mr-2 h-4 w-4" />
                            Create First Package
                        </Button>
                    </div>
                ) : (
                    <>
                        {packages.map((pkg) => (
                            <ServicePackageCard 
                                key={pkg.id} 
                                pkg={pkg} 
                                onEdit={handleOpenEdit} 
                                onDelete={handleDelete} 
                            />
                        ))}
                        <button
                            onClick={handleOpenCreate}
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-primary/50 hover:bg-slate-50 transition-all group min-h-[400px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                                <FiPlus className="text-slate-400 group-hover:text-primary" size={24} />
                            </div>
                            <span className="font-medium text-slate-600 group-hover:text-primary">Create New Package</span>
                        </button>
                    </>
                )}
            </div>

            {isModalOpen && (
<<<<<<< HEAD
                <ServicePackageDialog
                    isEditing={isEditing}
                    currentPackage={currentPackage}
                    setCurrentPackage={setCurrentPackage}
                    featuresInput={featuresInput}
                    setFeaturesInput={setFeaturesInput}
                    centers={centers}
                    handleSave={handleSave}
                    handleCloseModal={handleCloseModal}
                    isSaving={isSaving}
                />
            )}
            
=======
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-slate-900">
                                {isEditing ? `Edit ${currentPackage.name}` : "Create New Package"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Service Center</label>
                                    <select
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                        value={currentPackage.centerId}
                                        onChange={e => setCurrentPackage({ ...currentPackage, centerId: e.target.value })}
                                    >
                                        <option value="" disabled>Select a center</option>
                                        {centers.map(center => (
                                            <option key={center.id} value={center.id}>{center.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Package Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        placeholder="e.g. Gold Service"
                                        value={currentPackage.name}
                                        onChange={e => setCurrentPackage({ ...currentPackage, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Price (Rs.)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="0.00"
                                            value={currentPackage.price || ""}
                                            onChange={e => {
                                                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                                setCurrentPackage({ ...currentPackage, price: val });
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Estimated Duration (mins)</label>
                                        <input
                                            type="number"
                                            required
                                            min="5"
                                            step="5"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="30"
                                            value={currentPackage.duration || ""}
                                            onChange={e => {
                                                const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                                setCurrentPackage({ ...currentPackage, duration: val });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Description</label>
                                    <textarea
                                        required
                                        rows={2}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        placeholder="Brief description of the service package..."
                                        value={currentPackage.description}
                                        onChange={e => setCurrentPackage({ ...currentPackage, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <div className="flex items-center space-x-4 pt-2">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                className="text-primary focus:ring-primary"
                                                checked={currentPackage.isActive}
                                                onChange={() => setCurrentPackage({ ...currentPackage, isActive: true })}
                                            />
                                            <span className="text-sm text-slate-600">Active</span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                className="text-primary focus:ring-primary"
                                                checked={!currentPackage.isActive}
                                                onChange={() => setCurrentPackage({ ...currentPackage, isActive: false })}
                                            />
                                            <span className="text-sm text-slate-600">Inactive</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Features</label>
                                        <span className="text-xs text-slate-400">One feature per line</span>
                                    </div>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm"
                                        placeholder="- Oil change&#10;- Filter replacement&#10;- Tire check"
                                        value={featuresInput}
                                        onChange={e => setFeaturesInput(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleCloseModal}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <CircularProgress size={20} color="inherit" className="mr-2" />
                                    ) : (
                                        <FiSave className="mr-2" />
                                    )}
                                    {isEditing ? "Save Changes" : "Create Package"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
>>>>>>> backup-chamathka

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity} 
                    variant="filled" 
                    sx={{ width: '100%', borderRadius: '12px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}
