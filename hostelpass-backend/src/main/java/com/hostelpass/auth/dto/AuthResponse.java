package com.hostelpass.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Outbound payload for successful login (SDD Section 7.1), generic over the
 * embedded principal so it can carry either a StudentResponse or a StaffResponse.
 *
 * Design reconciliation note: SDD Section 7.1's API table shows refreshToken in
 * the response body, while Section 11's auth-flow narrative specifies the refresh
 * token is delivered via an HttpOnly, Secure, SameSite=Strict cookie instead (to
 * reduce XSS token-theft risk). This DTO follows Section 11 as the more
 * security-conscious source of truth and does NOT include refreshToken as a
 * JSON field — the cookie will be set separately by the controller in a later
 * phase. Flagging this explicitly rather than silently picking one.
 */
@Getter
@AllArgsConstructor
public class AuthResponse<T> {

    private String accessToken;
    private long expiresIn;
    private T principal;
}
