import api from "./apiService";

export const getDeviceMaps = async ({
  page = 1,
  pageSize = 10,
  accountId = 1,
  search = "",
} = {}) => {
  const res = await api.get(
    `/api/vehicle-device-maps/list?page=${page}&pageSize=${pageSize}&accountId=${accountId}&search=${encodeURIComponent(search)}`,
  );
  return res.data;
};

export const getDeviceMapById = async (id) => {
  const res = await api.get(`/api/vehicle-device-maps/${id}`);
  return res.data;
};

export const saveDeviceMap = async (payload) => {
  try {
    const res = await api.post(`/api/vehicle-device-maps`, payload);
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

export const updateDeviceMap = async (id, payload) => {
  try {
    const res = await api.put(`/api/vehicle-device-maps/${id}`, payload);
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

export const deleteDeviceMap = async (id) => {
  try {
    const res = await api.delete(`/api/vehicle-device-maps/${id}`);
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
