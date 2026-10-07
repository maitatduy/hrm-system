package com.company.hrm.gateway.security;

import org.springframework.http.server.PathContainer;
import org.springframework.stereotype.Component;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Đường nào không cần đăng nhập và đường nào chỉ một số role được vào, kiểm tra ngay tại gateway.
 * Service phía sau vẫn tự kiểm tra lại quyền, gateway chỉ là lớp chặn đầu tiên.
 */
@Component
public class RouteAccessPolicy {

    private static final PathPatternParser PARSER = PathPatternParser.defaultInstance;

    /**
     * Khớp đúng danh sách permitAll của auth-service SecurityConfig. So khớp chính xác từng đường, không dùng ** để
     * đường như /api/auth/login/../../accounts không lọt qua dưới danh nghĩa đường công khai.
     */
    private static final List<PathPattern> PUBLIC_PATHS = parse(
            "/api/auth/login",
            "/api/auth/refresh-token",
            "/api/auth/logout",
            "/api/auth/forgot-password",
            "/api/auth/verify-otp",
            "/api/auth/reset-password"
    );

    /**
     * Payroll chứa dữ liệu nhạy cảm, chỉ ADMIN và HR (AGENTS.md: kiểm tra ở cả gateway lẫn service).
     * Quản lý tài khoản chỉ ADMIN, khớp @PreAuthorize của AccountController ở auth-service.
     */
    private static final Map<List<PathPattern>, Set<String>> ROLE_RESTRICTED_PATHS = Map.of(
            parse("/api/payrolls/**", "/api/payslips/**"), Set.of("ADMIN", "HR"),
            parse("/api/accounts", "/api/accounts/**"), Set.of("ADMIN")
    );

    public boolean isPublic(String path) {
        PathContainer container = PathContainer.parsePath(path);
        return PUBLIC_PATHS.stream().anyMatch(pattern -> pattern.matches(container));
    }

    /** Các role được phép vào đường này, rỗng nếu mọi người dùng đã đăng nhập đều được vào. */
    public Optional<Set<String>> allowedRoles(String path) {
        PathContainer container = PathContainer.parsePath(path);
        return ROLE_RESTRICTED_PATHS.entrySet().stream()
                .filter(entry -> entry.getKey().stream().anyMatch(pattern -> pattern.matches(container)))
                .map(Map.Entry::getValue)
                .findFirst();
    }

    private static List<PathPattern> parse(String... patterns) {
        return Arrays.stream(patterns).map(PARSER::parse).toList();
    }
}
