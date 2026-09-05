package com.hostelpass.admin;

import com.hostelpass.admin.dto.StaffAdminCreateRequest;
import com.hostelpass.admin.dto.StaffAdminResponse;
import com.hostelpass.admin.dto.StaffAdminUpdateRequest;
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

@Service
@RequiredArgsConstructor
public class AdminStaffService {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<StaffAdminResponse> getStaff(String search, StaffRole role, Pageable pageable) {
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        var staffPage = staffRepository.searchAndFilter(trimmedSearch, role, pageable);
        return PageResponse.from(staffPage.map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public StaffAdminResponse getStaffById(Long id) {
        return toResponse(findStaff(id));
    }

    @Transactional
    public StaffAdminResponse createStaff(StaffAdminCreateRequest request) {
        String username = request.getUsername().trim();
        String email = request.getEmail().trim();

        if (staffRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Username is already in use");
        }
        if (staffRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email is already in use");
        }

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

        // Username update uniqueness check
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equalsIgnoreCase(staff.getUsername())
                    && staffRepository.existsByUsernameIgnoreCaseAndIdNot(newUsername, id)) {
                throw new ConflictException("Username is already in use");
            }
            staff.setUsername(newUsername);
        }

        // Email update uniqueness check
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim();
            if (!newEmail.equalsIgnoreCase(staff.getEmail())
                    && staffRepository.existsByEmailIgnoreCaseAndIdNot(newEmail, id)) {
                throw new ConflictException("Email is already in use");
            }
            staff.setEmail(newEmail);
        }

        // Full name
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            staff.setFullName(request.getFullName().trim());
        }

        // Role update with safety guards
        if (request.getRole() != null && request.getRole() != staff.getRole()) {
            // Guard 1: Prevent self-demotion
            if (currentUserId != null && currentUserId.equals(id) && request.getRole() != StaffRole.SUPER_ADMIN) {
                throw new ConflictException("You cannot remove your own SUPER_ADMIN role");
            }

            // Guard 2: Prevent demoting the last active super admin
            if (staff.getRole() == StaffRole.SUPER_ADMIN && staff.isActive()) {
                long activeSuperAdmins = staffRepository.countByRoleAndActiveTrue(StaffRole.SUPER_ADMIN);
                if (activeSuperAdmins <= 1) {
                    throw new ConflictException("Cannot change role of the only active Super Admin account");
                }
            }

            staff.setRole(request.getRole());
        }

        // Password reset (optional)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            staff.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return toResponse(staffRepository.save(staff));
    }

    @Transactional
    public StaffAdminResponse setActive(Long id, boolean active, Long currentUserId) {
        Staff staff = findStaff(id);

        if (!active) {
            // Guard 1: Prevent self-deactivation
            if (currentUserId != null && currentUserId.equals(id)) {
                throw new ConflictException("You cannot deactivate your own administrative account");
            }

            // Guard 2: Prevent deactivating the last active super admin
            if (staff.getRole() == StaffRole.SUPER_ADMIN) {
                long activeSuperAdmins = staffRepository.countByRoleAndActiveTrue(StaffRole.SUPER_ADMIN);
                if (activeSuperAdmins <= 1) {
                    throw new ConflictException("Cannot deactivate the only active Super Admin account");
                }
            }
        }

        staff.setActive(active);
        return toResponse(staffRepository.save(staff));
    }

    private Staff findStaff(Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
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
