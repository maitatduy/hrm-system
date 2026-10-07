package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.config.RateLimitProperties;
import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

/**
 * Giới hạn tần suất đăng nhập sai theo ba bộ đếm, mỗi bộ chặn một kiểu tấn công:
 * <ul>
 *     <li>Email và IP: dò mật khẩu của một tài khoản từ một nguồn. Chỉ khóa đúng nguồn đó, nên người khác không thể
 *     cố tình nhập sai để khóa đăng nhập của chủ tài khoản đang ở IP khác.</li>
 *     <li>IP: dò một mật khẩu trên nhiều email (password spraying) từ một nguồn.</li>
 *     <li>Email trên mọi IP: dò một tài khoản từ nhiều IP. Ngưỡng đặt cao để việc cố tình khóa tài khoản người khác
 *     phải dùng nhiều IP và nhiều lần thử.</li>
 * </ul>
 * Áp dụng cả cho email không tồn tại để không lộ thông tin tài khoản. Yêu cầu gửi OTP được giới hạn theo email
 * (chờ giữa hai lần gửi) và theo IP (chống spam email OTP tới nhiều địa chỉ). Ngưỡng nằm ở {@link RateLimitProperties}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitServiceImpl implements RateLimitService {

    static final String LOGIN_FAIL_PAIR_PREFIX = "auth:login:fail:pair:";
    static final String LOGIN_FAIL_IP_PREFIX = "auth:login:fail:ip:";
    static final String LOGIN_FAIL_EMAIL_PREFIX = "auth:login:fail:email:";
    static final String OTP_COOLDOWN_PREFIX = "auth:otp:cooldown:";
    static final String OTP_REQUESTS_IP_PREFIX = "auth:otp:requests:ip:";

    static final String PAIR_LIMIT_MESSAGE = "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau %s.";
    static final String IP_LIMIT_MESSAGE = "Có quá nhiều lần đăng nhập thất bại từ mạng của bạn. Vui lòng thử lại sau %s.";
    static final String EMAIL_LIMIT_MESSAGE = "Tài khoản này đang tạm thời bị giới hạn đăng nhập do có nhiều lần thử sai. "
            + "Vui lòng thử lại sau hoặc dùng chức năng quên mật khẩu.";
    static final String OTP_COOLDOWN_MESSAGE = "Vui lòng chờ %s trước khi yêu cầu mã OTP mới.";
    static final String OTP_IP_LIMIT_MESSAGE = "Có quá nhiều yêu cầu gửi mã OTP từ mạng của bạn. Vui lòng thử lại sau.";

    private final StringRedisTemplate redisTemplate;
    private final RateLimitProperties limits;

    @Override
    public void checkLoginAllowed(String email, String clientIp) {
        List<String> counts = redisTemplate.opsForValue().multiGet(List.of(
                pairKey(email, clientIp), ipKey(clientIp), emailKey(email)));
        if (counts == null) {
            return;
        }
        if (reached(counts.get(0), limits.loginPairMaxFailures())) {
            throw new TooManyRequestsException(PAIR_LIMIT_MESSAGE.formatted(humanize(limits.loginPairWindow())));
        }
        if (reached(counts.get(1), limits.loginIpMaxFailures())) {
            throw new TooManyRequestsException(IP_LIMIT_MESSAGE.formatted(humanize(limits.loginIpWindow())));
        }
        if (reached(counts.get(2), limits.loginEmailMaxFailures())) {
            throw new TooManyRequestsException(EMAIL_LIMIT_MESSAGE);
        }
    }

    @Override
    public void recordLoginFailure(String email, String clientIp) {
        long pairFailures = increment(pairKey(email, clientIp), limits.loginPairWindow());
        long ipFailures = increment(ipKey(clientIp), limits.loginIpWindow());
        long emailFailures = increment(emailKey(email), limits.loginEmailWindow());

        if (ipFailures == limits.loginIpMaxFailures()) {
            log.warn("IP {} đăng nhập sai {} lần trong {}, có thể đang dò mật khẩu trên nhiều tài khoản",
                    clientIp, ipFailures, humanize(limits.loginIpWindow()));
        }
        if (emailFailures == limits.loginEmailMaxFailures()) {
            log.warn("Email {} đăng nhập sai {} lần từ nhiều nguồn trong {}, tạm giới hạn đăng nhập",
                    email, emailFailures, humanize(limits.loginEmailWindow()));
        } else if (pairFailures == limits.loginPairMaxFailures()) {
            log.warn("Email {} đăng nhập sai {} lần từ IP {}, tạm khóa đăng nhập từ IP này trong {}",
                    email, pairFailures, clientIp, humanize(limits.loginPairWindow()));
        }
    }

    /**
     * Không xóa bộ đếm theo IP: nếu xóa, kẻ dò mật khẩu trên nhiều email chỉ cần đăng nhập đúng một tài khoản của
     * chính mình là xóa được dấu vết.
     */
    @Override
    public void resetLoginFailures(String email, String clientIp) {
        redisTemplate.delete(List.of(pairKey(email, clientIp), emailKey(email)));
    }

    @Override
    public void acquireOtpRequestSlot(String email, String clientIp) {
        if (reached(redisTemplate.opsForValue().get(otpIpKey(clientIp)), limits.otpIpMaxRequests())) {
            throw new TooManyRequestsException(OTP_IP_LIMIT_MESSAGE);
        }
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(OTP_COOLDOWN_PREFIX + email, "1", limits.otpCooldown());
        if (!Boolean.TRUE.equals(acquired)) {
            throw new TooManyRequestsException(OTP_COOLDOWN_MESSAGE.formatted(humanize(limits.otpCooldown())));
        }
        long requests = increment(otpIpKey(clientIp), limits.otpIpWindow());
        if (requests == limits.otpIpMaxRequests()) {
            log.warn("IP {} đã yêu cầu {} mã OTP trong {}", clientIp, requests, humanize(limits.otpIpWindow()));
        }
    }

    /**
     * Tạo key kèm TTL trước rồi mới tăng: INCR giữ nguyên TTL đã có, nên không bao giờ có bộ đếm thiếu TTL khóa vĩnh
     * viễn như khi INCR rồi mới EXPIRE mà tiến trình dừng giữa hai lệnh.
     */
    private long increment(String key, Duration window) {
        redisTemplate.opsForValue().setIfAbsent(key, "0", window);
        Long value = redisTemplate.opsForValue().increment(key);
        return value == null ? 0L : value;
    }

    private static boolean reached(String count, int limit) {
        return count != null && Long.parseLong(count) >= limit;
    }

    /** "15 phút", "1 giờ", "60 giây" cho thông báo hiển thị và log. */
    static String humanize(Duration duration) {
        if (duration.toSeconds() <= 60) {
            return duration.toSeconds() + " giây";
        }
        if (duration.toMinutes() < 60 || duration.toMinutesPart() != 0) {
            return duration.toMinutes() + " phút";
        }
        return duration.toHours() + " giờ";
    }

    private static String pairKey(String email, String clientIp) {
        return LOGIN_FAIL_PAIR_PREFIX + email + ":" + clientIp;
    }

    private static String ipKey(String clientIp) {
        return LOGIN_FAIL_IP_PREFIX + clientIp;
    }

    private static String emailKey(String email) {
        return LOGIN_FAIL_EMAIL_PREFIX + email;
    }

    private static String otpIpKey(String clientIp) {
        return OTP_REQUESTS_IP_PREFIX + clientIp;
    }
}
