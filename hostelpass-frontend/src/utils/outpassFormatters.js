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

export function formatDecidedBy(item) {
  if (!item) return "—";
  const name = item.decidedByStaffName || item.actorStaffName;
  if (!name) return "—";
  const role = item.decidedByStaffRole || item.actorStaffRole;
  const designation = formatStaffDesignation(role);
  return designation ? `${name} (${designation})` : name;
}

export function formatDecisionRemark(item) {
  if (!item) return "—";
  const isApproved =
    item.status === "APPROVED" || item.action === "APPROVED";
  const role = item.decidedByStaffRole || item.actorStaffRole;
  if (isApproved) {
    const designationLower = formatStaffDesignationLower(role);
    return `Approved by ${designationLower}`;
  }
  const isDenied =
    item.status === "DENIED" ||
    item.status === "REJECTED" ||
    item.action === "DENIED";
  if (isDenied) {
    return item.decisionRemark || item.remark || "—";
  }
  return item.decisionRemark || item.remark || "—";
}

export function formatAuditDecisionRemark(auditLog) {
  return formatDecisionRemark(auditLog);
}
