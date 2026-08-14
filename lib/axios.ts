import axios from "axios";
import { APP_CONFIG } from "@/utils/config";

const axiosInstance = axios.create({
  baseURL: APP_CONFIG.api.baseUrl,
});

// Add a request interceptor to add the JWT token to every request
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

// Add a response interceptor to handle 401 and 402 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clear token and redirect to login
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }

    // 402 Payment Required — subscription expired
    if (error.response?.status === 402) {
      // We no longer globally redirect on 402 to prevent infinite redirect loops.
      // Individual UI components will catch this error and show localized alerts.
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
