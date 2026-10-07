package com.company.hrm.auth.service;

import com.company.hrm.auth.dto.TokenPair;
import com.company.hrm.auth.entity.User;

import java.time.Duration;

public interface TokenService {

    /** Thời gian hiệu lực của mã OTP, dùng chung cho Redis TTL và nội dung email. */
    Duration OTP_TTL = Duration.ofMinutes(5);

    /**
     * Cấp cặp token khi đăng nhập. rememberMe quyết định thời gian sống của refresh token và
     * cookie lưu bền hay chỉ là cookie phiên, lựa chọn này được giữ nguyên qua các lần refresh.
     */
    TokenPair generateTokens(User user, boolean rememberMe);

    TokenPair refreshToken(String refreshToken);

    void blacklistAccessToken(String accessToken);

    void revokeRefreshToken(String refreshToken);

    void storeOtp(String email, String otp);

    String verifyOtpAndGenerateResetToken(String email, String otp);

    /** Lấy email gắn với reset token và xóa token trong cùng một lệnh, token chỉ dùng được một lần. */
    String consumeResetToken(String resetToken);

    void revokeAllUserTokens(String userId);
}
