"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "@/lib/axios";
import { APP_CONFIG } from "../utils/config";
import { getToken, getUserRole, isTokenExpired } from "../utils/authUtils";

interface DashboardDataContextType {
    centersData: any[];
    managersData: any[];
    analyticsData: any | null;
    statsData: any | null;
    customersData: any[];
    ownerData: any | null;
    bookingsData: any[];
    subscriptionsData: any[];
    isLoading: boolean;
    hasDataInitialized: boolean;
    refreshCenters: () => Promise<void>;
    refreshManagers: () => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    refreshBookings: () => Promise<void>;
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
    const [statsData, setStatsData] = useState<any | null>(null);
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
            console.warn("[DashboardDataContext] No valid token found. Skipping data fetch.");
            setIsInitialLoad(false);
            setHasDataInitialized(true); // Mark as done so the dashboard doesn't spin forever
            return;
        }

        setIsInitialLoad(true);
        try {
            const role = getUserRole(token);
            console.log("[DashboardDataContext] Fetching for role:", role);

            // Always fetch bookings for manager and customer roles
            if (role === "ROLE_COMPANY_OWNER" || role === "OWNER") {
                const [ownerRes, centersRes, managersRes, customersRes, analyticsRes] = await Promise.all([
                    axios.get(APP_CONFIG.api.owners + "/current").catch((e) => { console.warn("owners/current failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.serviceCenters + "/current").catch((e) => { console.warn("serviceCenters/current failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.managers + "/current").catch((e) => { console.warn("managers/current failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.customers + "/current").catch((e) => { console.warn("customers/current failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.analytics + "/current").catch((e) => { console.warn("analytics/current failed", e); return { data: null }; }),
                ]);
                setOwnerProfile(ownerRes.data || null);
                setCentersData(centersRes.data || []);
                setManagersData(managersRes.data || []);
                setCustomersData(customersRes.data || []);
                setAnalyticsData(analyticsRes.data || null);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                const [managerRes, bookingsRes] = await Promise.all([
                    axios.get(APP_CONFIG.api.managers + "/current").catch((e) => { console.warn("managers/current failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.baseUrl + "/bookings").catch((e) => { console.warn("bookings fetch failed", e); return { data: [] }; }),
                ]);
                const mData = managerRes.data;
                setManagersData(Array.isArray(mData) ? mData : (mData ? [mData] : []));
                const bookingsArray = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                console.log("[DashboardDataContext] Bookings fetched:", bookingsArray.length);
                setBookingsData(bookingsArray);

            } else if (role === "ROLE_SUPER_ADMIN" || role === "SUPER_ADMIN") {
                const [analyticsRes, statsRes, subscriptionsRes] = await Promise.all([
                    axios.get(APP_CONFIG.api.baseUrl + "/admin/analytics").catch((e) => { console.warn("admin/analytics failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.baseUrl + "/admin/stats").catch((e) => { console.warn("admin/stats failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.baseUrl + "/admin/subscriptions").catch((e) => { console.warn("subscriptions fetch failed", e); return { data: [] }; }),
                ]);
                setAnalyticsData(analyticsRes.data || null);
                setStatsData(statsRes.data || null);
                setSubscriptionsData(subscriptionsRes.data || []);

            } else if (role === "ROLE_CUSTOMER") {
                const [customerRes, bookingsRes] = await Promise.all([
                    axios.get(APP_CONFIG.api.customers + "/current").catch((e) => { console.warn("customers/current failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.baseUrl + "/bookings").catch((e) => { console.warn("bookings fetch failed", e); return { data: [] }; }),
                ]);
                setCustomersData(customerRes.data ? [customerRes.data] : []);
                setBookingsData(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);

            } else {
                console.warn("[DashboardDataContext] Unknown role, no data fetched:", role);
            }
        } catch (fetchError: any) {
            console.warn("[DashboardDataContext] Critical error during data initialization:", fetchError);
        } finally {
            setIsInitialLoad(false);
            setHasDataInitialized(true); // Always mark initialized so UI doesn't spin forever
        }
    }, []);

    // Trigger data fetch exactly once when the dashboard layout mounts
    useEffect(() => {
        if (!hasDataInitialized) {
            refreshAllDashboardData();
        }
    }, [hasDataInitialized, refreshAllDashboardData]);

    const refreshBookings = useCallback(async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        try {
            const res = await axios.get(APP_CONFIG.api.baseUrl + "/bookings");
            setBookingsData(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.warn("[DashboardDataContext] refreshBookings failed", e);
        }
    }, []);

    const contextValue: DashboardDataContextType = {
        centersData,
        managersData,
        analyticsData,
        statsData,
        customersData,
        ownerData: ownerProfile,
        bookingsData,
        subscriptionsData,
        isLoading: isInitialLoad,
        hasDataInitialized,
        refreshCenters: async () => { /* Individual refresh logic if needed */ },
        refreshManagers: async () => { /* Individual refresh logic if needed */ },
        refreshAnalytics: async () => { /* Individual refresh logic if needed */ },
        refreshBookings,
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
