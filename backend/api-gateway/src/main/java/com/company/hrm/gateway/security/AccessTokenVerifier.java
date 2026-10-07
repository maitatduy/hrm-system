package com.company.hrm.gateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Xác thực access token do auth-service cấp. Định dạng phải khớp {@code JwtTokens} và {@code TokenVersionStore}
 * của auth-service: HS256 ký bằng JWT_SECRET, claim {@value #TYPE_CLAIM} bằng {@value #ACCESS_TYPE}.
 * <p>
 * Gateway chỉ giữ JWT_SECRET (khóa access), không bao giờ giữ JWT_REFRESH_SECRET. Vì HS256 là khóa đối xứng, gateway
 * về lý thuyết cũng ký được access token; hướng lâu dài là chuyển sang RS256/ES256 để gateway chỉ giữ public key.
 */
@Component
public class AccessTokenVerifier {

    public static final String TYPE_CLAIM = "token_type";
    public static final String ACCESS_TYPE = "access";
    public static final String VERSION_CLAIM = "token_version";
    public static final String ROLE_CLAIM = "role";
    public static final String EMAIL_CLAIM = "email";

    private final SecretKey accessKey;

    public AccessTokenVerifier(@Value("${jwt.secret}") String accessSecret) {
        this.accessKey = Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
    }

    /** @throws JwtException khi token sai chữ ký, hết hạn, hoặc không phải access token */
    public Claims verify(String token) {
        return Jwts.parser()
                .verifyWith(accessKey)
                .require(TYPE_CLAIM, ACCESS_TYPE)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
