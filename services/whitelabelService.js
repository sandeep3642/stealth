import api from "./apiService";

// ✅ Get White Labels (List with Pagination)
export const getWhiteLabels = async (page = 1, pageSize = 10) => {
  const res = await api.get(`/api/white-labels?page=${page}&pageSize=${pageSize}`);
  return res.data;
};

// ✅ Get White Label By ID
export const getWhiteLabelById = async (id) => {
  const res = await api.get(`/api/white-labels/${id}`);
  return res.data;
};

// ✅ Get White Label By Account ID
export const getWhiteLabelByAccountId = async (accountId) => {
  const res = await api.get(`/api/white-labels/by-account/${accountId}`);
  return res.data;
};

// ✅ Save White Label
export const saveWhiteLabel = async (payload) => {
  try {
    const res = await api.post(`/api/white-labels`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in saveWhiteLabel:", error);

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

// ✅ Update White Label
export const updateWhiteLabel = async (payload, id) => {
  try {
    const res = await api.put(`/api/white-labels/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("API Error in updateWhiteLabel:", error);

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

// ✅ Delete White Label
export const deleteWhiteLabel = async (id) => {
  try {
    const res = await api.delete(`/api/white-labels/${id}`);
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