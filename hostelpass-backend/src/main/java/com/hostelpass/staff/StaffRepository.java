package com.hostelpass.staff;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Data access for Staff. findByUsername backed the original staff login flow
 * (SDD Section 7.1). findByEmail was added in Phase 4 because the unified
 * login endpoint (POST /api/auth/login) authenticates both Student and Staff
 * by email — this is the one addition to a Phase 3 file, and it is additive
 * only; nothing existing here was changed or removed.
 *
 * Phase 3 Step 3 adds uniqueness check methods, active super admin counter,
 * and paginated search/filter query for Admin Staff Management.
 */
public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByUsername(String username);

    Optional<Staff> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    long countByRoleAndActiveTrue(StaffRole role);

    @Query("""
            SELECT s FROM Staff s
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(s.username) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:role IS NULL OR s.role = :role)
            """)
    Page<Staff> searchAndFilter(@Param("search") String search, @Param("role") StaffRole role, Pageable pageable);

    @Query("""
            SELECT s FROM Staff s
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(s.username) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))
              AND s.role != com.hostelpass.staff.StaffRole.SUPER_ADMIN
              AND (:role IS NULL OR s.role = :role)
            """)
    Page<Staff> searchStaffExcludingSuperAdmin(@Param("search") String search, @Param("role") StaffRole role, Pageable pageable);
}
