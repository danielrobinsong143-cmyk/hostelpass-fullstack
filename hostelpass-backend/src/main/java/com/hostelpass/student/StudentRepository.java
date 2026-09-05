package com.hostelpass.student;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Data access for Student. findByRollNumber backs the student login flow.
 * The existsBy... methods support uniqueness checks at registration and in
 * Admin Management. The search query supports the Admin student list without
 * loading the entire table into memory.
 */
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByEmail(String email);

    boolean existsByRollNumberIgnoreCase(String rollNumber);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByRollNumberIgnoreCaseAndIdNot(String rollNumber, Long id);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByEmail(String email);

    boolean existsByRollNumberAndIdNot(String rollNumber, Long id);

    boolean existsByEmailAndIdNot(String email, Long id);

    @Query("""
            SELECT s FROM Student s
            WHERE LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.roomNumber) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.branch) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.department) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.yearOfStudy) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.mobileNumber) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    Page<Student> search(@Param("search") String search, Pageable pageable);
}
