package com.hostelpass.outpass;

import com.hostelpass.common.PageResponse;
import com.hostelpass.outpass.dto.OutpassCreateRequest;
import com.hostelpass.outpass.dto.OutpassDecisionRequest;
import com.hostelpass.outpass.dto.OutpassResponse;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;

/**
 * Student-facing outpass endpoints — exactly the four in SDD Section 7.2:
 * create, list-my, view-one-of-my, cancel-my. Staff-facing endpoints
 * (Section 7.3 — list-all, approve, deny) are a later phase and deliberately
 * not touched here.
 *
 * Every method takes the student id from @AuthenticationPrincipal, never from
 * the request body/path — this phase's requirement #6. UserPrincipal is the
 * same principal type JwtAuthenticationFilter has been populating into the
 * SecurityContext since Phase 4; no filter/security class needed to change for
 * this to work.
 *
 * @PreAuthorize("hasRole('STUDENT')") enforces SDD Section 3's permission
 * matrix at the API layer (a staff member's valid JWT still can't call these).
 * This requires @EnableMethodSecurity on SecurityConfig — see that file's
 * modification note.
 */
@RestController
@RequestMapping("/outpass-requests")
@RequiredArgsConstructor
public class OutpassController {

    private final OutpassService outpassService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<OutpassResponse> create(@AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody OutpassCreateRequest request) {
        OutpassResponse response = outpassService.createRequest(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PageResponse<OutpassResponse>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OutpassStatus status,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(
                outpassService.getMyRequests(
                        principal.getId(),
                        search,
                        status,
                        pageable));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('WARDEN', 'PRINCIPAL', 'SUPER_ADMIN')")
    public ResponseEntity<PageResponse<OutpassResponse>> getRequests(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OutpassStatus status,
            @PageableDefault(size = 20, sort = "submittedAt", direction = Sort.Direction.ASC) Pageable pageable) {

        return ResponseEntity.ok(
                outpassService.getRequests(search, status, pageable));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('WARDEN', 'PRINCIPAL', 'SUPER_ADMIN')")
    public ResponseEntity<OutpassResponse> approve(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody OutpassDecisionRequest request) {

        return ResponseEntity.ok(
                outpassService.approveRequest(
                        principal.getId(),
                        id,
                        request));
    }

    @PatchMapping("/{id}/deny")
    @PreAuthorize("hasAnyRole('WARDEN', 'PRINCIPAL', 'SUPER_ADMIN')")
    public ResponseEntity<OutpassResponse> deny(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody OutpassDecisionRequest request) {

        return ResponseEntity.ok(
                outpassService.denyRequest(
                        principal.getId(),
                        id,
                        request));
    }

    @GetMapping("/my/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<OutpassResponse> getMyRequestById(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(outpassService.getMyRequestById(principal.getId(), id));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<OutpassResponse> cancel(@AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(outpassService.cancelRequest(principal.getId(), id));
    }
}
