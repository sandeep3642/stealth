import api from "./apiService";

export const getAllAccounts = async () => {
  const res = await api.get(`/api/common/dropdowns/accounts`);
  return res.data;
};

export const getAllRoles = async (id) => {
  const res = await api.get(`/api/common/dropdowns/roles?accountId=${id}`);
  return res.data;
};
