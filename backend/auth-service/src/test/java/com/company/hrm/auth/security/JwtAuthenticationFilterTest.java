package com.company.hrm.auth.security;

import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    private static final JwtTokens JWT_TOKENS = new JwtTokens(
            "test-access-secret-at-least-32-bytes-long!!", "test-refresh-secret-at-least-32-bytes-long!");
    private static final String USER_ID = UUID.randomUUID().toString();

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private TokenVersionStore tokenVersionStore;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(redisTemplate, JWT_TOKENS, tokenVersionStore);
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesAccessToken() throws Exception {
        when(tokenVersionStore.matches(eq(USER_ID), any())).thenReturn(true);

        MockHttpServletRequest request = runFilter(token(JWT_TOKENS.accessKey(), JwtTokens.ACCESS_TYPE));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getPrincipal()).isEqualTo(USER_ID);
        assertThat(authentication.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
        assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE)).isNull();
    }

    @Test
    void rejectsAccessTokenIssuedBeforeSessionsWereRevoked() throws Exception {
        when(tokenVersionStore.matches(eq(USER_ID), any())).thenReturn(false);

        MockHttpServletRequest request = runFilter(token(JWT_TOKENS.accessKey(), JwtTokens.ACCESS_TYPE));

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE))
                .isEqualTo("Phiên đăng nhập đã hết hiệu lực, vui lòng đăng nhập lại");
    }

    @Test
    void rejectsRefreshTokenUsedAsBearer() throws Exception {
        MockHttpServletRequest request = runFilter(token(JWT_TOKENS.refreshKey(), JwtTokens.REFRESH_TYPE));

        assertRejected(request);
    }

    @Test
    void rejectsTokenSignedWithAccessKeyButTypedAsRefresh() throws Exception {
        MockHttpServletRequest request = runFilter(token(JWT_TOKENS.accessKey(), JwtTokens.REFRESH_TYPE));

        assertRejected(request);
    }

    @Test
    void rejectsTokenWithoutTypeClaim() throws Exception {
        MockHttpServletRequest request = runFilter(token(JWT_TOKENS.accessKey(), null));

        assertRejected(request);
    }

    private MockHttpServletRequest runFilter(String token) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());
        return request;
    }

    private void assertRejected(MockHttpServletRequest request) {
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(request.getAttribute(JwtAuthenticationFilter.AUTH_ERROR_ATTRIBUTE))
                .isEqualTo("Access token không hợp lệ");
    }

    private String token(SecretKey key, String type) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(USER_ID)
                .claim("role", "ADMIN")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(15, ChronoUnit.MINUTES)));
        if (type != null) {
            builder.claim(JwtTokens.TYPE_CLAIM, type);
        }
        return builder.signWith(key).compact();
    }
}
