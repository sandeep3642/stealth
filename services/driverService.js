import api from "./apiService";

const buildErrorResponse = (error, fallbackMessage = "Network or server error") =>
  error.response?.data || {
    success: false,
    statusCode: error.response?.status || 500,
    message: error.response?.data?.message || fallbackMessage,
    data: null,
  };

export const getDrivers = async (page = 1, pageSize = 10, searchQuery = "") => {
  const searchParam = searchQuery
    ? `&search=${encodeURIComponent(searchQuery)}`
    : "";
  const res = await api.get(
    `/api/Driver?page=${page}&pageSize=${pageSize}${searchParam}`,
  );
  return res.data;
};

export const getDriverById = async (id) => {
  const res = await api.get(`/api/Driver/${id}`);
  return res.data;
};

export const saveDriver = async (payload) => {
  try {
    const res = await api.post(`/api/Driver`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in saveDriver:", error);
    return buildErrorResponse(error);
  }
};

export const updateDriver = async (payload, id) => {
  try {
    const res = await api.put(`/api/Driver/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in updateDriver:", error);
    return buildErrorResponse(error);
  }
};

export const deleteDriver = async (id) => {
  try {
    const res = await api.delete(`/api/Driver/${id}`);
    return res.data;
  } catch (error) {
    return buildErrorResponse(error);
  }
};
