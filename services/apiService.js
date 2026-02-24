
import axios from "axios";
import Cookies from "js-cookie";

const LOGOUT_KEYS = [
  "authToken",
  "darkMode",
  "permissions",
  "primaryHsl",
  "user",
  "whiteLabelTheme",
];

let isLogoutInProgress = false;

const handleLogout = () => {
  if (typeof window === "undefined" || isLogoutInProgress) return;

  isLogoutInProgress = true;
  LOGOUT_KEYS.forEach((key) => localStorage.removeItem(key));
  Cookies.remove("authToken", { path: "/" });

  if (window.location.pathname !== "/") {
    window.location.href = "/";
  }
};

const api = axios.create({
  baseURL:process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
});

// Separate instance for VTS (map) API
export const vtsApi = axios.create({
  baseURL: "/vts-proxy",
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
    if (error?.response?.status === 401) {
      handleLogout();
    }
    return Promise.reject(error);
  },
);

export default api;
