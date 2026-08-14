package com.hostelpass.auth.dto;

/**
 * Outbound payload for POST /auth/refresh (SDD Section 7.1: "200 { accessToken,
 * expiresIn }"). Deliberately smaller than AuthResponse<T> — a refresh doesn't
 * re-send the student/staff principal, only a new access token.
 * Hand-written (no Lombok) for the same reason ApiResponse/PageResponse were
 * corrected in the Phase 3 fix — no self-constructing static factory needed
 * here, but keeping these small response DTOs dependency-free is now the
 * established convention for this project's 'common'/response-shape classes.
 */
public class RefreshResponse {

    private final String accessToken;
    private final long expiresIn;

    public RefreshResponse(String accessToken, long expiresIn) {
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }
}
