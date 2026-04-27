import axios from "axios";

import { APP_CONFIG } from "@/utils/config";

const API_BASE_URL = APP_CONFIG.api.baseUrl;

export interface AnalyticsData {
    totalRevenue: number;
    revenueChange: string;
    totalJobs: number;
    jobsChange: string;
    pendingJobs: number;
    pendingJobsChange: string;
    avgJobValue: number;
    avgJobValueChange: string;
    onlineRevenue: number;
    handCollectionRevenue: number;
    updatedAt: string;
    revenueOverview: { name: string; revenue: number }[];
    customerGrowth: { name: string; newCustomers: number; activeCustomers: number }[];
    serviceBreakdown: { name: string; value: number }[];
    topCenters: {
        id: string;
        name: string;
        initial: string;
        color: string;
        jobs: number;
        revenue: number;
    }[];
}

export const getCompanyAnalytics = async (
    companyCode: string,
    params?: { centerId?: string; startDate?: string; endDate?: string; period?: string }
): Promise<AnalyticsData> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/analytics/company/${companyCode}`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
};

export const getCurrentOwnerAnalytics = async (
    params?: { centerId?: string; startDate?: string; endDate?: string; period?: string }
): Promise<AnalyticsData> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/analytics/current`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching current owner analytics:", error);
        throw error;
    }
};
