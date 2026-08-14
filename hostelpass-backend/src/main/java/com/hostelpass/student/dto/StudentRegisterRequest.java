package com.hostelpass.student.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for POST /auth/student/register (SDD Section 7.1).
 * Every constraint here maps directly to SDD Section 13.1's registration rules.
 */
@Getter
@Setter
public class StudentRegisterRequest {

    @NotBlank(message = "Roll number is required")
    @Size(min = 4, max = 20, message = "Roll number must be between 4 and 20 characters")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "Roll number must be alphanumeric")
    private String rollNumber;

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 120)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "Password must contain at least one letter and one number"
    )
    private String password;

    @NotBlank(message = "Room number is required")
    @Size(max = 20)
    private String roomNumber;

    @NotBlank(message = "Branch is required")
    @Size(max = 50)
    private String branch;

    @NotBlank(message = "Department is required")
    @Size(max = 80)
    private String department;

    @NotBlank(message = "Year of study is required")
    @Size(max = 20)
    private String yearOfStudy;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobileNumber;
}
