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

/**
 * @param {{ page?: number; pageSize?: number; accountId?: number; search?: string }} options
 */
export const getRouteMasters = async ({
  page = 1,
  pageSize = 10,
  accountId,
  search = "",
} = {}) => {
  try {
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });

    if (accountId !== undefined && accountId !== null && Number(accountId) > 0) {
      query.set("accountId", String(accountId));
    }

    if (typeof search === "string" && search.trim()) {
      query.set("search", search.trim());
    }

    const res = await api.get(`/api/route-master/list?${query.toString()}`);
    return res.data;
  } catch (error) {
    console.error("API Error in getRouteMasters:", error);
    return buildErrorResponse(error, "Failed to fetch route masters");
  }
};

export const getRouteMasterById = async (id) => {
  try {
    const res = await api.get(`/api/route-master/${id}`);
    return res.data;
  } catch (error) {
    console.error("API Error in getRouteMasterById:", error);
    return buildErrorResponse(error, "Failed to fetch route master");
  }
};

export const saveRouteMaster = async (payload) => {
  try {
    const res = await api.post(`/api/route-master`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in saveRouteMaster:", error);
    return buildErrorResponse(error, "Failed to save route master");
  }
};

export const updateRouteMaster = async (id, payload) => {
  try {
    const res = await api.put(`/api/route-master/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in updateRouteMaster:", error);
    return buildErrorResponse(error, "Failed to update route master");
  }
};

export const deleteRouteMaster = async (id) => {
  try {
    const res = await api.delete(`/api/route-master/${id}`);
    return res.data;
  } catch (error) {
    console.error("API Error in deleteRouteMaster:", error);
    return buildErrorResponse(error, "Failed to delete route master");
  }
};
