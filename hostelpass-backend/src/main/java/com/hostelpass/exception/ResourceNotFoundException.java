package com.hostelpass.exception;

/**
 * Thrown when a requested resource doesn't exist — or, for ownership-scoped
 * lookups (e.g. a student's own outpass request), when it exists but doesn't
 * belong to the requesting user. Reusing 404 for both cases (rather than 403
 * for the ownership mismatch) deliberately avoids confirming to a caller that
 * a given resource ID exists at all under someone else's account.
 * Mapped to 404 NOT_FOUND by GlobalExceptionHandler.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
