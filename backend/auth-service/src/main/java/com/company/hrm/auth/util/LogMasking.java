package com.company.hrm.auth.util;

/** Che dữ liệu cá nhân trước khi ghi log, dùng chung cho mọi chỗ log email. */
public final class LogMasking {

    private LogMasking() {
    }

    /** "nguyenvana@hrm.vn" thành "n***@hrm.vn". */
    public static String maskEmail(String email) {
        if (email == null) {
            return null;
        }
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***" + email.substring(Math.max(atIndex, 0));
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
