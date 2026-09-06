import api from "./api";

/**
 * Admin Management API service.
 * Connects to the backend endpoints under /api/v1/admin/admins.
 * Exclusively manages SUPER_ADMIN accounts.
 * All requests require SUPER_ADMIN credentials (handled automatically via Bearer token in api.js).
 */

export const getAdminAdmins = async (page = 0, size = 10, search = "") => {
  return api.get("/admin/admins", {
    params: {
      page,
      size,
      search: search?.trim() ? search.trim() : undefined,
    },
  });
};

export const getAdminAdminById = async (id) => {
  return api.get(`/admin/admins/${id}`);
};

export const createAdminAdmin = async (adminData) => {
  return api.post("/admin/admins", adminData);
};

export const updateAdminAdmin = async (id, adminData) => {
  return api.put(`/admin/admins/${id}`, adminData);
};

export const deactivateAdminAdmin = async (id) => {
  return api.patch(`/admin/admins/${id}/deactivate`);
};

export const activateAdminAdmin = async (id) => {
  return api.patch(`/admin/admins/${id}/activate`);
};

export const changeAdminOwnPassword = async (passwordData) => {
  return api.post("/admin/admins/change-password", passwordData);
};

