package com.hostelpass.auth;

import com.hostelpass.auth.dto.AdminLoginRequest;
import com.hostelpass.auth.dto.AuthResponse;
import com.hostelpass.auth.dto.RefreshResponse;
import com.hostelpass.auth.dto.RefreshTokenRequest;
import com.hostelpass.auth.dto.StaffLoginRequest;
import com.hostelpass.auth.dto.StudentLoginRequest;
import com.hostelpass.security.jwt.JwtProperties;
import com.hostelpass.staff.dto.StaffResponse;
import com.hostelpass.student.dto.StudentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/**
 * Exposes auth endpoints at the base path (note: paths here are relative —
 * "/auth/student/login" becomes "/api/v1/auth/student/login" once
 * server.servlet.context-path=/api/v1 is applied).
 * Attaches the refresh token as an HttpOnly cookie per Section 11.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";
    private static final String REFRESH_COOKIE_PATH = "/api/v1/auth";

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @Value("${app.jwt.refresh-cookie-secure:false}")
    private boolean refreshCookieSecure;

    @Value("${app.jwt.refresh-cookie-samesite:Strict}")
    private String refreshCookieSameSite;

    @PostMapping("/student/login")
    public ResponseEntity<AuthResponse<StudentResponse>> loginStudent(@Valid @RequestBody StudentLoginRequest request) {
        AuthService.LoginResult<StudentResponse> result = authService.loginStudent(request);
        return ResponseEntity.ok()
                .header("Set-Cookie", buildRefreshCookie(result.rawRefreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/staff/login")
    public ResponseEntity<AuthResponse<StaffResponse>> loginStaff(@Valid @RequestBody StaffLoginRequest request) {
        AuthService.LoginResult<StaffResponse> result = authService.loginStaff(request);
        return ResponseEntity.ok()
                .header("Set-Cookie", buildRefreshCookie(result.rawRefreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse<StaffResponse>> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        AuthService.LoginResult<StaffResponse> result = authService.loginAdmin(request);
        return ResponseEntity.ok()
                .header("Set-Cookie", buildRefreshCookie(result.rawRefreshToken()).toString())
                .body(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest) {

        String token = cookieToken != null ? cookieToken
                : (bodyRequest != null ? bodyRequest.getRefreshToken() : null);

        RefreshResponse response = authService.refresh(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = REFRESH_COOKIE_NAME, required = false) String cookieToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest) {

        String token = cookieToken != null ? cookieToken
                : (bodyRequest != null ? bodyRequest.getRefreshToken() : null);

        authService.logout(token);

        return ResponseEntity.noContent()
                .header("Set-Cookie", clearRefreshCookie().toString())
                .build();
    }

    private ResponseCookie buildRefreshCookie(String rawRefreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, rawRefreshToken)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ofMillis(jwtProperties.getRefreshTokenExpiryMs()))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite(refreshCookieSameSite)
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();
    }
}
