package com.company.hrm.auth.security;

import io.jsonwebtoken.security.Keys;

import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;

/**
 * Access token và refresh token mang claim {@value #TYPE_CLAIM} khác nhau và ký bằng hai khóa khác nhau,
 * nên không thể dùng loại này thay cho loại kia: refresh token sống lâu không gọi được API,
 * access token đặt vào cookie refresh không kích hoạt được cơ chế thu hồi toàn bộ phiên.
 */
public final class JwtTokens {

    public static final String TYPE_CLAIM = "typ";
    public static final String ACCESS_TYPE = "access";
    public static final String REFRESH_TYPE = "refresh";

    private static final String KEY_DERIVATION_ALGORITHM = "HmacSHA256";
    private static final String REFRESH_KEY_CONTEXT = "hrm-auth:refresh-token-signing-key";

    private JwtTokens() {
    }

    /** Ký trực tiếp bằng JWT_SECRET để các service khác, ví dụ api-gateway, xác thực access token được. */
    public static SecretKey accessKey(String jwtSecret) {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /** Dẫn xuất từ JWT_SECRET theo ngữ cảnh riêng, chỉ auth-service biết, không cần thêm biến môi trường. */
    public static SecretKey refreshKey(String jwtSecret) {
        try {
            Mac mac = Mac.getInstance(KEY_DERIVATION_ALGORITHM);
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), KEY_DERIVATION_ALGORITHM));
            return Keys.hmacShaKeyFor(mac.doFinal(REFRESH_KEY_CONTEXT.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Không thể dẫn xuất khóa ký refresh token", e);
        }
    }
}
