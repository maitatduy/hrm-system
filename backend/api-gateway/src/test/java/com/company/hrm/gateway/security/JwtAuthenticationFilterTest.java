package com.company.hrm.gateway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** Token trong test được tạo đúng định dạng auth-service cấp (TokenServiceImpl.createAccessToken). */
class JwtAuthenticationFilterTest {

    private static final String ACCESS_SECRET = "test-access-secret-at-least-32-bytes-long!!";
    private static final String REFRESH_SECRET = "test-refresh-secret-at-least-32-bytes-long!";
    private static final SecretKey ACCESS_KEY = Keys.hmacShaKeyFor(ACCESS_SECRET.getBytes(StandardCharsets.UTF_8));
    private static final SecretKey REFRESH_KEY = Keys.hmacShaKeyFor(REFRESH_SECRET.getBytes(StandardCharsets.UTF_8));
    private static final String USER_ID = UUID.randomUUID().toString();

    private TokenRevocationChecker revocationChecker;
    private JwtAuthenticationFilter filter;

    /** Ghi lại request mà gateway chuyển tới service, null nếu request bị chặn tại gateway. */
    private final AtomicReference<ServerWebExchange> forwarded = new AtomicReference<>();
    private final GatewayFilterChain chain = exchange -> {
        forwarded.set(exchange);
        return Mono.empty();
    };

    @BeforeEach
    void setUp() {
        revocationChecker = mock(TokenRevocationChecker.class);
        when(revocationChecker.isRevoked(any(Claims.class))).thenReturn(Mono.just(false));
        filter = new JwtAuthenticationFilter(
                new AccessTokenVerifier(ACCESS_SECRET),
                revocationChecker,
                new RouteAccessPolicy(),
                new GatewayErrorResponseWriter(new ObjectMapper())
        );
    }

    private static String token(SecretKey key, String type, String role, Instant expiresAt) {
        var builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(USER_ID)
                .claim("email", "user@hrm.vn")
                .claim("role", role)
                .claim("token_version", 0L)
                .issuedAt(Date.from(expiresAt.minus(15, ChronoUnit.MINUTES)))
                .expiration(Date.from(expiresAt));
        if (type != null) {
            builder.claim("token_type", type);
        }
        return builder.signWith(key).compact();
    }

    private static String accessToken(String role) {
        return token(ACCESS_KEY, "access", role, Instant.now().plus(15, ChronoUnit.MINUTES));
    }

    private MockServerWebExchange run(MockServerHttpRequest request) {
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();
        return exchange;
    }

    private static MockServerHttpRequest get(String path, String token) {
        MockServerHttpRequest.BaseBuilder<?> builder = MockServerHttpRequest.get(path);
        if (token != null) {
            builder.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return builder.build();
    }

    private void assertRejected(MockServerWebExchange exchange, HttpStatus status, String message) {
        assertThat(forwarded.get()).isNull();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(status);
        assertThat(exchange.getResponse().getBodyAsString().block()).contains("\"message\":\"" + message + "\"");
    }

    @Test
    void forwardsAuthenticatedRequestWithVerifiedIdentityHeaders() {
        run(get("/api/employees/123", accessToken("EMPLOYEE")));

        HttpHeaders headers = forwarded.get().getRequest().getHeaders();
        assertThat(headers.getFirst(JwtAuthenticationFilter.USER_ID_HEADER)).isEqualTo(USER_ID);
        assertThat(headers.getFirst(JwtAuthenticationFilter.USER_ROLE_HEADER)).isEqualTo("EMPLOYEE");
        assertThat(headers.getFirst(JwtAuthenticationFilter.USER_EMAIL_HEADER)).isEqualTo("user@hrm.vn");
        // Service vẫn nhận Authorization để tự kiểm tra lại
        assertThat(headers.getFirst(HttpHeaders.AUTHORIZATION)).startsWith("Bearer ");
    }

    @Test
    void replacesIdentityHeadersSpoofedByTheClient() {
        run(MockServerHttpRequest.get("/api/employees/123")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken("EMPLOYEE"))
                .header(JwtAuthenticationFilter.USER_ID_HEADER, "someone-else")
                .header(JwtAuthenticationFilter.USER_ROLE_HEADER, "ADMIN")
                .build());

        HttpHeaders headers = forwarded.get().getRequest().getHeaders();
        assertThat(headers.get(JwtAuthenticationFilter.USER_ID_HEADER)).containsExactly(USER_ID);
        assertThat(headers.get(JwtAuthenticationFilter.USER_ROLE_HEADER)).containsExactly("EMPLOYEE");
    }

