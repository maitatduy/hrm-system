package com.company.hrm.auth.service;

public interface RateLimitService {

    /**
     * Chiếm một suất đăng nhập trước khi kiểm tra mật khẩu, ném TooManyRequestsException nếu email, IP hoặc cặp email
     * và IP đã vượt ngưỡng. Đếm trước khi chạy BCrypt nên nhiều request song song không cùng lọt qua bước kiểm tra.
     */
    void consumeLoginAttempt(String email, String clientIp);

    /**
     * Đúng mật khẩu: xóa bộ đếm của email và của cặp email và IP, trả lại đúng một suất của request này cho bộ đếm
     * theo IP (không xóa cả bộ đếm, để không ai xóa được dấu vết dò mật khẩu bằng một lần đăng nhập đúng).
     */
    void releaseLoginAttempt(String email, String clientIp);

    void acquireOtpRequestSlot(String email, String clientIp);
}
