package com.hostelpass.auth;

/**
 * Matches the DB enum on refresh_tokens.user_type (SDD Section 4.5). Used with
 * user_id to identify which table (students or staff) a given refresh token
 * belongs to. Deliberately not a JPA relationship — see relationship notes above
 * for why a real FK can't span two possible target tables.
 */
public enum UserType {
    STUDENT,
    STAFF
}
