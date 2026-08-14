package com.hostelpass.outpass;

import com.hostelpass.exception.ConflictException;
import com.hostelpass.exception.ResourceNotFoundException;
import com.hostelpass.outpass.dto.OutpassCreateRequest;
import com.hostelpass.outpass.dto.OutpassDecisionRequest;
import com.hostelpass.outpass.dto.OutpassResponse;
import com.hostelpass.outpass.dto.OutpassStatsResponse;

import com.hostelpass.common.PageResponse;
import com.hostelpass.staff.Staff;
import com.hostelpass.staff.StaffRepository;
import com.hostelpass.student.Student;
import com.hostelpass.student.StudentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
//import org.springframework.data.jpa.domain.Specification;

/**
 * Student-facing outpass business logic (SDD Section 7.2, 12, 13.2). Every
 * method takes the logged-in student's id as a parameter — callers (the new
 * OutpassController) must always source it from the JWT-derived UserPrincipal,
 * never from a client-supplied studentId, per this phase's requirement #6.
 *
 * Note on pass_code generation (FR-17): the column is NOT NULL + UNIQUE, but
 * the human-readable code ("OP-2026-000123") is derived from the row's own
 * auto-generated id — which doesn't exist until after the first insert. This
 * is handled with a temporary unique placeholder on insert, then a second
 * update once the real id is known (saveAndFlush + save). Two writes, but
 * guarantees uniqueness for free by construction rather than a random-retry
 * loop.
 *
 * Note on cancellation and audit logging: SDD Section 12's workflow diagram
 * shows an audit_logs row being written on the CANCELLED transition too, but
 * Section 4.4 defines audit_logs.actor_staff_id as NOT NULL — and a student
 * cancelling their own request has no staff actor. Rather than force a schema
 * change (making actor_staff_id nullable) to resolve this inconsistency
 * silently, self-cancellation here does NOT write an audit log row; only
 * staff-performed approve/deny actions (a later phase) will. Flagging this
 * explicitly — if a full audit trail on self-cancellation is actually wanted,
 * it requires revisiting the frozen schema, not just this service.
 */
@Service
@RequiredArgsConstructor
public class OutpassService {

        private final OutpassRepository outpassRepository;
        private final StudentRepository studentRepository;
        private final StaffRepository staffRepository;

