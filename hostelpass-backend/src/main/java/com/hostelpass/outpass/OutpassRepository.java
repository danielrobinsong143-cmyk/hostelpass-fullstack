package com.hostelpass.outpass;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.domain.Specification;

import java.util.Optional;

/**
 * Data access for OutpassRequest. Supports every read pattern the SDD Section 7
 * API list requires:
 *  - GET /outpass-requests/my            -> findByStudentId(...)
 *  - GET /outpass-requests?status=...    -> findByStatus(...)
 *  - GET /outpass-requests/search?...    -> JpaSpecificationExecutor (built in the
 *    service layer later, combining optional name/status/date-range filters)
 *  - existsByStudentIdAndStatus          -> enforces FR-18 (one PENDING request at
 *    a time per student) without loading full entities.
 */
public interface OutpassRepository extends JpaRepository<OutpassRequest, Long>,
        JpaSpecificationExecutor<OutpassRequest> {

    @Override
    @EntityGraph(attributePaths = { "student", "decidedByStaff" })
    Page<OutpassRequest> findAll(Specification<OutpassRequest> specification, Pageable pageable);

    Page<OutpassRequest> findByStudentId(Long studentId, Pageable pageable);

    // Added in Phase 5: lets the service look up a single request scoped to its
    // owning student in one query, instead of fetching by id and checking
    // ownership in application code (avoids an IDOR risk where a student could
    // view/cancel another student's request by guessing its id).
    Optional<OutpassRequest> findByIdAndStudentId(Long id, Long studentId);

    //Page<OutpassRequest> findByStatus(OutpassStatus status, Pageable pageable);

    Optional<OutpassRequest> findByPassCode(String passCode);

    boolean existsByStudentIdAndStatus(Long studentId, OutpassStatus status);
}
