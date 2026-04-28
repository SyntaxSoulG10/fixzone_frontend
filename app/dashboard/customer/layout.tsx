"use client";
import { useRoleGuard } from "../../../utils/useRoleGuard";
import { FiLoader } from "react-icons/fi";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthorized } = useRoleGuard(['ROLE_CUSTOMER']);

    if (isLoading || !isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-500 font-medium">Verifying Customer Access...</p>
            </div>
        );
    }

    return <>{children}</>;
}