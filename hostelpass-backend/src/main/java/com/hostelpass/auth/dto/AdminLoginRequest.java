package com.hostelpass.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for POST /auth/admin/login.
 * Dedicated login request for SUPER_ADMIN role authentication.
 */
@Getter
@Setter
public class AdminLoginRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
