import { jwtDecode } from "jwt-decode";

// Interface for decoded JWT token payload
export interface DecodedToken {
    exp?: number;
    role?: string;
    roles?: string[];
    authorities?: any[];
    [key: string]: any;
}

// Retrieve authentication token from localStorage
export const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

// Decode JWT token to extract payload data
export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (e) {
        return null;
    }
};

// Check if JWT token has expired by comparing exp time with current time
export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    return Date.now() >= expirationTime;
};

// Extract user role from token with fallback for different token formats
export const getUserRole = (token: string): string | null => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    // Try simple role field first
    if (decoded.role) return decoded.role;
    
    // Try roles array (Spring Security format)
    if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
        return decoded.roles[0];
    }
    
    // Try authorities array (Spring Security format)
    if (decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
        const auth = decoded.authorities[0];
        if (typeof auth === "string") return auth;
        if (auth && typeof auth === "object" && auth.authority) return auth.authority;
    }

    return null;
};
