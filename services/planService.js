import api from "./apiService";

export const getPlans = async (page, pageSize, searchQuery) => {
  const res = await api.get(
    `/api/plans?page=${page}&pageSize=${pageSize}&search=${searchQuery}`,
  );
  return res.data;
};

export const createPlan = async (payload) => {
  try {
    const res = await api.post(`/api/plans`, payload);
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

export const deletePlan = async (id) => {
  const res = await api.delete(`/api/plans/${id}`);
  return res.data;
};
