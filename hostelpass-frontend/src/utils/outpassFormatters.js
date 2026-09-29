/**
 * Utility functions for formatting outpass decision details
 */

export function formatStaffDesignation(role) {
  if (!role) return "";
  const roleMap = {
    PRINCIPAL: "Principal",
    WARDEN: "Warden",
    DEAN: "Dean",
    VICE_PRINCIPAL: "Vice Principal",
    VC: "VC",
    SUPER_ADMIN: "Super Admin",
  };
  return (
    roleMap[role.toUpperCase()] ||
    role
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export function formatStaffDesignationLower(role) {
  if (!role) return "staff";
  const roleMap = {
    PRINCIPAL: "principal",
    WARDEN: "warden",
    DEAN: "dean",
    VICE_PRINCIPAL: "vice principal",
    VC: "vc",
    SUPER_ADMIN: "super admin",
  };
  return roleMap[role.toUpperCase()] || role.toLowerCase().replace(/_/g, " ");
}

export function formatDecidedBy(request) {
  if (!request?.decidedByStaffName) return "—";
  const designation = formatStaffDesignation(request.decidedByStaffRole);
  return designation
    ? `${request.decidedByStaffName} (${designation})`
    : request.decidedByStaffName;
}

export function formatDecisionRemark(request) {
  if (!request) return "—";
  if (request.status === "APPROVED") {
    const designationLower = formatStaffDesignationLower(request.decidedByStaffRole);
    return `Approved by ${designationLower}`;
  }
  if (request.status === "DENIED" || request.status === "REJECTED") {
    return request.decisionRemark || "—";
  }
  return request.decisionRemark || "—";
}
