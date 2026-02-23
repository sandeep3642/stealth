import api from "./apiService";

export const getAllAccounts = async () => {
  const res = await api.get(`/api/common/dropdowns/accounts?limit=0`);
  return res.data;
};

export const getAllRoles = async (id) => {
  const res = await api.get(`/api/common/dropdowns/roles?accountId=${id}`);
  return res.data;
};

export const getCountries = async () => {
  const res = await api.get(`/api/countries`);
  return res.data;
};

export const getStatesByCountry = async (countryId) => {
  const res = await api.get(`/api/states/by-country/${countryId}`);
  return res.data;
};

export const getCitiesByState = async (stateId) => {
  const res = await api.get(`/api/cities/by-state/${stateId}`);
  return res.data;
};

export const getRoleById = async (roleId, accountId) => {
  const res = await api.get(`/api/roles/${roleId}?accountId=${accountId}`);
  return res.data;
};

export const getUserRoleData = async () => {
  try {
    // Get user data from localStorage
    const userString = localStorage.getItem("user");
    if (!userString) {
      console.error("No user data found in localStorage");
      return null;
    }

    const user = JSON.parse(userString);
    const { roleId, accountId } = user;

    if (!roleId || !accountId) {
      console.error("Missing roleId or accountId in user data");
      return null;
    }

    // Fetch role details with permissions
    const roleData = await getRoleById(roleId, accountId);
    localStorage.setItem("permissions", JSON.stringify(roleData.data.rights));
    // return roleData;
  } catch (error) {
    console.error("Error fetching user role data:", error);
    return null;
  }
};

export const hasPermission = (rights, pageUrl, permission = "canRead") => {
  if (!rights || !Array.isArray(rights)) return false;

  const form = rights.find((right) => {
    // Normalize paths for comparison (remove trailing slashes)
    const normalizedRightPath = right.pageUrl?.replace(/\/$/, "");
    const normalizedPageUrl = pageUrl?.replace(/\/$/, "");

    return normalizedRightPath === normalizedPageUrl;
  });

  return form ? form[permission] : false;
};

export const filterMenuByPermissions = (menuItems, rights) => {
  if (!rights || !Array.isArray(rights)) return [];

  return menuItems
    .map((item) => {
      // If item has children, filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter((child) =>
          hasPermission(rights, child.path, "canRead"),
        );

        // Only include parent if it has accessible children
        if (filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          };
        }
        return null;
      }

      // For items without children, check if user has read permission
      if (item.path) {
        return hasPermission(rights, item.path, "canRead") ? item : null;
      }

      // Include items without paths (like section headers)
      return item;
    })
    .filter(Boolean); // Remove null items
};

export const getCurrencies = async () => {
  const res = await api.get(`/api/common/dropdowns/Currency`);
  return res.data;
};

export const getFormModulesDropdown = async () => {
  const res = await api.get(
    `/api/common/dropdowns/form-modules/dropdown`
  );
  return res.data;
};

export const getVehicleDropdown = async (accountId) => {
  const endpoint = accountId
    ? `/api/common/dropdowns/vehicles/${accountId}`
    : `/api/common/dropdowns/vehicles`;
  const res = await api.get(endpoint);
  return res.data;
};

export const getVehicleBrandOemDropdown = async () => {
  const res = await api.get(`/api/Lookup/vehicle-brand-oems`);
  return res.data;
};

export const getDeviceTypeDropdown = async () => {
  const res = await api.get(`/api/common/dropdowns/device-types`);
  return res.data;
};

export const getLookupDeviceTypeDropdown = async () => {
  const res = await api.get(`/api/Lookup/device-types`);
  return res.data;
};

export const getHardwareDropdown = async (deviceTypeId) => {
  const query = deviceTypeId ? `?deviceTypeId=${deviceTypeId}` : "";
  const res = await api.get(`/api/common/dropdowns/hardware${query}`);
  return res.data;
};

export const getDeviceDropdown = async (accountId) => {
  const endpoint = accountId
    ? `/api/common/dropdowns/devices/${accountId}`
    : `/api/common/dropdowns/devices`;
  const res = await api.get(endpoint);
  return res.data;
};

export const getOemManufacturersDropdown = async () => {
  const res = await api.get(`/api/Lookup/oem-manufacturers`);
  return res.data;
};

export const getSimDropdown = async () => {
  const res = await api.get(`/api/common/dropdowns/sims`);
  return res.data;
};

export const getSimDropdownByAccount = async (accountId) => {
  const endpoint = accountId
    ? `/api/common/dropdowns/sims/${accountId}`
    : `/api/common/dropdowns/sims`;
  const res = await api.get(endpoint);
  return res.data;
};
