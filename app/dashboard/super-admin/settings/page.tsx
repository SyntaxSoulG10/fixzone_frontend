"use client";

import Button from "@/components/UI/Button"; import PageHeader from "@/components/UI/PageHeader";

export default function SystemSettingsPage() {
    return (
        <div>
            <PageHeader
                title="System Settings"
                description="Configure platform-wide settings."
            />
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Platform Name</label>
                        <input type="text" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border" defaultValue="FixZone" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Maintenance Mode</label>
                        <div className="mt-2 flex items-center gap-2">
                            <input type="checkbox" className="toggle-checkbox" />
                            <span className="text-sm text-slate-500">Enable maintenance mode</span>
                        </div>
                    </div>
                    <Button className=" mt-4">Save Changes</Button>
                </form>
            </div>
        </div>
    );
}
