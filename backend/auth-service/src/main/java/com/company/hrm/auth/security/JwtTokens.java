package com.company.hrm.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Nơi duy nhất tạo khóa và parse JWT của auth-service.
 * <p>
 * Thứ tách access token khỏi refresh token là claim {@value #TYPE_CLAIM}: filter chỉ nhận {@value #ACCESS_TYPE},
 * endpoint refresh chỉ nhận {@value #REFRESH_TYPE}. Hai loại còn ký bằng hai secret độc lập
 * ({@code JWT_SECRET} và {@code JWT_REFRESH_SECRET}). {@code JWT_SECRET} có thể được chia sẻ cho service khác
 * để xác thực access token, còn {@code JWT_REFRESH_SECRET} chỉ cấp cho auth-service, nên service giữ
 * {@code JWT_SECRET} vẫn không giả mạo được refresh token.
 */
@Component
public class JwtTokens {

    public static final String TYPE_CLAIM = "token_type";
    public static final String ACCESS_TYPE = "access";
    public static final String REFRESH_TYPE = "refresh";

    private final SecretKey accessKey;
    private final SecretKey refreshKey;

    public JwtTokens(
            @Value("${jwt.secret}") String accessSecret,
            @Value("${jwt.refresh-secret}") String refreshSecret
    ) {
        byte[] accessBytes = accessSecret.getBytes(StandardCharsets.UTF_8);
        byte[] refreshBytes = refreshSecret.getBytes(StandardCharsets.UTF_8);
        if (MessageDigest.isEqual(accessBytes, refreshBytes)) {
            throw new IllegalStateException("JWT_REFRESH_SECRET phải khác JWT_SECRET");
        }
        // hmacShaKeyFor từ chối khóa ngắn hơn 256 bit, ứng dụng dừng ngay khi khởi động nếu cấu hình yếu
        this.accessKey = Keys.hmacShaKeyFor(accessBytes);
        this.refreshKey = Keys.hmacShaKeyFor(refreshBytes);
    }

    public SecretKey accessKey() {
        return accessKey;
    }

    public SecretKey refreshKey() {
        return refreshKey;
    }

    /** @throws JwtException khi token sai chữ ký, hết hạn, hoặc không phải access token */
    public Claims parseAccess(String token) {
        return parse(token, accessKey, ACCESS_TYPE);
    }

    /** @throws JwtException khi token sai chữ ký, hết hạn, hoặc không phải refresh token */
    public Claims parseRefresh(String token) {
        return parse(token, refreshKey, REFRESH_TYPE);
    }

    private Claims parse(String token, SecretKey key, String expectedType) {
        return Jwts.parser()
                .verifyWith(key)
                .require(TYPE_CLAIM, expectedType)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
