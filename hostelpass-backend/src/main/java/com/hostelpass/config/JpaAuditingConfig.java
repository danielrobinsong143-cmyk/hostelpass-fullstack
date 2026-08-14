package com.hostelpass.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables Spring Data JPA auditing so that BaseEntity's @CreatedDate / @LastModifiedDate
 * fields are populated automatically on every entity insert/update, project-wide.
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}
