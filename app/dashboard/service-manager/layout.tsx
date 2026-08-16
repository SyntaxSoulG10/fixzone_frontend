import RoleGuard from "@/components/auth/RoleGuard";

export default function ServiceManagerLayout({ children }: { children: React.ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ROLE_SERVICE_MANAGER', 'SERVICE_MANAGER']}>
            {children}
        </RoleGuard>
    );
}
