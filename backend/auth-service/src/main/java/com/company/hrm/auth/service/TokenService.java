package com.company.hrm.auth.service;

import com.company.hrm.auth.dto.response.LoginResponse;
import com.company.hrm.auth.dto.response.TokenRefreshResponse;
import com.company.hrm.auth.entity.User;

public interface TokenService {

    LoginResponse generateTokens(User user);

    TokenRefreshResponse refreshToken(String refreshToken);

    void blacklistAccessToken(String accessToken);

    void revokeRefreshToken(String refreshToken);

    void storeOtp(String email, String otp);

    String verifyOtpAndGenerateResetToken(String email, String otp);

    String validateResetToken(String resetToken);

    void revokeResetToken(String resetToken);

    void revokeAllUserTokens(String userId);
}