        @Transactional
        public OutpassResponse createRequest(Long studentId, OutpassCreateRequest request) {
                if (outpassRepository.existsByStudentIdAndStatus(studentId, OutpassStatus.PENDING)) {
                        throw new ConflictException("You already have a pending outpass request");
                }

                Student student = studentRepository.findById(studentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

                OutpassRequest entity = new OutpassRequest();
                entity.setStudent(student);
                entity.setPlaceOfVisit(request.getPlaceOfVisit());
                entity.setPurpose(request.getPurpose());
                entity.setReason(request.getReason());
                entity.setDepartureAt(request.getDepartureAt());
                entity.setReturnAt(request.getReturnAt());
                entity.setStatus(OutpassStatus.PENDING);
                entity.setSubmittedAt(LocalDateTime.now());
                // Temporary unique placeholder — satisfies the NOT NULL + UNIQUE column
                // until the real id-based code can be computed below.
                entity.setPassCode("TEMP-" + UUID.randomUUID());

                OutpassRequest saved = outpassRepository.saveAndFlush(entity);
                saved.setPassCode(generatePassCode(saved.getId()));
                OutpassRequest finalized = outpassRepository.save(saved);

                return toResponse(finalized);
        }

        @Transactional(readOnly = true)
        public PageResponse<OutpassResponse> getMyRequests(
                        Long studentId,
                        String search,
                        OutpassStatus status,
                        Pageable pageable) {

                Specification<OutpassRequest> studentSpecification = (root, query, criteriaBuilder) -> criteriaBuilder
                                .equal(
                                                root.get("student").get("id"),
                                                studentId);

                Specification<OutpassRequest> searchSpecification = OutpassSpecification.studentSearch(search);

                Specification<OutpassRequest> statusSpecification = OutpassSpecification.statusFilter(status);

                Specification<OutpassRequest> finalSpecification = studentSpecification
                                .and(searchSpecification)
                                .and(statusSpecification);

                return PageResponse.from(
                                outpassRepository.findAll(finalSpecification, pageable)
                                                .map(this::toResponse));
        }

        @Transactional(readOnly = true)
        public OutpassStatsResponse getMyStats(Long studentId) {

                long total = outpassRepository.countByStudentId(studentId);

                long pending = outpassRepository.countByStudentIdAndStatus(
                                studentId,
                                OutpassStatus.PENDING);

                long approved = outpassRepository.countByStudentIdAndStatus(
                                studentId,
                                OutpassStatus.APPROVED);

                long denied = outpassRepository.countByStudentIdAndStatus(
                                studentId,
                                OutpassStatus.DENIED);

                long cancelled = outpassRepository.countByStudentIdAndStatus(
                                studentId,
                                OutpassStatus.CANCELLED);

                return new OutpassStatsResponse(
                                total,
                                pending,
                                approved,
                                denied,
                                cancelled);
        }

        @Transactional(readOnly = true)
        public PageResponse<OutpassResponse> getRequests(
                        String search,
                        OutpassStatus status,
                        Pageable pageable) {

                Specification<OutpassRequest> statusSpecification = OutpassSpecification.statusFilter(status);

                Specification<OutpassRequest> searchSpecification = OutpassSpecification.staffSearch(search);

                Specification<OutpassRequest> finalSpecification = statusSpecification.and(searchSpecification);

                return PageResponse.from(
                                outpassRepository
                                                .findAll(finalSpecification, pageable)
                                                .map(this::toResponse));
        }

        @Transactional
        public OutpassResponse approveRequest(
                        Long staffId,
                        Long requestId,
                        OutpassDecisionRequest request) {

                OutpassRequest entity = outpassRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outpass request not found"));

                if (entity.getStatus() != OutpassStatus.PENDING) {
                        throw new ConflictException(
                                        "Only a pending request can be approved");
                }

                Staff staff = staffRepository.findById(staffId)
                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

                entity.setStatus(OutpassStatus.APPROVED);
                entity.setDecidedByStaff(staff);
                entity.setDecisionRemark(request.getRemark());
                entity.setDecidedAt(LocalDateTime.now());

                return toResponse(outpassRepository.save(entity));
        }

        @Transactional
        public OutpassResponse denyRequest(
                        Long staffId,
                        Long requestId,
                        OutpassDecisionRequest request) {

                OutpassRequest entity = outpassRepository.findById(requestId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outpass request not found"));

                if (entity.getStatus() != OutpassStatus.PENDING) {
                        throw new ConflictException(
                                        "Only a pending request can be denied");
                }

                if (request.getRemark() == null ||
                                request.getRemark().trim().length() < 5) {

                        throw new ConflictException(
                                        "A denial remark is required and must be at least 5 characters");
                }

                Staff staff = staffRepository.findById(staffId)
                                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

                entity.setStatus(OutpassStatus.DENIED);
                entity.setDecidedByStaff(staff);
                entity.setDecisionRemark(request.getRemark());
                entity.setDecidedAt(LocalDateTime.now());

                return toResponse(outpassRepository.save(entity));
        }

        @Transactional(readOnly = true)
        public OutpassResponse getMyRequestById(Long studentId,
                        Long requestId) {
                OutpassRequest entity = outpassRepository.findByIdAndStudentId(requestId, studentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outpass request not found"));

                return toResponse(entity);
        }

        @Transactional
        public OutpassResponse cancelRequest(Long studentId, Long requestId) {
                OutpassRequest entity = outpassRepository.findByIdAndStudentId(requestId, studentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Outpass request not found"));

                if (entity.getStatus() != OutpassStatus.PENDING) {
                        throw new ConflictException("Only a pending request can be cancelled");
                }

                entity.setStatus(OutpassStatus.CANCELLED);
                return toResponse(outpassRepository.save(entity));
        }

        private String generatePassCode(Long id) {
                return "OP-" + Year.now().getValue() + "-" + String.format("%06d", id);
        }

        private OutpassResponse toResponse(OutpassRequest r) {
                Staff decidedBy = r.getDecidedByStaff();
                return new OutpassResponse(
                                r.getId(),
                                r.getPassCode(),
                                r.getStudent().getId(),
                                r.getStudent().getFullName(),
                                r.getStudent().getRollNumber(),
                                r.getPlaceOfVisit(),
                                r.getPurpose(),
                                r.getReason(),
                                r.getDepartureAt(),
                                r.getReturnAt(),
                                r.getStatus(),
                                decidedBy != null ? decidedBy.getFullName() : null,
                                r.getDecisionRemark(),
                                r.getSubmittedAt(),
                                r.getDecidedAt());
        }
}
