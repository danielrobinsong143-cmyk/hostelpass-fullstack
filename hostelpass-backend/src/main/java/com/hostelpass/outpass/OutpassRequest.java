package com.hostelpass.outpass;

import com.hostelpass.common.BaseEntity;
import com.hostelpass.staff.Staff;
import com.hostelpass.student.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Maps onto the frozen 'outpass_requests' table (SDD Section 4.3) — the central
 * entity of the whole system. Holds unidirectional @ManyToOne links to Student and
 * Staff (see relationship notes above); both are LAZY so listing many requests
 * never triggers eager loading of full student/staff graphs.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "outpass_requests")
public class OutpassRequest extends BaseEntity {

    @Column(name = "pass_code", nullable = false, unique = true, length = 20)
    private String passCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "place_of_visit", nullable = false, length = 150)
    private String placeOfVisit;

    @Enumerated(EnumType.STRING)
    @Column(name = "purpose", nullable = false, length = 50)
    private OutpassPurpose purpose;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "departure_at", nullable = false)
    private LocalDateTime departureAt;

    @Column(name = "return_at", nullable = false)
    private LocalDateTime returnAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OutpassStatus status = OutpassStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_staff_id")
    private Staff decidedByStaff;

    @Column(name = "decision_remark", length = 255)
    private String decisionRemark;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;
}
