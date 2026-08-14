package com.hostelpass.auditlog;

import com.hostelpass.outpass.OutpassRequest;
import com.hostelpass.staff.Staff;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Maps onto the frozen 'audit_logs' table (SDD Section 4.4). Deliberately does NOT
 * extend BaseEntity: that table has only 'performed_at', not 'created_at'/'updated_at'
 * — and per SDD Section 6, audit rows are never updated after creation, so an
 * 'updatedAt' field would be actively misleading. Its own id + performedAt are
 * defined directly here instead.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "outpass_request_id", nullable = false)
    private OutpassRequest outpassRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_staff_id", nullable = false)
    private Staff actorStaff;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AuditAction action;

    @Column(name = "previous_status", nullable = false, length = 20)
    private String previousStatus;

    @Column(name = "new_status", nullable = false, length = 20)
    private String newStatus;

    @Column(name = "remark", length = 255)
    private String remark;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;
}
