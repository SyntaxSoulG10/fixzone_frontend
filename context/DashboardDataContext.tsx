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
    
    // Lifecycle and loading states
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const [hasDataInitialized, setHasDataInitialized] = useState<boolean>(false);

    /**
     * REFRESH ALL DATA
     * Why: By using Promise.all, we trigger all 5 API calls simultaneously. 
     * This is significantly faster than calling them one by one (waterfall effect),
     * as the browser can handle multiple concurrent requests.
     */
    const refreshAllDashboardData = useCallback(async () => {
        setIsInitialLoad(true);
        try {
            const [
                centersResponse, 
                managersResponse, 
                analyticsResponse, 
                customersResponse, 
                ownerResponse
            ] = await Promise.all([
                axios.get(APP_CONFIG.api.serviceCenters + "/current"),
                axios.get(APP_CONFIG.api.managers + "/current"),
                axios.get(APP_CONFIG.api.analytics + "/current"),
                axios.get(APP_CONFIG.api.customers + "/current"),
                axios.get(APP_CONFIG.api.owners + "/current")
            ]);
            
            // Atomically update state to minimize UI re-renders
            setCentersData(centersResponse.data);
            setManagersData(managersResponse.data);
            setAnalyticsData(analyticsResponse.data);
            setCustomersData(customersResponse.data);
            setOwnerProfile(ownerResponse.data);
            
            setHasDataInitialized(true);
        } catch (fetchError) {
            // We log error context for debugging but keep the UI stable
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
        isLoading: isInitialLoad,
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
