package com.company.hrm.auth.controller;

import com.company.hrm.auth.dto.request.ChangePasswordRequest;
import com.company.hrm.auth.dto.request.ForgotPasswordRequest;
import com.company.hrm.auth.dto.request.LoginRequest;
import com.company.hrm.auth.dto.request.ResetPasswordRequest;
import com.company.hrm.auth.dto.request.VerifyOtpRequest;
import com.company.hrm.auth.dto.response.ApiResponse;
import com.company.hrm.auth.dto.response.LoginResponse;
import com.company.hrm.auth.dto.response.TokenRefreshResponse;
import com.company.hrm.auth.dto.response.UserSummaryResponse;
import com.company.hrm.auth.dto.response.VerifyOtpResponse;
import com.company.hrm.auth.security.SecurityUtils;
import com.company.hrm.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Các API xác thực, phiên làm việc và quản lý mật khẩu")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập hệ thống", description = "Xác thực email và mật khẩu, trả về accessToken và lưu refreshToken vào cookie")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResponse loginResponse = authService.login(request, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", loginResponse));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Làm mới access token", description = "Đọc refreshToken từ cookie và cấp phát accessToken mới")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        TokenRefreshResponse tokenResponse = authService.refreshToken(refreshToken, response);
        return ResponseEntity.ok(ApiResponse.success("Làm mới token thành công", tokenResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất tài khoản", description = "Không cần xác thực: thu hồi refresh token trong cookie và xóa cookie, "
            + "đưa access token vào blacklist nếu có gửi kèm và còn hợp lệ. Luôn trả 200 để đăng xuất được cả khi phiên đã bị thu hồi")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(authHeader, refreshToken, response);
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy thông tin người dùng hiện tại", description = "Trả về thông tin chi tiết của tài khoản đang đăng nhập")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser() {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        UserSummaryResponse userInfo = authService.getCurrentUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Yêu cầu quên mật khẩu", description = "Gửi mã xác thực OTP qua email để đặt lại mật khẩu")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Nếu email tồn tại trong hệ thống, mã xác thực OTP đã được gửi đến hộp thư của bạn.", null));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Xác thực mã OTP", description = "Kiểm tra mã OTP và trả về reset token để thực hiện đổi mật khẩu")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        VerifyOtpResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Xác thực OTP thành công", response));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Đặt lại mật khẩu mới", description = "Sử dụng reset token hợp lệ để cập nhật mật khẩu mới")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công", null));
    }

    @PutMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Đổi mật khẩu", description = "Cập nhật mật khẩu mới sau khi xác thực mật khẩu hiện tại")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        UUID currentUserId = SecurityUtils.getCurrentUserId();
        authService.changePassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }
}
