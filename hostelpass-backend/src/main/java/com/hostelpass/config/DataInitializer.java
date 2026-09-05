package com.hostelpass.config;

import com.hostelpass.staff.Staff;
import com.hostelpass.staff.StaffRepository;
import com.hostelpass.staff.StaffRole;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Development-only seed data. Runs once on application startup.
 * Seeds ONLY the initial SUPER_ADMIN account (admin1) if it does not already exist.
 *
 * Idempotent:
 * - If admin1 already exists, does nothing.
 * - Does NOT seed any students, WARDEN, or PRINCIPAL accounts.
 * - Preserves all dynamically created students and staff upon backend restarts.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {
        if (staffRepository.existsByUsernameIgnoreCase("admin1")) {
            log.info("DataInitializer: admin1 account already exists, skipping seed.");
            return;
        }

        Staff admin = new Staff();
        admin.setUsername("admin1");
        admin.setFullName("System Administrator");
        admin.setEmail("admin@hostelpass.edu");
        admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
        admin.setRole(StaffRole.SUPER_ADMIN);
        admin.setActive(true);

        staffRepository.save(admin);
        log.info("DataInitializer: seeded single initial SUPER_ADMIN account (admin1).");
    }
}
