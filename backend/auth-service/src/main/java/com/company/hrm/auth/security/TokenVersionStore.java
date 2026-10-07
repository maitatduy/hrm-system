package com.company.hrm.auth.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Phiên bản token theo từng user. Access token và refresh token mang phiên bản lúc được cấp (claim {@value #CLAIM}),
 * filter và endpoint refresh từ chối token có phiên bản khác phiên bản hiện tại. Tăng phiên bản là thu hồi ngay mọi
 * token đã cấp của user, dùng khi khóa tài khoản, đổi role, đổi hoặc đặt lại mật khẩu.
 * <p>
 * Chỉ auth-service kiểm tra được phiên bản vì cần đọc Redis. Nếu sau này api-gateway tự xác thực JWT, gateway phải
 * đọc cùng key Redis này, hoặc vẫn chuyển request qua auth-service để kiểm tra, nếu không token đã thu hồi vẫn lọt.
 * <p>
 * Key không có TTL: nếu key hết hạn, phiên bản quay về 0 và các token cấp sau lần tăng trước đó sẽ bị từ chối oan.
 * Mất dữ liệu Redis cũng làm mất refresh token và blacklist, nên người dùng phải đăng nhập lại, cùng mức rủi ro
 * với thiết kế hiện tại.
 */
@Component
@RequiredArgsConstructor
public class TokenVersionStore {

    public static final String CLAIM = "token_version";
    public static final String REVOKED_MESSAGE = "Phiên đăng nhập đã hết hiệu lực, vui lòng đăng nhập lại";
    private static final String KEY_PREFIX = "auth:token-version:";

    private final StringRedisTemplate redisTemplate;

    public long current(String userId) {
        String value = redisTemplate.opsForValue().get(KEY_PREFIX + userId);
        return value == null ? 0L : Long.parseLong(value);
    }

    /**
     * Tăng phiên bản ngay, và tăng thêm lần nữa sau khi transaction hiện tại commit (nếu có). Lần tăng sau commit
     * chặn trường hợp một request cấp token đọc phiên bản mới nhưng vẫn đọc dữ liệu cũ (role cũ) của user
     * khi thay đổi chưa commit.
     */
    public void bump(String userId) {
        increment(userId);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    increment(userId);
                }
            });
        }
    }

    /** Token không có claim (cấp trước khi có cơ chế này) được coi là phiên bản 0. */
    public boolean matches(String userId, Number tokenVersion) {
        long version = tokenVersion == null ? 0L : tokenVersion.longValue();
        return version == current(userId);
    }

    private void increment(String userId) {
        redisTemplate.opsForValue().increment(KEY_PREFIX + userId);
    }
}
