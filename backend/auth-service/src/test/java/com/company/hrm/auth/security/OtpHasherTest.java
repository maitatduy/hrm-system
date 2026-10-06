package com.company.hrm.auth.security;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;

class OtpHasherTest {

    private static final String REFRESH_SECRET = "test-refresh-secret-at-least-32-bytes-long!";
    private static final String EMAIL = "user@hrm.vn";

    private final OtpHasher hasher = new OtpHasher(REFRESH_SECRET);

    @Test
    void matchesOnlyTheSameEmailAndCode() {
        String stored = hasher.hash(EMAIL, "123456");

        assertThat(hasher.matches(stored, EMAIL, "123456")).isTrue();
        assertThat(hasher.matches(stored, EMAIL, "654321")).isFalse();
        assertThat(hasher.matches(stored, "other@hrm.vn", "123456")).isFalse();
        assertThat(hasher.matches(stored, EMAIL, null)).isFalse();
        assertThat(hasher.matches(null, EMAIL, "123456")).isFalse();
    }

    @Test
    void neverStoresTheRawCode() {
        assertThat(hasher.hash(EMAIL, "123456")).doesNotContain("123456").hasSize(64);
    }

    @Test
    void keyIsNotTheRawRefreshSecret() throws Exception {
        // Khóa OTP là khóa dẫn xuất, biết refresh secret mà dùng thẳng làm khóa HMAC cũng không ra được hash đã lưu
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(REFRESH_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String rawKeyHash = HexFormat.of().formatHex(mac.doFinal((EMAIL + ":123456").getBytes(StandardCharsets.UTF_8)));

        assertThat(hasher.hash(EMAIL, "123456")).isNotEqualTo(rawKeyHash);
    }

    @Test
    void differentSecretsProduceDifferentHashes() {
        OtpHasher other = new OtpHasher("another-refresh-secret-at-least-32-bytes!!");

        assertThat(other.hash(EMAIL, "123456")).isNotEqualTo(hasher.hash(EMAIL, "123456"));
    }
}
