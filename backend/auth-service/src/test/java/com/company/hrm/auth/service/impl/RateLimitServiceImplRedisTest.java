package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.config.RateLimitProperties;
import com.company.hrm.auth.exception.TooManyRequestsException;
import com.company.hrm.auth.security.ClientIpResolver;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.ThreadLocalRandom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Chạy RateLimitServiceImpl với Redis thật, vì các lỗi cần chặn (đếm không atomic giữa request song song, bộ đếm mất
 * TTL) chỉ lộ ra khi Lua script và INCR chạy trên Redis thật, mock không bắt được.
 * <p>
 * Cần biến môi trường {@code TEST_REDIS_HOST} (tùy chọn {@code TEST_REDIS_PORT}, mặc định 6379), không có thì bỏ qua.
 * Dùng database {@value #TEST_DATABASE} và key ngẫu nhiên theo từng lần chạy, chỉ xóa đúng các key của test.
 */
@EnabledIfEnvironmentVariable(named = "TEST_REDIS_HOST", matches = ".+")
class RateLimitServiceImplRedisTest {

    private static final int TEST_DATABASE = 15;
    private static final RateLimitProperties LIMITS = RateLimitProperties.defaults();
    private static final String RUN_ID = UUID.randomUUID().toString().substring(0, 8);

    private static LettuceConnectionFactory connectionFactory;
    private static StringRedisTemplate redis;
    private static RateLimitServiceImpl rateLimitService;

    @BeforeAll
    static void connect() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(
                System.getenv("TEST_REDIS_HOST"),
                Integer.parseInt(System.getenv().getOrDefault("TEST_REDIS_PORT", "6379")));
        config.setDatabase(TEST_DATABASE);
        connectionFactory = new LettuceConnectionFactory(config);
        connectionFactory.afterPropertiesSet();
        connectionFactory.start();
        redis = new StringRedisTemplate(connectionFactory);
        rateLimitService = new RateLimitServiceImpl(redis, LIMITS);
    }

    @AfterEach
    void deleteKeysOfThisRun() {
        // Key theo email chứa RUN_ID, key theo IP chứa 4 ký tự đầu của RUN_ID trong prefix IPv6 /64
        for (String pattern : List.of("auth:*" + RUN_ID + "*", "auth:*2001:0db8:" + RUN_ID.substring(0, 4) + ":*")) {
            Set<String> keys = redis.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redis.delete(keys);
            }
        }
    }

    @AfterAll
    static void disconnect() {
        connectionFactory.destroy();
    }

    /** Email và IP riêng cho từng test, đều chứa RUN_ID để dọn được sau khi chạy. */
    private static String email(String name) {
        return name + "-" + RUN_ID + "-" + ThreadLocalRandom.current().nextInt(1_000_000) + "@hrm.vn";
    }

    private static String ip() {
        // IPv4 không chứa được RUN_ID nên dùng key IPv6 dạng /64 có RUN_ID trong prefix
        return "2001:db8:" + RUN_ID.substring(0, 4) + ":" + Integer.toHexString(ThreadLocalRandom.current().nextInt(0xffff)) + "::1";
    }

    private static void failLogins(String email, String ip, int times) {
        for (int i = 0; i < times; i++) {
            rateLimitService.consumeLoginAttempt(email, ip);
        }
    }

    @Test
    void attackerCannotLockTheOwnerOutFromAnotherIp() {
        String victim = email("victim");
        String attackerIp = ip();
        failLogins(victim, attackerIp, LIMITS.loginPairMaxFailures());

        assertThatThrownBy(() -> rateLimitService.consumeLoginAttempt(victim, attackerIp))
                .isInstanceOf(TooManyRequestsException.class)
                .hasMessage(RateLimitServiceImpl.PAIR_LIMIT_MESSAGE.formatted("15 phút"));
        assertThatCode(() -> rateLimitService.consumeLoginAttempt(victim, ip())).doesNotThrowAnyException();
    }

    @Test
    void hammeringFromOneIpCannotFillTheAccountWideCounter() {
        String victim = email("victim");
        String attackerIp = ip();
        // Gấp bốn ngưỡng của email: các lần đã bị chặn ở bộ đếm theo cặp không được tính vào bộ đếm chung của email
        for (int i = 0; i < LIMITS.loginEmailMaxFailures() * 4; i++) {
            try {
                rateLimitService.consumeLoginAttempt(victim, attackerIp);
            } catch (TooManyRequestsException ignored) {
                // Bị chặn sau 5 lần là đúng
            }
        }

        assertThat(redis.opsForValue().get(RateLimitServiceImpl.LOGIN_FAIL_EMAIL_PREFIX + victim))
                .isEqualTo(String.valueOf(LIMITS.loginPairMaxFailures()));
        assertThatCode(() -> rateLimitService.consumeLoginAttempt(victim, ip())).doesNotThrowAnyException();
    }

    @Test
    void passwordSprayingFromOneIpIsBlocked() {
        String attackerIp = ip();
        for (int i = 0; i < LIMITS.loginIpMaxFailures(); i++) {
            rateLimitService.consumeLoginAttempt(email("spray" + i), attackerIp);
        }

        assertThatThrownBy(() -> rateLimitService.consumeLoginAttempt(email("next"), attackerIp))
                .hasMessage(RateLimitServiceImpl.IP_LIMIT_MESSAGE.formatted("15 phút"));
        assertThatCode(() -> rateLimitService.consumeLoginAttempt(email("next"), ip())).doesNotThrowAnyException();
    }

    @Test
    void distributedAttackOnOneAccountIsEventuallyLimited() {
        String victim = email("victim");
        for (int i = 0; i < LIMITS.loginEmailMaxFailures(); i++) {
            rateLimitService.consumeLoginAttempt(victim, ip());
        }

        assertThatThrownBy(() -> rateLimitService.consumeLoginAttempt(victim, ip()))
                .hasMessage(RateLimitServiceImpl.EMAIL_LIMIT_MESSAGE);
    }

    @Test
    void successfulLoginsDoNotFillTheIpCounterButCannotEraseFailures() {
        String officeIp = ip();
        // Cả văn phòng đăng nhập đúng nhiều lần qua cùng một IP: mỗi lần trả lại suất của chính mình
        for (int i = 0; i < LIMITS.loginIpMaxFailures() * 3; i++) {
            String employee = email("employee" + i);
            rateLimitService.consumeLoginAttempt(employee, officeIp);
            rateLimitService.releaseLoginAttempt(employee, officeIp);
        }
        assertThatCode(() -> rateLimitService.consumeLoginAttempt(email("late"), officeIp)).doesNotThrowAnyException();

        // Kẻ dò mật khẩu sai gần ngưỡng rồi đăng nhập đúng tài khoản của mình: chỉ trả lại một suất, không xóa dấu vết
        String attackerIp = ip();
        for (int i = 0; i < LIMITS.loginIpMaxFailures() - 1; i++) {
            rateLimitService.consumeLoginAttempt(email("spray" + i), attackerIp);
        }
        String own = email("own");
        rateLimitService.consumeLoginAttempt(own, attackerIp);
        rateLimitService.releaseLoginAttempt(own, attackerIp);
        rateLimitService.consumeLoginAttempt(email("one-more"), attackerIp);

        assertThatThrownBy(() -> rateLimitService.consumeLoginAttempt(email("blocked"), attackerIp))
                .hasMessage(RateLimitServiceImpl.IP_LIMIT_MESSAGE.formatted("15 phút"));
    }

    @Test
    void parallelAttemptsOnOneAccountNeverExceedTheLimit() throws Exception {
        String victim = email("victim");
        String attackerIp = ip();

        long allowed = runConcurrently(100, () -> rateLimitService.consumeLoginAttempt(victim, attackerIp));

        assertThat(allowed).isEqualTo(LIMITS.loginPairMaxFailures());
    }

    @Test
    void parallelSprayingFromOneIpNeverExceedsTheLimit() throws Exception {
        String attackerIp = ip();

        long allowed = runConcurrently(100, () -> rateLimitService.consumeLoginAttempt(email("spray"), attackerIp));

        assertThat(allowed).isEqualTo(LIMITS.loginIpMaxFailures());
    }

    @Test
    void parallelOtpRequestsFromOneIpNeverExceedTheLimit() throws Exception {
        String attackerIp = ip();

        long allowed = runConcurrently(50, () -> rateLimitService.acquireOtpRequestSlot(email("target"), attackerIp));

        assertThat(allowed).isEqualTo(LIMITS.otpIpMaxRequests());
    }

    @Test
    void counterNeverLosesItsTtlEvenWhenItExpiresMidOperation() {
        String victim = email("ttl");
        String key = RateLimitServiceImpl.LOGIN_FAIL_EMAIL_PREFIX + victim;
        String attackerIp = ip();
        // Bộ đếm còn đúng 1ms rồi tăng ngay: với cách SETNX rồi INCR cũ, key hết hạn giữa hai lệnh thì INCR tạo lại
        // key không có TTL. Lặp nhiều lần để thời điểm hết hạn rơi đúng vào khe đó.
        for (int i = 0; i < 2000; i++) {
            redis.opsForValue().set(key, "3", 1, TimeUnit.MILLISECONDS);
            try {
                rateLimitService.consumeLoginAttempt(victim, attackerIp);
            } catch (TooManyRequestsException ignored) {
                // Chạm ngưỡng theo cặp hoặc IP không ảnh hưởng điều đang kiểm tra
            }
            assertThat(redis.getExpire(key, TimeUnit.MILLISECONDS))
                    .as("bộ đếm mất TTL ở lần %d", i)
                    .isNotEqualTo(-1L);
            redis.delete(List.of(key,
                    RateLimitServiceImpl.LOGIN_FAIL_PAIR_PREFIX + victim + ":" + ClientIpResolver.rateLimitSubject(attackerIp),
                    RateLimitServiceImpl.LOGIN_FAIL_IP_PREFIX + ClientIpResolver.rateLimitSubject(attackerIp)));
        }
    }

    @Test
    void counterLeftWithoutTtlByOlderCodeIsRepaired() {
        String victim = email("legacy");
        String key = RateLimitServiceImpl.LOGIN_FAIL_EMAIL_PREFIX + victim;
        redis.opsForValue().set(key, "7");

        rateLimitService.consumeLoginAttempt(victim, ip());

        assertThat(redis.getExpire(key, TimeUnit.SECONDS)).isPositive();
    }

    /** Chạy cùng lúc {@code requests} lần, trả về số lần không bị chặn. */
    private static long runConcurrently(int requests, Runnable attempt) throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(requests);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<Boolean>> results = new ArrayList<>();
            for (int i = 0; i < requests; i++) {
                Callable<Boolean> task = () -> {
                    start.await();
                    try {
                        attempt.run();
                        return true;
                    } catch (TooManyRequestsException e) {
                        return false;
                    }
                };
                results.add(executor.submit(task));
            }
            start.countDown();
            long allowed = 0;
            for (Future<Boolean> result : results) {
                if (result.get(30, TimeUnit.SECONDS)) {
                    allowed++;
                }
            }
            return allowed;
        } finally {
            executor.shutdownNow();
        }
    }
}
