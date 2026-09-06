package com.hostelpass.admin;

import com.hostelpass.admin.dto.AdminResetPasswordRequest;
import com.hostelpass.admin.dto.StudentAdminCreateRequest;
import com.hostelpass.admin.dto.StudentAdminResponse;
import com.hostelpass.admin.dto.StudentAdminUpdateRequest;
import com.hostelpass.auth.RefreshToken;
import com.hostelpass.auth.RefreshTokenRepository;
import com.hostelpass.auth.UserType;
import com.hostelpass.common.PageResponse;
import com.hostelpass.exception.ConflictException;
import com.hostelpass.exception.ResourceNotFoundException;
import com.hostelpass.student.Student;
import com.hostelpass.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStudentService {

    private final StudentRepository studentRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<StudentAdminResponse> getStudents(String search, Pageable pageable) {
        var students = (search == null || search.isBlank())
                ? studentRepository.findAll(pageable)
                : studentRepository.search(search.trim(), pageable);
        return PageResponse.from(students.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public StudentAdminResponse getStudent(Long id) {
        return toResponse(findStudent(id));
    }

    @Transactional
    public StudentAdminResponse createStudent(StudentAdminCreateRequest request) {
        String rollNumber = request.getRollNumber().trim();
        String email = request.getEmail().trim();

        if (studentRepository.existsByRollNumberIgnoreCase(rollNumber)) {
            throw new ConflictException("Roll number is already in use");
        }
        if (studentRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already in use");
        }

        Student student = new Student();
        student.setRollNumber(rollNumber);
        student.setFullName(request.getFullName().trim());
        student.setEmail(email);
        student.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        student.setRoomNumber(request.getRoomNumber().trim());
        student.setBranch(request.getBranch().trim());
        student.setDepartment(request.getDepartment().trim());
        student.setYearOfStudy(request.getYearOfStudy().trim());
        student.setMobileNumber(request.getMobileNumber().trim());
        student.setActive(true);

        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentAdminResponse updateStudent(Long id, StudentAdminUpdateRequest request) {
        Student student = findStudent(id);

        if (request.getRollNumber() != null && !request.getRollNumber().isBlank()) {
            String newRoll = request.getRollNumber().trim();
            if (!newRoll.equalsIgnoreCase(student.getRollNumber())
                    && studentRepository.existsByRollNumberIgnoreCaseAndIdNot(newRoll, id)) {
                throw new ConflictException("Roll number is already in use");
            }
            student.setRollNumber(newRoll);
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(student.getEmail())
                    && studentRepository.existsByEmailIgnoreCaseAndIdNot(newEmail, id)) {
                throw new ConflictException("Email is already in use");
            }
            student.setEmail(newEmail);
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            student.setFullName(request.getFullName().trim());
        }

        if (request.getRoomNumber() != null && !request.getRoomNumber().isBlank()) {
            student.setRoomNumber(request.getRoomNumber().trim());
        }

        if (request.getBranch() != null && !request.getBranch().isBlank()) {
            student.setBranch(request.getBranch().trim());
        }

        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            student.setDepartment(request.getDepartment().trim());
        }

        if (request.getYearOfStudy() != null && !request.getYearOfStudy().isBlank()) {
            student.setYearOfStudy(request.getYearOfStudy().trim());
        }

        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            student.setMobileNumber(request.getMobileNumber().trim());
        }

        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public void resetStudentPassword(Long studentId, AdminResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ConflictException("New password and confirmation password do not match");
        }

        Student student = findStudent(studentId);
        student.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        studentRepository.save(student);

        revokeUserRefreshTokens(UserType.STUDENT, studentId);
    }

    @Transactional
    public StudentAdminResponse setActive(Long id, boolean active) {
        Student student = findStudent(id);
        student.setActive(active);
        return toResponse(studentRepository.save(student));
    }

    private void revokeUserRefreshTokens(UserType userType, Long userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserTypeAndUserId(userType, userId);
        List<RefreshToken> activeTokens = tokens.stream()
                .filter(t -> !t.isRevoked())
                .toList();
        if (!activeTokens.isEmpty()) {
            activeTokens.forEach(t -> t.setRevoked(true));
            refreshTokenRepository.saveAll(activeTokens);
        }
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private StudentAdminResponse toResponse(Student s) {
        return new StudentAdminResponse(
                s.getId(),
                s.getRollNumber(),
                s.getFullName(),
                s.getEmail(),
                s.getRoomNumber(),
                s.getBranch(),
                s.getDepartment(),
                s.getYearOfStudy(),
                s.getMobileNumber(),
                s.isActive()
        );
    }
}
