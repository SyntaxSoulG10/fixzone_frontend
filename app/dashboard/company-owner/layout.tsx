"use client";
import { useRoleGuard } from "../../../utils/useRoleGuard";
import { useDashboardData } from "../../../context/DashboardDataContext";
import { useSearchParams, useRouter } from "next/navigation";
import { FiLoader, FiAlertTriangle, FiArrowRight } from "react-icons/fi";
import { Suspense, useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button as MuiButton } from "@mui/material";

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

function SubscriptionExpiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const router = useRouter();
    return (
        <Dialog 
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { borderRadius: '1.25rem', p: 1, maxWidth: 400, width: '100%', textAlign: 'center' } }}
        >
            <DialogTitle sx={{ pt: 3, fontWeight: 'bold' }}>
                <div className="w-14 h-14 mx-auto mb-2 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl">
                    <FiAlertTriangle className="w-7 h-7" />
                </div>
                Subscription Expired
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    Your subscription plan has expired. Please upgrade or renew your plan to unlock all features.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
                <MuiButton
                    fullWidth
                    variant="outlined"
                    onClick={onClose}
                    sx={{ py: 1.25, borderRadius: '0.75rem', fontWeight: 600, textTransform: 'none', color: '#64748b', borderColor: '#cbd5e1' }}
                >
                    Dismiss
                </MuiButton>
                <MuiButton
                    fullWidth
                    variant="contained"
                    onClick={() => {
                        onClose();
                        router.push("/dashboard/company-owner/profile?tab=billing");
                    }}
                    sx={{ bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' }, py: 1.25, borderRadius: '0.75rem', fontWeight: 'bold', textTransform: 'none' }}
                >
                    Upgrade Now
                </MuiButton>
            </DialogActions>
        </Dialog>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isLoading: isRoleLoading, isAuthorized } = useRoleGuard(['ROLE_COMPANY_OWNER', 'OWNER']);
    const { ownerData } = useDashboardData();
    const searchParams = useSearchParams();
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (searchParams?.get("sub_expired") === "true") {
            setModalOpen(true);
        }
    }, [searchParams]);

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
            <SubscriptionExpiredModal open={modalOpen} onClose={() => setModalOpen(false)} />
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
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><FiLoader className="w-8 h-8 text-orange-600 animate-spin" /></div>}>
            <LayoutContent>{children}</LayoutContent>
        </Suspense>
    );
}
