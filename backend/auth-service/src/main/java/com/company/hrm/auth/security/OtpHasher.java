package com.company.hrm.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.util.HexFormat;

/**
 * Redis chỉ lưu HMAC của OTP, gắn với email. OTP chỉ có 1 triệu tổ hợp nên ai có khóa và đọc được Redis
 * sẽ dò ra mã rất nhanh, vì vậy khóa phải là bí mật riêng của auth-service.
 * <p>
 * Khóa được dẫn xuất từ {@code JWT_REFRESH_SECRET} (chỉ auth-service giữ) theo một ngữ cảnh riêng, nên không dùng
 * thẳng cùng một khóa cho hai việc là ký refresh token và băm OTP, và không cần thêm biến môi trường.
 * Không dùng {@code JWT_SECRET} vì secret đó có thể được chia sẻ cho service khác để xác thực access token.
 */
@Component
public class OtpHasher {

    private static final String ALGORITHM = "HmacSHA256";
    private static final String KEY_CONTEXT = "hrm-auth:otp-hmac-key";

    private final SecretKeySpec key;

    public OtpHasher(@Value("${jwt.refresh-secret}") String refreshSecret) {
        byte[] derived = hmac(
                new SecretKeySpec(refreshSecret.getBytes(StandardCharsets.UTF_8), ALGORITHM),
                KEY_CONTEXT
        );
        this.key = new SecretKeySpec(derived, ALGORITHM);
    }

    public String hash(String normalizedEmail, String otp) {
        return HexFormat.of().formatHex(hmac(key, normalizedEmail + ":" + otp));
    }

    /** So sánh thời gian hằng để không lộ thông tin qua thời gian phản hồi. */
    public boolean matches(String storedHash, String normalizedEmail, String otp) {
        if (storedHash == null || otp == null) {
            return false;
        }
        return MessageDigest.isEqual(
                storedHash.getBytes(StandardCharsets.UTF_8),
                hash(normalizedEmail, otp).getBytes(StandardCharsets.UTF_8)
        );
    }

    private static byte[] hmac(SecretKeySpec key, String data) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(key);
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Không thể tính HMAC cho OTP", e);
        }
    }
}
