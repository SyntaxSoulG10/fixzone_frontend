"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiFilter } from "react-icons/fi";

const DUMMY_VEHICLES = [
    { id: 1, plate: "ABC-1234", model: "Toyota Camry 2022", owner: "David Wilson", history: "3 Visits", status: "In Shop" },
    { id: 2, plate: "XYZ-9876", model: "Honda Civic 2020", owner: "Grace Lee", history: "5 Visits", status: "Active" },
];

export default function ServiceVehiclesPage() {
    return (
        <div>
            <PageHeader
                title="Vehicle Registry"
                description="Search and manage vehicles serviced at this branch."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <Button variant="secondary" className="flex items-center gap-2">
                        <FiFilter /> Filter
                    </Button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-semibold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Plate Number</th>
                                <th className="px-6 py-4">Make & Model</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Service History</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DUMMY_VEHICLES.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900 bg-slate-100/50 w-fit rounded">{vehicle.plate}</td>
                                    <td className="px-6 py-4 font-medium">{vehicle.model}</td>
                                    <td className="px-6 py-4">{vehicle.owner}</td>
                                    <td className="px-6 py-4">{vehicle.history}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${vehicle.status === 'In Shop' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {vehicle.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" className="p-2 rounded-full">
                                            <FiMoreVertical />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
