package com.hostelpass.auditlog.dto;

import com.hostelpass.auditlog.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Outbound representation of an AuditLog entry, flattening actorStaff into
 * actorStaffName so the frontend audit trail view can render
 * "who did what, when" without extra lookups.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long outpassRequestId;
    private String actorStaffName;
    private String actorStaffRole;
    private AuditAction action;
    private String previousStatus;
    private String newStatus;
    private String remark;
    private LocalDateTime performedAt;
    private String passCode;
    private String studentName;

    public AuditLogResponse(
            Long id,
            Long outpassRequestId,
            String actorStaffName,
            AuditAction action,
            String previousStatus,
            String newStatus,
            String remark,
            LocalDateTime performedAt) {
        this(id, outpassRequestId, actorStaffName, null, action, previousStatus, newStatus, remark, performedAt, null, null);
    }
}
