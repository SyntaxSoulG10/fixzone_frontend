"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "@/lib/axios";
import { APP_CONFIG } from "../utils/config";
import { getToken, getUserRole, isTokenExpired } from "../utils/authUtils";
import { getErrorMessage } from "../utils/errorHandler";

/**
 * Type-safe interfaces for dashboard data
 */
interface DashboardDataContextType {
    centersData: Array<Record<string, any>>;
    managersData: Array<Record<string, any>>;
    analyticsData: Record<string, any> | null;
    customersData: Array<Record<string, any>>;
    ownerData: Record<string, any> | null;
    bookingsData: Array<Record<string, any>>;
    isLoading: boolean;
    hasDataInitialized: boolean;
    error: string | null;
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
    const [centersData, setCentersData] = useState<Array<Record<string, any>>>([]);
    const [managersData, setManagersData] = useState<Array<Record<string, any>>>([]);
    const [analyticsData, setAnalyticsData] = useState<Record<string, any> | null>(null);
    const [customersData, setCustomersData] = useState<Array<Record<string, any>>>([]);
    const [ownerProfile, setOwnerProfile] = useState<Record<string, any> | null>(null);
    const [bookingsData, setBookingsData] = useState<Array<Record<string, any>>>([]);

    // Lifecycle and loading states
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [hasDataInitialized, setHasDataInitialized] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * REFRESH ALL DATA
     * Why: By using Promise.all, we trigger all relevant API calls simultaneously. 
     */
    const refreshAllDashboardData = useCallback(async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token || isTokenExpired(token)) {
            setIsInitialLoad(false);
            setError('Authentication token is invalid or expired');
            return;
        }

        setIsInitialLoad(true);
        setError(null);
        try {
            const role = getUserRole(token);
            const requests = [];

            // Add endpoints conditionally based on role
            if (role === "ROLE_COMPANY_OWNER" || role === "OWNER") {
                requests.push(axios.get(APP_CONFIG.api.owners + "/current").catch(() => ({ data: null })));
                requests.push(axios.get(APP_CONFIG.api.serviceCenters + "/current").catch(() => ({ data: [] })));
                requests.push(axios.get(APP_CONFIG.api.managers + "/current").catch(() => ({ data: [] })));
                requests.push(axios.get(APP_CONFIG.api.analytics + "/current").catch(() => ({ data: null })));
                requests.push(axios.get(APP_CONFIG.api.customers + "/current").catch(() => ({ data: [] })));
            } else if (role === "ROLE_SERVICE_MANAGER") {
                requests.push(axios.get(APP_CONFIG.api.managers + "/current").catch(() => ({ data: null })));
                requests.push(axios.get("http://localhost:8081/api/bookings").catch(() => ({ data: [] })));
            } else if (role === "ROLE_SUPER_ADMIN") {
                requests.push(axios.get(APP_CONFIG.api.analytics + "/current").catch(() => ({ data: null })));
                // Also fetch stats for the super admin cards
                requests.push(axios.get("http://localhost:8081/api/admin/stats").catch(() => ({ data: null })));
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
                setAnalyticsData(responses[3]?.data || null);
                setCustomersData(responses[4]?.data || []);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                setManagersData(responses[0]?.data || []);
                setBookingsData(responses[1]?.data || []);
            } else if (role === "ROLE_SUPER_ADMIN") {
                setAnalyticsData(responses[0]?.data || null);
                // stats could be stored in a new state if needed, but for now we focus on analytics
            } else if (role === "ROLE_CUSTOMER") {
                setCustomersData(responses[0]?.data || []);
                setBookingsData(responses[1]?.data || []);
            }
            
            setHasDataInitialized(true);
        } catch (fetchError: any) {
            const errorMessage = getErrorMessage(fetchError);
            console.error("Critical error during dashboard data initialization:", errorMessage);
            setError(errorMessage);
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
        isLoading: isInitialLoad,
        hasDataInitialized,
        error,
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
