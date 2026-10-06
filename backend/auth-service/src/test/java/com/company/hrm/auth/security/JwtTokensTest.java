package com.company.hrm.auth.security;

import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokensTest {

    private static final String SECRET = "test-access-secret-at-least-32-bytes-long!!";

    @Test
    void rejectsRefreshSecretEqualToAccessSecret() {
        assertThatThrownBy(() -> new JwtTokens(SECRET, SECRET))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT_REFRESH_SECRET phải khác JWT_SECRET");
    }

    @Test
    void rejectsRefreshSecretShorterThan256Bits() {
        assertThatThrownBy(() -> new JwtTokens(SECRET, "too-short"))
                .isInstanceOf(WeakKeyException.class);
    }
}
