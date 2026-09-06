package com.hostelpass.admin;

import com.hostelpass.admin.dto.AdminChangePasswordRequest;
import com.hostelpass.admin.dto.AdminCreateRequest;
import com.hostelpass.admin.dto.AdminResetPasswordRequest;
import com.hostelpass.admin.dto.AdminUpdateRequest;
import com.hostelpass.admin.dto.StaffAdminCreateRequest;
import com.hostelpass.admin.dto.StaffAdminResponse;
import com.hostelpass.admin.dto.StaffAdminUpdateRequest;
import com.hostelpass.auth.RefreshToken;
import com.hostelpass.auth.RefreshTokenRepository;
import com.hostelpass.auth.UserType;
import com.hostelpass.common.PageResponse;
import com.hostelpass.exception.ConflictException;
import com.hostelpass.exception.ResourceNotFoundException;
import com.hostelpass.staff.Staff;
import com.hostelpass.staff.StaffRepository;
import com.hostelpass.staff.StaffRole;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminStaffService {

    private final StaffRepository staffRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    // ==========================================
    // STAFF MANAGEMENT (WARDEN & PRINCIPAL ONLY)
    // ==========================================

    @Transactional(readOnly = true)
    public PageResponse<StaffAdminResponse> getStaff(String search, StaffRole role, Pageable pageable) {
        if (role == StaffRole.SUPER_ADMIN) {
            throw new ConflictException("SUPER_ADMIN cannot be queried via the staff endpoint");
        }
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        var staffPage = staffRepository.searchStaffExcludingSuperAdmin(trimmedSearch, role, pageable);
        return PageResponse.from(staffPage.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public StaffAdminResponse getStaffById(Long id) {
        Staff staff = findStaff(id);
        if (staff.getRole() == StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Staff not found with id: " + id);
        }
        return toResponse(staff);
    }

    @Transactional
    public StaffAdminResponse createStaff(StaffAdminCreateRequest request) {
        if (request.getRole() == StaffRole.SUPER_ADMIN) {
            throw new ConflictException("Cannot create Super Admin via staff endpoint. Use admin management.");
        }

        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        validateUniqueUsername(username, null);
        validateUniqueEmail(email, null);

        Staff staff = new Staff();
        staff.setUsername(username);
        staff.setFullName(request.getFullName().trim());
        staff.setEmail(email);
        staff.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        staff.setRole(request.getRole());
        staff.setActive(true);

        return toResponse(staffRepository.save(staff));
    }

    @Transactional
    public StaffAdminResponse updateStaff(Long id, StaffAdminUpdateRequest request, Long currentUserId) {
        Staff staff = findStaff(id);
        if (staff.getRole() == StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Staff not found with id: " + id);
        }
        if (request.getRole() == StaffRole.SUPER_ADMIN) {
            throw new ConflictException("Cannot promote staff to SUPER_ADMIN via staff endpoint");
        }

        // Username update uniqueness check
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(staff.getUsername())) {
                validateUniqueUsername(newUsername, id);
            }
            staff.setUsername(newUsername);
        }

        // Email update uniqueness check
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(staff.getEmail())) {
                validateUniqueEmail(newEmail, id);
            }
            staff.setEmail(newEmail);
        }

        // Full name
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            staff.setFullName(request.getFullName().trim());
        }

        // Role update
        if (request.getRole() != null && request.getRole() != staff.getRole()) {
            staff.setRole(request.getRole());
        }

        return toResponse(staffRepository.save(staff));
    }

    @Transactional
    public void resetStaffPassword(Long staffId, AdminResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ConflictException("New password and confirmation password do not match");
        }

        Staff staff = findStaff(staffId);
        if (staff.getRole() == StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Staff not found with id: " + staffId);
        }

        staff.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        staffRepository.save(staff);

        revokeUserRefreshTokens(UserType.STAFF, staffId);
    }

    @Transactional
    public StaffAdminResponse setStaffActive(Long id, boolean active) {
        Staff staff = findStaff(id);
        if (staff.getRole() == StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Staff not found with id: " + id);
        }
        staff.setActive(active);
        return toResponse(staffRepository.save(staff));
    }

    // ==========================================
    // ADMIN MANAGEMENT (SUPER_ADMIN ONLY)
    // ==========================================

    @Transactional(readOnly = true)
    public PageResponse<StaffAdminResponse> getAdmins(String search, Pageable pageable) {
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        var adminPage = staffRepository.searchAndFilter(trimmedSearch, StaffRole.SUPER_ADMIN, pageable);
        return PageResponse.from(adminPage.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public StaffAdminResponse getAdminById(Long id) {
        Staff staff = findStaff(id);
        if (staff.getRole() != StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Admin not found with id: " + id);
        }
        return toResponse(staff);
    }

    @Transactional
    public StaffAdminResponse createAdmin(AdminCreateRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        validateUniqueUsername(username, null);
        validateUniqueEmail(email, null);

        Staff admin = new Staff();
        admin.setUsername(username);
        admin.setFullName(request.getFullName().trim());
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setRole(StaffRole.SUPER_ADMIN);
        admin.setActive(true);

        return toResponse(staffRepository.save(admin));
    }

    @Transactional
    public StaffAdminResponse updateAdmin(Long id, AdminUpdateRequest request, Long currentUserId) {
        Staff admin = findStaff(id);
        if (admin.getRole() != StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Admin not found with id: " + id);
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(admin.getUsername())) {
                validateUniqueUsername(newUsername, id);
            }
            admin.setUsername(newUsername);
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(admin.getEmail())) {
                validateUniqueEmail(newEmail, id);
            }
            admin.setEmail(newEmail);
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            admin.setFullName(request.getFullName().trim());
        }

        return toResponse(staffRepository.save(admin));
    }

    @Transactional
    public void changeAdminOwnPassword(Long adminId, AdminChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ConflictException("New password and confirmation password do not match");
        }

        Staff admin = findStaff(adminId);
        if (admin.getRole() != StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Admin not found with id: " + adminId);
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPasswordHash())) {
            throw new ConflictException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), admin.getPasswordHash())) {
            throw new ConflictException("New password cannot be the same as the current password");
        }

        admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        staffRepository.save(admin);

        revokeUserRefreshTokens(UserType.STAFF, adminId);
    }

    @Transactional
    public StaffAdminResponse setAdminActive(Long id, boolean active, Long currentUserId) {
        Staff admin = findStaff(id);
        if (admin.getRole() != StaffRole.SUPER_ADMIN) {
            throw new ResourceNotFoundException("Admin not found with id: " + id);
        }

        if (!active) {
            // Guard 1: Prevent self-deactivation
            if (currentUserId != null && currentUserId.equals(id)) {
                throw new ConflictException("You cannot deactivate your own administrative account");
            }

            // Guard 2: Prevent deactivating the last active super admin
            long activeSuperAdmins = staffRepository.countByRoleAndActiveTrue(StaffRole.SUPER_ADMIN);
            if (activeSuperAdmins <= 1) {
                throw new ConflictException("Cannot deactivate the only active Super Admin account");
            }
        }

        admin.setActive(active);
        return toResponse(staffRepository.save(admin));
    }

    // ==========================================
    // SHARED PRIVATE HELPERS
    // ==========================================

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

    private void validateUniqueUsername(String username, Long excludeId) {
        boolean inUse = (excludeId == null)
                ? staffRepository.existsByUsernameIgnoreCase(username)
                : staffRepository.existsByUsernameIgnoreCaseAndIdNot(username, excludeId);
        if (inUse) {
            throw new ConflictException("Username is already in use");
        }
    }

    private void validateUniqueEmail(String email, Long excludeId) {
        boolean inUse = (excludeId == null)
                ? staffRepository.existsByEmailIgnoreCase(email)
                : staffRepository.existsByEmailIgnoreCaseAndIdNot(email, excludeId);
        if (inUse) {
            throw new ConflictException("Email is already in use");
        }
    }

    private Staff findStaff(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Record not found with id: " + id));
    }

    private StaffAdminResponse toResponse(Staff s) {
        return new StaffAdminResponse(
                s.getId(),
                s.getUsername(),
                s.getFullName(),
                s.getEmail(),
                s.getRole(),
                s.isActive()
        );
    }
}
