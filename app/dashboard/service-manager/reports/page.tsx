"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";

export default function ServiceReportsPage() {
    return (
        <div>
            <PageHeader
                title="Branch Reports"
                description="Daily operational reports."
            />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">
                Reports list will go here.
            </div>
        </div>
    );
}
