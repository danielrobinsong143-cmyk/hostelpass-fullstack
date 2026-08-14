package com.hostelpass.staff;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access for Staff. findByUsername backed the original staff login flow
 * (SDD Section 7.1). findByEmail was added in Phase 4 because the unified
 * login endpoint (POST /api/auth/login) authenticates both Student and Staff
 * by email — this is the one addition to a Phase 3 file, and it is additive
 * only; nothing existing here was changed or removed.
 */
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByUsername(String username);

    Optional<Staff> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
