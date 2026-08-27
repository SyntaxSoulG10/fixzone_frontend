import axios from "@/lib/axios";
import { APP_CONFIG } from "@/utils/config";

const API_BASE_URL = APP_CONFIG.api.baseUrl;

export interface ReportItem {
    id: string;
    name: string;
    date: string;
    type: string;
    size: string;
    source?: string;
    description?: string;
    fileContentBase64?: string;
    downloadUrl: string;
    createdAt?: string;
}

export const getAllReports = async (): Promise<ReportItem[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/reports`);
        return response.data;
    } catch (error) {
        console.error("Error fetching reports:", error);
        throw error;
    }
};

export const createReport = async (reportData: Partial<ReportItem>): Promise<ReportItem> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/reports`, reportData);
        return response.data;
    } catch (error) {
        console.error("Error creating report:", error);
        throw error;
    }
};

export const deleteReport = async (id: string): Promise<void> => {
    try {
        await axios.delete(`${API_BASE_URL}/reports/${id}`);
    } catch (error) {
        console.error("Error deleting report:", error);
        throw error;
    }
};
