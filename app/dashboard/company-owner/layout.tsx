"use client";

import { useRoleGuard } from "../../../utils/useRoleGuard";
import { FiLoader } from "react-icons/fi";
import CompanyOwnerLayoutClient from "./CompanyOwnerLayoutClient";

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    const { isLoading: isRoleLoading, isAuthorized } = useRoleGuard(['ROLE_COMPANY_OWNER', 'COMPANY_OWNER', 'OWNER']);

    if (isRoleLoading || !isAuthorized) {
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
