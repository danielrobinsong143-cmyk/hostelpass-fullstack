package com.hostelpass.outpass;

/**
 * Formalizes the purpose-of-visit options that existed as a plain HTML <select> in
 * the original prototype into a type-safe enum. Stored via @Enumerated(STRING) into
 * the existing 'purpose VARCHAR(50)' column (SDD Section 4.3) — no schema change
 * required, since that column was never a strict DB-level ENUM to begin with.
 */
public enum OutpassPurpose {
    MEDICAL_APPOINTMENT,
    FAMILY_EMERGENCY,
    PERSONAL_WORK,
    EDUCATIONAL_SEMINAR,
    RELIGIOUS_FESTIVAL,
    SHOPPING_ERRANDS,
    OTHER
}
