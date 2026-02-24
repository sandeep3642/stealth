// src/features/auth/authService.js
import api from "./apiService";

export const getdevices = async (page, pageSize,) => {
    const res = await api.get(
        `/api/devices/list?page=${page}&pageSize=${pageSize}`,
    );
    return res.data;
};

export const getDeviceType = async () => {
    const res = await api.get(
        `api/device-types/list?page=0&pageSize=0`,
    );
    return res.data;
};


export const saveDevice = async (payload) => {
    try {
        const res = await api.post(`/api/devices`, payload);
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
    const res = await api.get(`/api/devices/${id}`);
    return res.data;
};

export const updateDevice = async (id, payload) => {
    try {
        const res = await api.put(`/api/devices/${id}`, payload);
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
        const res = await api.delete(`/api/devices/${id}`);
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
