"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
    const router = useRouter();

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role) {
            // Robust mapping from backend role to frontend dashboard path
            const roleToPath: Record<string, string> = {
                "ROLE_COMPANY_OWNER": "company-owner",
                "ROLE_OWNER": "company-owner",
                "OWNER": "company-owner",
                "ROLE_SERVICE_MANAGER": "service-manager",
                "ROLE_SUPER_ADMIN": "super-admin",
                "ROLE_CUSTOMER": "customer",
                "CUSTOMER": "customer"
            };
            
            const path = roleToPath[role] || role.toLowerCase().replace('role_', '').replace(/_/g, '-');
            router.push(`/dashboard/${path}`);
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );
}
