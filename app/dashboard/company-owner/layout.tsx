"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRoleGuard } from "../../../utils/useRoleGuard";
import { FiLoader } from "react-icons/fi";
import CompanyOwnerLayoutClient from "./CompanyOwnerLayoutClient";
import APP_CONFIG from "@/config";

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    const { isLoading: isRoleLoading, isAuthorized } = useRoleGuard(['ROLE_COMPANY_OWNER', 'COMPANY_OWNER', 'OWNER']);
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingStatus, setIsCheckingStatus] = useState(true);

    useEffect(() => {
        const checkVerification = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                
                // Only check if we are in company-owner dashboard, not on verification page itself
                if (pathname?.includes("/dashboard/company-owner") && !pathname?.includes("/verification")) {
                    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/api/service-centers/current`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const status = data[0].status;
                            if (status === "PENDING" || status === "REJECTED") {
                                router.push("/verification");
                                return; // Stop rendering dashboard
                            }
                        } else {
                            router.push("/verification");
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error("Verification check failed", error);
            } finally {
                setIsCheckingStatus(false);
            }
        };
        checkVerification();
    }, [pathname, router]);

    if (isRoleLoading || !isAuthorized || isCheckingStatus) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <FiLoader className="w-8 h-8 text-orange-600 animate-spin" />
                <p className="text-slate-500 font-medium">Verifying Access...</p>
            </div>
        );
    }

    return (
        <CompanyOwnerLayoutClient>
            {children}
        </CompanyOwnerLayoutClient>
    );
}
