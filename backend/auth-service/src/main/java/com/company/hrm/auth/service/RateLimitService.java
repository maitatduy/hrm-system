package com.company.hrm.auth.service;

public interface RateLimitService {

    /** Chặn trước khi kiểm tra mật khẩu nếu email, IP hoặc cặp email và IP đã sai quá nhiều lần. */
    void checkLoginAllowed(String email, String clientIp);

    void recordLoginFailure(String email, String clientIp);

    /** Đăng nhập thành công chỉ xóa bộ đếm của email, không xóa bộ đếm theo IP. */
    void resetLoginFailures(String email, String clientIp);

    void acquireOtpRequestSlot(String email, String clientIp);
}
