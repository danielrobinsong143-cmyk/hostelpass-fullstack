package com.hostelpass.outpass.dto;

import com.hostelpass.outpass.OutpassPurpose;
import com.hostelpass.outpass.OutpassStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Outbound representation of an OutpassRequest, flattening the Student/Staff
 * relationships into plain fields (studentName, rollNumber, decidedByStaffName)
 * so the frontend never has to make follow-up calls just to display a request card
 * — matches the fields rendered in the original app's request/status cards.
 */
@Getter
@AllArgsConstructor
public class OutpassResponse {

    private Long id;
    private String passCode;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String placeOfVisit;
    private OutpassPurpose purpose;
    private String reason;
    private LocalDateTime departureAt;
    private LocalDateTime returnAt;
    private OutpassStatus status;
    private String decidedByStaffName;
    private String decisionRemark;
    private LocalDateTime submittedAt;
    private LocalDateTime decidedAt;
}
