"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiMoreVertical, FiSearch, FiFilter } from "react-icons/fi";

const DUMMY_VEHICLES = [
    { id: 1, plate: "ABC-1234", model: "Toyota Camry 2022", owner: "David Wilson", lastService: "Dec 10, 2024", condition: "Good" },
    { id: 2, plate: "XYZ-9876", model: "Honda Civic 2020", owner: "Grace Lee", lastService: "Nov 22, 2024", condition: "Excellent" },
    { id: 3, plate: "LMN-4567", model: "Ford F-150 2023", owner: "John Doe", lastService: "Oct 05, 2024", condition: "Fair" },
    { id: 4, plate: "QWE-5544", model: "Tesla Model 3", owner: "Jane Roe", lastService: "Dec 01, 2024", condition: "Good" },
    { id: 5, plate: "ZXC-1122", model: "BMW X5 2021", owner: "Mike Tyson", lastService: "Sep 15, 2024", condition: "Poor" },
];

export default function AllVehiclesPage() {
    return (
        <div>
            <PageHeader
                title="All Vehicles"
                description="Global vehicle registry across all tenants."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Plate or Model..."
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
                                <th className="px-6 py-4">Last Service</th>
                                <th className="px-6 py-4">Condition</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {DUMMY_VEHICLES.map((vehicle) => (
                                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900 bg-slate-100/50 w-fit rounded">{vehicle.plate}</td>
                                    <td className="px-6 py-4 font-medium">{vehicle.model}</td>
                                    <td className="px-6 py-4">{vehicle.owner}</td>
                                    <td className="px-6 py-4">{vehicle.lastService}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${vehicle.condition === 'Excellent' ? 'bg-green-100 text-green-700' :
                                                vehicle.condition === 'Good' ? 'bg-blue-100 text-blue-700' :
                                                    vehicle.condition === 'Fair' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {vehicle.condition}
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
