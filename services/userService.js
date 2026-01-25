import api from "./apiService";

export const getUsers = async (page, pageSize, searchQuery) => {
  const res = await api.get(
    `/api/users/GetAllUser??page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/api/users/${id}?userId=${id}`);
  return res.data;
};

export const createUser = async (payload) => {
  try {
    const res = await api.post(`/api/users`, payload);
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

export const updateUser = async (id, payload) => {
  try {
    const res = await api.put(`/api/users/${id}?userId=${id}`, payload);
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

export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/api/users/${id}?userId=${id}`);
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
