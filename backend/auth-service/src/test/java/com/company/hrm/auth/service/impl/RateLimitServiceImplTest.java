package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.config.RateLimitProperties;
import com.company.hrm.auth.exception.TooManyRequestsException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** Redis được thay bằng một Map trong bộ nhớ để mô phỏng đúng từng kiểu tấn công qua nhiều lần đăng nhập. */
class RateLimitServiceImplTest {

    private static final String VICTIM = "victim@hrm.vn";
    private static final String ATTACKER_IP = "198.51.100.1";
    private static final String OWNER_IP = "203.0.113.7";
    private static final RateLimitProperties LIMITS = RateLimitProperties.defaults();

    private final Map<String, String> redis = new HashMap<>();
    private ValueOperations<String, String> valueOperations;
    private RateLimitServiceImpl rateLimitService;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenAnswer(invocation -> redis.get(invocation.<String>getArgument(0)));
        when(valueOperations.multiGet(anyList())).thenAnswer(invocation ->
                invocation.<List<String>>getArgument(0).stream().map(redis::get).toList());
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenAnswer(invocation ->
                redis.putIfAbsent(invocation.getArgument(0), invocation.getArgument(1)) == null);
        when(valueOperations.increment(anyString())).thenAnswer(invocation ->
                Long.parseLong(redis.merge(invocation.getArgument(0), "1",
                        (current, one) -> String.valueOf(Long.parseLong(current) + 1))));
        when(redisTemplate.delete(anyCollection())).thenAnswer(invocation -> {
            Collection<String> keys = invocation.getArgument(0);
            keys.forEach(redis::remove);
            return (long) keys.size();
        });
        rateLimitService = new RateLimitServiceImpl(redisTemplate, LIMITS);
    }

    private void fail(String email, String ip, int times) {
        for (int i = 0; i < times; i++) {
            rateLimitService.recordLoginFailure(email, ip);
        }
    }

    @Test
    void attackerCannotLockTheOwnerOutFromAnotherIp() {
        fail(VICTIM, ATTACKER_IP, LIMITS.loginPairMaxFailures());

        assertThatThrownBy(() -> rateLimitService.checkLoginAllowed(VICTIM, ATTACKER_IP))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessage(RateLimitServiceImpl.PAIR_LIMIT_MESSAGE.formatted("15 phút"));
        // Chủ tài khoản ở IP khác vẫn đăng nhập được
        assertThatCode(() -> rateLimitService.checkLoginAllowed(VICTIM, OWNER_IP)).doesNotThrowAnyException();
    }

    @Test
    void passwordSprayingFromOneIpIsBlocked() {
        // Mỗi email chỉ sai 1 lần, không email nào chạm ngưỡng riêng
        for (int i = 0; i < LIMITS.loginIpMaxFailures(); i++) {
            rateLimitService.recordLoginFailure("user" + i + "@hrm.vn", ATTACKER_IP);
        }

        assertThatThrownBy(() -> rateLimitService.checkLoginAllowed("another@hrm.vn", ATTACKER_IP))
                .hasMessage(RateLimitServiceImpl.IP_LIMIT_MESSAGE.formatted("15 phút"));
        assertThatCode(() -> rateLimitService.checkLoginAllowed("another@hrm.vn", OWNER_IP)).doesNotThrowAnyException();
    }

    @Test
    void distributedAttackOnOneAccountIsEventuallyLimited() {
        // Mỗi IP chỉ sai 1 lần, không IP nào chạm ngưỡng riêng
        for (int i = 0; i < LIMITS.loginEmailMaxFailures(); i++) {
            rateLimitService.recordLoginFailure(VICTIM, "198.51.100." + i);
        }

        assertThatThrownBy(() -> rateLimitService.checkLoginAllowed(VICTIM, "192.0.2.1"))
                .hasMessage(RateLimitServiceImpl.EMAIL_LIMIT_MESSAGE);
    }

    @Test
    void successfulLoginClearsEmailCountersButNotTheIpCounter() {
        for (int i = 0; i < LIMITS.loginIpMaxFailures() - 1; i++) {
            rateLimitService.recordLoginFailure("user" + i + "@hrm.vn", ATTACKER_IP);
        }

        // Kẻ tấn công đăng nhập đúng tài khoản của chính mình cũng không xóa được dấu vết dò mật khẩu
        rateLimitService.resetLoginFailures("own-account@hrm.vn", ATTACKER_IP);
        rateLimitService.recordLoginFailure("next@hrm.vn", ATTACKER_IP);

        assertThatThrownBy(() -> rateLimitService.checkLoginAllowed("any@hrm.vn", ATTACKER_IP))
                .hasMessage(RateLimitServiceImpl.IP_LIMIT_MESSAGE.formatted("15 phút"));
    }

    @Test
    void successfulLoginClearsThePairCounterOfThatEmail() {
        fail(VICTIM, OWNER_IP, LIMITS.loginPairMaxFailures() - 1);

        rateLimitService.resetLoginFailures(VICTIM, OWNER_IP);
        fail(VICTIM, OWNER_IP, LIMITS.loginPairMaxFailures() - 1);

        assertThatCode(() -> rateLimitService.checkLoginAllowed(VICTIM, OWNER_IP)).doesNotThrowAnyException();
    }

    @Test
    void counterIsCreatedWithTtlBeforeBeingIncremented() {
        rateLimitService.recordLoginFailure(VICTIM, ATTACKER_IP);

        String pairKey = RateLimitServiceImpl.LOGIN_FAIL_PAIR_PREFIX + VICTIM + ":" + ATTACKER_IP;
        InOrder order = inOrder(valueOperations);
        order.verify(valueOperations).setIfAbsent(eq(pairKey), eq("0"), eq(LIMITS.loginPairWindow()));
        order.verify(valueOperations).increment(pairKey);
    }

    @Test
    void otpRequestsAreLimitedPerEmailAndPerIp() {
        rateLimitService.acquireOtpRequestSlot(VICTIM, OWNER_IP);
        assertThatThrownBy(() -> rateLimitService.acquireOtpRequestSlot(VICTIM, OWNER_IP))
                .hasMessage(RateLimitServiceImpl.OTP_COOLDOWN_MESSAGE.formatted("60 giây"));

        // Spam email OTP tới nhiều địa chỉ từ một IP
        for (int i = 0; i < LIMITS.otpIpMaxRequests(); i++) {
            rateLimitService.acquireOtpRequestSlot("target" + i + "@hrm.vn", ATTACKER_IP);
        }
        assertThatThrownBy(() -> rateLimitService.acquireOtpRequestSlot("one-more@hrm.vn", ATTACKER_IP))
                .hasMessage(RateLimitServiceImpl.OTP_IP_LIMIT_MESSAGE);
        assertThatCode(() -> rateLimitService.acquireOtpRequestSlot("one-more@hrm.vn", OWNER_IP))
                .doesNotThrowAnyException();
    }
}
