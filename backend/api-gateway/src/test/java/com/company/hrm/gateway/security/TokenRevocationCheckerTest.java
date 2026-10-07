package com.company.hrm.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TokenRevocationCheckerTest {

    private static final String USER_ID = "user-1";

    private ReactiveStringRedisTemplate redisTemplate;
    private ReactiveValueOperations<String, String> valueOperations;
    private TokenRevocationChecker checker;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        redisTemplate = mock(ReactiveStringRedisTemplate.class);
        valueOperations = mock(ReactiveValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.hasKey(anyString())).thenReturn(Mono.just(false));
        when(valueOperations.get(anyString())).thenReturn(Mono.empty());
        checker = new TokenRevocationChecker(redisTemplate);
    }

    private static Claims claims(String jti, Long version) {
        var builder = Jwts.claims().id(jti).subject(USER_ID);
        if (version != null) {
            builder.add("token_version", version);
        }
        return builder.build();
    }

    @Test
    void activeTokenOfUserWithoutRevocation() {
        StepVerifier.create(checker.isRevoked(claims("jti-1", 0L))).expectNext(false).verifyComplete();
    }

    @Test
    void loggedOutTokenIsRevoked() {
        when(redisTemplate.hasKey("auth:blacklist:jti-1")).thenReturn(Mono.just(true));

        StepVerifier.create(checker.isRevoked(claims("jti-1", 0L))).expectNext(true).verifyComplete();
    }

    @Test
    void tokenFromBeforeSessionRevocationIsRevoked() {
        when(valueOperations.get("auth:token-version:" + USER_ID)).thenReturn(Mono.just("2"));

        StepVerifier.create(checker.isRevoked(claims("jti-1", 1L))).expectNext(true).verifyComplete();
        StepVerifier.create(checker.isRevoked(claims("jti-1", null))).expectNext(true).verifyComplete();
        StepVerifier.create(checker.isRevoked(claims("jti-1", 2L))).expectNext(false).verifyComplete();
    }

    @Test
    void redisErrorsPropagateSoTheFilterCanFailClosed() {
        when(valueOperations.get(anyString())).thenReturn(Mono.error(new IllegalStateException("Redis down")));

        StepVerifier.create(checker.isRevoked(claims("jti-1", 0L))).expectError(IllegalStateException.class).verify();
    }
}
