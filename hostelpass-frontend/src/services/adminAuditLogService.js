import api from "./api";

/**
 * Admin Audit Log API service.
 * Connects to the backend endpoint under /api/v1/admin/audit-logs.
 * Requires SUPER_ADMIN credentials (handled automatically via Bearer token in api.js).
 */
export const getAdminAuditLogs = async (page = 0, size = 10, search = "", action = "") => {
  const params = {
    page,
    size,
  };

  if (search && search.trim()) {
    params.search = search.trim();
  }

  if (action && action.trim() && action !== "ALL") {
    params.action = action.trim();
  }

  return api.get("/admin/audit-logs", { params });
};
