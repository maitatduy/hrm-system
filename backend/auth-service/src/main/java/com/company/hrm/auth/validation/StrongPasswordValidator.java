package com.company.hrm.auth.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Optional;

public class StrongPasswordValidator implements ConstraintValidator<StrongPassword, String> {

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return true;
        }
        Optional<String> violation = PasswordPolicy.violation(password);
        if (violation.isEmpty()) {
            return true;
        }
        // Báo đúng lý do (yếu hay quá dài) thay vì message mặc định của annotation
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(violation.get()).addConstraintViolation();
        return false;
    }
}
