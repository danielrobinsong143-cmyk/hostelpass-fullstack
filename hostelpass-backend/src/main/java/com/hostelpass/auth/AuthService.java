package com.hostelpass.auth;

import com.hostelpass.auth.dto.AdminLoginRequest;
import com.hostelpass.auth.dto.AuthResponse;
import com.hostelpass.auth.dto.RefreshResponse;
import com.hostelpass.auth.dto.StaffLoginRequest;
import com.hostelpass.auth.dto.StudentLoginRequest;
import com.hostelpass.exception.InvalidCredentialsException;
import com.hostelpass.exception.TokenRefreshException;
import com.hostelpass.security.UserPrincipal;
import com.hostelpass.security.jwt.JwtProperties;
import com.hostelpass.security.jwt.JwtTokenProvider;
import com.hostelpass.staff.Staff;
import com.hostelpass.staff.StaffRepository;
import com.hostelpass.staff.StaffRole;
import com.hostelpass.staff.dto.StaffResponse;
import com.hostelpass.student.Student;
import com.hostelpass.student.StudentRepository;
import com.hostelpass.student.dto.StudentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Orchestrates the whole auth flow described in SDD Section 11. Deliberately
 * thin: authentication itself is delegated to Spring's AuthenticationManager
 * (which uses CustomUserDetailsService + PasswordEncoder under the hood), so
 * this class's job is just: authenticate -> issue access token -> issue +
 * persist a refresh token -> return the shaped response.
 *
 * Refresh tokens are opaque random strings stored via the RefreshToken entity
 * (Phase 3) — not JWTs. This was a deliberate rejection of an external spec
 * that proposed JWT-based refresh tokens; the frozen SDD's DB-backed, individually
 * revocable design is what's implemented here.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int REFRESH_TOKEN_BYTE_LENGTH = 64;

    private final AuthenticationManager authenticationManager;
    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public LoginResult<StudentResponse> loginStudent(StudentLoginRequest request) {
        UserPrincipal principal = authenticate(request.getRollNumber(), request.getPassword());

        Student student = studentRepository.findByRollNumber(request.getRollNumber())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid roll number or password"));

        String accessToken = issueAccessToken(principal);
        String rawRefreshToken = issueRefreshToken(UserType.STUDENT, student.getId());

        StudentResponse response = toStudentResponse(student);
        AuthResponse<StudentResponse> body =
                new AuthResponse<>(accessToken, jwtProperties.getAccessTokenExpiryMs() / 1000, response);
        return new LoginResult<>(body, rawRefreshToken);
    }

    @Transactional
    public LoginResult<StaffResponse> loginStaff(StaffLoginRequest request) {
        UserPrincipal principal = authenticate(request.getUsername(), request.getPassword());

        Staff staff = staffRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        String accessToken = issueAccessToken(principal);
        String rawRefreshToken = issueRefreshToken(UserType.STAFF, staff.getId());

        StaffResponse response = toStaffResponse(staff);
        AuthResponse<StaffResponse> body =
                new AuthResponse<>(accessToken, jwtProperties.getAccessTokenExpiryMs() / 1000, response);
        return new LoginResult<>(body, rawRefreshToken);
    }

    @Transactional
    public LoginResult<StaffResponse> loginAdmin(AdminLoginRequest request) {
        UserPrincipal principal = authenticate(request.getUsername(), request.getPassword());

        if (principal.getUserType() != UserType.STAFF || !StaffRole.SUPER_ADMIN.name().equals(principal.getRole())) {
            throw new InvalidCredentialsException("Admin access required");
        }

        Staff staff = staffRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!staff.isActive()) {
            throw new InvalidCredentialsException("Account inactive");
        }

        String accessToken = issueAccessToken(principal);
        String rawRefreshToken = issueRefreshToken(UserType.STAFF, staff.getId());

        StaffResponse response = toStaffResponse(staff);
        AuthResponse<StaffResponse> body =
                new AuthResponse<>(accessToken, jwtProperties.getAccessTokenExpiryMs() / 1000, response);
        return new LoginResult<>(body, rawRefreshToken);
    }

    @Transactional
    public RefreshResponse refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new TokenRefreshException("Refresh token is required");
        }

        RefreshToken stored = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new TokenRefreshException("Refresh token not recognized"));

        if (stored.isRevoked()) {
            throw new TokenRefreshException("Refresh token has been revoked");
        }
        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new TokenRefreshException("Refresh token has expired");
        }

        UserPrincipal principal = switch (stored.getUserType()) {
            case STUDENT -> studentRepository.findById(stored.getUserId())
                    .map(UserPrincipal::of)
                    .orElseThrow(() -> new TokenRefreshException("Associated student account no longer exists"));
            case STAFF -> staffRepository.findById(stored.getUserId())
                    .map(UserPrincipal::of)
                    .orElseThrow(() -> new TokenRefreshException("Associated staff account no longer exists"));
        };

        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);
        return new RefreshResponse(newAccessToken, jwtProperties.getAccessTokenExpiryMs() / 1000);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByToken(rawRefreshToken).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
        // Intentionally silent if the token isn't found — avoids confirming or
        // denying token existence to a caller, per general auth hygiene.
    }

    private UserPrincipal authenticate(String identifier, String rawPassword) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(identifier, rawPassword));
            return (UserPrincipal) authentication.getPrincipal();
        } catch (DisabledException ex) {
            throw new InvalidCredentialsException("Account inactive");
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid credentials");
        }
    }

    private String issueAccessToken(UserPrincipal principal) {
        return jwtTokenProvider.generateAccessToken(principal);
    }

    private String issueRefreshToken(UserType userType, Long userId) {
        RefreshToken refreshToken = new RefreshToken();
        String rawToken = generateOpaqueToken();
        refreshToken.setToken(rawToken);
        refreshToken.setUserType(userType);
        refreshToken.setUserId(userId);
        refreshToken.setExpiresAt(LocalDateTime.now().plus(Duration.ofMillis(jwtProperties.getRefreshTokenExpiryMs())));
        refreshToken.setRevoked(false);
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[REFRESH_TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private StudentResponse toStudentResponse(Student s) {
        return new StudentResponse(s.getId(), s.getRollNumber(), s.getFullName(), s.getEmail(),
                s.getRoomNumber(), s.getBranch(), s.getDepartment(), s.getYearOfStudy(), s.getMobileNumber());
    }

    private StaffResponse toStaffResponse(Staff s) {
        return new StaffResponse(s.getId(), s.getUsername(), s.getFullName(), s.getEmail(), s.getRole(), s.isActive());
    }

    /**
     * Internal carrier only — not a REST DTO. Lets AuthController set the
     * refresh-token cookie without AuthResponse (the actual JSON body shape,
     * frozen by SDD Section 7.1) ever including the raw refresh token itself.
     */
    public record LoginResult<T>(AuthResponse<T> response, String rawRefreshToken) {
    }
}
