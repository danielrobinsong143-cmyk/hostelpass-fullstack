-- ============================================================
-- V1__init_schema.sql
-- Baseline schema — implements SDD Section 4 (Database Design)
-- and Section 6 (Database Relationships) exactly as frozen.
-- ============================================================

CREATE TABLE students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    roll_number     VARCHAR(20)  NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    room_number     VARCHAR(20)  NOT NULL,
    branch          VARCHAR(50)  NOT NULL,
    department      VARCHAR(80)  NOT NULL,
    year_of_study   VARCHAR(20)  NOT NULL,
    mobile_number   VARCHAR(10)  NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE staff (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('WARDEN','PRINCIPAL','SUPER_ADMIN') NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE outpass_requests (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    pass_code             VARCHAR(20)  NOT NULL UNIQUE,
    student_id            BIGINT       NOT NULL,
    place_of_visit        VARCHAR(150) NOT NULL,
    purpose               VARCHAR(50)  NOT NULL,
    reason                TEXT         NOT NULL,
    departure_at          DATETIME     NOT NULL,
    return_at             DATETIME     NOT NULL,
    status                ENUM('PENDING','APPROVED','DENIED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    decided_by_staff_id   BIGINT       NULL,
    decision_remark       VARCHAR(255) NULL,
    submitted_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at            DATETIME     NULL,
    created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_outpass_student
        FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_outpass_decided_by_staff
        FOREIGN KEY (decided_by_staff_id) REFERENCES staff(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_outpass_status       ON outpass_requests(status);
CREATE INDEX idx_outpass_student_id   ON outpass_requests(student_id);
CREATE INDEX idx_outpass_submitted_at ON outpass_requests(submitted_at);

CREATE TABLE audit_logs (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    outpass_request_id    BIGINT NOT NULL,
    actor_staff_id        BIGINT NOT NULL,
    action                ENUM('APPROVED','DENIED','CANCELLED') NOT NULL,
    previous_status       VARCHAR(20)  NOT NULL,
    new_status            VARCHAR(20)  NOT NULL,
    remark                VARCHAR(255) NULL,
    performed_at           DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_outpass_request
        FOREIGN KEY (outpass_request_id) REFERENCES outpass_requests(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_audit_actor_staff
        FOREIGN KEY (actor_staff_id) REFERENCES staff(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    token        VARCHAR(255) NOT NULL UNIQUE,
    user_type    ENUM('STUDENT','STAFF') NOT NULL,
    user_id      BIGINT   NOT NULL,
    expires_at   DATETIME NOT NULL,
    revoked      BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_refresh_token_user ON refresh_tokens(user_type, user_id);
