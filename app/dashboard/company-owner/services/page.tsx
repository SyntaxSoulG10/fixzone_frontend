"use client";

import { useState } from "react";
import PageHeader from "@/components/UI/PageHeader";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCheck, FiX, FiSave } from "react-icons/fi";

interface ServicePackage {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    features: string[];
    isActive: boolean;
}

const MOCK_PACKAGES: ServicePackage[] = [
    {
        id: "1",
        name: "Standard Oil Change",
        description: "Complete oil change service including filter replacement and fluid top-up.",
        price: 15000.00,
        duration: 45,
        features: ["Oil filter replacement", "Up to 5 quarts of oil", "Fluid top-up", "Visual inspection"],
        isActive: true,
    },
    {
        id: "2",
        name: "Full Diagnostic Scan",
        description: "Comprehensive vehicle diagnostic scan to identify engine and system issues.",
        price: 8500.00,
        duration: 60,
        features: ["Engine check", "Transmission check", "Brake system scan", "Detailed report"],
        isActive: true,
    },
    {
        id: "3",
        name: "Premium Detailing",
        description: "Interior and exterior detailing service for a showroom finish.",
        price: 25000.00,
        duration: 180,
        features: ["Exterior wash & wax", "Interior vacuum & shampoo", "Leather conditioning", "Window cleaning"],
        isActive: true,
    },
    {
        id: "4",
        name: "Brake Pad Replacement",
        description: "Professional brake pad replacement for front or rear axle.",
        price: 18500.00,
        duration: 90,
        features: ["Ceramic brake pads", "Rotor inspection", "Brake fluid check", "Test drive"],
        isActive: false,
    },
];

export default function ServicesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>(MOCK_PACKAGES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [currentPackage, setCurrentPackage] = useState<ServicePackage>({
        id: "",
        name: "",
        description: "",
        price: 0,
        duration: 30,
        features: [""],
        isActive: true
    });

    const [featuresInput, setFeaturesInput] = useState("");

    const handleOpenCreate = () => {
        setCurrentPackage({
            id: "",
            name: "",
            description: "",
            price: 0,
            duration: 30,
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
        setIsModalOpen(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();


        const processedFeatures = featuresInput
            .split("\n")
            .map(f => f.trim())
            .filter(f => f.length > 0);

        const packageData = {
            ...currentPackage,
            features: processedFeatures,
            price: Number(currentPackage.price),
            duration: Number(currentPackage.duration)
        };

        if (isEditing) {
            setPackages(packages.map(p => p.id === packageData.id ? packageData : p));
        } else {
            const newPackage = {
                ...packageData,
                id: Math.random().toString(36).substr(2, 9)
            };
            setPackages([...packages, newPackage]);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this service package?")) {
            setPackages(packages.filter(p => p.id !== id));
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
                {packages.map((pkg) => (
                    <div key={pkg.id} className="group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={() => handleOpenEdit(pkg)}
                                className="p-2 bg-white text-slate-600 rounded-full shadow-sm hover:text-primary hover:bg-slate-50 border border-slate-100 transition-colors"
                                title="Edit"
                            >
                                <FiEdit2 size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(pkg.id)}
                                className="p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 border border-slate-100 transition-colors"
                                title="Delete"
                            >
                                <FiTrash2 size={16} />
                            </button>
                        </div>

                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-full">
                                    <div className="flex justify-between w-full">
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                                            {pkg.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                                            }`}>
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
                                <span className="text-3xl font-bold text-slate-900 tracking-tight">Rs. {pkg.price.toFixed(2)}</span>
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
                            </div>
                        </div>
                    </div>
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
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Price (Rs.)</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="0.00"
                                            value={currentPackage.price}
                                            onChange={e => setCurrentPackage({ ...currentPackage, price: parseFloat(e.target.value) })}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Estimated Duration (mins)</label>
                                        <input
                                            type="number"
                                            required
                                            min="5"
                                            step="5"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            placeholder="30"
                                            value={currentPackage.duration}
                                            onChange={e => setCurrentPackage({ ...currentPackage, duration: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Status</label>
                                        <div className="flex items-center space-x-4 pt-2">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    className="text-primary focus:ring-primary"
                                                    checked={currentPackage.isActive}
                                                    onChange={() => setCurrentPackage({ ...currentPackage, isActive: true })}
                                                />
                                                <span className="text-sm text-slate-600">Active</span>
                                            </label>
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    className="text-primary focus:ring-primary"
                                                    checked={!currentPackage.isActive}
                                                    onChange={() => setCurrentPackage({ ...currentPackage, isActive: false })}
                                                />
                                                <span className="text-sm text-slate-600">Inactive</span>
                                            </label>
                                        </div>
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
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                >
                                    <FiSave className="mr-2" />
                                    {isEditing ? "Save Changes" : "Create Package"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
