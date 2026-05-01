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
                // Strictly redirect to login on any role mismatch or bypass attempt
                router.push("/login");
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
