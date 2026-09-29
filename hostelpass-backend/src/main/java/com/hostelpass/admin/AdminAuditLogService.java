package com.hostelpass.admin;

import com.hostelpass.auditlog.AuditLog;
import com.hostelpass.auditlog.AuditLogRepository;
import com.hostelpass.auditlog.dto.AuditLogResponse;
import com.hostelpass.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Minimal read-only service for Admin Dashboard to view system audit logs.
 * Reuses existing AuditLog entity, AuditLogRepository, and AuditLogResponse.
 */
@Service
@RequiredArgsConstructor
public class AdminAuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAll(pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    private AuditLogResponse toResponse(AuditLog log) {
        String actorName = "System";
        if (log.getActorStaff() != null && log.getActorStaff().getFullName() != null) {
            actorName = log.getActorStaff().getFullName();
        }

        Long requestId = null;
        if (log.getOutpassRequest() != null) {
            requestId = log.getOutpassRequest().getId();
        }

        return new AuditLogResponse(
                log.getId(),
                requestId,
                actorName,
                log.getAction(),
                log.getPreviousStatus(),
                log.getNewStatus(),
                log.getRemark(),
                log.getPerformedAt()
        );
    }
}