    @Test
    void publicAuthEndpointsPassWithoutTokenAndWithoutSpoofedHeaders() {
        run(MockServerHttpRequest.post("/api/auth/login")
                .header(JwtAuthenticationFilter.USER_ROLE_HEADER, "ADMIN")
                .build());

        assertThat(forwarded.get()).isNotNull();
        assertThat(forwarded.get().getRequest().getHeaders().containsKey(JwtAuthenticationFilter.USER_ROLE_HEADER))
                .isFalse();
    }

    @Test
    void preflightRequestsPassWithoutToken() {
        run(MockServerHttpRequest.options("/api/employees").build());

        assertThat(forwarded.get()).isNotNull();
    }

    @Test
    void rejectsProtectedPathWithoutToken() {
        assertRejected(run(get("/api/accounts", null)), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.MISSING_TOKEN_MESSAGE);
    }

    @Test
    void pathThatOnlyStartsLikeAPublicPathIsStillProtected() {
        assertRejected(run(get("/api/auth/login/../../accounts", null)), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.MISSING_TOKEN_MESSAGE);
        assertRejected(run(get("/api/auth/me", null)), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.MISSING_TOKEN_MESSAGE);
    }

    @Test
    void rejectsExpiredToken() {
        String expired = token(ACCESS_KEY, "access", "EMPLOYEE", Instant.now().minus(1, ChronoUnit.MINUTES));

        assertRejected(run(get("/api/employees", expired)), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.EXPIRED_TOKEN_MESSAGE);
    }

    @Test
    void rejectsRefreshTokenAndTokensWithoutAccessType() {
        String refreshToken = token(REFRESH_KEY, "refresh", "EMPLOYEE", Instant.now().plus(1, ChronoUnit.DAYS));
        String untyped = token(ACCESS_KEY, null, "EMPLOYEE", Instant.now().plus(15, ChronoUnit.MINUTES));

        assertRejected(run(get("/api/employees", refreshToken)), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
        assertRejected(run(get("/api/employees", untyped)), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
    }

    @Test
    void rejectsGarbageToken() {
        assertRejected(run(get("/api/employees", "not-a-jwt")), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.INVALID_TOKEN_MESSAGE);
    }

    @Test
    void rejectsRevokedToken() {
        when(revocationChecker.isRevoked(any(Claims.class))).thenReturn(Mono.just(true));

        assertRejected(run(get("/api/employees", accessToken("EMPLOYEE"))), HttpStatus.UNAUTHORIZED,
                JwtAuthenticationFilter.REVOKED_TOKEN_MESSAGE);
    }

    @Test
    void failsClosedWhenRevocationCannotBeChecked() {
        when(revocationChecker.isRevoked(any(Claims.class)))
                .thenReturn(Mono.error(new IllegalStateException("Redis không phản hồi")));

        assertRejected(run(get("/api/employees", accessToken("EMPLOYEE"))), HttpStatus.SERVICE_UNAVAILABLE,
                JwtAuthenticationFilter.UNAVAILABLE_MESSAGE);
    }

    @Test
    void downstreamErrorsAreNotReportedAsAuthenticationOutage() {
        GatewayFilterChain failingChain = exchange -> Mono.error(new IllegalStateException("service phía sau lỗi"));
        MockServerWebExchange exchange = MockServerWebExchange.from(get("/api/employees", accessToken("EMPLOYEE")));

        StepVerifier.create(filter.filter(exchange, failingChain))
                .expectErrorMessage("service phía sau lỗi")
                .verify();
    }

    @Test
    void payrollIsOnlyForAdminAndHr() {
        assertRejected(run(get("/api/payrolls/2026-10", accessToken("EMPLOYEE"))), HttpStatus.FORBIDDEN,
                JwtAuthenticationFilter.FORBIDDEN_MESSAGE);
        assertRejected(run(get("/api/payslips/me", accessToken("MANAGER"))), HttpStatus.FORBIDDEN,
                JwtAuthenticationFilter.FORBIDDEN_MESSAGE);

        run(get("/api/payrolls/2026-10", accessToken("HR")));
        assertThat(forwarded.getAndSet(null)).isNotNull();
        run(get("/api/payslips/me", accessToken("ADMIN")));
        assertThat(forwarded.get()).isNotNull();
    }
}
