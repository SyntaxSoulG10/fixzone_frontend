import RoleGuard from "@/components/auth/RoleGuard";
import ExpiredGate from "./ExpiredGate";
import { Suspense } from "react";

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ROLE_COMPANY_OWNER', 'OWNER']}>
            <Suspense fallback={<>{children}</>}>
                <ExpiredGate>{children}</ExpiredGate>
            </Suspense>
        </RoleGuard>
    );
}
