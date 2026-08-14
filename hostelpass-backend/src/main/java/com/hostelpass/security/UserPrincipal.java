package com.hostelpass.security;

import com.hostelpass.auth.UserType;
import com.hostelpass.staff.Staff;
import com.hostelpass.student.Student;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * One UserDetails implementation shared by Student and Staff, per SDD Section 9.
 * Built two ways:
 *  - of(Student)/of(Staff): used at login time by CustomUserDetailsService; carries
 *    the real password hash so Spring's DaoAuthenticationProvider can verify it.
 *  - fromClaims(...): used by JwtAuthenticationFilter on every subsequent request,
 *    reconstructed directly from a validated token's claims with NO database call
 *    — passwordHash is null here since authentication already happened at login.
 *
 * getUsername() returns rollNumber for a student, username for a staff member —
 * whichever identifier CustomUserDetailsService looked them up by.
 */
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String identifier;
    private final String email;
    private final String passwordHash;
    private final String role;
    private final UserType userType;
    private final boolean active;

    private UserPrincipal(Long id, String identifier, String email, String passwordHash,
                           String role, UserType userType, boolean active) {
        this.id = id;
        this.identifier = identifier;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.userType = userType;
        this.active = active;
    }

    public static UserPrincipal of(Student student) {
        return new UserPrincipal(
                student.getId(),
                student.getRollNumber(),
                student.getEmail(),
                student.getPasswordHash(),
                "STUDENT",
                UserType.STUDENT,
                student.isActive()
        );
    }

    public static UserPrincipal of(Staff staff) {
        return new UserPrincipal(
                staff.getId(),
                staff.getUsername(),
                staff.getEmail(),
                staff.getPasswordHash(),
                staff.getRole().name(),
                UserType.STAFF,
                staff.isActive()
        );
    }

    /**
     * Reconstructs a principal purely from JWT claims — no repository lookup.
     * This is what keeps the backend stateless per SDD Section 2's NFR.
     */
    public static UserPrincipal fromClaims(Long id, String email, String role, UserType userType) {
        return new UserPrincipal(id, null, email, null, role, userType, true);
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public UserType getUserType() {
        return userType;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return identifier;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
