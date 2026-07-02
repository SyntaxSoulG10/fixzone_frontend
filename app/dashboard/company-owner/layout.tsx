"use client";
import { useRoleGuard } from "../../../utils/useRoleGuard";
import { useSearchParams, useRouter } from "next/navigation";
import { FiLoader, FiAlertTriangle } from "react-icons/fi";
import { Suspense } from "react";

function SubscriptionExpiredModal() {
    const router = useRouter();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center space-y-6">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <FiAlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-black text-slate-900">Subscription Expired</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Your subscription has expired. Please upgrade your plan to continue using FixZone.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/company-owner/profile?tab=billing")}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                    Upgrade Now
                </button>
            </div>
        </div>
    );
}

function ExpiredGate({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const isExpired = searchParams?.get("sub_expired") === "true";
    return (
        <>
            {isExpired && <SubscriptionExpiredModal />}
            {children}
        </>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthorized } = useRoleGuard(['ROLE_COMPANY_OWNER', 'OWNER']);

    if (isLoading || !isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <FiLoader className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-slate-500 font-medium">Verifying Access...</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<>{children}</>}>
            <ExpiredGate>{children}</ExpiredGate>
        </Suspense>
    );
}

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    return <LayoutContent>{children}</LayoutContent>;
}
