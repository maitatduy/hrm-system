package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.config.RateLimitProperties;
import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.security.ClientIpResolver;
import com.company.hrm.auth.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import static com.company.hrm.auth.util.LogMasking.maskEmail;

/**
 * Giới hạn tần suất đăng nhập theo ba bộ đếm, mỗi bộ chặn một kiểu tấn công:
 * <ul>
 *     <li>Email và IP: dò mật khẩu của một tài khoản từ một nguồn. Chỉ khóa đúng nguồn đó, nên người khác không thể
 *     cố tình nhập sai để khóa đăng nhập của chủ tài khoản đang ở IP khác.</li>
 *     <li>IP: dò một mật khẩu trên nhiều email (password spraying) từ một nguồn.</li>
 *     <li>Email trên mọi IP: dò một tài khoản từ nhiều IP. Ngưỡng đặt cao để việc cố tình khóa tài khoản người khác
 *     phải dùng nhiều IP và nhiều lần thử.</li>
 * </ul>
 * Mỗi lần thử chiếm một suất trước khi kiểm tra mật khẩu, đúng mật khẩu thì trả lại suất. Kiểm tra, tăng và đặt TTL
 * chạy trong cùng một Lua script nên vừa atomic giữa các request song song, vừa không bao giờ để lại bộ đếm thiếu TTL.
 * Áp dụng cả cho email không tồn tại để không lộ thông tin tài khoản. Ngưỡng nằm ở {@link RateLimitProperties}.
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

    /**
     * Tăng lần lượt từng bộ đếm trong KEYS (ARGV theo cặp: TTL mili giây, ngưỡng) và dừng ở bộ đếm đầu tiên vượt
     * ngưỡng, không tăng các bộ đếm sau nó. Nhờ vậy request đã bị chặn ở bộ đếm theo cặp email và IP không làm tăng
     * bộ đếm theo email, tức là một IP không thể làm đầy bộ đếm chung của email để khóa chủ tài khoản ở IP khác.
     * TTL được đặt khi key vừa tạo hoặc đang thiếu TTL. Trả về {vị trí bộ đếm vượt ngưỡng hoặc 0, giá trị của nó}.
     */
    static final RedisScript<List> CONSUME_IN_ORDER = new DefaultRedisScript<>("""
            for i, key in ipairs(KEYS) do
                local value = redis.call('INCR', key)
                if value == 1 or redis.call('PTTL', key) == -1 then
                    redis.call('PEXPIRE', key, ARGV[2 * i - 1])
                end
                if value > tonumber(ARGV[2 * i]) then
                    return {i, value}
                end
            end
            return {0, 0}
            """, List.class);

    /** Một bộ đếm: key, cửa sổ thời gian và số lần tối đa trong cửa sổ. */
    private record Counter(String key, Duration window, int max) {
    }

    /** Bộ đếm vượt ngưỡng (vị trí tính từ 1, 0 nếu không có) và giá trị của nó sau khi tăng. */
    private record Exceeded(int position, long count) {
    }

    /** Xóa KEYS[1], KEYS[2] và giảm KEYS[3] đi 1 nếu còn lớn hơn 0 (DECR giữ nguyên TTL đang có). */
    static final RedisScript<Long> RELEASE_LOGIN_ATTEMPT = new DefaultRedisScript<>("""
            redis.call('DEL', KEYS[1], KEYS[2])
            local value = tonumber(redis.call('GET', KEYS[3]) or '0')
            if value > 0 then
                return redis.call('DECR', KEYS[3])
            end
            return 0
            """, Long.class);

    private final StringRedisTemplate redisTemplate;
    private final RateLimitProperties limits;

    @Override
    public void consumeLoginAttempt(String email, String clientIp) {
        Exceeded exceeded = consumeInOrder(
                new Counter(pairKey(email, clientIp), limits.loginPairWindow(), limits.loginPairMaxFailures()),
                new Counter(ipKey(clientIp), limits.loginIpWindow(), limits.loginIpMaxFailures()),
                new Counter(emailKey(email), limits.loginEmailWindow(), limits.loginEmailMaxFailures()));
        // Chỉ ghi log ở lần đầu vượt ngưỡng trong cửa sổ, các lần bị chặn sau đó không lặp lại cảnh báo
        switch (exceeded.position()) {
            case 1 -> {
                if (exceeded.count() == limits.loginPairMaxFailures() + 1L) {
                    log.warn("Email {} đăng nhập sai {} lần từ IP {}, tạm chặn đăng nhập từ IP này trong {}",
                            maskEmail(email), limits.loginPairMaxFailures(), clientIp, humanize(limits.loginPairWindow()));
                }
                throw new TooManyRequestsException(PAIR_LIMIT_MESSAGE.formatted(humanize(limits.loginPairWindow())));
            }
            case 2 -> {
                if (exceeded.count() == limits.loginIpMaxFailures() + 1L) {
                    log.warn("IP {} đăng nhập sai {} lần trong {}, có thể đang dò mật khẩu trên nhiều tài khoản",
                            clientIp, limits.loginIpMaxFailures(), humanize(limits.loginIpWindow()));
                }
                throw new TooManyRequestsException(IP_LIMIT_MESSAGE.formatted(humanize(limits.loginIpWindow())));
            }
            case 3 -> {
                if (exceeded.count() == limits.loginEmailMaxFailures() + 1L) {
                    log.warn("Email {} đăng nhập sai {} lần từ nhiều nguồn trong {}, tạm giới hạn đăng nhập",
                            maskEmail(email), limits.loginEmailMaxFailures(), humanize(limits.loginEmailWindow()));
                }
                throw new TooManyRequestsException(EMAIL_LIMIT_MESSAGE);
            }
            default -> {
                // Chưa vượt ngưỡng nào, request được kiểm tra mật khẩu
            }
        }
    }

    @Override
    public void releaseLoginAttempt(String email, String clientIp) {
        redisTemplate.execute(RELEASE_LOGIN_ATTEMPT, List.of(pairKey(email, clientIp), emailKey(email), ipKey(clientIp)));
    }

    @Override
    public void acquireOtpRequestSlot(String email, String clientIp) {
        Exceeded exceeded = consumeInOrder(
                new Counter(otpIpKey(clientIp), limits.otpIpWindow(), limits.otpIpMaxRequests()));
        if (exceeded.position() != 0) {
            if (exceeded.count() == limits.otpIpMaxRequests() + 1L) {
                log.warn("IP {} đã yêu cầu quá {} mã OTP trong {}", clientIp, limits.otpIpMaxRequests(),
                        humanize(limits.otpIpWindow()));
            }
            throw new TooManyRequestsException(OTP_IP_LIMIT_MESSAGE);
        }
        // SET NX EX là một lệnh atomic, chỉ một request đồng thời cho cùng email lấy được suất gửi
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(OTP_COOLDOWN_PREFIX + email, "1", limits.otpCooldown());
        if (!Boolean.TRUE.equals(acquired)) {
            throw new TooManyRequestsException(OTP_COOLDOWN_MESSAGE.formatted(humanize(limits.otpCooldown())));
        }
    }

    /** Chạy CONSUME_IN_ORDER trong một lần gọi Redis, atomic với mọi request khác. */
    @SuppressWarnings("unchecked")
    private Exceeded consumeInOrder(Counter... counters) {
        List<String> keys = new ArrayList<>(counters.length);
        Object[] args = new Object[counters.length * 2];
        for (int i = 0; i < counters.length; i++) {
            keys.add(counters[i].key());
            args[2 * i] = String.valueOf(counters[i].window().toMillis());
            args[2 * i + 1] = String.valueOf(counters[i].max());
        }
        List<Long> result = redisTemplate.execute(CONSUME_IN_ORDER, keys, args);
        if (result == null || result.size() != 2) {
            throw new IllegalStateException("Redis không trả về kết quả rate limit");
        }
        return new Exceeded(result.get(0).intValue(), result.get(1));
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
        return LOGIN_FAIL_PAIR_PREFIX + email + ":" + ClientIpResolver.rateLimitSubject(clientIp);
    }

    private static String ipKey(String clientIp) {
        return LOGIN_FAIL_IP_PREFIX + ClientIpResolver.rateLimitSubject(clientIp);
    }

    private static String emailKey(String email) {
        return LOGIN_FAIL_EMAIL_PREFIX + email;
    }

    private static String otpIpKey(String clientIp) {
        return OTP_REQUESTS_IP_PREFIX + ClientIpResolver.rateLimitSubject(clientIp);
    }
}
