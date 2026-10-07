package com.company.hrm.auth.service.impl;

import com.company.hrm.auth.exception.BadRequestException;
import com.company.hrm.auth.mapper.UserMapper;
import com.company.hrm.auth.repository.UserRepository;
import com.company.hrm.auth.security.JwtTokens;
import com.company.hrm.auth.security.OtpHasher;
import com.company.hrm.auth.security.TokenVersionStore;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Reset token chỉ dùng được một lần, kể cả khi nhiều request cùng gửi một token. Cần Redis thật vì tính atomic của
 * GETDEL không kiểm chứng được bằng mock. Chạy khi có biến môi trường {@code TEST_REDIS_HOST}, giống
 * RateLimitServiceImplRedisTest.
 */
@EnabledIfEnvironmentVariable(named = "TEST_REDIS_HOST", matches = ".+")
class TokenServiceImplRedisTest {

    private static LettuceConnectionFactory connectionFactory;
    private static StringRedisTemplate redis;
    private static TokenServiceImpl tokenService;

    @BeforeAll
    static void connect() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(
                System.getenv("TEST_REDIS_HOST"),
                Integer.parseInt(System.getenv().getOrDefault("TEST_REDIS_PORT", "6379")));
        config.setDatabase(15);
        connectionFactory = new LettuceConnectionFactory(config);
        connectionFactory.afterPropertiesSet();
        connectionFactory.start();
        redis = new StringRedisTemplate(connectionFactory);
        tokenService = new TokenServiceImpl(
                redis,
                mock(UserRepository.class),
                mock(UserMapper.class),
                new JwtTokens("test-access-secret-at-least-32-bytes-long!!", "test-refresh-secret-at-least-32-bytes-long!"),
                new OtpHasher("test-refresh-secret-at-least-32-bytes-long!"),
                new TokenVersionStore(redis));
    }

    @AfterAll
    static void disconnect() {
        connectionFactory.destroy();
    }

    @Test
    void resetTokenIsUsableExactlyOnceUnderConcurrentRequests() throws Exception {
        String token = "test-" + UUID.randomUUID();
        redis.opsForValue().set("auth:reset:" + token, "user@hrm.vn", 15, TimeUnit.MINUTES);

        ExecutorService executor = Executors.newFixedThreadPool(50);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<Boolean>> results = new ArrayList<>();
            for (int i = 0; i < 50; i++) {
                results.add(executor.submit(() -> {
                    start.await();
                    try {
                        return "user@hrm.vn".equals(tokenService.consumeResetToken(token));
                    } catch (BadRequestException e) {
                        return false;
                    }
                }));
            }
            start.countDown();
            long succeeded = 0;
            for (Future<Boolean> result : results) {
                if (result.get(30, TimeUnit.SECONDS)) {
                    succeeded++;
                }
            }

            assertThat(succeeded).isEqualTo(1);
            assertThat(redis.hasKey("auth:reset:" + token)).isFalse();
        } finally {
            executor.shutdownNow();
            redis.delete("auth:reset:" + token);
        }
    }
}
