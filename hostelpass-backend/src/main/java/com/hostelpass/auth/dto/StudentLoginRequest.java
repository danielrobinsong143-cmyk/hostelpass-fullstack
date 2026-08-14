package com.hostelpass.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for POST /auth/student/login (SDD Section 7.1).
 * Students authenticate with roll number, not email — matching the roll-number
 * based login flow described in Section 11.
 */
@Getter
@Setter
public class StudentLoginRequest {

    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Password is required")
    private String password;
}
