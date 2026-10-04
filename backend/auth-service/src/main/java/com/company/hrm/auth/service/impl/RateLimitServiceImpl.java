package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.service.RateLimitService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Giới hạn tần suất theo email, áp dụng cho cả email không tồn tại để không lộ thông tin tài khoản.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimitServiceImpl implements RateLimitService {

    private static final String REDIS_LOGIN_FAIL_PREFIX = "auth:login:fail:";
    private static final String REDIS_OTP_COOLDOWN_PREFIX = "auth:otp:cooldown:";

    private static final int MAX_LOGIN_FAILURES = 5;
    private static final Duration LOGIN_LOCK_WINDOW = Duration.ofMinutes(15);
    private static final Duration OTP_REQUEST_COOLDOWN = Duration.ofSeconds(60);

    private final StringRedisTemplate redisTemplate;

    @Override
    public void checkLoginAllowed(String email) {
        String value = redisTemplate.opsForValue().get(REDIS_LOGIN_FAIL_PREFIX + email);
        if (value != null && Integer.parseInt(value) >= MAX_LOGIN_FAILURES) {
            throw new TooManyRequestsException("Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.");
        }
    }

    @Override
    public void recordLoginFailure(String email) {
        String key = REDIS_LOGIN_FAIL_PREFIX + email;
        Long failures = redisTemplate.opsForValue().increment(key);
        if (failures != null && failures == 1) {
            redisTemplate.expire(key, LOGIN_LOCK_WINDOW);
        }
        if (failures != null && failures >= MAX_LOGIN_FAILURES) {
            log.warn("Email {} đăng nhập sai {} lần, tạm khóa đăng nhập trong {} phút", email, failures, LOGIN_LOCK_WINDOW.toMinutes());
        }
    }

    @Override
    public void resetLoginFailures(String email) {
        redisTemplate.delete(REDIS_LOGIN_FAIL_PREFIX + email);
    }

    @Override
    public void acquireOtpRequestSlot(String email) {
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(REDIS_OTP_COOLDOWN_PREFIX + email, "1", OTP_REQUEST_COOLDOWN);
        if (!Boolean.TRUE.equals(acquired)) {
            throw new TooManyRequestsException("Vui lòng chờ 60 giây trước khi yêu cầu mã OTP mới.");
        }
    }
}
