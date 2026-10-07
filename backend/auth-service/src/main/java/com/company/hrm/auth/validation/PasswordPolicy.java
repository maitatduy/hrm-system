package com.company.hrm.auth.validation;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Chính sách mật khẩu duy nhất của auth-service, dùng cho đổi và đặt lại mật khẩu, mật khẩu MANUAL khi tạo
 * tài khoản và mật khẩu ADMIN ban đầu. Quy tắc khớp {@code frontend/src/features/auth/passwordRules.ts}.
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 8;
    /** BCrypt chỉ dùng 72 byte đầu, phần dư bị bỏ qua nên hai mật khẩu chỉ khác ở đuôi sẽ được coi là một. */
    public static final int MAX_BYTES = 72;

    public static final String WEAK_MESSAGE = "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    public static final String TOO_LONG_MESSAGE = "Mật khẩu quá dài, tối đa 72 byte (khoảng 72 ký tự không dấu)";

    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9\\s]");

    private PasswordPolicy() {
    }

    /** Trả về lý do không hợp lệ, rỗng nếu mật khẩu đạt chính sách. */
    public static Optional<String> violation(String password) {
        if (password == null) {
            return Optional.of(WEAK_MESSAGE);
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) {
            return Optional.of(TOO_LONG_MESSAGE);
        }
        boolean strong = password.length() >= MIN_LENGTH
                && UPPER.matcher(password).find()
                && LOWER.matcher(password).find()
                && DIGIT.matcher(password).find()
                && SPECIAL.matcher(password).find();
        return strong ? Optional.empty() : Optional.of(WEAK_MESSAGE);
    }

    public static boolean isValid(String password) {
        return violation(password).isEmpty();
    }
}
