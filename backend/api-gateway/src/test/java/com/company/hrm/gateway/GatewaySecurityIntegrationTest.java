package com.company.hrm.gateway;

import com.company.hrm.gateway.security.JwtAuthenticationFilter;
import com.company.hrm.gateway.security.TokenRevocationChecker;
import com.sun.net.httpserver.HttpServer;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Chạy gateway thật (định tuyến, CorsWebFilter, JwtAuthenticationFilter) trước một service giả, để kiểm chứng những
 * điều unit test với chain giả không chứng minh được. Redis được thay bằng mock TokenRevocationChecker.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewaySecurityIntegrationTest {

    private static final String ACCESS_SECRET = "test-access-secret-at-least-32-bytes-long!!";
    private static final String ORIGIN = "http://localhost:5173";
    private static final String USER_ID = UUID.randomUUID().toString();

    /** Service giả đứng sau gateway: ghi lại đường và header của mọi request nhận được. */
    private static final HttpServer BACKEND = startBackend();
    private static final List<String> RECEIVED_PATHS = new CopyOnWriteArrayList<>();
    private static final Map<String, String> LAST_HEADERS = new ConcurrentHashMap<>();

    @Autowired
    private WebTestClient client;
    @Autowired
    private DiscoveryClient discoveryClient;
    @MockBean
    private TokenRevocationChecker revocationChecker;

    private static HttpServer startBackend() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/", exchange -> {
                RECEIVED_PATHS.add(exchange.getRequestURI().getPath());
                LAST_HEADERS.clear();
                exchange.getRequestHeaders().forEach((name, values) -> LAST_HEADERS.put(name.toLowerCase(), values.get(0)));
                byte[] body = "{\"status\":200,\"message\":\"from backend\"}".getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(body);
                }
            });
            server.start();
            return server;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    @AfterAll
    static void stopBackend() {
        BACKEND.stop(0);
    }

    @DynamicPropertySource
    static void gatewayProperties(DynamicPropertyRegistry registry) {
        String backendUrl = "http://127.0.0.1:" + BACKEND.getAddress().getPort();
        registry.add("API_GATEWAY_PORT", () -> "0");
        registry.add("JWT_SECRET", () -> ACCESS_SECRET);
        registry.add("CORS_ALLOWED_ORIGINS", () -> ORIGIN);
        for (String service : List.of("AUTH", "EMPLOYEE", "ATTENDANCE", "LEAVE", "PAYROLL")) {
            registry.add(service + "_SERVICE_URI", () -> backendUrl);
        }
        registry.add("SPRING_DATA_REDIS_HOST", () -> "127.0.0.1");
        registry.add("SPRING_DATA_REDIS_PORT", () -> "6379");
        registry.add("SPRING_DATA_REDIS_PASSWORD", () -> "");
        registry.add("EUREKA_CLIENT_SERVICEURL_DEFAULTZONE", () -> "http://127.0.0.1:1/eureka/");
        registry.add("EUREKA_REGISTER_WITH_EUREKA", () -> "false");
        registry.add("EUREKA_FETCH_REGISTRY", () -> "false");
        registry.add("eureka.client.enabled", () -> "false");
        // Có sẵn instance auth-service trong discovery: nếu locator bị bật, /auth-service/** sẽ thật sự tới được backend
        registry.add("spring.cloud.discovery.client.simple.instances.auth-service[0].uri", () -> backendUrl);
    }

    @BeforeEach
    void setUp() {
        RECEIVED_PATHS.clear();
        LAST_HEADERS.clear();
        when(revocationChecker.isRevoked(any(Claims.class))).thenReturn(Mono.just(false));
    }

    private static String accessToken(String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(USER_ID)
                .claim("token_type", "access")
                .claim("token_version", 0L)
                .claim("email", "user@hrm.vn")
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(15, ChronoUnit.MINUTES)))
                .signWith(Keys.hmacShaKeyFor(ACCESS_SECRET.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }

    @Test
    void spoofedIdentityHeadersAreReplacedBeforeReachingTheService() {
        client.get().uri("/api/employees/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken("EMPLOYEE"))
                .header(JwtAuthenticationFilter.USER_ID_HEADER, "someone-else")
                .header("x-user-role", "ADMIN")
                .exchange()
                .expectStatus().isOk();

        assertThat(RECEIVED_PATHS).containsExactly("/api/employees/1");
        assertThat(LAST_HEADERS)
                .containsEntry("x-user-id", USER_ID)
                .containsEntry("x-user-role", "EMPLOYEE")
                .containsEntry("x-user-email", "user@hrm.vn");
        assertThat(LAST_HEADERS.get("authorization")).startsWith("Bearer ");
    }

    @Test
    void unauthorizedResponseCarriesCorsHeadersSoTheFrontendCanReadIt() {
        client.get().uri("/api/employees")
                .header(HttpHeaders.ORIGIN, ORIGIN)
                .exchange()
                .expectStatus().isUnauthorized()
                .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGIN)
                .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true")
                .expectBody().jsonPath("$.status").isEqualTo(401);

        assertThat(RECEIVED_PATHS).isEmpty();
    }

    @Test
    void forbiddenResponseAlsoCarriesCorsHeaders() {
        client.get().uri("/api/payrolls")
                .header(HttpHeaders.ORIGIN, ORIGIN)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken("EMPLOYEE"))
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.FORBIDDEN)
                .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, ORIGIN);

        assertThat(RECEIVED_PATHS).isEmpty();
    }

    @Test
    void discoveryLocatorDoesNotOpenServiceIdRoutes() {
        // Bảo đảm test có ý nghĩa: discovery thật sự biết auth-service, chỉ có locator là bị tắt
        assertThat(discoveryClient.getInstances("auth-service")).isNotEmpty();

        client.get().uri("/auth-service/api/auth/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken("ADMIN"))
                .exchange()
                .expectStatus().isNotFound();

        assertThat(RECEIVED_PATHS).isEmpty();
    }

    @Test
    void publicAuthEndpointReachesTheServiceWithoutToken() {
        client.post().uri("/api/auth/login")
                .header("X-User-Role", "ADMIN")
                .exchange()
                .expectStatus().isOk();

        assertThat(RECEIVED_PATHS).containsExactly("/api/auth/login");
        assertThat(LAST_HEADERS).doesNotContainKey("x-user-role");
    }

    @Test
    void loginReceivesTheRealClientIpEvenIfTheClientSpoofsIt() {
        // Rate limit đăng nhập dựa vào IP này, client tự đặt IP khác để né giới hạn sẽ không có tác dụng
        client.post().uri("/api/auth/login")
                .header(JwtAuthenticationFilter.CLIENT_IP_HEADER, "1.2.3.4")
                .exchange()
                .expectStatus().isOk();

        assertThat(LAST_HEADERS.get("x-client-ip")).isIn("127.0.0.1", "0:0:0:0:0:0:0:1");
    }
}
