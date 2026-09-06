package com.hostelpass.admin;

import com.hostelpass.admin.dto.AdminCreateRequest;
import com.hostelpass.admin.dto.AdminUpdateRequest;
import com.hostelpass.admin.dto.StaffAdminResponse;
import com.hostelpass.common.PageResponse;
import com.hostelpass.security.UserPrincipal;
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
@RequestMapping("/admin/admins")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminAdminController {

    private final AdminStaffService adminStaffService;

    @GetMapping
    public ResponseEntity<PageResponse<StaffAdminResponse>> getAdmins(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminStaffService.getAdmins(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffAdminResponse> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(adminStaffService.getAdminById(id));
    }

    @PostMapping
    public ResponseEntity<StaffAdminResponse> createAdmin(
            @Valid @RequestBody AdminCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminStaffService.createAdmin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffAdminResponse> updateAdmin(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminStaffService.updateAdmin(id, request, principal.getId()));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<StaffAdminResponse> deactivate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminStaffService.setAdminActive(id, false, principal.getId()));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<StaffAdminResponse> activate(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminStaffService.setAdminActive(id, true, principal.getId()));
    }
}
