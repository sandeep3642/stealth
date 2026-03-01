// src/features/auth/authService.js
import api from "./apiService";

export const loginUser = async (email, password) => {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/api/auth/signup", userData);
  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/api/auth/forgot-password", { email });
  return res.data;
};
