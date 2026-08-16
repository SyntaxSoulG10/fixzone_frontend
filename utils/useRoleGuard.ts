import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenExpired, getUserRole } from "./authUtils";

export const useRoleGuard = (allowedRoles: string[]) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const rolesKey = allowedRoles.join(',');

    useEffect(() => {
        const checkAuth = () => {
            const token = getToken();

            // 1. Check if token exists
            if (!token) {
                router.push("/login");
                return;
            }

            // 2. Check if token is expired
            if (isTokenExpired(token)) {
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            // 3. Check user role with robust fallback to localStorage
            const storedRole = typeof window !== "undefined" ? (localStorage.getItem("role") || localStorage.getItem("userRole")) : null;
            const userRole = getUserRole(token) || storedRole;
            
            const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace(/^ROLE_/, ''));
            const normalizedRole = userRole ? userRole.toUpperCase().replace(/^ROLE_/, '') : '';
            const hasAccess = isAuthorized || (userRole && (allowedRoles.includes(userRole) || normalizedAllowed.includes(normalizedRole)));

            if (!hasAccess) {
                if (normalizedRole === "SERVICE_MANAGER") router.push("/dashboard/service-manager");
                else if (normalizedRole === "SUPER_ADMIN") router.push("/dashboard/super-admin");
                else if (normalizedRole === "COMPANY_OWNER" || normalizedRole === "OWNER") router.push("/dashboard/company-owner");
                else if (normalizedRole === "CUSTOMER") router.push("/dashboard/customer");
                else router.push("/login");
                return;
            }

            // If we get here, user is authorized
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router, rolesKey]);

    return { isAuthorized, isLoading };
};
