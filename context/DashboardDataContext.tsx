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
    invoicesData: any[];
    isLoading: boolean;
    hasDataInitialized: boolean;
    refreshCenters: () => Promise<void>;
    refreshManagers: () => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    refreshBookings: () => Promise<void>;
    refreshInvoices: () => Promise<void>;
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
    const [invoicesData, setInvoicesData] = useState<any[]>([]);

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
            return;
        }

        // Only show blocking spinner on cold first-time load, not background revalidations
        setIsInitialLoad((prev) => (!hasDataInitialized ? true : prev));
        try {
            const role = getUserRole(token);
            console.log("[DashboardDataContext] Fetching for role:", role);

            // Always fetch bookings for manager and customer roles
            if (role === "ROLE_COMPANY_OWNER" || role === "OWNER") {
                const [ownerRes, centersRes, managersRes, customersRes, analyticsRes, invoicesRes] = await Promise.all([
                    axios.get(APP_CONFIG.api.owners + "/current").catch((e) => { console.warn("owners/current failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.serviceCenters + "/current").catch((e) => { console.warn("serviceCenters/current failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.managers + "/current").catch((e) => { console.warn("managers/current failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.customers + "/current").catch((e) => { console.warn("customers/current failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.analytics + "/current").catch((e) => { console.warn("analytics/current failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.invoices + "/current").catch((e) => { console.warn("invoices/current failed", e); return { data: [] }; }),
                ]);
                setOwnerProfile(ownerRes.data || null);
                setCentersData(centersRes.data || []);
                setManagersData(managersRes.data || []);
                setCustomersData(customersRes.data || []);
                setAnalyticsData(analyticsRes.data || null);
                setInvoicesData(invoicesRes.data || []);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                const managerRes = await axios.get(APP_CONFIG.api.managers + "/current").catch((e) => { console.warn("managers/current failed", e); return { data: null }; });
                const mData = managerRes.data;
                const centerId = mData?.managedCenterId || (Array.isArray(mData) ? mData[0]?.managedCenterId : null);

                const [bookingsRes, invoicesRes] = await Promise.all([
                    axios.get(centerId ? `${APP_CONFIG.api.bookings}/center/${centerId}` : APP_CONFIG.api.bookings).catch((e) => { console.warn("bookings fetch failed", e); return { data: [] }; }),
                    axios.get(centerId ? `${APP_CONFIG.api.invoices}/center/${centerId}` : APP_CONFIG.api.invoices).catch((e) => { console.warn("invoices fetch failed", e); return { data: [] }; }),
                ]);

                setManagersData(Array.isArray(mData) ? mData : (mData ? [mData] : []));
                const bookingsArray = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];
                const invoicesArray = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];
                console.log("[DashboardDataContext] Bookings fetched:", bookingsArray.length, "Invoices fetched:", invoicesArray.length);
                setBookingsData(bookingsArray);
                setInvoicesData(invoicesArray);

            } else if (role === "ROLE_SUPER_ADMIN" || role === "SUPER_ADMIN") {
                const [analyticsRes, statsRes, subscriptionsRes, invoicesRes] = await Promise.all([
                    axios.get(APP_CONFIG.api.baseUrl + "/admin/analytics").catch((e) => { console.warn("admin/analytics failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.baseUrl + "/admin/stats").catch((e) => { console.warn("admin/stats failed", e); return { data: null }; }),
                    axios.get(APP_CONFIG.api.baseUrl + "/admin/subscriptions").catch((e) => { console.warn("subscriptions fetch failed", e); return { data: [] }; }),
                    axios.get(APP_CONFIG.api.invoices).catch((e) => { console.warn("invoices fetch failed", e); return { data: [] }; }),
                ]);
                setAnalyticsData(analyticsRes.data || null);
                setStatsData(statsRes.data || null);
                setSubscriptionsData(subscriptionsRes.data || []);
                setInvoicesData(invoicesRes.data || []);

            } else if (role === "ROLE_CUSTOMER") {
                const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

                // Only fetch bookings — profile is fetched directly by the customer pages
                if (userId) {
                    try {
                        const [res, invRes] = await Promise.all([
                            axios.get(`${APP_CONFIG.api.bookings}/customer/${userId}`).catch(() => ({ data: [] })),
                            axios.get(`${APP_CONFIG.api.invoices}/customer/${userId}`).catch(() => ({ data: [] })),
                        ]);
                        setBookingsData(Array.isArray(res.data) ? res.data : []);
                        setInvoicesData(Array.isArray(invRes.data) ? invRes.data : []);
                    } catch (e: any) {
                        console.warn("[DashboardDataContext] customer bookings failed:", e?.response?.status, e?.message);
                        setBookingsData([]);
                        setInvoicesData([]);
                    }
                }

            } else {
                console.warn("[DashboardDataContext] Unknown role, no data fetched:", role);
            }
        } catch (fetchError: any) {
            console.warn("[DashboardDataContext] Critical error during data initialization:", fetchError);
        } finally {
            setIsInitialLoad(false);
            setHasDataInitialized(true); // Mark initialized once fetch attempt finishes
        }
    }, []);

    // Trigger data fetch when the dashboard layout mounts or token becomes available
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (token && !isTokenExpired(token) && !hasDataInitialized) {
            refreshAllDashboardData();
        }
    }, [hasDataInitialized, refreshAllDashboardData]);

    // Listen to authentication changes across tabs or post-login navigation
    useEffect(() => {
        const handleAuthChange = () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            if (token && !isTokenExpired(token)) {
                refreshAllDashboardData();
            }
        };
        window.addEventListener("authChange", handleAuthChange);
        window.addEventListener("storage", handleAuthChange);
        return () => {
            window.removeEventListener("authChange", handleAuthChange);
            window.removeEventListener("storage", handleAuthChange);
        };
    }, [refreshAllDashboardData]);

    const refreshBookings = useCallback(async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const role = getUserRole(token);
        try {
            if (role === "ROLE_CUSTOMER") {
                const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
                if (!userId) return;
                const res = await axios.get(`${APP_CONFIG.api.bookings}/customer/${userId}`);
                setBookingsData(Array.isArray(res.data) ? res.data : []);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                const managerRes = await axios.get(APP_CONFIG.api.managers + "/current").catch(() => ({ data: null }));
                const centerId = managerRes?.data?.managedCenterId || (Array.isArray(managerRes?.data) ? managerRes?.data[0]?.managedCenterId : null);
                const res = await axios.get(centerId ? `${APP_CONFIG.api.bookings}/center/${centerId}` : APP_CONFIG.api.bookings);
                setBookingsData(Array.isArray(res.data) ? res.data : []);
            } else {
                const res = await axios.get(APP_CONFIG.api.bookings);
                setBookingsData(Array.isArray(res.data) ? res.data : []);
            }
        } catch (e) {
            console.warn("[DashboardDataContext] refreshBookings failed", e);
        }
    }, []);

    const refreshInvoices = useCallback(async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;
        const role = getUserRole(token);
        try {
            if (role === "ROLE_CUSTOMER") {
                const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
                if (!userId) return;
                const res = await axios.get(`${APP_CONFIG.api.invoices}/customer/${userId}`);
                setInvoicesData(Array.isArray(res.data) ? res.data : []);
            } else if (role === "ROLE_SERVICE_MANAGER") {
                const managerRes = await axios.get(APP_CONFIG.api.managers + "/current").catch(() => ({ data: null }));
                const centerId = managerRes?.data?.managedCenterId || (Array.isArray(managerRes?.data) ? managerRes?.data[0]?.managedCenterId : null);
                const res = await axios.get(centerId ? `${APP_CONFIG.api.invoices}/center/${centerId}` : APP_CONFIG.api.invoices);
                setInvoicesData(Array.isArray(res.data) ? res.data : []);
            } else {
                const res = await axios.get(APP_CONFIG.api.invoices);
                setInvoicesData(Array.isArray(res.data) ? res.data : []);
            }
        } catch (e) {
            console.warn("[DashboardDataContext] refreshInvoices failed", e);
        }
    }, []);

    const refreshManagers = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.managers + "/current");
            setManagersData(Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []));
        } catch (e) {
            console.warn("[DashboardDataContext] refreshManagers failed", e);
        }
    }, []);

    const refreshCenters = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.serviceCenters + "/current");
            setCentersData(res.data || []);
        } catch (e) {
            console.warn("[DashboardDataContext] refreshCenters failed", e);
        }
    }, []);

    const refreshAnalytics = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.analytics + "/current");
            setAnalyticsData(res.data || null);
        } catch (e) {
            console.warn("[DashboardDataContext] refreshAnalytics failed", e);
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
        invoicesData,
        isLoading: isInitialLoad,
        hasDataInitialized,
        refreshCenters,
        refreshManagers,
        refreshAnalytics,
        refreshBookings,
        refreshInvoices,
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

