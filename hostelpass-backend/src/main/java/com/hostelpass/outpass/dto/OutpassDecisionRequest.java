package com.hostelpass.outpass.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Inbound payload for PATCH /outpass-requests/{id}/approve and
 * .../deny (SDD Section 7.3). remark is optional for approval but required
 * (min 5 chars) for denial per Section 13.3 — that condition depends on which
 * endpoint/action is being invoked, so it cannot be a static annotation here and
 * is enforced in the service layer in a later phase.
 */
@Getter
@Setter
public class OutpassDecisionRequest {

    @Size(max = 255, message = "Remark must not exceed 255 characters")
    private String remark;
}
