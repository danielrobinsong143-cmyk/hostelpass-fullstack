package com.hostelpass.outpass;

/**
 * Matches the DB enum on outpass_requests.status (SDD Section 4.3) and drives the
 * approval workflow state machine in SDD Section 12:
 * PENDING -> (APPROVED | DENIED | CANCELLED), no transitions back out of a terminal state.
 */
public enum OutpassStatus {
    PENDING,
    APPROVED,
    DENIED,
    CANCELLED
}
