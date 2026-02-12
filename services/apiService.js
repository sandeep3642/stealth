
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Separate instance for VTS (map) API
export const vtsApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_VTS_API_BASE_URL,
});

// 🟦 Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Add Bearer Token
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Auto-detect and set Content-Type
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary for FormData
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      // Default to JSON for other requests
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 🟩 Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
