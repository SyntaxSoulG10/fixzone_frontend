"use client";

import { useState } from "react";
import Button from "@/components/UI/Button";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiBell } from "react-icons/fi";

type BannerType = 'info' | 'warning' | 'success' | 'error';
interface Banner {
    id: number;
    title: string;
    message: string;
    type: BannerType;
    isActive: boolean;
    target: 'all' | 'owners' | 'customers';
}

const INITIAL_BANNERS: Banner[] = [
    {
        id: 1,
        title: "System Maintenance",
        message: "Scheduled maintenance is planned for Sunday at 2:00 AM UTC. Services may be briefly unavailable.",
        type: "warning",
        isActive: true,
        target: "all"
    },
    {
        id: 2,
        title: "New Feature Alert",
        message: "Check out the new analytics dashboard for Service Center Owners!",
        type: "info",
        isActive: false,
        target: "owners"
    }
];

export default function GlobalBannersPage() {
    const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
    const [isCreating, setIsCreating] = useState(false);

    const toggleStatus = (id: number) => {
        setBanners(prev => prev.map(banner => 
            banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
        ));
    };

    const getTypeColor = (type: BannerType) => {
        switch (type) {
            case 'info': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'success': return 'bg-green-100 text-green-700 border-green-200';
            case 'error': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getTypeIcon = (type: BannerType) => {
        switch (type) {
            case 'info': return <FiInfo className="w-5 h-5" />;
            case 'warning': return <FiAlertCircle className="w-5 h-5" />;
            case 'success': return <FiCheckCircle className="w-5 h-5" />;
            case 'error': return <FiAlertCircle className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Banners</h1>
                    <p className="text-slate-500 mt-1">Manage announcements visible to users across the platform.</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                    <span className="flex items-center gap-2"><FiBell /> Create New Banner</span>
                </Button>
            </div>

            <div className="space-y-4">
                {banners.map((banner) => (
                    <div key={banner.id} className={`bg-white rounded-xl p-6 border shadow-sm transition-all ${
                        banner.isActive ? 'border-orange-200 shadow-orange-100/50' : 'border-slate-200 opacity-75'
                    }`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl flex items-center justify-center shadow-sm border ${getTypeColor(banner.type)}`}>
                                {getTypeIcon(banner.type)}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-lg">{banner.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full border tracking-wide ${
                                            banner.target === 'all' ? 'bg-slate-100 text-slate-600 border-slate-200' : 
                                            banner.target === 'owners' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                            'bg-green-50 text-green-700 border-green-200'
                                        }`}>
                                            Target: {banner.target}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={banner.isActive} onChange={() => toggleStatus(banner.id)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:shadow-sm after:transition-all peer-checked:bg-orange-500 hover:bg-slate-300 peer-checked:hover:bg-orange-600 transition-colors"></div>
                                            <span className="ml-3 text-sm font-bold text-slate-600 w-16">{banner.isActive ? 'Active' : 'Inactive'}</span>
                                        </label>
                                    </div>
                                </div>
                                <p className="text-slate-600 mt-2 font-medium">{banner.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
             {/* Simple Creation Instructions Placeholder */}
             {isCreating && (
                 <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                     <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold">New Banner</h3>
                             <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-full"><FiX /></button>
                         </div>
                         <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center text-center text-slate-500">
                             <p>Form implementation would go here.</p>
                             <Button className="mt-4" onClick={() => setIsCreating(false)}>Close Mockup</Button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
}
