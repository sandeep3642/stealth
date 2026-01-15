// src/features/auth/authService.js
import api from "../../services/apiService";

export const loginUser = async (email, password) => {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/api/auth/signup", userData);
  return res.data;
};