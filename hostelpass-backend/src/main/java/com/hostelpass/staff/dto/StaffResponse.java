package com.hostelpass.staff.dto;

import com.hostelpass.staff.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Outbound representation of a Staff member. Omits passwordHash for the same
 * reason StudentResponse omits it — credentials never leave the backend.
 */
@Getter
@AllArgsConstructor
public class StaffResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private StaffRole role;
    private boolean active;
}
