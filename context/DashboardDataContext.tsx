"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "@/lib/axios";
import { APP_CONFIG } from "../utils/config";
import { getToken, getUserRole, isTokenExpired } from "../utils/authUtils";

interface DashboardDataContextType {
    centersData: any[];
    managersData: any[];
    analyticsData: any | null;
    customersData: any[];
    ownerData: any | null;
    bookingsData: any[];
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
    const [customersData, setCustomersData] = useState<any[]>([]);
    const [ownerProfile, setOwnerProfile] = useState<any | null>(null);
    const [bookingsData, setBookingsData] = useState<any[]>([]);

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
                const [ownerRes, centersRes, managersRes] = await Promise.all([
                    axios.get("/owners/current").catch((e) => { console.warn("owners/current failed", e.message); return { data: null }; }),
                    axios.get("/service-centers/current").catch((e) => { console.warn("serviceCenters/current failed", e.message); return { data: [] }; }),
                    axios.get("/managers/current").catch((e) => { console.warn("managers/current failed", e.message); return { data: [] }; }),
                ]);
                setOwnerProfile(ownerRes.data || null);
                setCentersData(centersRes.data || []);
                setManagersData(managersRes.data || []);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                const [managerRes, bookingsRes] = await Promise.all([
                    axios.get("/managers/current").catch((e) => { console.warn("managers/current failed", e.message); return { data: null }; }),
                    axios.get("/bookings").catch((e) => { console.warn("bookings fetch failed", e.message); return { data: [] }; }),
                ]);
                const mData = managerRes.data;
                setManagersData(Array.isArray(mData) ? mData : (mData ? [mData] : []));
                const bookingsArray = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                console.log("[DashboardDataContext] Bookings fetched:", bookingsArray.length);
                setBookingsData(bookingsArray);

            } else if (role === "ROLE_SUPER_ADMIN") {
                const [analyticsRes] = await Promise.all([
                    axios.get("/analytics/current").catch((e) => { console.warn("analytics/current failed", e.message); return { data: null }; }),
                ]);
                setAnalyticsData(analyticsRes.data || null);

            } else if (role === "ROLE_CUSTOMER") {
                const [customerRes, bookingsRes] = await Promise.all([
                    axios.get("/customers/current").catch((e) => { console.warn("customers/current failed", e.message); return { data: null }; }),
                    axios.get("/bookings").catch((e) => { console.warn("bookings fetch failed", e.message); return { data: [] }; }),
                ]);
                setCustomersData(customerRes.data ? [customerRes.data] : []);
                setBookingsData(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);

            } else {
                console.warn("[DashboardDataContext] Unknown role, no data fetched:", role);
            }


        } catch (fetchError: any) {
            console.warn("[DashboardDataContext] Critical error during data initialization:", fetchError.message);
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
            const res = await axios.get("/bookings");
            setBookingsData(Array.isArray(res.data) ? res.data : []);
        } catch (e: any) {
            console.warn("[DashboardDataContext] refreshBookings failed", e.message);
        }
    }, []);

    const contextValue: DashboardDataContextType = {
        centersData,
        managersData,
        analyticsData,
        customersData,
        ownerData: ownerProfile,
        bookingsData,
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
