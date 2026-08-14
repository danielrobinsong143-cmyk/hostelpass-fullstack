package com.hostelpass.outpass.dto;

import com.hostelpass.common.validation.ValidDateRange;
import com.hostelpass.outpass.OutpassPurpose;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Inbound payload for POST /outpass-requests (SDD Section 7.2).
 * @ValidDateRange enforces Section 13.2's "returnAt strictly after departureAt"
 * rule declaratively at the DTO boundary, before any service logic runs.
 * Note: the "student must not already have a PENDING request" business rule
 * (Section 13.2) is NOT expressible here — it requires a database lookup, so it
 * belongs in the service layer built in a later phase.
 */
@Getter
@Setter
@ValidDateRange(startField = "departureAt", endField = "returnAt")
public class OutpassCreateRequest {

    @NotBlank(message = "Place of visit is required")
    @Size(min = 2, max = 150, message = "Place of visit must be between 2 and 150 characters")
    private String placeOfVisit;

    @NotNull(message = "Purpose is required")
    private OutpassPurpose purpose;

    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 1000, message = "Reason must be between 10 and 1000 characters")
    private String reason;

    @NotNull(message = "Departure date/time is required")
    @FutureOrPresent(message = "Departure date/time must not be in the past")
    private LocalDateTime departureAt;

    @NotNull(message = "Return date/time is required")
    private LocalDateTime returnAt;
}
