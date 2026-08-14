"use client";
import { useRoleGuard } from "../../../utils/useRoleGuard";
import { useDashboardData } from "../../../context/DashboardDataContext";
import { useRouter } from "next/navigation";
import { FiLoader, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { Suspense } from "react";

function SubscriptionExpiredBanner() {
    const router = useRouter();
    return (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 sm:px-6 lg:px-8 z-40 relative">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FiAlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800 font-medium">
                        Your subscription has expired. Some features are restricted.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/company-owner/profile?tab=billing")}
                    className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                    Upgrade Now <FiArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isLoading: isRoleLoading, isAuthorized } = useRoleGuard(['ROLE_COMPANY_OWNER', 'OWNER']);
    const { ownerData } = useDashboardData();

    if (isRoleLoading || !isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <FiLoader className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-slate-500 font-medium">Verifying Access...</p>
            </div>
        );
    }

    const status = ownerData?.subscriptionStatus;
    const isExpired = status === 'TRIAL_EXPIRED' || status === 'PREMIUM_EXPIRED';

    return (
        <div className="flex flex-col min-h-screen">
            {isExpired && <SubscriptionExpiredBanner />}
            <div className="flex-1 relative">
                <Suspense fallback={
                    <div className="flex justify-center p-8">
                        <FiLoader className="w-8 h-8 text-orange-600 animate-spin" />
                    </div>
                }>
                    {children}
                </Suspense>
            </div>
        </div>
    );
}

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    return <LayoutContent>{children}</LayoutContent>;
}
