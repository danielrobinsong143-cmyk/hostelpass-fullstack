package com.hostelpass.security.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Binds the app.jwt.* keys already present in application.yml since Phase 2
 * (secret, access-token-expiry-ms, refresh-token-expiry-ms). No application.yml
 * change was needed for Phase 4 — those properties were defined ahead of time
 * specifically so this class could bind to them once auth was implemented.
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret;
    private long accessTokenExpiryMs;
    private long refreshTokenExpiryMs;
}
