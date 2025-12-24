"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";

export default function CustomerProfilePage() {
    return (
        <div>
            <PageHeader
                title="My Profile"
                description="Manage your account settings."
            />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center text-slate-500">
                Profile edit form will go here.
            </div>
        </div>
    );
}
