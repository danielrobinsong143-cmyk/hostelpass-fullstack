package com.hostelpass.admin.dto;

import com.hostelpass.staff.StaffRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StaffAdminUpdateRequest {

    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^$|^[A-Za-z0-9_]+$", message = "Username must contain only alphanumeric characters and underscores")
    private String username;

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Email(message = "Email must be a valid email address")
    @Size(max = 120, message = "Email must not exceed 120 characters")
    private String email;

    private StaffRole role;
}
