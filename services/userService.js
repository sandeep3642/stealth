import api from "./apiService";

export const getUsers = async (page, pageSize, searchQuery) => {
  const res = await api.get(
    `/api/accounts?page=${page}&pageSize=${pageSize}&search=${searchQuery}`,
  );
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
