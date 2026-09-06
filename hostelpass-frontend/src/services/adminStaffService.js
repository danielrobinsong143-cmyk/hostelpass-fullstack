import api from "./api";

/**
 * Admin Staff Management API service.
 * Connects to the Phase 3 Step 3 backend endpoints under /api/v1/admin/staff.
 * All requests require SUPER_ADMIN credentials (handled automatically via Bearer token in api.js).
 */

export const getAdminStaff = async (page = 0, size = 10, search = "", role = "") => {
  return api.get("/admin/staff", {
    params: {
      page,
      size,
      search: search?.trim() ? search.trim() : undefined,
      role: role && role !== "ALL" ? role : undefined,
    },
  });
};

export const getAdminStaffById = async (id) => {
  return api.get(`/admin/staff/${id}`);
};

export const createAdminStaff = async (staffData) => {
  return api.post("/admin/staff", staffData);
};

export const updateAdminStaff = async (id, staffData) => {
  return api.put(`/admin/staff/${id}`, staffData);
};

export const deactivateAdminStaff = async (id) => {
  return api.patch(`/admin/staff/${id}/deactivate`);
};

export const activateAdminStaff = async (id) => {
  return api.patch(`/admin/staff/${id}/activate`);
};

export const resetStaffPassword = async (id, passwordData) => {
  return api.post(`/admin/staff/${id}/reset-password`, passwordData);
};

