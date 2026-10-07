package com.company.hrm.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

/**
 * Ngưỡng rate limit đăng nhập và gửi OTP, chỉnh được qua cấu hình {@code app.rate-limit.*} mà không cần sửa code.
 * <p>
 * Lưu ý khi chỉnh {@code login-ip-max-failures}: nhân viên trong cùng văn phòng thường dùng chung một IP công khai
 * (NAT). Ngưỡng quá thấp thì vài người gõ sai là cả văn phòng bị chặn đăng nhập; ngưỡng quá cao thì kém hiệu quả
 * trước việc dò một mật khẩu trên nhiều email.
 */
@ConfigurationProperties(prefix = "app.rate-limit")
public record RateLimitProperties(
        @DefaultValue("5") int loginPairMaxFailures,
        @DefaultValue("15m") Duration loginPairWindow,
        @DefaultValue("20") int loginIpMaxFailures,
        @DefaultValue("15m") Duration loginIpWindow,
        @DefaultValue("50") int loginEmailMaxFailures,
        @DefaultValue("1h") Duration loginEmailWindow,
        @DefaultValue("60s") Duration otpCooldown,
        @DefaultValue("10") int otpIpMaxRequests,
        @DefaultValue("1h") Duration otpIpWindow
) {

    /** Giá trị mặc định, dùng trong test. */
    public static RateLimitProperties defaults() {
        return new RateLimitProperties(
                5, Duration.ofMinutes(15),
                20, Duration.ofMinutes(15),
                50, Duration.ofHours(1),
                Duration.ofSeconds(60),
                10, Duration.ofHours(1)
        );
    }
}
