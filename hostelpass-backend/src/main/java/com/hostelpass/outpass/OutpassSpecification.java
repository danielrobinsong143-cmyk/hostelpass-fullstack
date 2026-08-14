package com.hostelpass.outpass;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OutpassSpecification {

    private OutpassSpecification() {
        // Utility class
    }

    public static Specification<OutpassRequest> studentSearch(String search) {

        return (root, query, criteriaBuilder) -> {

            if (search == null || search.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String searchPattern = "%" + search.trim().toLowerCase() + "%";

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("passCode")),
                            searchPattern));

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("placeOfVisit")),
                            searchPattern));

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("reason")),
                            searchPattern));

            return criteriaBuilder.or(
                    predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<OutpassRequest> statusFilter(
            OutpassStatus status) {

        return (root, query, criteriaBuilder) -> {

            if (status == null) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    root.get("status"),
                    status);
        };
    }

    public static Specification<OutpassRequest> staffSearch(String search) {

        return (root, query, criteriaBuilder) -> {

            if (search == null || search.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }

            String value = "%" + search.trim().toLowerCase() + "%";

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("passCode")),
                            value));

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("placeOfVisit")),
                            value));

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("reason")),
                            value));

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("student").get("fullName")),
                            value));

            predicates.add(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("student").get("rollNumber")),
                            value));

            return criteriaBuilder.or(
                    predicates.toArray(new Predicate[0]));
        };
    }
}