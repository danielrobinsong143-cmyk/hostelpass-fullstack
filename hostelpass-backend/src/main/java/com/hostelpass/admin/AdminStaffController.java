package com.hostelpass.admin;

import com.hostelpass.admin.dto.StaffAdminCreateRequest;
import com.hostelpass.admin.dto.StaffAdminResponse;
import com.hostelpass.admin.dto.StaffAdminUpdateRequest;
import com.hostelpass.common.PageResponse;
import com.hostelpass.security.UserPrincipal;
import com.hostelpass.staff.StaffRole;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminStaffController {

    private final AdminStaffService adminStaffService;

    @GetMapping
    public ResponseEntity<PageResponse<StaffAdminResponse>> getStaff(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) StaffRole role,
            @PageableDefault(size = 20, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminStaffService.getStaff(search, role, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffAdminResponse> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(adminStaffService.getStaffById(id));
    }

    @PostMapping
    public ResponseEntity<StaffAdminResponse> createStaff(
            @Valid @RequestBody StaffAdminCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminStaffService.createStaff(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffAdminResponse> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffAdminUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminStaffService.updateStaff(id, request, principal.getId()));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<StaffAdminResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(adminStaffService.setStaffActive(id, false));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<StaffAdminResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(adminStaffService.setStaffActive(id, true));
    }
}
