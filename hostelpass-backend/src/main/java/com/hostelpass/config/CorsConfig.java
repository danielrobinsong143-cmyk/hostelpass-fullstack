package com.hostelpass.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Defines which origins may call this API from a browser (i.e. the React frontend).
 * The allowed origin list is externalized via app.cors.allowed-origins so dev/prod
 * environments can differ without a code change — consumed here, wired into
 * SecurityConfig's HttpSecurity.cors(...) in Phase 3.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Was "/api/**" — but with server.servlet.context-path=/api/v1 now set
        // (Phase 4), Spring strips the context path before matching internally,
        // so every real request path here looks like "/auth/student/login",
        // "/outpass-requests", etc. "/api/**" would never match again; "/**" is
        // correct and safe since this application serves nothing but this API.
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
