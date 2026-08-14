package com.hostelpass.staff.dto;

import com.hostelpass.staff.StaffRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for POST /staff (SDD Section 7.5 — Super Admin only).
 * Included now, alongside the entity it maps to, even though the controller/service
 * that consumes it belongs to a later phase — keeps the DTO contract fixed early.
 */
@Getter
@Setter
public class StaffCreateRequest {

    @NotBlank(message = "Username is required")
    @Size(max = 50)
    private String username;

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    @Size(max = 120)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private StaffRole role;
}
