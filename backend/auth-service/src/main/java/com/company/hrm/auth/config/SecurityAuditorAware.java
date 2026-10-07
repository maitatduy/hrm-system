package com.company.hrm.auth.config;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Điền {@code created_by} và {@code updated_by} của entity: id của người dùng đã xác thực đang thực hiện thao tác
 * (principal do JwtAuthenticationFilter đặt), hoặc {@value #SYSTEM_AUDITOR} khi không có ai đăng nhập: tạo ADMIN lúc
 * khởi động, đặt lại mật khẩu bằng OTP, cập nhật thời điểm đăng nhập.
 */
@Component("auditorAware")
public class SecurityAuditorAware implements AuditorAware<String> {

    public static final String SYSTEM_AUDITOR = "system";

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.of(SYSTEM_AUDITOR);
        }
        return Optional.of(authentication.getName());
    }
}
