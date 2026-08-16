"use client";
import { useRoleGuard } from "../../../utils/useRoleGuard";
import { useSearchParams, useRouter } from "next/navigation";
import { FiLoader, FiAlertTriangle } from "react-icons/fi";
import { Suspense } from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button as MuiButton } from "@mui/material";

function SubscriptionExpiredModal() {
    const router = useRouter();
    return (
        <Dialog 
            open={true}
            PaperProps={{ sx: { borderRadius: '1.5rem', p: 1, maxWidth: 400, width: '100%', textAlign: 'center' } }}
        >
            <div className="h-2 rounded-t-full bg-red-500"></div>
            <DialogTitle sx={{ pt: 3, fontWeight: 'bold' }}>
                <div className="w-16 h-16 mx-auto mb-3 bg-red-50 rounded-2xl flex items-center justify-center text-2xl text-red-500">
                    <FiAlertTriangle className="w-8 h-8" />
                </div>
                Subscription Expired
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                    Your subscription has expired. Please upgrade your plan to continue using FixZone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'center' }}>
                <MuiButton
                    fullWidth
                    variant="contained"
                    onClick={() => router.push("/dashboard/company-owner/profile?tab=billing")}
                    sx={{ bgcolor: '#EA580C', '&:hover': { bgcolor: '#c2410c' }, py: 1.5, borderRadius: '0.75rem', fontWeight: 'bold', textTransform: 'none' }}
                >
                    Upgrade Now
                </MuiButton>
            </DialogActions>
        </Dialog>
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
