package com.hostelpass.auditlog.dto;

import com.hostelpass.auditlog.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Outbound representation of an AuditLog entry, flattening actorStaff into
 * actorStaffName so the frontend audit trail view (future admin UI) can render
 * "who did what, when" without extra lookups.
 */
@Getter
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long outpassRequestId;
    private String actorStaffName;
    private AuditAction action;
    private String previousStatus;
    private String newStatus;
    private String remark;
    private LocalDateTime performedAt;
}
