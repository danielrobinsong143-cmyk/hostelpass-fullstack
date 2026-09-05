package com.hostelpass.admin;

import com.hostelpass.admin.dto.StudentAdminCreateRequest;
import com.hostelpass.admin.dto.StudentAdminResponse;
import com.hostelpass.admin.dto.StudentAdminUpdateRequest;
import com.hostelpass.common.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminStudentController {

    private final AdminStudentService adminStudentService;

    @GetMapping
    public ResponseEntity<PageResponse<StudentAdminResponse>> getStudents(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "fullName", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(adminStudentService.getStudents(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentAdminResponse> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(adminStudentService.getStudent(id));
    }

    @PostMapping
    public ResponseEntity<StudentAdminResponse> createStudent(
            @Valid @RequestBody StudentAdminCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminStudentService.createStudent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentAdminResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentAdminUpdateRequest request) {
        return ResponseEntity.ok(adminStudentService.updateStudent(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<StudentAdminResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(adminStudentService.setActive(id, false));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<StudentAdminResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(adminStudentService.setActive(id, true));
    }
}
