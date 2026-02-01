import api from "./apiService";

export const getUsers = async (page, pageSize, searchQuery) => {
  const res = await api.get(
    `/api/users/GetAllUser??page=${page}&pageSize=${pageSize}`,
  );
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`/api/users/${id}?userId=${id}`);
  return res.data;
};

export const createUser = async (payload) => {
  try {
    const formData = new FormData();

    formData.append("FirstName", payload.FirstName);
    formData.append("LastName", payload.LastName);
    formData.append("Email", payload.Email);
    formData.append("Password", payload.Password);
    formData.append("MobileNo", payload.MobileNo || "");
    formData.append("AccountId", payload.AccountId.toString());
    formData.append("RoleId", payload.RoleId.toString());
    formData.append("Status", payload.Status.toString());
    formData.append("TwoFactorEnabled", payload.TwoFactorEnabled.toString());

    // Handle array properly
    if (payload.AdditionalPermissions && Array.isArray(payload.AdditionalPermissions)) {
      payload.AdditionalPermissions.forEach((permission) => {
        formData.append("AdditionalPermissions", JSON.stringify(permission));
      });
    }

    if (payload.ProfileImage) {
      formData.append("ProfileImage", payload.ProfileImage);
    }

    const res = await api.post("/api/users", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    return error.response?.data;
  }
};

export const updateUser = async (id, payload) => {
  try {
    const formData = new FormData();

    // 👇 ONLY FILE GOES IN BODY
    if (payload.ProfileImage) {
      formData.append("ProfileImage", payload.ProfileImage);
    }

    const res = await api.put(
      `/api/users/${id}` +
      `?userId=${id}` +
      `&Email=${encodeURIComponent(payload.Email)}` +
      `&FirstName=${encodeURIComponent(payload.FirstName)}` +
      `&LastName=${encodeURIComponent(payload.LastName)}` +
      `&MobileNo=${encodeURIComponent(payload.MobileNo || "")}` +
      `&AccountId=${payload.AccountId}` +
      `&RoleId=${payload.RoleId}` +
      `&Status=${payload.Status}` +
      `&TwoFactorEnabled=${payload.TwoFactorEnabled}` +
      `&AdditionalPermissions=${encodeURIComponent(
        JSON.stringify(payload.AdditionalPermissions)
      )}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

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



export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/api/users/${id}?userId=${id}`);
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
