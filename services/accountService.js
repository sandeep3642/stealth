// src/features/auth/authService.js
import api from "./apiService";

export const getAccounts = async (page, pageSize, searchQuery) => {
  const res = await api.get(
    `/api/accounts?page=${page}&pageSize=${pageSize}&search=${searchQuery}`,
  );
  return res.data;
};

export const getCategoreis = async () => {
  const res = await api.get(`/api/categories`);
  return res.data;
};

export const saveAccount = async (payload) => {
  try {
    const res = await api.post(`/api/accounts`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in saveCategory:", error);

    // Handle different error response structures safely
    return (
      error.response?.data || {
        success: false,
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || "Network or server error",
        data: null,
      }
    );
  }
};

export const getAccountById = async (id) => {
  const res = await api.get(`/api/accounts/${id}`);
  return res.data;
};

export const updateAccount = async (payload, id) => {
  try {
    const res = await api.put(`/api/accounts/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in saveCategory:", error);

    // Handle different error response structures safely
    return (
      error.response?.data || {
        success: false,
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || "Network or server error",
        data: null,
      }
    );
  }
};

export const deleteAccount = async (id) => {
  try {
    const res = await api.delete(`/api/accounts/${id}`);
    return res.data;
  } catch (error) {
    return (
      error.response?.data || {
        success: false,
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || "Network or server error",
        data: null,
      }
    );
  }
};
