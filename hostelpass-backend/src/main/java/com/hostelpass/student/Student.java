package com.hostelpass.student;

import com.hostelpass.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Maps directly onto the frozen 'students' table (SDD Section 4.1).
 * Referenced by OutpassRequest via a unidirectional @ManyToOne — see the
 * relationship notes above for why no inverse collection lives here.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "students")
public class Student extends BaseEntity {

    @Column(name = "roll_number", nullable = false, unique = true, length = 20)
    private String rollNumber;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "room_number", nullable = false, length = 20)
    private String roomNumber;

    @Column(name = "branch", nullable = false, length = 50)
    private String branch;

    @Column(name = "department", nullable = false, length = 80)
    private String department;

    @Column(name = "year_of_study", nullable = false, length = 20)
    private String yearOfStudy;

    @Column(name = "mobile_number", nullable = false, length = 10)
    private String mobileNumber;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
