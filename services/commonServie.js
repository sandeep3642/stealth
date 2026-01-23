import api from "./apiService";

export const getAllAccounts = async () => {
  const res = await api.get(`/api/common/dropdowns/accounts`);
  return res.data;
};

export const getAllRoles = async () => {
  const res = await api.get(`/api/common/dropdowns/roles?accountId=7`);
  return res.data;
};
