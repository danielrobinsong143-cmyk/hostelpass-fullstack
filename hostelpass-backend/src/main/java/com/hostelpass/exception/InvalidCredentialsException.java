package com.hostelpass.exception;

/**
 * Thrown by AuthService when a login's password check fails (SDD Section 14 —
 * "Invalid Credentials"). Deliberately generic in message (never reveals
 * whether the identifier itself existed) to avoid leaking account existence.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
