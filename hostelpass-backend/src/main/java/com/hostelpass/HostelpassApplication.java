package com.hostelpass;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the HostelPass backend.
 *
 * Component scanning defaults to this class's package (com.hostelpass) and everything
 * beneath it — so every feature package (student, staff, outpass, auditlog, auth,
 * security, config) defined in the frozen SDD (Section 9) is picked up automatically
 * as long as it lives under com.hostelpass.
 */
@SpringBootApplication
public class HostelpassApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelpassApplication.class, args);
    }

}
