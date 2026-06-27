import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";

const api = axios.create({
  baseURL: BASE_URL,
});

// Setup Axios Interceptor to inject JWT token
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

export type CustomerProfile = {
  firstName: string;
  secondName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl?: string;
};

export type Vehicle = {
  id: string;
  brand: string;
  model?: string;
  plateNumber: string;
  vehicleType?: "CAR" | "BIKE" | "VAN" | "TRUCK";
  imageUrl?: string | null;
};

export type CustomerSettings = {
  notificationsOn: boolean;
  language: string;
};

export type ApiValidationError = {
  message: string;
  details?: Record<string, string[]> | string[];
};

export function toApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiValidationError | undefined;
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

// 1) GET /profile
export async function getProfile(): Promise<CustomerProfile> {
  const { data } = await api.get<CustomerProfile>(`${CUSTOMER_BASE}/profile`);
  return data;
}

// 2) PUT /profile
export async function updateProfile(payload: CustomerProfile): Promise<CustomerProfile> {
  const { data } = await api.put<CustomerProfile>(`${CUSTOMER_BASE}/profile`, payload);
  return data;
}

// 2b) POST /profile/picture
export async function uploadProfilePicture(imageData: string): Promise<{ profilePictureUrl: string }> {
  const { data } = await api.post<{ profilePictureUrl: string }>(`${CUSTOMER_BASE}/profile/picture`, { imageData });
  return data;
}

// 3) GET /vehicles
export async function getVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>(`${CUSTOMER_BASE}/vehicles`);
  return data;
}

// 4) POST /vehicle
export async function addVehicle(payload: { brand: string; model?: string; plateNumber: string; vehicleType: "CAR" | "BIKE" | "VAN" | "TRUCK"; imageData?: string | null }): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>(`${CUSTOMER_BASE}/vehicle`, payload);
  return data;
}

// 4b) POST /vehicle/{id}/image
export async function uploadVehicleImage(vehicleId: string, imageData: string): Promise<{ imageUrl: string }> {
  const { data } = await api.post<{ imageUrl: string }>(`${CUSTOMER_BASE}/vehicle/${vehicleId}/image`, { imageData });
  return data;
}

// 5) DELETE /vehicle/{id}
export async function deleteVehicle(vehicleId: string): Promise<void> {
  await api.delete(`${CUSTOMER_BASE}/vehicle/${vehicleId}`);
}

// 6) GET /settings
export async function getSettings(): Promise<CustomerSettings> {
  const { data } = await api.get<CustomerSettings>(`${CUSTOMER_BASE}/settings`);
  return data;
}

// 7) PUT /settings
export async function updateSettings(payload: CustomerSettings): Promise<CustomerSettings> {
  const { data } = await api.put<CustomerSettings>(`${CUSTOMER_BASE}/settings`, payload);
  return data;
}

// 8) GET /payment-methods
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

