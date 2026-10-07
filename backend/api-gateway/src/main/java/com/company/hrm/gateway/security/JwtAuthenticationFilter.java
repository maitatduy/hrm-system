package com.company.hrm.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.InetSocketAddress;
import java.util.Optional;
import java.util.Set;

/**
 * Xác thực access token cho mọi request đi qua route của gateway, trừ các đường công khai của auth-service.
 * Request hợp lệ được gắn danh tính đã xác thực vào header {@value #USER_ID_HEADER}, {@value #USER_ROLE_HEADER},
 * {@value #USER_EMAIL_HEADER} cho service phía sau, và mọi request được gắn {@value #CLIENT_IP_HEADER}. Các header
 * này do client tự gửi luôn bị xóa trước, nên service không bao giờ nhận được danh tính hay IP giả.
 * Header Authorization vẫn được chuyển tiếp để service tự kiểm tra lại.
 */
@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_ROLE_HEADER = "X-User-Role";
    public static final String USER_EMAIL_HEADER = "X-User-Email";
    /** Khớp ClientIpResolver.CLIENT_IP_HEADER của auth-service. */
    public static final String CLIENT_IP_HEADER = "X-Client-Ip";

    static final String MISSING_TOKEN_MESSAGE = "Bạn cần đăng nhập để thực hiện thao tác này";
    static final String EXPIRED_TOKEN_MESSAGE = "Access token đã hết hạn";
    static final String INVALID_TOKEN_MESSAGE = "Access token không hợp lệ";
    static final String REVOKED_TOKEN_MESSAGE = "Phiên đăng nhập đã hết hiệu lực, vui lòng đăng nhập lại";
    static final String FORBIDDEN_MESSAGE = "Bạn không có quyền thực hiện thao tác này";
    static final String UNAVAILABLE_MESSAGE = "Hệ thống xác thực tạm thời không khả dụng, vui lòng thử lại sau";

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private enum Revocation { ACTIVE, REVOKED, UNAVAILABLE }

    private final AccessTokenVerifier tokenVerifier;
    private final TokenRevocationChecker revocationChecker;
    private final RouteAccessPolicy accessPolicy;
    private final GatewayErrorResponseWriter errorWriter;

    public JwtAuthenticationFilter(
            AccessTokenVerifier tokenVerifier,
            TokenRevocationChecker revocationChecker,
            RouteAccessPolicy accessPolicy,
            GatewayErrorResponseWriter errorWriter
    ) {
        this.tokenVerifier = tokenVerifier;
        this.revocationChecker = revocationChecker;
        this.accessPolicy = accessPolicy;
        this.errorWriter = errorWriter;
    }

    /** Chạy trước mọi filter định tuyến để request chưa xác thực không bao giờ được chuyển tới service. */
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 100;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientIp = clientIp(exchange.getRequest());
        ServerHttpRequest stripped = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.remove(USER_ID_HEADER);
                    headers.remove(USER_ROLE_HEADER);
                    headers.remove(USER_EMAIL_HEADER);
                    // IP thật cho rate limit đăng nhập ở auth-service, gắn cả cho đường công khai như login
                    headers.remove(CLIENT_IP_HEADER);
                    if (clientIp != null) {
                        headers.set(CLIENT_IP_HEADER, clientIp);
                    }
                })
                .build();
        ServerWebExchange strippedExchange = exchange.mutate().request(stripped).build();

        String path = stripped.getPath().pathWithinApplication().value();
        if (HttpMethod.OPTIONS.equals(stripped.getMethod()) || accessPolicy.isPublic(path)) {
            return chain.filter(strippedExchange);
        }

        String token = resolveBearerToken(stripped);
        if (token == null) {
            return errorWriter.write(strippedExchange, HttpStatus.UNAUTHORIZED, MISSING_TOKEN_MESSAGE);
        }

        Claims claims;
        try {
            claims = tokenVerifier.verify(token);
        } catch (ExpiredJwtException e) {
            return errorWriter.write(strippedExchange, HttpStatus.UNAUTHORIZED, EXPIRED_TOKEN_MESSAGE);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Access token không hợp lệ tại gateway: {}", e.getMessage());
            return errorWriter.write(strippedExchange, HttpStatus.UNAUTHORIZED, INVALID_TOKEN_MESSAGE);
        }
        if (!StringUtils.hasText(claims.getSubject())) {
            return errorWriter.write(strippedExchange, HttpStatus.UNAUTHORIZED, INVALID_TOKEN_MESSAGE);
        }

        // Chỉ bắt lỗi của bước đọc Redis, không bắt lỗi của service phía sau (chain.filter) để không báo nhầm
        return revocationChecker.isRevoked(claims)
                .map(revoked -> revoked ? Revocation.REVOKED : Revocation.ACTIVE)
                .onErrorResume(e -> {
                    // Không kiểm tra được thu hồi thì từ chối (fail closed), không cho token có thể đã bị thu hồi đi qua
                    log.error("Không kiểm tra được trạng thái thu hồi token tại gateway: {}", e.getMessage());
                    return Mono.just(Revocation.UNAVAILABLE);
                })
                .flatMap(revocation -> switch (revocation) {
                    case REVOKED -> errorWriter.write(strippedExchange, HttpStatus.UNAUTHORIZED, REVOKED_TOKEN_MESSAGE);
                    case UNAVAILABLE -> errorWriter.write(strippedExchange, HttpStatus.SERVICE_UNAVAILABLE, UNAVAILABLE_MESSAGE);
                    case ACTIVE -> authorizeAndForward(strippedExchange, chain, path, claims);
                });
    }

    private Mono<Void> authorizeAndForward(
            ServerWebExchange exchange,
            GatewayFilterChain chain,
            String path,
            Claims claims
    ) {
        String role = claims.get(AccessTokenVerifier.ROLE_CLAIM, String.class);
        Optional<Set<String>> allowedRoles = accessPolicy.allowedRoles(path);
        if (allowedRoles.isPresent() && (role == null || !allowedRoles.get().contains(role))) {
            return errorWriter.write(exchange, HttpStatus.FORBIDDEN, FORBIDDEN_MESSAGE);
        }

        String email = claims.get(AccessTokenVerifier.EMAIL_CLAIM, String.class);
        ServerHttpRequest authenticated = exchange.getRequest().mutate()
                .headers(headers -> {
                    headers.set(USER_ID_HEADER, claims.getSubject());
                    if (role != null) {
                        headers.set(USER_ROLE_HEADER, role);
                    }
                    if (email != null) {
                        headers.set(USER_EMAIL_HEADER, email);
                    }
                })
                .build();
        return chain.filter(exchange.mutate().request(authenticated).build());
    }

    /**
     * Địa chỉ của kết nối tới gateway, không đọc X-Forwarded-For do client có thể tự đặt. Nếu sau này gateway đứng
     * sau load balancer, cần lấy IP thật từ X-Forwarded-For của load balancer tin cậy thay cho địa chỉ này.
     */
    private static String clientIp(ServerHttpRequest request) {
        InetSocketAddress remote = request.getRemoteAddress();
        if (remote == null || remote.getAddress() == null) {
            return null;
        }
        return remote.getAddress().getHostAddress();
    }

    private static String resolveBearerToken(ServerHttpRequest request) {
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            return null;
        }
        String token = header.substring(BEARER_PREFIX.length()).trim();
        return token.isEmpty() ? null : token;
    }
}
