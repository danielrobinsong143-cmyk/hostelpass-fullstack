package com.hostelpass.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Class-level constraint enforcing SDD Section 13's rule: "returnAt must be strictly
 * after departureAt". Applied to OutpassCreateRequest (see outpass/dto package).
 * A class-level (not field-level) annotation is required here because the check
 * needs to compare two fields against each other.
 */
@Documented
@Constraint(validatedBy = DateRangeValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDateRange {

    String message() default "returnAt must be after departureAt";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String startField();

    String endField();
}
