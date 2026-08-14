package com.hostelpass.auditlog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access for AuditLog. Backs both audit endpoints in SDD Section 7.4:
 *  - GET /audit-logs/request/{outpassRequestId} -> findByOutpassRequestId (full
 *    unpaginated history for one request; a request will only ever accumulate one
 *    audit row in its lifetime under the current workflow, so pagination isn't
 *    needed here, but the list return type keeps this future-proof)
 *  - GET /audit-logs?staffId=...                -> findByActorStaffId, paginated
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByOutpassRequestId(Long outpassRequestId);

    Page<AuditLog> findByActorStaffId(Long actorStaffId, Pageable pageable);
}
