import api from "./apiService";

const buildErrorResponse = (
  error,
  fallbackMessage = "Network or server error",
) =>
  error.response?.data || {
    success: false,
    statusCode: error.response?.status || 500,
    message: error.response?.data?.message || fallbackMessage,
    data: null,
  };

const getUserData = () => {
  if (typeof window === "undefined") {
    return { accountId: 0 };
  }

  try {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return { accountId: 0 };
    const user = JSON.parse(userRaw);
    return {
      accountId: Number(user?.accountId || 0),
    };
  } catch (error) {
    console.error("Error parsing user data:", error);
    return { accountId: 0 };
  }
};

export const getGeofences = async (page = 1, pageSize = 10) => {
  try {
    const res = await api.get(
      `/api/geofences/list?page=${page}&pageSize=${pageSize}`,
    );
    return res.data;
  } catch (error) {
    console.error("API Error in getGeofences:", error);
    return buildErrorResponse(error);
  }
};

export const createGeofence = async (payload) => {
  try {
    const { accountId } = getUserData();
    const resolvedAccountId = Number(accountId || 0);
    const finalPayload = {
      ...payload,

      createdBy: Number(payload?.createdBy || resolvedAccountId || 0),
    };
    const res = await api.post(`/api/geofences`, finalPayload);
    return res.data;
  } catch (error) {
    console.error("API Error in createGeofence:", error);
    return buildErrorResponse(error);
  }
};

export const getGeofenceById = async (id) => {
  try {
    const res = await api.get(`/api/geofences/${id}`);
    return res.data;
  } catch (error) {
    console.error("API Error in getGeofenceById:", error);
    return buildErrorResponse(error);
  }
};

export const updateGeofence = async (id, payload) => {
  try {
    const { accountId } = getUserData();
    const resolvedAccountId = Number(payload?.accountId || accountId || 0);
    const finalPayload = {
      ...payload,
      accountId: resolvedAccountId,
      updatedBy: Number(payload?.updatedBy || resolvedAccountId || 0),
    };
    const res = await api.put(`/api/geofences/${id}`, finalPayload);
    return res.data;
  } catch (error) {
    console.error("API Error in updateGeofence:", error);
    return buildErrorResponse(error);
  }
};
