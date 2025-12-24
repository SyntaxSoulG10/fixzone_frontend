"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";
import { FiDownload, FiFileText } from "react-icons/fi";

const DUMMY_REPORTS = [
    { id: 1, name: "December Revenue Report", date: "Dec 24, 2024", type: "Financial", size: "1.2 MB" },
    { id: 2, name: "Q4 Performance Summary", date: "Dec 20, 2024", type: "Analytics", size: "4.5 MB" },
    { id: 3, name: "Customer Satisfaction Survey", date: "Dec 15, 2024", type: "Feedback", size: "850 KB" },
    { id: 4, name: "Staff Attendance Report", date: "Dec 01, 2024", type: "HR", size: "500 KB" },
];

export default function ReportsPage() {
    return (
        <div>
            <PageHeader
                title="Reports"
                description="Download financial and operational reports."
            />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                    {DUMMY_REPORTS.map((report) => (
                        <div key={report.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                    <FiFileText className="text-xl" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{report.name}</h4>
                                    <p className="text-xs text-slate-500">{report.date} • {report.type} • {report.size}</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full">
                                <FiDownload className="text-xl" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
