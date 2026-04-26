import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
    exp?: number;
    role?: string;
    roles?: string[];
    authorities?: any[];
    [key: string]: any;
}

export const getToken = () => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

export const decodeToken = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (e) {
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    return Date.now() >= expirationTime;
};

export const getUserRole = (token: string): string | null => {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    // Defensive checking for Spring Security payloads
    if (decoded.role) return decoded.role;
    
    if (decoded.roles && Array.isArray(decoded.roles) && decoded.roles.length > 0) {
        return decoded.roles[0];
    }
    
    if (decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
        const auth = decoded.authorities[0];
        if (typeof auth === "string") return auth;
        if (auth && typeof auth === "object" && auth.authority) return auth.authority;
    }

    return null;
};
