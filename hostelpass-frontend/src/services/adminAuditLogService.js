import api from "./api";

/**
 * Admin Audit Log API service.
 * Connects to the backend endpoint under /api/v1/admin/audit-logs.
 * Requires SUPER_ADMIN credentials (handled automatically via Bearer token in api.js).
 */
export const getAdminAuditLogs = async (page = 0, size = 10) => {
  return api.get("/admin/audit-logs", {
    params: {
      page,
      size,
    },
  });
};
