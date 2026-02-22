// src/features/auth/authService.js
import api from "./apiService";

export const getdevices = async (page, pageSize,) => {
    const res = await api.get(
        `/api/devices/list?page=${page}&pageSize=${pageSize}`,
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



export const saveDevice = async (payload) => {
    try {
        const res = await api.post(`/api/device`, payload);
        return res.data;
    } catch (error) {
        console.error("API Error in saveDevice:", error);

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

export const getDeviceById = async (id) => {
    const res = await api.get(`/api/device/${id}`);
    return res.data;
};

export const updateDevice = async (id, payload) => {
    try {
        const res = await api.put(`/api/device/${id}`, payload);
        return res.data;
    } catch (error) {
        console.error("API Error in update Device:", error);

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

export const deleteDevice = async (id) => {
    try {
        const res = await api.delete(`/api/device/${id}`);
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
