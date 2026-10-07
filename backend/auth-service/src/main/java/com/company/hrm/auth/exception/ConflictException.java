package com.company.hrm.auth.exception;

import org.springframework.http.HttpStatus;

/** Yêu cầu hợp lệ về cú pháp nhưng xung đột với trạng thái dữ liệu hiện tại, trả về 409. */
public class ConflictException extends AppException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
