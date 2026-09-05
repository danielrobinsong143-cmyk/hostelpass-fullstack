package com.hostelpass.admin.dto;

import com.hostelpass.staff.StaffRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StaffAdminResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private StaffRole role;
    private boolean active;
}
