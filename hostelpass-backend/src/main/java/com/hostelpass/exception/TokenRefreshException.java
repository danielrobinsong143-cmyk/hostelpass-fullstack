package com.hostelpass.exception;

/**
 * Thrown by AuthService when a refresh token is missing, expired, or already
 * revoked (SDD Section 14 — "Expired Token" / "Invalid Token" cases). Mapped to
 * 401 UNAUTHORIZED by GlobalExceptionHandler.
 */
public class TokenRefreshException extends RuntimeException {

    public TokenRefreshException(String message) {
        super(message);
    }
}
