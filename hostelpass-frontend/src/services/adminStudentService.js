import api from "./api";

/**
 * Admin Student Management API service.
 * Connects to the Step 1 backend endpoints under /api/v1/admin/students.
 * All requests require SUPER_ADMIN credentials (handled automatically via Bearer token).
 */

export const getAdminStudents = async (page = 0, size = 10, search = "") => {
  return api.get("/admin/students", {
    params: {
      page,
      size,
      search: search?.trim() ? search.trim() : undefined,
    },
  });
};

export const getAdminStudentById = async (id) => {
  return api.get(`/admin/students/${id}`);
};

export const createAdminStudent = async (studentData) => {
  return api.post("/admin/students", studentData);
};

export const updateAdminStudent = async (id, studentData) => {
  return api.put(`/admin/students/${id}`, studentData);
};

export const deactivateAdminStudent = async (id) => {
  return api.patch(`/admin/students/${id}/deactivate`);
};

export const activateAdminStudent = async (id) => {
  return api.patch(`/admin/students/${id}/activate`);
};

export const resetStudentPassword = async (id, passwordData) => {
  return api.post(`/admin/students/${id}/reset-password`, passwordData);
};

