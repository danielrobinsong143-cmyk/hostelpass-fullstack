package com.hostelpass.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for POST /auth/staff/login (SDD Section 7.1).
 * This is the real, server-verified replacement for the original prototype's
 * client-side admin selector + hardcoded password check (architecture review,
 * Section 7).
 */
@Getter
@Setter
public class StaffLoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
