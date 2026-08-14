package com.hostelpass.outpass.dto;

/**
 * Lightweight response for GET /outpass-requests/my/stats — returns per-status
 * counts for the authenticated student's dashboard without fetching all records.
 * Each count is computed via a single COUNT query in the repository layer.
 */
public class OutpassStatsResponse {

    private final long total;
    private final long pending;
    private final long approved;
    private final long denied;
    private final long cancelled;

    public OutpassStatsResponse(long total, long pending, long approved, long denied, long cancelled) {
        this.total = total;
        this.pending = pending;
        this.approved = approved;
        this.denied = denied;
        this.cancelled = cancelled;
    }

    public long getTotal() {
        return total;
    }

    public long getPending() {
        return pending;
    }

    public long getApproved() {
        return approved;
    }

    public long getDenied() {
        return denied;
    }

    public long getCancelled() {
        return cancelled;
    }
}
