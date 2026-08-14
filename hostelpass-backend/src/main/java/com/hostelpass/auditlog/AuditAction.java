package com.hostelpass.auditlog;

/**
 * Matches the DB enum on audit_logs.action (SDD Section 4.4). Intentionally the
 * same three values as the terminal OutpassStatus transitions — every audit row
 * records one of these three actions being performed on a request.
 */
public enum AuditAction {
    APPROVED,
    DENIED,
    CANCELLED
}
