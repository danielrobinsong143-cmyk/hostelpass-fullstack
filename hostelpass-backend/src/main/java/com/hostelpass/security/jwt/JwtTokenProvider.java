package com.hostelpass.security.jwt;

import com.hostelpass.auth.UserType;
import com.hostelpass.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Generates and validates ACCESS TOKENS ONLY. The refresh token in this system
 * is deliberately not a JWT (see AuthService) — it's the opaque, DB-stored
 * RefreshToken entity already built in Phase 3, per SDD Section 11. Claims
 * embedded here (sub, email, role, type) are exactly the ones Section 8 lists,
 * and are what JwtAuthenticationFilter reads back out to build a UserPrincipal
 * without hitting the database on every request.
 */
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);

    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYPE = "type";

    private final JwtProperties jwtProperties;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserPrincipal principal) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getAccessTokenExpiryMs());

        return Jwts.builder()
                .subject(String.valueOf(principal.getId()))
                .claim(CLAIM_EMAIL, principal.getEmail())
                .claim(CLAIM_ROLE, principal.getRole())
                .claim(CLAIM_TYPE, principal.getUserType().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    /**
     * Validates signature and expiry. Returns false (never throws) so callers
     * — chiefly JwtAuthenticationFilter — can treat any invalid/expired/malformed
     * token uniformly as "not authenticated" rather than a request-aborting error.
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(signingKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT validation failed: {}", ex.getMessage());
            return false;
        }
    }

    public Claims extractClaims(String token) {
        return Jwts.parser().verifyWith(signingKey()).build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractUserId(String token) {
        return Long.valueOf(extractClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return extractClaims(token).get(CLAIM_EMAIL, String.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get(CLAIM_ROLE, String.class);
    }

    public UserType extractUserType(String token) {
        return UserType.valueOf(extractClaims(token).get(CLAIM_TYPE, String.class));
    }

    public Date extractExpiration(String token) {
        return extractClaims(token).getExpiration();
    }
}
