package com.hostelpass.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Data access for Student. findByRollNumber backs the future login flow
 * (SDD Section 11 — students authenticate with roll number, not email).
 * The existsBy... methods support uniqueness checks at registration time
 * (SDD Section 13.1) without loading a full entity.
 */
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByEmail(String email);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByEmail(String email);
}
