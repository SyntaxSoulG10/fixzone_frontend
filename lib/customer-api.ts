import axios from "axios";

// Use environment variables or default localhost
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:8081";

const api = axios.create({
  baseURL: BASE_URL,
});

// Auto-inject JWT token into every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const CUSTOMER_BASE = "/api/customer";

// Customer profile information type
export type CustomerProfile = {
  firstName: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl?: string;
};

// Vehicle information type
export type Vehicle = {
  id: string;
  brand: string;
  plateNumber: string;
  imageUrl?: string | null;
};

// Customer notification and preference settings
export type CustomerSettings = {
  notificationsOn: boolean;
  language: string;
};

// API error response structure
export type ApiValidationError = {
  message: string;
  details?: Record<string, string[]> | string[];
};

// Convert API error to readable message
export function toApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiValidationError | undefined;
    // Extract validation error details
    if (status === 400 && data) {
      if (Array.isArray(data.details) && data.details.length > 0) {
        return data.details.join(", ");
      }
      if (data.details && typeof data.details === "object") {
        const first = Object.values(data.details)[0];
        if (first && first.length > 0) return first[0];
      }
      if (data.message) return data.message;
      return "Validation failed.";
    }
    return data?.message || error.message || "Request failed.";
  }
  return "Something went wrong.";
}

// Retrieve customer profile information
export async function getProfile(): Promise<CustomerProfile> {
  const { data } = await api.get<CustomerProfile>(`${CUSTOMER_BASE}/profile`);
  return data;
}

// Update customer profile information
export async function updateProfile(payload: CustomerProfile): Promise<CustomerProfile> {
  const { data } = await api.put<CustomerProfile>(`${CUSTOMER_BASE}/profile`, payload);
  return data;
}

// Get all vehicles for customer
export async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>(`${CUSTOMER_BASE}/vehicles`);
  return data;
}

// Add new vehicle to customer account
export async function addVehicle(payload: Omit<Vehicle, "id">): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>(`${CUSTOMER_BASE}/vehicle`, payload);
  return data;
}

// Remove vehicle from customer account
export async function deleteVehicle(vehicleId: string): Promise<void> {
  await api.delete(`${CUSTOMER_BASE}/vehicle/${vehicleId}`);
}

// Retrieve customer notification and language settings
export async function getSettings(): Promise<CustomerSettings> {
  const { data } = await api.get<CustomerSettings>(`${CUSTOMER_BASE}/settings`);
  return data;
}

// Update customer settings and preferences
export async function updateSettings(payload: CustomerSettings): Promise<CustomerSettings> {
  const { data } = await api.put<CustomerSettings>(`${CUSTOMER_BASE}/settings`, payload);
  return data;
}

// Saved payment method information
export type PaymentMethod = {
  id: number;
  cardType: string;
  lastFour: string;
  brandColor: string;
};

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const { data } = await api.get<PaymentMethod[]>(`${CUSTOMER_BASE}/payment-methods`);
  return data;
}

// 9) POST /payment-method
export async function addPaymentMethod(payload: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
  const { data } = await api.post<PaymentMethod>(`${CUSTOMER_BASE}/payment-method`, payload);
  return data;
}

// 10) DELETE /payment-method/{id}
export async function deletePaymentMethod(id: number): Promise<void> {
  await api.delete(`${CUSTOMER_BASE}/payment-method/${id}`);
}

