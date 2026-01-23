import axios from "axios";

const api = axios.create({
  baseURL: "http://fleetbharat.com:8080/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟦 Add Bearer Token automatically (if available)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 🟩 Response Interceptor (no toast here)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ❌ No toast here — only reject error to be handled in component
    return Promise.reject(error);
  },
);

export default api;
