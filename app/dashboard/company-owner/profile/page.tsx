"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";

export default function ProfilePage() {
    return (
        <div>
            <PageHeader
                title="Company Profile"
                description="Manage company details and branding."
            />

            <div className="max-w-3xl bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                            <input type="text" defaultValue="AutoFix Pro" className="w-full border-slate-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
                            <input type="email" defaultValue="contact@autofix.com" className="w-full border-slate-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input type="text" defaultValue="+1 (555) 123-4567" className="w-full border-slate-200 rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                            <input type="text" defaultValue="www.autofix.com" className="w-full border-slate-200 rounded-lg" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea className="w-full border-slate-200 rounded-lg" rows={3} defaultValue="123 Main St, Suite 500, New York, NY 10001"></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <Button type="button" variant="secondary">Cancel</Button>
                        <Button type="button">Save Changes</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
