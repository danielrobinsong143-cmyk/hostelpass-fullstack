package com.hostelpass.auditlog;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AuditLogSpecification {

    private AuditLogSpecification() {
        // Utility class
    }

    public static Specification<AuditLog> actionFilter(AuditAction action) {
        return (root, query, criteriaBuilder) -> {
            if (action == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("action"), action);
        };
    }

    public static Specification<AuditLog> searchFilter(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String searchPattern = "%" + search.trim().toLowerCase() + "%";
            List<Predicate> predicates = new ArrayList<>();

            // Search actor staff name
            Join<Object, Object> staffJoin = root.join("actorStaff", JoinType.LEFT);
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(staffJoin.get("fullName")), searchPattern));

            // Search outpass request pass code
            Join<Object, Object> requestJoin = root.join("outpassRequest", JoinType.LEFT);
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(requestJoin.get("passCode")), searchPattern));

            // Search student name & roll number
            Join<Object, Object> studentJoin = requestJoin.join("student", JoinType.LEFT);
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(studentJoin.get("fullName")), searchPattern));
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(studentJoin.get("rollNumber")), searchPattern));

            // Search remark
            predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("remark")), searchPattern));

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}
