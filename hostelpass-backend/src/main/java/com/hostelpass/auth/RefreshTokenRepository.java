package com.hostelpass.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Data access for RefreshToken. Backs the token-refresh and logout flows in
 * SDD Section 11:
 *  - findByToken       -> validates an incoming refresh request
 *  - findByUserTypeAndUserId -> lets a future logout-all-sessions feature revoke
 *    every token belonging to one student/staff account
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    List<RefreshToken> findByUserTypeAndUserId(UserType userType, Long userId);
}
