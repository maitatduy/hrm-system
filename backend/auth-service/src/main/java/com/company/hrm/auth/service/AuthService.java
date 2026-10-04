package com.company.hrm.auth.service;

import com.company.hrm.auth.dto.request.ChangePasswordRequest;
import com.company.hrm.auth.dto.request.ForgotPasswordRequest;
import com.company.hrm.auth.dto.request.LoginRequest;
import com.company.hrm.auth.dto.request.ResetPasswordRequest;
import com.company.hrm.auth.dto.request.VerifyOtpRequest;
import com.company.hrm.auth.dto.response.LoginResponse;
import com.company.hrm.auth.dto.response.TokenRefreshResponse;
import com.company.hrm.auth.dto.response.UserSummaryResponse;
import com.company.hrm.auth.dto.response.VerifyOtpResponse;
import jakarta.servlet.http.HttpServletResponse;

import java.util.UUID;

public interface AuthService {

    LoginResponse login(LoginRequest request, HttpServletResponse response);

    TokenRefreshResponse refreshToken(String refreshToken, HttpServletResponse response);

    void logout(String authHeader, String refreshToken, HttpServletResponse response);

    UserSummaryResponse getCurrentUser(UUID currentUserId);

    void forgotPassword(ForgotPasswordRequest request);

    VerifyOtpResponse verifyOtp(VerifyOtpRequest request);

    void resetPassword(ResetPasswordRequest request);

    void changePassword(UUID currentUserId, ChangePasswordRequest request);
}
