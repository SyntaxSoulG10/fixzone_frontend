import axios from "axios";
import { APP_CONFIG } from "@/utils/config";

// Create axios instance with base URL from config
const axiosInstance = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
});

// Inject JWT token into every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors (401 responses)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detect unauthorized access
    if (error.response?.status === 401) {
      // Optional: Clear token and redirect to login
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
