import axios from "@/lib/axios";
import APP_CONFIG from "@/config";

const API_BASE_URL = APP_CONFIG.API_BASE_URL;

export interface BookingResponseDTO {
    bookingId: string;
    centerId?: string;
    vehicleId?: string;
    packageId?: string;
    customerId?: string;
    tenantId?: string;
    bookingDate: string; // YYYY-MM-DD
    bookingTime: string; // HH:mm:ss
    status: string;
    estimatedCost?: number;
    bookingFee?: number;
    cancellationPenalty?: number;
    gatewaySessionId?: string;
    bookingFeePaid?: boolean;
    expiresAt?: string;
    specialRequest?: string;
    createdAt?: string;
    serviceCenterName?: string;
    packageName?: string;
    // mock extensions for UI display if needed:
    customerName?: string;
    vehicleName?: string;
}

export const getAllBookings = async (): Promise<BookingResponseDTO[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/bookings`);
        return response.data;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        throw error;
    }
};

export const createBooking = async (bookingData: any): Promise<BookingResponseDTO> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/bookings`, bookingData);
        return response.data;
    } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
    }
};

export const editExistingBooking = async (id: string, bookingData: any): Promise<BookingResponseDTO> => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/bookings/${id}/edit`, bookingData);
        return response.data;
    } catch (error) {
        console.error("Error editing booking:", error);
        throw error;
    }
};

export const startService = async (id: string): Promise<BookingResponseDTO> => {
    const response = await axios.put(`${API_BASE_URL}/api/bookings/${id}/start-service`);
    return response.data;
};

export const completeBooking = async (id: string): Promise<BookingResponseDTO> => {
    const response = await axios.put(`${API_BASE_URL}/api/bookings/${id}/complete`);
    return response.data;
};

export const cancelBooking = async (id: string): Promise<BookingResponseDTO> => {
    const response = await axios.put(`${API_BASE_URL}/api/bookings/${id}/cancel`);
    return response.data;
};

export const assignLane = async (id: string, laneNumber: number): Promise<BookingResponseDTO> => {
    const response = await axios.put(`${API_BASE_URL}/api/bookings/${id}/assign-lane?laneNumber=${laneNumber}`);
    return response.data;
};
