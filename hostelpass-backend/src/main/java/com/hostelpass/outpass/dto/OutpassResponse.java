package com.hostelpass.outpass.dto;

import com.hostelpass.outpass.OutpassPurpose;
import com.hostelpass.outpass.OutpassStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OutpassResponse {

    private Long id;
    private String passCode;

    // Student details
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String roomNumber;
    private String branch;
    private String department;
    private String yearOfStudy;
    private String mobileNumber;

    // Outpass details
    private String placeOfVisit;
    private OutpassPurpose purpose;
    private String reason;
    private LocalDateTime departureAt;
    private LocalDateTime returnAt;
    private OutpassStatus status;

    // Decision details
    private String decidedByStaffName;
    private String decidedByStaffRole;
    private String decisionRemark;
    private LocalDateTime submittedAt;
    private LocalDateTime decidedAt;

    public OutpassResponse(
            Long id,
            String passCode,
            Long studentId,
            String studentName,
            String rollNumber,
            String roomNumber,
            String branch,
            String department,
            String yearOfStudy,
            String mobileNumber,
            String placeOfVisit,
            OutpassPurpose purpose,
            String reason,
            LocalDateTime departureAt,
            LocalDateTime returnAt,
            OutpassStatus status,
            String decidedByStaffName,
            String decisionRemark,
            LocalDateTime submittedAt,
            LocalDateTime decidedAt) {
        this(id, passCode, studentId, studentName, rollNumber, roomNumber, branch, department, yearOfStudy, mobileNumber,
                placeOfVisit, purpose, reason, departureAt, returnAt, status, decidedByStaffName, null, decisionRemark, submittedAt, decidedAt);
    }
}