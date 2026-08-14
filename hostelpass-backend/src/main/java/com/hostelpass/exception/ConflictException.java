package com.hostelpass.exception;

/**
 * Thrown for state-conflict business rule violations (SDD Section 13.2/14):
 * a student already has a PENDING request, or a request being cancelled is no
 * longer PENDING. Generic/reusable rather than one exception per rule, since
 * later phases (staff approve/deny re-decision conflicts) will hit the same
 * 409 CONFLICT shape.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
