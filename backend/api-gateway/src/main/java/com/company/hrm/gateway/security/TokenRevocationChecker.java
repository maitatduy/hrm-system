package com.company.hrm.gateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * Kiểm tra access token đã bị thu hồi chưa, đọc đúng các key Redis mà auth-service ghi:
 * <ul>
 *     <li>{@code auth:blacklist:{jti}}: token đã logout (TokenServiceImpl.blacklistAccessToken)</li>
 *     <li>{@code auth:token-version:{userId}}: phiên bản token hiện tại (TokenVersionStore), tăng khi khóa tài khoản,
 *     đổi role, đổi hoặc đặt lại mật khẩu</li>
 * </ul>
 * Đổi tên key ở auth-service thì phải đổi ở đây, nếu không token đã thu hồi sẽ lọt qua gateway.
 */
@Component
public class TokenRevocationChecker {

    static final String BLACKLIST_PREFIX = "auth:blacklist:";
    static final String TOKEN_VERSION_PREFIX = "auth:token-version:";

    private final ReactiveStringRedisTemplate redisTemplate;

    public TokenRevocationChecker(ReactiveStringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /** Trả về true nếu token đã bị logout hoặc thuộc phiên đã bị thu hồi. Lỗi Redis được truyền lên để từ chối request. */
    public Mono<Boolean> isRevoked(Claims claims) {
        Mono<Boolean> blacklisted = claims.getId() == null
                ? Mono.just(false)
                : redisTemplate.hasKey(BLACKLIST_PREFIX + claims.getId());

        Mono<Boolean> staleVersion = redisTemplate.opsForValue()
                .get(TOKEN_VERSION_PREFIX + claims.getSubject())
                .map(Long::parseLong)
                .defaultIfEmpty(0L)
                .map(current -> current != tokenVersion(claims));

        return blacklisted.flatMap(isBlacklisted -> isBlacklisted ? Mono.just(true) : staleVersion);
    }

    /** Token không có claim (cấp trước khi có cơ chế phiên bản) được coi là phiên bản 0, giống auth-service. */
    private static long tokenVersion(Claims claims) {
        Number version = claims.get(AccessTokenVerifier.VERSION_CLAIM, Number.class);
        return version == null ? 0L : version.longValue();
    }
}
