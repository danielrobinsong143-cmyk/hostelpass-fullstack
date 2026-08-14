package com.hostelpass.security;

import com.hostelpass.staff.StaffRepository;
import com.hostelpass.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Single UserDetailsService for two entity types, per SDD Section 9. Used only
 * during login (AuthService -> AuthenticationManager -> here), NOT on every
 * request — JwtAuthenticationFilter reconstructs principals from JWT claims
 * instead (see UserPrincipal.fromClaims), so this class never runs on the hot
 * path of an authenticated request.
 *
 * The identifier passed in is a rollNumber (student login endpoint) or a
 * username (staff login endpoint) — never chosen ambiguously by this class,
 * since AuthController's two separate endpoints already know which one they're
 * sending. Checking Student first is an arbitrary but harmless order: a
 * collision would require a staff username to be byte-identical to some
 * student's roll number, which the two ID formats make practically impossible.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        return studentRepository.findByRollNumber(identifier)
                .map(UserPrincipal::of)
                .map(UserDetails.class::cast)
                .or(() -> staffRepository.findByUsername(identifier).map(UserPrincipal::of))
                .orElseThrow(() -> new UsernameNotFoundException("No student or staff account found for: " + identifier));
    }
}
