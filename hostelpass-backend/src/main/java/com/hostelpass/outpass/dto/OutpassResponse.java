package com.hostelpass.outpass.dto;

import com.hostelpass.outpass.OutpassPurpose;
import com.hostelpass.outpass.OutpassStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
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
    private String decisionRemark;
    private LocalDateTime submittedAt;
    private LocalDateTime decidedAt;
}