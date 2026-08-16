import RoleGuard from "@/components/auth/RoleGuard";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ROLE_SUPER_ADMIN', 'SUPER_ADMIN', 'ADMIN']}>
            {children}
        </RoleGuard>
    );
}
