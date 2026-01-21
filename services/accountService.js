// src/features/auth/authService.js
import api from "./apiService";

export const getAccounts = async (page, pageSize) => {
  const res = await api.get(`/api/accounts?page=${page}&pageSize=${pageSize}`);
  return res.data;
};

export const getCategoreis = async () => {
  const res = await api.get(`/api/categories`);
  return res.data;
};

export const saveCategory = async (payload) => {
  const res = await api.post(`/api/accounts`,payload);
  return res.data;
};
