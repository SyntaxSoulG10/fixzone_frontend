import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8081/api";

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

export const getCompanyAnalytics = async (companyCode: string): Promise<AnalyticsData> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/analytics/company/${companyCode}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
};
