package com.hostelpass.security.jwt;

import com.hostelpass.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per request (registered before UsernamePasswordAuthenticationFilter
 * in SecurityConfig). Reads the Authorization header, validates the JWT via
 * JwtTokenProvider, and — if valid — builds a UserPrincipal directly from the
 * token's own claims (UserPrincipal.fromClaims), with no database lookup. This
 * is what keeps every authenticated request stateless and fast, per SDD
 * Section 2. Any missing/invalid token simply leaves the SecurityContext empty;
 * SecurityConfig's requestMatchers then decide whether that request is allowed
 * to proceed (e.g. /auth/** is public) or gets rejected via
 * JwtAuthenticationEntryPoint.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTH_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            UserPrincipal principal = UserPrincipal.fromClaims(
                    jwtTokenProvider.extractUserId(token),
                    jwtTokenProvider.extractEmail(token),
                    jwtTokenProvider.extractRole(token),
                    jwtTokenProvider.extractUserType(token)
            );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(AUTH_HEADER);
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
