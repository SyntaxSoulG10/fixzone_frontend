"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { APP_CONFIG } from "../utils/config";
import { getToken, getUserRole, isTokenExpired } from "../utils/authUtils";

// Setup Axios Interceptor to inject JWT token
axios.interceptors.request.use(
    (config) => {
        // Ensure we are in the browser environment before accessing localStorage
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface DashboardDataContextType {
    centersData: any[];
    managersData: any[];
    analyticsData: any | null;
    customersData: any[];
    ownerData: any | null;
    bookingsData: any[];
    subscriptionsData: any[];
    isLoading: boolean;
    hasDataInitialized: boolean;
    refreshCenters: () => Promise<void>;
    refreshManagers: () => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

/**
 * DASHBOARD DATA CONTEXT
 * Why: We use a global context to prevent "Prop Drilling" and to cache expensive 
 * API data. This ensures that when a user switches tabs, the data is already 
 * available without showing a blank screen.
 */
export const DashboardDataProvider = ({ children }: { children: ReactNode }) => {
    // State for core business entities
    const [centersData, setCentersData] = useState<any[]>([]);
    const [managersData, setManagersData] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any | null>(null);
    const [customersData, setCustomersData] = useState<any[]>([]);
    const [ownerProfile, setOwnerProfile] = useState<any | null>(null);
    const [bookingsData, setBookingsData] = useState<any[]>([]);
    const [subscriptionsData, setSubscriptionsData] = useState<any[]>([]);

    // Lifecycle and loading states
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [hasDataInitialized, setHasDataInitialized] = useState<boolean>(false);

    /**
     * REFRESH ALL DATA
     * Why: By using Promise.all, we trigger all relevant API calls simultaneously. 
     */
    const refreshAllDashboardData = useCallback(async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token || isTokenExpired(token)) {
            setIsInitialLoad(false);
            return;
        }

        setIsInitialLoad(true);
        try {
            const role = getUserRole(token);
            const requests = [];

            // Add endpoints conditionally based on role
            if (role === "ROLE_COMPANY_OWNER" || role === "OWNER") {
                requests.push(axios.get(APP_CONFIG.api.owners + "/current").catch(() => ({ data: null })));
                requests.push(axios.get(APP_CONFIG.api.serviceCenters + "/current").catch(() => ({ data: [] })));
                requests.push(axios.get(APP_CONFIG.api.managers + "/current").catch(() => ({ data: [] })));
            } else if (role === "ROLE_SERVICE_MANAGER") {
                requests.push(axios.get(APP_CONFIG.api.managers + "/current").catch(() => ({ data: null })));
                requests.push(axios.get("http://localhost:8081/api/bookings").catch(() => ({ data: [] })));
            } else if (role === "ROLE_SUPER_ADMIN" || role === "SUPER_ADMIN") {
                requests.push(axios.get("http://localhost:8081/api/admin/analytics").catch(() => ({ data: null })));
                // Also fetch stats for the super admin cards
                requests.push(axios.get("http://localhost:8081/api/admin/stats").catch(() => ({ data: null })));
                requests.push(axios.get("http://localhost:8081/api/admin/subscriptions").catch(() => ({ data: [] })));
            } else if (role === "ROLE_CUSTOMER") {
                requests.push(axios.get(APP_CONFIG.api.customers + "/current").catch(() => ({ data: null })));
                requests.push(axios.get("http://localhost:8081/api/bookings").catch(() => ({ data: [] })));
            }

            // Execute only the relevant endpoints
            const responses = await Promise.all(requests);
            
            // Assign data based on role
            if (role === "ROLE_COMPANY_OWNER" || role === "OWNER") {
                setOwnerProfile(responses[0]?.data || null);
                setCentersData(responses[1]?.data || []);
                setManagersData(responses[2]?.data || []);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                setManagersData(responses[0]?.data || []);
                setBookingsData(responses[1]?.data || []);
            } else if (role === "ROLE_SUPER_ADMIN" || role === "SUPER_ADMIN") {
                setAnalyticsData(responses[0]?.data || null);
                // responses[1] is stats
                setSubscriptionsData(responses[2]?.data || []);
            } else if (role === "ROLE_CUSTOMER") {
                setCustomersData(responses[0]?.data || []);
                setBookingsData(responses[1]?.data || []);
            }
            
            setHasDataInitialized(true);
        } catch (fetchError: any) {
            console.error("Critical error during dashboard data initialization:", fetchError);
        } finally {
            setIsInitialLoad(false);
        }
    }, []);

    // Trigger data fetch exactly once when the dashboard layout mounts
    useEffect(() => {
        if (!hasDataInitialized) {
            refreshAllDashboardData();
        }
    }, [hasDataInitialized, refreshAllDashboardData]);

    const contextValue: DashboardDataContextType = {
        centersData,
        managersData,
        analyticsData,
        customersData,
        ownerData: ownerProfile,
        bookingsData,
        subscriptionsData,
        isLoading: isInitialLoad,
        hasDataInitialized,
        refreshCenters: async () => { /* Individual refresh logic if needed */ },
        refreshManagers: async () => { /* Individual refresh logic if needed */ },
        refreshAnalytics: async () => { /* Individual refresh logic if needed */ },
        refreshAll: refreshAllDashboardData
    };

    return (
        <DashboardDataContext.Provider value={contextValue}>
            {children}
        </DashboardDataContext.Provider>
    );
};


export const useDashboardData = () => {
    const context = useContext(DashboardDataContext);
    if (context === undefined) {
        throw new Error("useDashboardData must be used within a DashboardDataProvider");
    }
    return context;
};
