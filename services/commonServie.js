import api from "./apiService";

export const getAllAccounts = async () => {
  const res = await api.get(`/api/common/dropdowns/accounts`);
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

/**
 * Get role details with permissions based on roleId and accountId
 * @param {number} roleId - The role ID
 * @param {number} accountId - The account ID
 * @returns {Promise} Role data with permissions
 */
export const getRoleById = async (roleId, accountId) => {
  const res = await api.get(`/api/roles/${roleId}?accountId=${accountId}`);
  return res.data;
};

/**
 * Get role data from localStorage and fetch complete role details
 * @returns {Promise} Role data with permissions or null
 */
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
    return roleData;
  } catch (error) {
    console.error("Error fetching user role data:", error);
    return null;
  }
};

/**
 * Check if user has permission to access a specific form/page
 * @param {Array} rights - Array of rights from role data
 * @param {string} pageUrl - The page URL to check
 * @param {string} permission - The permission type (canRead, canWrite, etc.)
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (rights, pageUrl, permission = "canRead") => {
  if (!rights || !Array.isArray(rights)) return false;
  
  const form = rights.find((right) => right.pageUrl === pageUrl);
  return form ? form[permission] : false;
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Array of menu items
 * @param {Array} rights - Array of rights from role data
 * @returns {Array} Filtered menu items
 */
export const filterMenuByPermissions = (menuItems, rights) => {
  if (!rights || !Array.isArray(rights)) return [];

  return menuItems
    .map((item) => {
      // If item has children, filter them
      if (item.children && item.children.length > 0) {
        const filteredChildren = item.children.filter((child) =>
          hasPermission(rights, child.path, "canRead")
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