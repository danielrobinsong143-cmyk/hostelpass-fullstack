package com.hostelpass.admin;

import com.hostelpass.auditlog.dto.AuditLogResponse;
import com.hostelpass.common.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only endpoint for SUPER_ADMIN to inspect system audit logs.
 */
@RestController
@RequestMapping("/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminAuditLogController {

    private final AdminAuditLogService adminAuditLogService;

    @GetMapping
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @PageableDefault(size = 10, sort = "performedAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminAuditLogService.getAuditLogs(pageable));
    }
}
