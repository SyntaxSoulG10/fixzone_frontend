"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { APP_CONFIG } from "../utils/config";

interface DashboardDataContextType {
    centersData: any[];
    managersData: any[];
    analyticsData: any | null;
    customersData: any[];
    ownerData: any | null;
    isLoading: boolean;
    refreshCenters: () => Promise<void>;
    refreshManagers: () => Promise<void>;
    refreshAnalytics: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export const DashboardDataProvider = ({ children }: { children: ReactNode }) => {
    const [centersData, setCentersData] = useState<any[]>([]);
    const [managersData, setManagersData] = useState<any[]>([]);
    const [analyticsData, setAnalyticsData] = useState<any | null>(null);
    const [customersData, setCustomersData] = useState<any[]>([]);
    const [ownerData, setOwnerData] = useState<any | null>(null);
    
    // We only show full loading state initially
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasLoaded, setHasLoaded] = useState<boolean>(false);

    const refreshCenters = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.serviceCenters + "/current");
            setCentersData(res.data);
        } catch (error) {
            console.error("Failed to fetch centers:", error);
        }
    }, []);

    const refreshManagers = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.managers + "/current");
            setManagersData(res.data);
        } catch (error) {
            console.error("Failed to fetch managers:", error);
        }
    }, []);

    const refreshAnalytics = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.analytics + "/current");
            setAnalyticsData(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
    }, []);

    const refreshCustomers = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.customers + "/current");
            setCustomersData(res.data);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
        }
    }, []);

    const refreshOwner = useCallback(async () => {
        try {
            const res = await axios.get(APP_CONFIG.api.owners + "/current");
            setOwnerData(res.data);
        } catch (error) {
            console.error("Failed to fetch owner:", error);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [ctr, mgr, ana, cus, own] = await Promise.all([
                axios.get(APP_CONFIG.api.serviceCenters + "/current"),
                axios.get(APP_CONFIG.api.managers + "/current"),
                axios.get(APP_CONFIG.api.analytics + "/current"),
                axios.get(APP_CONFIG.api.customers + "/current"),
                axios.get(APP_CONFIG.api.owners + "/current")
            ]);
            
            // Batch updates
            setCentersData(ctr.data);
            setManagersData(mgr.data);
            setAnalyticsData(ana.data);
            setCustomersData(cus.data);
            setOwnerData(own.data);
            setHasLoaded(true);
        } catch (error) {
            console.error("Dashboard refresh failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!hasLoaded) {
            refreshAll();
        }
    }, [hasLoaded, refreshAll]);

    return (
        <DashboardDataContext.Provider value={{
            centersData,
            managersData,
            analyticsData,
            customersData,
            ownerData,
            isLoading,
            refreshCenters,
            refreshManagers,
            refreshAnalytics,
            refreshAll
        }}>
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
