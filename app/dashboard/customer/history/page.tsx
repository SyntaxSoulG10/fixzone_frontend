"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiCheckCircle, FiFileText } from "react-icons/fi";

const DUMMY_HISTORY = [
    { id: 1, service: "Full Inspection", date: "Nov 15, 2024", center: "Downtown Branch", cost: "$150.00", vehicle: "Toyota Camry" },
    { id: 2, service: "Brake Replacement", date: "Sep 02, 2024", center: "Downtown Branch", cost: "$320.00", vehicle: "Toyota Camry" },
    { id: 3, service: "Oil Change", date: "Jun 10, 2024", center: "Westside Hub", cost: "$80.00", vehicle: "Toyota Camry" },
];

export default function ServiceHistoryPage() {
    return (
        <div>
            <PageHeader
                title="Service History"
                description="Records of past vehicle services."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {DUMMY_HISTORY.map((record) => (
                        <div key={record.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-green-500 text-xl">
                                    <FiCheckCircle />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{record.service}</h4>
                                    <p className="text-sm text-slate-500 mt-1">Completed on {record.date} at {record.center}</p>
                                    <p className="text-xs text-slate-400 mt-1">{record.vehicle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-bold text-slate-900">{record.cost}</span>
                                <Button variant="ghost" className="flex items-center gap-2 text-sm text-primary hover:underline hover:bg-transparent p-0">
                                    <FiFileText /> Invoice
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
