package com.hostelpass.config;

import com.hostelpass.staff.Staff;
import com.hostelpass.staff.StaffRepository;
import com.hostelpass.staff.StaffRole;
import com.hostelpass.student.Student;
import com.hostelpass.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Development-only seed data. Runs once on application startup and inserts
 * demo Student/Staff rows ONLY if their respective tables are currently empty
 * — so restarting the app repeatedly never creates duplicates.
 *
 * @Profile("dev") ensures this never runs against a production datasource,
 * even if this class is accidentally left in the codebase — application.yml's
 * spring.profiles.active defaults to "dev" locally, but a prod deployment sets
 * SPRING_PROFILES_ACTIVE=prod (see application-prod.yml / Dockerfile from
 * Phase 2), which excludes this bean from the context entirely.
 *
 * Uses the existing Student/Staff entities and StudentRepository/StaffRepository
 * as-is (Phase 3) and the existing PasswordEncoder bean (Phase 4's
 * SecurityConfig) — no entity, repository, or auth code is touched.
 *
 * Note: "Admin" was requested as a third staff role alongside Warden and
 * Principal, but the frozen StaffRole enum has no plain ADMIN value (only
 * WARDEN, PRINCIPAL, SUPER_ADMIN — see SDD Section 3, and the earlier decision
 * to reject a standalone ADMIN role). Mapped to SUPER_ADMIN here rather than
 * adding a new enum constant.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedStudents();
        seedStaff();
    }

    private void seedStudents() {
        if (studentRepository.count() > 0) {
            log.info("DataInitializer: students table is not empty, skipping student seed.");
            return;
        }

        studentRepository.save(buildStudent(
                "411724205007", "Daniel Robinson G", "daniel@gmail.com",
                "Daniel@2007", "A-101", "IT", "Information Technology", "3rd Year", "9876543210"));

        studentRepository.save(buildStudent(
                "411724205003", "Aswin V", "aswin@gmail.com",
                "Aswin@2006", "A-102", "CSE", "Computer Science", "2nd Year", "9876543211"));

        studentRepository.save(buildStudent(
                "411724205008", "Sutharsanabalan D", "sutharsan@gmail.com",
                "Sutharsan@2007", "B-201", "MECH", "Mechanical Engineering", "4th Year", "9876543212"));

        log.info("DataInitializer: seeded 3 demo students.");
    }

    private void seedStaff() {
        if (staffRepository.count() > 0) {
            log.info("DataInitializer: staff table is not empty, skipping staff seed.");
            return;
        }

        staffRepository.save(buildStaff(
                "warden1", "Suresh Kumar", "warden@hostelpass.edu", "Warden@123", StaffRole.WARDEN));

        staffRepository.save(buildStaff(
                "principal1", "Dr. Meena Iyer", "principal@hostelpass.edu", "Principal@123", StaffRole.PRINCIPAL));

        // Requested as "Admin" — mapped to SUPER_ADMIN (see class-level note above).
        staffRepository.save(buildStaff(
                "admin1", "System Administrator", "admin@hostelpass.edu", "Admin@123", StaffRole.SUPER_ADMIN));

        log.info("DataInitializer: seeded 3 demo staff accounts (WARDEN, PRINCIPAL, SUPER_ADMIN).");
    }

    private Student buildStudent(String rollNumber, String fullName, String email, String rawPassword,
                                  String roomNumber, String branch, String department,
                                  String yearOfStudy, String mobileNumber) {
        Student student = new Student();
        student.setRollNumber(rollNumber);
        student.setFullName(fullName);
        student.setEmail(email);
        student.setPasswordHash(passwordEncoder.encode(rawPassword));
        student.setRoomNumber(roomNumber);
        student.setBranch(branch);
        student.setDepartment(department);
        student.setYearOfStudy(yearOfStudy);
        student.setMobileNumber(mobileNumber);
        student.setActive(true);
        return student;
    }

    private Staff buildStaff(String username, String fullName, String email, String rawPassword, StaffRole role) {
        Staff staff = new Staff();
        staff.setUsername(username);
        staff.setFullName(fullName);
        staff.setEmail(email);
        staff.setPasswordHash(passwordEncoder.encode(rawPassword));
        staff.setRole(role);
        staff.setActive(true);
        return staff;
    }
}
