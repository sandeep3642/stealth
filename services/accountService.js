// src/features/auth/authService.js
import api from "./apiService";

export const getAccounts = async (page, pageSize) => {
  const res = await api.get(`/api/accounts?page=${page}&pageSize=${pageSize}`);
  return res.data;
};
