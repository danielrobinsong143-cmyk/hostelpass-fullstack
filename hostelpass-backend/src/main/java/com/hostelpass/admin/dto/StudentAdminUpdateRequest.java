package com.hostelpass.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentAdminUpdateRequest {

    @Size(min = 4, max = 20, message = "Roll number must be between 4 and 20 characters")
    @Pattern(regexp = "^[A-Za-z0-9]+$", message = "Roll number must be alphanumeric")
    private String rollNumber;

    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Email(message = "Email must be a valid email address")
    @Size(max = 120)
    private String email;

    @Pattern(regexp = "^$|^(?=.*[A-Za-z])(?=.*\\d).{8,100}$",
            message = "Password must be at least 8 characters and contain at least one letter and one number")
    private String password;

    @Size(max = 20)
    private String roomNumber;

    @Size(max = 50)
    private String branch;

    @Size(max = 80)
    private String department;

    @Size(max = 20)
    private String yearOfStudy;

    @Pattern(regexp = "^$|^\\d{10}$", message = "Mobile number must be exactly 10 digits")
    private String mobileNumber;
}
