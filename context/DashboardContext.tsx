"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { APP_CONFIG } from '../utils/config';

// Dashboard data structure containing analytics and entity info
interface DashboardData {
    analytics: any;
    centers: any[];
    customers: any[];
    companyName: string;
    lastFetched: number | null;
}

// Context type with data and methods
interface DashboardContextType {
    data: DashboardData;
    isLoading: boolean;
    error: string | null;
    fetchDashboardData: (force?: boolean) => Promise<void>;
    updateCenters: (centers: any[]) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DashboardData>({
        analytics: null,
        centers: [],
        customers: [],
        companyName: "Company Dashboard",
        lastFetched: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data with 2-minute caching to reduce API calls
    const fetchDashboardData = useCallback(async (force = false) => {
        // Skip fetch if cache is still valid and not forced
        const CACHE_DURATION = 2 * 60 * 1000;
        if (!force && data.lastFetched && (Date.now() - data.lastFetched < CACHE_DURATION)) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch all dashboard data in parallel
            const [centersRes, custRes, analyticsRes, ownerRes] = await Promise.all([
                axios.get(APP_CONFIG.api.serviceCenters + "/current"),
                axios.get(APP_CONFIG.api.customers + "/current"),
                axios.get(APP_CONFIG.api.analytics + "/current"),
                axios.get(APP_CONFIG.api.owners + "/current")
            ]);

            setData({
                centers: centersRes.data,
                customers: custRes.data,
                analytics: analyticsRes.data,
                companyName: ownerRes.data.companyName || "Company Dashboard",
                lastFetched: Date.now(),
            });
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, [data.lastFetched]);

    // Update centers in state without re-fetching
    const updateCenters = (centers: any[]) => {
        setData(prev => ({ ...prev, centers }));
    };

    return (
        <DashboardContext.Provider value={{ data, isLoading, error, fetchDashboardData, updateCenters }}>
            {children}
        </DashboardContext.Provider>
    );
};

// Hook to access dashboard context - throws error if used outside provider
export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
