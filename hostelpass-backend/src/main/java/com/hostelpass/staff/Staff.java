package com.hostelpass.staff;

import com.hostelpass.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Maps onto the frozen 'staff' table (SDD Section 4.2). This is the direct
 * replacement for the four hardcoded, plaintext-password admin accounts in the
 * original prototype (see architecture review, Section 7) — passwordHash is
 * BCrypt-hashed (enforced at the service layer in a later phase, not here).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "staff")
public class Staff extends BaseEntity {

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private StaffRole role;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
