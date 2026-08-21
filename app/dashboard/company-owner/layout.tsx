import RoleGuard from "@/components/auth/RoleGuard";
import CompanyOwnerLayoutClient from "./CompanyOwnerLayoutClient";

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ROLE_COMPANY_OWNER', 'COMPANY_OWNER', 'OWNER']}>
            <CompanyOwnerLayoutClient>
                {children}
            </CompanyOwnerLayoutClient>
        </RoleGuard>
    );
}
