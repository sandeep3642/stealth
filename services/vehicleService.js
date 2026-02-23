// src/features/auth/authService.js
import api from "./apiService";

export const getVehicles = async (page, pageSize,) => {
    const res = await api.get(
        `/api/vehicles?page=${page}&pageSize=${pageSize}`,
    );
    return res.data;
};

export const getVehicleType = async () => {
    const res = await api.get(
        `/api/VehicleType`,
    );
    return res.data;
};

export const getLeasedVendors = async () => {
    const res = await api.get(`/api/Lookup/leased-vendors`);
    return res.data;
};

export const getVehicleBrands = async () => {
    const res = await api.get(`/api/Lookup/vehicle-brand-oems`);
    return res.data;
};



export const saveVehicle = async (payload) => {
    try {
        const res = await api.post(`/api/vehicles`, payload);
        return res.data;
    } catch (error) {
        console.error("API Error in saveCategory:", error);

        // Handle different error response structures safely
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

export const getVehicleById = async (id) => {
    const res = await api.get(`/api/vehicles/${id}`);
    return res.data;
};

export const updateVehicle = async (id, payload) => {
    try {
        const res = await api.put(`/api/vehicles/${id}`, payload);
        return res.data;
    } catch (error) {
        console.error("API Error in update Vehicle:", error);

        // Handle different error response structures safely
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

export const deleteAccount = async (id) => {
    try {
        const res = await api.delete(`/api/accounts/${id}`);
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
