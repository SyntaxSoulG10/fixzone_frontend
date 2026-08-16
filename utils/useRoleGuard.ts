import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, isTokenExpired, getUserRole } from "./authUtils";

export const useRoleGuard = (allowedRoles: string[]) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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

            // 3. Check user role
            const userRole = getUserRole(token);
            if (!userRole || !allowedRoles.includes(userRole)) {
                // If wrong role, redirect to their own dashboard or login
                if (userRole === "ROLE_SERVICE_MANAGER") router.push("/dashboard/service-manager");
                else if (userRole === "ROLE_SUPER_ADMIN" || userRole === "SUPER_ADMIN") router.push("/dashboard/super-admin");
                else if (userRole === "ROLE_COMPANY_OWNER" || userRole === "OWNER") router.push("/dashboard/company-owner");
                else if (userRole === "ROLE_CUSTOMER") router.push("/dashboard/customer");
                else router.push("/login");
                return;
            }

            // If we get here, user is authorized
            setIsAuthorized(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [router, allowedRoles]);

    return { isAuthorized, isLoading };
};
