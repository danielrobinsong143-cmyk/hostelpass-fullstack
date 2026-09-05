package com.hostelpass.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentAdminResponse {
    private Long id;
    private String rollNumber;
    private String fullName;
    private String email;
    private String roomNumber;
    private String branch;
    private String department;
    private String yearOfStudy;
    private String mobileNumber;
    private boolean active;
}
