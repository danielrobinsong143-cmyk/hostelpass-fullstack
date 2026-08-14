package com.hostelpass.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for POST /auth/refresh and POST /auth/logout (SDD Section 7.1).
 * In practice the refresh token will typically arrive via an HttpOnly cookie
 * (SDD Section 11), but this DTO is kept available for the body-based fallback
 * shown in the API list, and for non-browser clients.
 */
@Getter
@Setter
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
}
