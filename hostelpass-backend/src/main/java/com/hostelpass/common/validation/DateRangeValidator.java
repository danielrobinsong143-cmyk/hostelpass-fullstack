package com.hostelpass.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.BeanWrapperImpl;

import java.time.LocalDateTime;

/**
 * Reflectively reads the two named fields (startField/endField) off the annotated
 * DTO and confirms endField is strictly after startField. Used by
 * OutpassCreateRequest to validate departureAt / returnAt without hardcoding
 * field names into a one-off validator per DTO.
 */
public class DateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

    private String startField;
    private String endField;

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        this.startField = constraintAnnotation.startField();
        this.endField = constraintAnnotation.endField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // let @NotNull on individual fields handle nulls
        }

        BeanWrapperImpl wrapper = new BeanWrapperImpl(value);
        Object startRaw = wrapper.getPropertyValue(startField);
        Object endRaw = wrapper.getPropertyValue(endField);

        if (!(startRaw instanceof LocalDateTime start) || !(endRaw instanceof LocalDateTime end)) {
            return true; // individual @NotNull validators report the missing values
        }

        return end.isAfter(start);
    }
}
