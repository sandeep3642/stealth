import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://fleetbharat.com:8080/",
  // baseURL: "http://13.60.242.137:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.data?.status?.success;
    const message =
      error.response?.data?.status?.message || "Something went wrong";

    if (!status) {
      toast.error(message);
    } else if (status === 500) {
      toast.error("Server error! Try again later.");
    } else {
      toast.error(message);
    }

    return Promise.reject(error);
  },
);

export default api;
