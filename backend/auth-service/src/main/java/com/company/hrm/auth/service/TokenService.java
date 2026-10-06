package com.company.hrm.auth.service;

import com.company.hrm.auth.dto.TokenPair;
import com.company.hrm.auth.entity.User;

import java.time.Duration;

public interface TokenService {

    /** Thời gian hiệu lực của mã OTP, dùng chung cho Redis TTL và nội dung email. */
    Duration OTP_TTL = Duration.ofMinutes(5);

    TokenPair generateTokens(User user);

    TokenPair refreshToken(String refreshToken);

    void blacklistAccessToken(String accessToken);

    void revokeRefreshToken(String refreshToken);

    void storeOtp(String email, String otp);

    String verifyOtpAndGenerateResetToken(String email, String otp);

    String validateResetToken(String resetToken);

    void revokeResetToken(String resetToken);

    void revokeAllUserTokens(String userId);
}
