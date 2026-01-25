import api from "./apiService";

export const getRoles = async (page, pageSize, searchQuery) => {
  const res = await api.get(
    `/api/roles/GetAllRole?page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
};

export const createRole = async (payload) => {
  try {
    const res = await api.post(`/api/roles`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in save:", error);

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

export const deleteRole = async (id) => {
  const res = await api.delete(`/api/roles/${id}`);
  return res.data;
};
