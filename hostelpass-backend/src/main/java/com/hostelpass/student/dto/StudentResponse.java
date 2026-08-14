package com.hostelpass.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Outbound representation of a Student. Deliberately omits passwordHash —
 * this DTO boundary is what prevents the credential-exposure problem identified
 * in the original architecture review (Section 7) from ever recurring, since the
 * entity's password_hash field can never leave the backend through this response.
 */
@Getter
@AllArgsConstructor
public class StudentResponse {

    private Long id;
    private String rollNumber;
    private String fullName;
    private String email;
    private String roomNumber;
    private String branch;
    private String department;
    private String yearOfStudy;
    private String mobileNumber;
}
