package com.hostelpass.exception;

import java.time.LocalDateTime;

/**
 * Exact shape defined in SDD Section 7.6 — the standard error response body for
 * every endpoint in the API, not just auth. Introduced now because Phase 4 is
 * the first phase that needs to actually return errors (401/403/400 from the
 * auth flow); later phases' GlobalExceptionHandler additions will reuse this
 * same shape.
 */
public class ApiError {

    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;

    public ApiError(int status, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }
}
