package com.hostelpass.config;

import com.hostelpass.security.jwt.JwtAccessDeniedHandler;
import com.hostelpass.security.jwt.JwtAuthenticationEntryPoint;
import com.hostelpass.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Central Spring Security wiring for the whole application, per SDD Section 9
 * (config/SecurityConfig.java) and Section 11 (auth flow). Everything else in
 * the security/auth packages is assembled here into one filter chain:
 *
 *  1. Stateless sessions (SessionCreationPolicy.STATELESS) — no server-side
 *     session state, per Section 2's scalability NFR.
 *  2. CSRF disabled — meaningful only for cookie-based session auth; irrelevant
 *     for a stateless Bearer-token API (the refresh-token cookie is HttpOnly +
 *     SameSite=Strict, which already mitigates CSRF on that one endpoint).
 *  3. CORS delegated to the existing CorsConfigurationSource bean (CorsConfig).
 *  4. /auth/** left public (login/refresh/logout must work before a client has
 *     a token); everything else requires authentication.
 *  5. JwtAuthenticationFilter runs before Spring's own
 *     UsernamePasswordAuthenticationFilter so every request is evaluated
 *     against the JWT before any other authentication mechanism could apply.
 *  6. Custom entry point / access-denied handler so 401s and 403s return the
 *     project's JSON error shape instead of Spring's default HTML page.
 *
 * NOTE: paths below are relative ("/auth/**"), not "/api/v1/auth/**" — Spring
 * Security matches against the request path with context-path already
 * stripped (server.servlet.context-path=/api/v1 in application.yml).
 *
 * @EnableMethodSecurity added in Phase 5 — activates @PreAuthorize on
 * controller methods (OutpassController), which SDD Section 3 explicitly
 * mandates for permission enforcement ("All permission checks are enforced at
 * the API layer via Spring Security (@PreAuthorize), never trusted from the
 * frontend alone"). Nothing else in this class changed; existing
 * authentication behavior (login, JWT validation, CORS, exception handling)
 * is untouched.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService,
                                                         PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
