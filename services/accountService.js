// src/features/auth/authService.js
import api from "./apiService";

export const getAccounts = async () => {
  const res = await api.get("/api/accounts");
  return res.data;
};
