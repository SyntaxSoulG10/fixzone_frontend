"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiMapPin, FiPhone } from "react-icons/fi";

const MY_CENTERS = [
    { id: 1, name: "Downtown Branch", location: "123 Main St, New York, NY", phone: "+1 (555) 123-4567", revenue: "$45,200", status: "Active" },
    { id: 2, name: "Westside Hub", location: "456 West Ave, New York, NY", phone: "+1 (555) 987-6543", revenue: "$32,100", status: "Active" },
];

export default function MyCentersPage() {
    return (
        <div>
            <PageHeader
                title="My Service Centers"
                description="Manage your branches and locations."
                action={
                    <Button>
                        + New Branch
                    </Button>
                }
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MY_CENTERS.map((center) => (
                    <div key={center.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-xl text-primary font-bold">
                                {center.name.charAt(0)}
                            </div>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">{center.status}</span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2">{center.name}</h3>

                        <div className="space-y-2 text-sm text-slate-500 mb-6">
                            <div className="flex items-center gap-2">
                                <FiMapPin className="text-slate-400" />
                                {center.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <FiPhone className="text-slate-400" />
                                {center.phone}
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-semibold">Revenue (Dec)</p>
                                <p className="text-lg font-bold text-slate-900">{center.revenue}</p>
                            </div>
                            <Button variant="ghost" className="text-primary hover:text-primary-hover font-medium text-sm hover:bg-slate-50">Manage</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
