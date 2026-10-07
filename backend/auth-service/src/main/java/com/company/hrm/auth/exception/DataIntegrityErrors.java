package com.company.hrm.auth.exception;

import org.hibernate.exception.ConstraintViolationException;

import java.sql.SQLException;

/** Nhận diện vi phạm khóa unique trong chuỗi exception mà không phụ thuộc loại database. */
public final class DataIntegrityErrors {

    /** SQLState chuẩn cho vi phạm unique, dùng bởi H2, PostgreSQL. MySQL trả SQLState chung 23000 nên cần mã 1062. */
    private static final String STANDARD_UNIQUE_VIOLATION_STATE = "23505";
    private static final int MYSQL_DUPLICATE_KEY = 1062;

    private DataIntegrityErrors() {
    }

    /**
     * Ưu tiên phân loại của Hibernate (theo dialect nên không phụ thuộc database), sau đó tới SQLState chuẩn và mã lỗi
     * riêng của MySQL cho trường hợp dialect chưa phân loại được.
     */
    public static boolean isUniqueViolation(Throwable ex) {
        for (Throwable cause = ex; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException hibernateViolation
                    && hibernateViolation.getKind() == ConstraintViolationException.ConstraintKind.UNIQUE) {
                return true;
            }
            if (cause instanceof SQLException sqlException
                    && (STANDARD_UNIQUE_VIOLATION_STATE.equals(sqlException.getSQLState())
                        || sqlException.getErrorCode() == MYSQL_DUPLICATE_KEY)) {
                return true;
            }
        }
        return false;
    }
}
