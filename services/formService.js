import api from "./apiService";

export const getAllForms = async (page, pageSize) => {
  const res = await api.get(`/api/forms?page=${page}&pageSize=${pageSize}`);
  return res.data;
};
