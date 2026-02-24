import api from "./apiService";

// ── GET all SIMs (paginated) ───────────────────────────────────────────────
export const getSims = async (pageNo, pageSize) => {
    const response = await api.get(
        `/api/sims/list??pageNo=${pageNo}&pageSize=${pageSize}`
    );
    return response.data;
};

// ── GET single SIM by ID ──────────────────────────────────────────────────
export const getSimById = async (id) => {
    const response = await api.get(`/api/sims/${id}`);
    return response.data;
};

// ── POST create SIM ────────────────────────────────────────────────────────
export const saveSim = async (payload) => {
    const response = await api.post(`/sim`, payload);
    return response.data;
};

// ── PUT update SIM ─────────────────────────────────────────────────────────
export const updateSim = async (id, payload) => {
    const response = await api.put(`/sim/${id}`, payload);
    return response.data;
};

// ── DELETE SIM ─────────────────────────────────────────────────────────────
export const deleteSim = async (
    simId
) => {
    const response = await api.delete(`/sim/${simId}`);
    return response.data;
};

// ── GET carriers list ──────────────────────────────────────────────────────
export const getSimCarriers = async () => {
    const response = await api.get(`/sim/carriers`);
    return response.data;
};