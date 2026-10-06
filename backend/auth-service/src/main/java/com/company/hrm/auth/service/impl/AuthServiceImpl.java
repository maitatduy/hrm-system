package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.dto.TokenPair;
import com.company.hrm.auth.dto.request.ChangePasswordRequest;
import com.company.hrm.auth.dto.request.ForgotPasswordRequest;
import com.company.hrm.auth.dto.request.LoginRequest;
import com.company.hrm.auth.dto.request.ResetPasswordRequest;
import com.company.hrm.auth.dto.request.VerifyOtpRequest;
import com.company.hrm.auth.dto.response.LoginResponse;
import com.company.hrm.auth.dto.response.TokenRefreshResponse;
import com.company.hrm.auth.dto.response.UserSummaryResponse;
import com.company.hrm.auth.dto.response.VerifyOtpResponse;
import com.company.hrm.auth.entity.User;
import com.company.hrm.auth.enums.UserStatus;
import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.exception.ForbiddenException;
import com.company.hrm.auth.exception.ResourceNotFoundException;
import com.company.hrm.auth.exception.UnauthorizedException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.service.AuthService;
import com.company.hrm.auth.service.EmailService;
import com.company.hrm.auth.service.RateLimitService;
import com.company.hrm.auth.service.TokenService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitService rateLimitService;

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletResponse response) {
        String email = request.getEmail().toLowerCase();
        rateLimitService.checkLoginAllowed(email);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            rateLimitService.recordLoginFailure(email);
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        // Chỉ báo trạng thái khóa khi đã đúng mật khẩu, tránh lộ trạng thái tài khoản cho người lạ
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new ForbiddenException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.");
        }

        rateLimitService.resetLoginFailures(email);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        TokenPair tokenPair = tokenService.generateTokens(user, request.isRememberMe());
        addRefreshTokenCookie(response, tokenPair);

        return LoginResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .tokenType(tokenPair.getTokenType())
                .user(tokenPair.getUser())
                .build();
    }

    @Override
    public TokenRefreshResponse refreshToken(String refreshToken, HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token không tồn tại trong cookie");
        }

        TokenPair tokenPair = tokenService.refreshToken(refreshToken);
        addRefreshTokenCookie(response, tokenPair);

        return TokenRefreshResponse.builder()
                .accessToken(tokenPair.getAccessToken())
                .tokenType(tokenPair.getTokenType())
                .build();
    }

    @Override
    public void logout(String authHeader, String refreshToken, HttpServletResponse response) {
        if (authHeader != null && !authHeader.isBlank()) {
            tokenService.blacklistAccessToken(authHeader);
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            tokenService.revokeRefreshToken(refreshToken);
        }

        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie("").maxAge(0).build().toString());
    }

    /** Có maxAge thì là cookie lưu bền (ghi nhớ đăng nhập), không có thì là cookie phiên. */
    private void addRefreshTokenCookie(HttpServletResponse response, TokenPair tokenPair) {
        ResponseCookie.ResponseCookieBuilder cookie = refreshTokenCookie(tokenPair.getRefreshToken());
        if (tokenPair.getRefreshTokenCookieMaxAge() != null) {
            cookie.maxAge(tokenPair.getRefreshTokenCookieMaxAge());
        }
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.build().toString());
    }

    private ResponseCookie.ResponseCookieBuilder refreshTokenCookie(String value) {
        return ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, value)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth");
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryResponse getCurrentUser(UUID currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản"));
        return userMapper.toSummaryResponse(user);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase();
        rateLimitService.acquireOtpRequestSlot(email);
        userRepository.findByEmail(email).ifPresent(user -> {
            if (user.getStatus() != UserStatus.LOCKED) {
                String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
                tokenService.storeOtp(email, otp);
                emailService.sendOtpEmailAsync(email, otp);
            }
        });
    }

    @Override
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {
        String resetToken = tokenService.verifyOtpAndGenerateResetToken(request.getEmail(), request.getOtp());
        return VerifyOtpResponse.builder()
                .resetToken(resetToken)
                .build();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = tokenService.validateResetToken(request.getResetToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenService.revokeResetToken(request.getResetToken());
        tokenService.revokeAllUserTokens(user.getId().toString());
    }

    @Override
    @Transactional
    public void changePassword(UUID currentUserId, ChangePasswordRequest request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu hiện tại không chính xác");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        tokenService.revokeAllUserTokens(user.getId().toString());
    }
}
