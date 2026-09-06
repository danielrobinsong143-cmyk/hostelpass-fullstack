package com.hostelpass.staff;

/**
 * Matches the DB enum on staff.role (SDD Section 4.2) and drives the permission
 * matrix in SDD Section 3. Stored as STRING (not ORDINAL) in the Staff entity so
 * the persisted value stays readable and stable even if this enum's declaration
 * order changes later.
 */
public enum StaffRole {
    VC,
    PRINCIPAL,
    VICE_PRINCIPAL,
    DEAN,
    WARDEN,
    SUPER_ADMIN
}
