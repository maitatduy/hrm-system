package com.company.hrm.auth.validation;

import com.company.hrm.auth.dto.request.ChangePasswordRequest;
import com.company.hrm.auth.dto.request.CreateAccountRequest;
import com.company.hrm.auth.enums.Role;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordPolicyTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    @ParameterizedTest
    @ValueSource(strings = {"Abcdef1!", "Mật#khẩu9A", "Kp7#mQ2xVr9$tLw4"})
    void acceptsStrongPasswords(String password) {
        assertThat(PasswordPolicy.violation(password)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "12345678",     // chỉ có số
            "abcdefgh",     // chỉ chữ thường
            "Abcdefgh",     // thiếu số và ký tự đặc biệt
            "Abcdefg1",     // thiếu ký tự đặc biệt
            "abcdef1!",     // thiếu chữ hoa
            "ABCDEF1!",     // thiếu chữ thường
            "Abcdef!!",     // thiếu số
            "Ab1!",         // quá ngắn
            "Abcdef1 ",     // khoảng trắng không tính là ký tự đặc biệt
    })
    void rejectsWeakPasswords(String password) {
        assertThat(PasswordPolicy.violation(password)).contains(PasswordPolicy.WEAK_MESSAGE);
    }

    @Test
    void rejectsPasswordsLongerThanBcryptLimit() {
        String asciiAtLimit = "Aa1!" + "x".repeat(PasswordPolicy.MAX_BYTES - 4);
        // "ậ" chiếm 3 byte UTF-8 nên 25 ký tự đã vượt 72 byte dù chưa tới 72 ký tự
        String multiByte = "Aa1!" + "ậ".repeat(25);

        assertThat(PasswordPolicy.violation(asciiAtLimit)).isEmpty();
        assertThat(PasswordPolicy.violation(asciiAtLimit + "x")).contains(PasswordPolicy.TOO_LONG_MESSAGE);
        assertThat(PasswordPolicy.violation(multiByte)).contains(PasswordPolicy.TOO_LONG_MESSAGE);
    }

    @Test
    void dtoValidationReportsTheSpecificReason() {
        ChangePasswordRequest weak = new ChangePasswordRequest("Current#1", "12345678");
        ChangePasswordRequest tooLong = new ChangePasswordRequest("Current#1", "Aa1!" + "x".repeat(80));

        assertThat(messages(VALIDATOR.validate(weak))).containsExactly(PasswordPolicy.WEAK_MESSAGE);
        assertThat(messages(VALIDATOR.validate(tooLong))).containsExactly(PasswordPolicy.TOO_LONG_MESSAGE);
    }

    @Test
    void createAccountAllowsMissingPasswordForGeneratedModes() {
        CreateAccountRequest request = CreateAccountRequest.builder()
                .employeeId(UUID.randomUUID())
                .email("a@hrm.vn")
                .role(Role.EMPLOYEE)
                .passwordMode("RANDOM")
                .build();

        assertThat(VALIDATOR.validate(request)).isEmpty();
    }

    private static <T> Set<String> messages(Set<ConstraintViolation<T>> violations) {
        return violations.stream().map(ConstraintViolation::getMessage).collect(java.util.stream.Collectors.toSet());
    }
}
